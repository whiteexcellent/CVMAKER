import { NextResponse } from 'next/server';
import { z } from 'zod';
import { createClient } from '@/lib/supabase/server';
import { checkAndDeductCredit } from '@/lib/credits';
import { groq } from '@/lib/groq';

export const dynamic = 'force-dynamic';

const schema = z.object({
    textToRewrite: z.string().min(2),
    instruction: z.string().optional()
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

        const { textToRewrite, instruction } = parsed.data;

        // 1. Check User Credits Securely (Magic Rewrite costs 1 credit)
        const creditCheck = await checkAndDeductCredit(user.id, 1);
        if (!creditCheck.allowed) {
            return NextResponse.json({ error: creditCheck.reason }, { status: 402 });
        }

        const systemInstruction = `You are an elite Tech/Executive Recruiter. Your task is to rewrite a specific sentence or bullet point from a user's CV to make it sound highly professional, action-oriented, and ATS-friendly. 
If the user provides a specific instruction (e.g., "Make it shorter", "Highlight leadership"), follow it strictly.
Return ONLY the rewritten text, without any conversational filler, quotes, or formatting arrays. Just the plain text.`;

        const userPrompt = `
Original Text: "${textToRewrite}"
User Instruction: ${instruction || 'Make it sound more professional and impactful.'}

Rewritten Text:`;

        let rewrittenText = '';

        const chatCompletion = await groq.chat.completions.create({
            messages: [
                { role: 'system', content: systemInstruction },
                { role: 'user', content: userPrompt }
            ],
            model: 'llama-3.3-70b-versatile',
            temperature: 0.4
        });

        rewrittenText = chatCompletion.choices[0]?.message?.content?.trim() || '';

        // 3. Deduction already safely recorded in profiles via RPC

        return NextResponse.json({ rewrittenText });

    } catch (error: any) {
        console.error('Magic Rewrite Error:', error);
        return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
    }
}
