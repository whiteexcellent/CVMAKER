import { NextResponse } from 'next/server';

import { createClient } from '@/lib/supabase/server';
import { checkAndDeductCredit, refundCredit } from '@/lib/credits';
import { groq } from '@/lib/groq';
import { presentationContentSchema, presentationGenerateRequestSchema } from '@/lib/schemas';
import { parseJsonBody, RequestGuardError, getRateLimitIdentifier } from '@/lib/request-guards';
import { enforceRateLimit } from '@/lib/rate-limit';

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
    try {
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        try {
            await enforceRateLimit(supabase, {
                identifier: getRateLimitIdentifier(req, user.id),
                routeKey: 'generate_presentation',
                maxRequests: 8,
                windowSeconds: 3600,
            });
        } catch (rateLimitError: any) {
            return NextResponse.json({ error: rateLimitError.message }, { status: 429 });
        }

        const { resumeId, jobDescription, targetRole, targetCompany, language } = await parseJsonBody(
            req,
            presentationGenerateRequestSchema,
            { maxBytes: 32_000 }
        );

        const { data: resume, error: resumeErr } = await supabase
            .from('resumes')
            .select('content')
            .eq('id', resumeId)
            .eq('user_id', user.id)
            .single();

        if (resumeErr || !resume) {
            return NextResponse.json({ error: 'Resume not found' }, { status: 404 });
        }

        const deductionResult = await checkAndDeductCredit(user.id, 1, 'generate_presentation');
        if (!deductionResult.allowed) {
            return NextResponse.json({ error: deductionResult.reason }, { status: 402 });
        }

        const systemInstruction = `You are an elite Interview Coach and Presentation Designer.
Your task is to analyze the user's CV and the target company's job description, and create a compelling "Pitch Deck / Interview Presentation" that proves why the User is the perfect fit for the Target Company.
Write the presentation in ${language}.
Format your response exclusively as a JSON object matching this schema:
{
  "title": "string",
  "subtitle": "string",
  "slides": [
    {
      "heading": "string",
      "talking_points": ["string", "string", "string"],
      "why_im_a_fit": "string"
    }
  ],
  "conclusion": "string"
}`;

        const userPrompt = `CV Data: ${JSON.stringify(resume.content)}

Target Role: ${targetRole}
Target Company: ${targetCompany}
Job Description: ${jobDescription || 'No specific job description provided. Base the presentation strongly on the target role and company.'}

INSTRUCTIONS: Create 4-5 highly persuasive slides focusing on measurable impact, relevant skills, and deep cultural/technical alignment with the company.`;

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

        let structuredPresentation;
        try {
            structuredPresentation = presentationContentSchema.parse(JSON.parse(cleanedText));
        } catch {
            await refundCredit(user.id, 1, 'generate_presentation_refund');
            return NextResponse.json({ error: 'AI failed to generate a valid structure. Please try again (Credit Refunded).' }, { status: 500 });
        }

        let presentonId: string | null = null;
        let pptxPath: string | null = null;

        const presentonUrl = process.env.PRESENTON_API_URL || 'http://localhost:5000';

        try {
            const slideSummary = structuredPresentation.slides
                .map((slide) => `${slide.heading}: ${slide.talking_points.join('. ')}`)
                .join('\n\n');

            const presentonContent = `Interview Pitch Deck for ${targetCompany} - ${targetRole}\n\n${structuredPresentation.title}\n${structuredPresentation.subtitle || ''}\n\n${slideSummary}\n\n${structuredPresentation.conclusion || ''}`;

            const presentonRes = await fetch(`${presentonUrl}/api/v1/ppt/presentation/generate`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    content: presentonContent,
                    n_slides: structuredPresentation.slides.length,
                    language,
                    template: 'general',
                    export_as: 'pptx'
                }),
                signal: AbortSignal.timeout(60_000)
            });

            if (presentonRes.ok) {
                const presentonData = await presentonRes.json();
                presentonId = presentonData.presentation_id || null;
                pptxPath = presentonData.path || null;
            } else {
                console.warn(`Presenton API returned ${presentonRes.status}, skipping PPTX generation`);
            }
        } catch (presentonErr: any) {
            console.warn('Presenton service unavailable, skipping PPTX:', presentonErr.message);
        }

        const { data: savedPresentation, error: saveError } = await supabase.from('presentations')
            .insert({
                user_id: user.id,
                resume_id: resumeId,
                title: structuredPresentation.title || `${targetCompany} Presentation`,
                target_company: targetCompany,
                content: structuredPresentation,
                ...(presentonId && { presenton_id: presentonId }),
                ...(pptxPath && { pptx_path: pptxPath }),
            })
            .select()
            .single();

        if (saveError) {
            console.error('Error saving presentation:', saveError);
            await refundCredit(user.id, 1, 'generate_presentation_refund');
            return NextResponse.json({ error: 'Failed to save presentation securely. Please try again (Credit Refunded).' }, { status: 500 });
        }

        return NextResponse.json({
            success: true,
            presentationId: savedPresentation.id,
            data: structuredPresentation,
            pptxPath,
        });

    } catch (error: any) {
        if (error instanceof RequestGuardError) {
            return NextResponse.json(error.payload, { status: error.status });
        }

        console.error('Generation Error:', error);
        return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
    }
}
