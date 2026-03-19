import { NextResponse } from 'next/server';

import { createClient } from '@/lib/supabase/server';
import { checkAndDeductCredit, refundCredit } from '@/lib/credits';
import { groq } from '@/lib/groq';
import { coverLetterContentSchema, coverLetterGenerateRequestSchema } from '@/lib/schemas';
import { parseJsonBody, RequestGuardError, getRateLimitIdentifier } from '@/lib/request-guards';
import { enforceRateLimit } from '@/lib/rate-limit';
import { isDevAuthBypassEnabled } from '@/lib/env';

export const dynamic = 'force-dynamic';

const DEV_RESUME_ID = '00000000-0000-0000-0000-000000000000';

export async function POST(req: Request) {
    try {
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();
        const bypassAuth = isDevAuthBypassEnabled();

        if (!user && !bypassAuth) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await parseJsonBody(req, coverLetterGenerateRequestSchema, {
            maxBytes: 32_000,
        });

        if (user?.id) {
            try {
                await enforceRateLimit(supabase, {
                    identifier: getRateLimitIdentifier(req, user.id),
                    routeKey: 'generate_cover_letter',
                    maxRequests: 12,
                    windowSeconds: 3600,
                });
            } catch (rateLimitError: any) {
                return NextResponse.json({ error: rateLimitError.message }, { status: 429 });
            }
        }

        const { resumeId, jobDescription, targetRole, targetCompany, language } = body;

        let resumeContent = {
            personalSummary: 'This is a test CV summary.',
            experience: [],
            education: [],
            skills: [],
        };

        if (!(bypassAuth && resumeId === DEV_RESUME_ID)) {
            const { data: resume, error: resumeErr } = await supabase
                .from('resumes')
                .select('content')
                .eq('id', resumeId)
                .eq('user_id', user?.id)
                .single();

            if (resumeErr || !resume) {
                return NextResponse.json({ error: 'Resume not found' }, { status: 404 });
            }

            resumeContent = resume.content;

            if (user?.id) {
                const deductionResult = await checkAndDeductCredit(user.id, 1, 'generate_cover_letter');
                if (!deductionResult.allowed) {
                    return NextResponse.json({ error: deductionResult.reason }, { status: 402 });
                }
            }
        }

        const systemInstruction = `You are a world-class Executive Recruiter. Your task is to write a highly persuasive Cover Letter based on the user's CV data and a Job Description.
Write the cover letter in ${language}.
Format your response exclusively as a JSON object matching this schema:
{
  "sender_name": "string",
  "sender_contact": "string",
  "recipient_name": "string",
  "date": "string",
  "subject": "string",
  "paragraphs": ["string", "string", "string"]
}`;

        const userPrompt = `CV Data: ${JSON.stringify(resumeContent)}

Target Role: ${targetRole}
Target Company: ${targetCompany || 'Unknown'}
Job Description: ${jobDescription || 'No specific job description provided. Write a strong general cover letter for this role.'}
`;

        const chatCompletion = await groq.chat.completions.create({
            messages: [
                { role: 'system', content: systemInstruction },
                { role: 'user', content: userPrompt }
            ],
            model: 'llama-3.3-70b-versatile',
            temperature: 0.4,
            response_format: { type: 'json_object' }
        });

        const rawResponse = chatCompletion.choices[0]?.message?.content || '{}';
        const cleanedText = rawResponse.replace(/```json\n?|\`\`\`\n?/g, '').trim();

        let structuredLetter;
        try {
            structuredLetter = coverLetterContentSchema.parse(JSON.parse(cleanedText));
        } catch (jsonParseError) {
            console.error('Failed to parse Cover Letter JSON:', cleanedText);
            if (user?.id) await refundCredit(user.id, 1, 'generate_cover_letter_refund');
            return NextResponse.json({ error: 'AI failed to generate a valid structure. Please try again (Credit Refunded).' }, { status: 500 });
        }

        if (bypassAuth && resumeId === DEV_RESUME_ID) {
            return NextResponse.json({ success: true, coverLetterId: '00000000-0000-0000-0000-000000000001', data: structuredLetter });
        }

        const { data: savedLetter, error: saveError } = await supabase.from('cover_letters')
            .insert({
                user_id: user!.id,
                resume_id: resumeId,
                title: `${targetCompany ? `${targetCompany} - ` : ''}${targetRole} Cover Letter`,
                job_description: jobDescription || null,
                target_role: targetRole,
                company_name: targetCompany || null,
                content: {
                    ...structuredLetter,
                    meta: {
                        ...(structuredLetter.meta || {}),
                        resume_id: resumeId,
                        target_company: targetCompany || targetRole,
                        target_role: targetRole,
                    }
                }
            })
            .select()
            .single();

        if (saveError) {
            console.error('Error saving cover letter:', saveError);
            if (user?.id) await refundCredit(user.id, 1, 'generate_cover_letter_refund');
            return NextResponse.json({ error: 'Failed to save cover letter securely. Please try again (Credit Refunded).' }, { status: 500 });
        }

        return NextResponse.json({ success: true, coverLetterId: savedLetter.id, data: structuredLetter });

    } catch (error: any) {
        if (error instanceof RequestGuardError) {
            return NextResponse.json(error.payload, { status: error.status });
        }

        console.error('Generation Error:', error);
        return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
    }
}
