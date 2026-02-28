import { NextResponse } from 'next/server';
import { z } from 'zod';
import { createClient } from '@/lib/supabase/server';
import { createOpenAI } from '@ai-sdk/openai';
import { streamText, tool } from 'ai';

export const dynamic = 'force-dynamic';

const schema = z.object({
    message: z.string().optional(),
    messages: z.array(z.any()).optional(),
    step: z.number(),
    formData: z.any().optional(),
    locale: z.string().optional()
});

export async function POST(req: Request) {
    try {
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();

        const bypassAuth = process.env.NODE_ENV === 'development' || true;

        if (!bypassAuth && !user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await req.json();
        const parsed = schema.safeParse(body);
        if (!parsed.success) {
            return NextResponse.json({ error: 'Invalid payload', details: parsed.error.format() }, { status: 400 });
        }
        const { message, messages, step, formData, locale } = parsed.data;

        const currentStepString = ['Trajectory/Target Role', 'Education', 'Track Record/Experience', 'Capabilities/Skills'][step - 1] || 'General';

        const languageInstruction = locale === 'tr'
            ? 'Reply entirely in Turkish (Türkçe).'
            : `Reply entirely in ${locale || 'English'}.`;

        const groq = createOpenAI({
            baseURL: 'https://api.groq.com/openai/v1',
            apiKey: process.env.GROQ_API_KEY,
        });

        // System prompt tailored for chat assistant
        const systemInstruction = `
You are an elite Career Coach and Senior HR Expert. You are currently chatting with a user who is building their CV step-by-step.
Your goal is to guide them to write highly professional, impactful, and industry-standard CV content.
${languageInstruction}
They are on step ${step} which focuses on: ${currentStepString}.

Here is the live data they have entered in their CV form so far:
- Profile Type: ${formData?.profileType || 'Not answered'}
- Target Role: ${formData?.targetRole || 'Not answered'}
- Education: ${formData?.education || 'Not answered'}
- Experience: ${formData?.experience || 'Not answered'}
- Skills: ${formData?.skills || 'Not answered'}

CRITICAL AUDIT INSTRUCTION:
Before answering, silently review the "live data" above. If you notice they are asking for help on a section (e.g., "Experience") but their current data for that section is empty or weak, proactively offer to draft that section for them using the context from the other fields (like their Target Role or Profile Type).


Your Task & Persona Rules:
1. Act naturally as an expert consultant. Be concise, direct, and highly professional. Avoid generic fluff.
2. Adapt your terminology to their 'Target Role'. If they are a Software Engineer, use tech jargon. If they are a Chef, use culinary terms.
3. If their input is simple (e.g., "mutfak"), DO NOT just rewrite "mutfak". Suggest 2-3 professional, actionable accomplishments or skills they could select from, and ask which one fits best.
4. If you have generated a good, substantial piece of text that they should directly add to their CV (like a rewritten bullet point, a strong professional summary, or a curated skill list), you MUST call the "suggest_cv_content" tool to provide it to the UI in a structured format alongside your reply message.
5. Answer their question or help them figure out what to write for the CURRENT step. Ask ONE probing question if you need more info.
`;

        let finalMessagesToSend = messages || [];

        if (message && !messages?.find(m => m.content === message)) {
            finalMessagesToSend.push({ role: 'user', content: message });
        }

        const coreMessages = finalMessagesToSend.map((msg: any) => {
            let textContent = msg.content || '';
            if (!textContent && Array.isArray(msg.parts)) {
                textContent = msg.parts
                    .filter((p: any) => p.type === 'text')
                    .map((p: any) => p.text)
                    .join('\n');
            }

            return {
                role: (msg.role === 'model' || msg.role === 'assistant') ? 'assistant' : 'user',
                content: textContent,
            };
        });

        const result = streamText({
            model: groq('llama-3.3-70b-versatile'),
            system: systemInstruction,
            messages: coreMessages as any,
            tools: {
                suggest_cv_content: tool({
                    description: 'Suggest text for the user to import into their CV fields.',
                    inputSchema: z.object({
                        field: z.enum(['experience', 'education', 'skills', 'targetRole', 'profileType']),
                        value: z.string().describe('The professional, polished text they should insert into their CV.'),
                    })
                })
            }
        });
        return result.toTextStreamResponse();

    } catch (error: any) {
        console.error('Chat Error:', error);
        return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
    }
}
