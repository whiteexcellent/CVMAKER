import { NextResponse } from 'next/server';
import { z } from 'zod';
import { createClient } from '@/lib/supabase/server';
import { groq } from '@/lib/groq';

export const dynamic = 'force-dynamic';

const schema = z.object({
    message: z.string().optional(),
    messages: z.array(z.object({
        role: z.enum(['user', 'assistant', 'system']),
        content: z.string()
    })).optional(),
    step: z.number(),
    formData: z.object({
        profileType: z.string().optional(),
        targetRole: z.string().optional(),
        education: z.string().optional(),
        experience: z.string().optional(),
        skills: z.string().optional(),
        jobDescription: z.string().optional()
    }).optional(),
    locale: z.string().optional()
}).strict();

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

        // System prompt tailored for chat assistant
        const systemInstruction = `
You are an elite Career Coach and Senior HR Expert. You are currently chatting with a user who is building their CV step-by-step.
Your goal is to guide them to write highly professional, impactful, and industry-standard CV content.
${languageInstruction}
They are on step ${step} which focuses on: ${currentStepString}.

Here is the data they have entered so far:
Profile Type: ${formData?.profileType || 'Not answered'}
Target Role: ${formData?.targetRole || 'Not answered'}
Education: ${formData?.education || 'Not answered'}
Experience: ${formData?.experience || 'Not answered'}
Skills: ${formData?.skills || 'Not answered'}

Your Task & Persona Rules:
1. Act naturally as an expert consultant. Be concise, direct, and highly professional. Avoid generic fluff.
2. Adapt your terminology to their 'Target Role'. If they are a Software Engineer, use tech jargon. If they are a Chef, use culinary terms.
3. If their input is simple (e.g., "mutfak"), DO NOT just rewrite "mutfak". Suggest 2-3 professional, actionable accomplishments or skills they could select from, and ask which one fits best.
4. If you have generated a good, substantial piece of text that they should directly add to their CV (like a rewritten bullet point, a strong professional summary, or a curated skill list), you MUST return it in the "suggestion" object.
5. Answer their question or help them figure out what to write for the CURRENT step. Ask ONE probing question if you need more info.

JSON Response Format (Respond ONLY in this format, NO markdown blocks):
{
  "reply": "Your conversational reply to the user here. Include any options or questions in this text natively.",
  "suggestion": {
    "field": "experience", // MUST be one of: "experience", "education", "skills", "targetRole", "profileType"
    "value": "The actual text they should import into their form. This should be a highly polished snippet."
  }
}
If there is no specific text ready to import (e.g. you're just asking a question or giving multiple choices to pick from first), leave "suggestion" as null:
{
  "reply": "Your conversational reply here",
  "suggestion": null
}`;

        // Construct initial system message
        let apiMessages: any[] = [{ role: 'system', content: systemInstruction }];
        let finalMessagesToSend = [...apiMessages];

        // MEMORY SUMMARIZATION PIPELINE (Context Window Builder)
        // If history gets long, summarize the past to save tokens and maintain intense context focus.
        if (messages && messages.length > 6) {
            console.log("[MEMORY MANAGER] Conversation history exceeds 6 messages. Triggering summarization...");

            // Extract the last 6 messages as the "recent working memory"
            const recentMessages = messages.slice(-6);

            // The ones before that are sent to the summarizer
            const oldMessages = messages.slice(0, messages.length - 6);

            if (oldMessages.length > 0) {
                const summarizerPrompt = `
You are an AI Memory Manager.
Summarize the following deep conversation history between a Career Coach AI and a User into 2-3 highly concise sentences.
Focus ONLY on facts learned about the user (e.g., their skills, their decisions, specific job titles mentioned, or exact phrases agreed upon).
Ignore pleasantries.

HISTORY TO SUMMARIZE:
${JSON.stringify(oldMessages.map(m => m.role + ": " + m.content))}
                 `;

                const summaryCompletion = await groq.chat.completions.create({
                    messages: [{ role: 'user', content: summarizerPrompt }],
                    model: 'llama3-8b-8192',
                    temperature: 0.1,
                });

                const coreMemory = summaryCompletion.choices[0]?.message?.content || "";
                console.log("[MEMORY MANAGER] Generated Core Memory:", coreMemory);

                // Update the system instruction with the newly compressed core memory
                apiMessages[0].content = `${systemInstruction}\n\n[CORE MEMORY FROM PREVIOUS CHAT]:\n${coreMemory}`;
            }

            // Send System + Core Memory + Only the 6 recent messages to the expensive 70B model
            finalMessagesToSend = [apiMessages[0], ...recentMessages];

            if (message && !messages.find(m => m.content === message)) {
                finalMessagesToSend.push({ role: 'user', content: message });
            }

        } else if (messages && messages.length > 0) {
            // Normal flow for short conversations
            finalMessagesToSend = [...apiMessages, ...messages];
            if (message && !messages.find(m => m.content === message)) {
                finalMessagesToSend.push({ role: 'user', content: message });
            }
        } else if (message) {
            finalMessagesToSend.push({ role: 'user', content: message });
        }

        // Main Chat Completion (Writer Model)
        const chatCompletion = await groq.chat.completions.create({
            messages: finalMessagesToSend,
            model: 'llama-3.3-70b-versatile',
            temperature: 0.7,
            response_format: { type: 'json_object' }
        });

        const rawResponse = chatCompletion.choices[0]?.message?.content || '{}';
        let output = { reply: 'Sorry, I failed to generate a response.', suggestion: null };

        try {
            const parsedOutput = JSON.parse(rawResponse.replace(/\`\`\`json\n?|\`\`\`\n?/g, '').trim());
            output = {
                reply: parsedOutput.reply || parsedOutput.response || "I generated some text for you.",
                suggestion: parsedOutput.suggestion || null
            };
        } catch (e) {
            console.error("Failed to parse AI JSON:", rawResponse);
            output.reply = rawResponse; // Fallback to raw text if parsing fails
        }

        return NextResponse.json(output);

    } catch (error: any) {
        console.error('Chat Error:', error);
        return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
    }
}
