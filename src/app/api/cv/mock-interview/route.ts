import { NextResponse } from 'next/server';
import { z } from 'zod';
import { createClient } from '@/lib/supabase/server';
import { checkAndDeductCredit } from '@/lib/credits';
import { groq } from '@/lib/groq';

export const dynamic = 'force-dynamic';

const schema = z.object({
    resumeData: z.record(z.string(), z.any()),
    jobDescription: z.string().optional(),
    targetRole: z.string().optional(),
    companyName: z.string().optional()
});

export async function POST(req: Request) {
    try {
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await req.json();
        const parsed = schema.safeParse(body);

        if (!parsed.success) {
            return NextResponse.json({ error: 'Invalid payload', details: parsed.error.format() }, { status: 400 });
        }

        const { resumeData, jobDescription, targetRole, companyName } = parsed.data;

        if (!resumeData || Object.keys(resumeData).length === 0) {
            return NextResponse.json({ error: 'Resume data is required to generate mock interview questions.' }, { status: 400 });
        }

        // 1. Check User Credits Securely (Mock Interview costs 2 credits because it's highly intensive)
        const creditCheck = await checkAndDeductCredit(user.id, 2);
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

        let cleanedText = '';

        const chatCompletion = await groq.chat.completions.create({
            messages: [
                { role: 'system', content: systemInstruction },
                { role: 'user', content: userPrompt }
            ],
            model: 'llama-3.3-70b-versatile',
            temperature: 0.4,
            response_format: { type: 'json_object' }
        });

        cleanedText = chatCompletion.choices[0]?.message?.content || '{}';

        let interviewData;
        try {
            interviewData = JSON.parse(cleanedText);
        } catch (e) {
            console.error("Failed to parse Interview Mock JSON:", cleanedText);
            return NextResponse.json({ error: 'AI generated invalid structure.' }, { status: 500 });
        }

        // 3. Deduction already safely recorded in profiles via RPC

        return NextResponse.json(interviewData);

    } catch (error: any) {
        console.error('Mock Interview Error:', error);
        return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
    }
}
