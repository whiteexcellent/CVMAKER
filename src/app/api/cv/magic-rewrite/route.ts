import { NextResponse } from 'next/server';

import { createClient } from '@/lib/supabase/server';
import { checkAndDeductCredit } from '@/lib/credits';
import { groq } from '@/lib/groq';
import { magicRewriteRequestSchema } from '@/lib/schemas';
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
                routeKey: 'magic_rewrite',
                maxRequests: 15,
                windowSeconds: 3600,
            });
        } catch (rateLimitError: any) {
            return NextResponse.json({ error: rateLimitError.message }, { status: 429 });
        }

        const { textToRewrite, instruction } = await parseJsonBody(req, magicRewriteRequestSchema, {
            maxBytes: 8_000,
        });

        const creditCheck = await checkAndDeductCredit(user.id, 1, 'magic_rewrite');
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

        const chatCompletion = await groq.chat.completions.create({
            messages: [
                { role: 'system', content: systemInstruction },
                { role: 'user', content: userPrompt }
            ],
            model: 'llama-3.3-70b-versatile',
            temperature: 0.4
        });

        const rewrittenText = chatCompletion.choices[0]?.message?.content?.trim() || '';
        return NextResponse.json({ rewrittenText });

    } catch (error: any) {
        if (error instanceof RequestGuardError) {
            return NextResponse.json(error.payload, { status: error.status });
        }

        console.error('Magic Rewrite Error:', error);
        return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
    }
}
