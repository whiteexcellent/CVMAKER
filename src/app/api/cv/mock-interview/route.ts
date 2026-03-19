import { NextResponse } from 'next/server';

import { createClient } from '@/lib/supabase/server';
import { checkAndDeductCredit } from '@/lib/credits';
import { groq } from '@/lib/groq';
import { mockInterviewRequestSchema } from '@/lib/schemas';
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
                routeKey: 'mock_interview',
                maxRequests: 6,
                windowSeconds: 3600,
            });
        } catch (rateLimitError: any) {
            return NextResponse.json({ error: rateLimitError.message }, { status: 429 });
        }

        const { resumeData, jobDescription, targetRole, companyName } = await parseJsonBody(req, mockInterviewRequestSchema, {
            maxBytes: 48_000,
        });

        if (!resumeData || Object.keys(resumeData).length === 0) {
            return NextResponse.json({ error: 'Resume data is required to generate mock interview questions.' }, { status: 400 });
        }

        const creditCheck = await checkAndDeductCredit(user.id, 2, 'mock_interview');
        if (!creditCheck.allowed) {
            return NextResponse.json({ error: creditCheck.reason }, { status: 402 });
        }

        const systemInstruction = `You are a strict, senior Technical Hiring Manager at a top-tier company.
Your task is to generate a Mock Interview preparation guide tailored exactly to the user's CV and the job they are applying for.
You MUST output raw JSON only, matching this structure:
{
  "summary": "Brief 1-2 sentence analysis of their profile fit for this role.",
  "technicalQuestions": [
    { "question": "...", "whyTheyAskThis": "...", "howToAnswer": "..." }
  ],
  "behavioralQuestions": [
    { "question": "...", "whyTheyAskThis": "...", "howToAnswer": "..." }
  ],
  "weaknessesToDefend": ["Area of concern 1", "Area of concern 2"]
}
Do not use markdown blocks like \`\`\`json. Return raw JSON.`;

        const userPrompt = `
User CV Data (JSON):
${JSON.stringify(resumeData, null, 2)}

Target Role: ${targetRole || 'Not specified'}
Target Company: ${companyName || 'Not specified'}

Job Description Context:
${jobDescription || 'None provided. Focus on generic but difficult questions for this role.'}

Generate the Mock Interview prep guide in JSON format.`;

        const chatCompletion = await groq.chat.completions.create({
            messages: [
                { role: 'system', content: systemInstruction },
                { role: 'user', content: userPrompt }
            ],
            model: 'llama-3.3-70b-versatile',
            temperature: 0.4,
            response_format: { type: 'json_object' }
        });

        const cleanedText = chatCompletion.choices[0]?.message?.content || '{}';

        let interviewData;
        try {
            interviewData = JSON.parse(cleanedText);
        } catch {
            console.error('Failed to parse Interview Mock JSON:', cleanedText);
            return NextResponse.json({ error: 'AI generated invalid structure.' }, { status: 500 });
        }

        return NextResponse.json(interviewData);

    } catch (error: any) {
        if (error instanceof RequestGuardError) {
            return NextResponse.json(error.payload, { status: error.status });
        }

        console.error('Mock Interview Error:', error);
        return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
    }
}
