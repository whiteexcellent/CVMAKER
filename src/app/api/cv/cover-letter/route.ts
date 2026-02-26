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
            return NextResponse.json({ error: 'Resume data is required to generate a cover letter.' }, { status: 400 });
        }

        // 1. Check User Credits Securely (Cover Letter costs 1 credit)
        const creditCheck = await checkAndDeductCredit(user.id, 1);
        if (!creditCheck.allowed) {
            return NextResponse.json({ error: creditCheck.reason }, { status: 402 });
        }

        const systemInstruction = `You are an elite Tech/Executive Career Coach. Your task is to write a highly compelling, modern, and professional Cover Letter based on the user's CV data.
If a target role and company name are provided, tailor the letter specifically for that opportunity.
If a job description is provided, meticulously align the user's past experiences with the core requirements of the role.
Use a confident but humble tone. Avoid generic buzzwords.
Format the output as clean HTML paragraphs (<p>...</p>) so it can be rendered directly in a web app. Do NOT include html/head/body tags, just the content paragraphs.`;

        const userPrompt = `
User CV Data (JSON):
${JSON.stringify(resumeData, null, 2)}

Target Role: ${targetRole || 'Not specified'}
Target Company: ${companyName || 'Not specified'}

Job Description Context:
${jobDescription || 'None provided. Focus on a general impactful introduction based on the CV.'}

Generate the HTML Cover Letter:`;

        let coverLetterHtml = '';

        const chatCompletion = await groq.chat.completions.create({
            messages: [
                { role: 'system', content: systemInstruction },
                { role: 'user', content: userPrompt }
            ],
            model: 'llama-3.3-70b-versatile',
            temperature: 0.4
        });

        coverLetterHtml = chatCompletion.choices[0]?.message?.content?.trim() || '';

        // 3. Deduction already safely recorded in profiles via RPC

        return NextResponse.json({ coverLetter: coverLetterHtml });

    } catch (error: any) {
        console.error('Cover Letter Error:', error);
        return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
    }
}
