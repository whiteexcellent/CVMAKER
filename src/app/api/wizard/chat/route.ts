import { NextResponse } from 'next/server';
import { z } from 'zod';
import { createClient } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';
export const maxDuration = 60;

// ─── Sabitler ───────────────────────────────────────────────────────────────

const OPENROUTER_BASE_URL = 'https://openrouter.ai/api/v1/chat/completions';
const GROQ_BASE_URL = 'https://api.groq.com/openai/v1/chat/completions';

const OPENROUTER_FREE_MODEL = 'deepseek/deepseek-chat-v3-0324:free';
const OPENROUTER_PRO_MODEL = 'deepseek/deepseek-r1:free';
const GROQ_FALLBACK_MODEL = 'llama-3.3-70b-versatile';

/** HTTP durum kodları — OpenRouter kotası veya erişim hatası */
const OPENROUTER_FALLBACK_STATUSES = new Set([402, 429, 503, 529]);

const STEP_LABELS: Record<number, string> = {
    1: 'Trajectory / Target Role',
    2: 'Education',
    3: 'Track Record / Experience',
    4: 'Capabilities / Skills',
};

// ─── Zod Şemaları ────────────────────────────────────────────────────────────

const MessageSchema = z.object({
    role: z.enum(['user', 'assistant']),
    content: z.string().min(1),
});

const FormDataSchema = z.object({
    profileType: z.string().optional(),
    targetRole: z.string().optional(),
    education: z.string().optional(),
    experience: z.string().optional(),
    skills: z.string().optional(),
}).optional();

const RequestSchema = z.object({
    messages: z.array(MessageSchema).min(1).max(40),
    step: z.number().int().min(1).max(4),
    formData: FormDataSchema,
    locale: z.string().max(20).optional(),
});

// ─── Sistem Promptu ──────────────────────────────────────────────────────────

function buildSystemPrompt(
    step: number,
    formData: z.infer<typeof FormDataSchema>,
    locale: string,
): string {
    const stepLabel = STEP_LABELS[step] ?? 'General';
    const langInstruction =
        locale === 'tr'
            ? 'Cevaplarını tamamen Türkçe yaz.'
            : `Reply entirely in ${locale}.`;

    return `You are an elite Career Coach and Senior HR Expert helping a user build their CV step-by-step.
${langInstruction}
Current step (${step}/4): ${stepLabel}

Live CV data entered so far:
- Profile Type: ${formData?.profileType ?? 'Not answered'}
- Target Role: ${formData?.targetRole ?? 'Not answered'}
- Education: ${formData?.education ?? 'Not answered'}
- Experience: ${formData?.experience ?? 'Not answered'}
- Skills: ${formData?.skills ?? 'Not answered'}

INSTRUCTIONS:
1. Be concise, direct, and highly professional. No generic fluff.
2. Adapt your language to their Target Role (use relevant jargon).
3. If a field is empty or weak and they ask about it, proactively draft it using context from other fields.
4. When you generate a polished text they should add to their CV, include a JSON block on its OWN LINE at the end of your message using EXACTLY this format:
   {"type":"suggestion","field":"experience"|"education"|"skills"|"targetRole"|"profileType","value":"<text>"}
   Only use this when you have generated quality, ready-to-import content.
5. Answer the question and ask ONE follow-up question if you need more info.`;
}

// ─── Provider Çağrısı ────────────────────────────────────────────────────────

interface LLMRequest {
    messages: Array<{ role: 'user' | 'assistant' | 'system'; content: string }>;
    model: string;
    stream: true;
}

async function callLLM(
    url: string,
    apiKey: string,
    body: LLMRequest,
    extraHeaders?: Record<string, string>,
): Promise<Response> {
    return fetch(url, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${apiKey}`,
            ...extraHeaders,
        },
        body: JSON.stringify(body),
        signal: AbortSignal.timeout(30_000),
    });
}

// ─── SSE → ReadableStream Dönüştürücü ────────────────────────────────────────

function sseToTextStream(upstreamResponse: Response): ReadableStream<Uint8Array> {
    const encoder = new TextEncoder();
    const reader = upstreamResponse.body!.getReader();
    const decoder = new TextDecoder();

    return new ReadableStream<Uint8Array>({
        async start(controller) {
            let buffer = '';
            try {
                while (true) {
                    const { done, value } = await reader.read();
                    if (done) break;

                    buffer += decoder.decode(value, { stream: true });
                    const lines = buffer.split('\n');
                    buffer = lines.pop() ?? '';

                    for (const line of lines) {
                        const trimmed = line.trim();
                        if (!trimmed.startsWith('data:')) continue;
                        const raw = trimmed.slice(5).trim();
                        if (raw === '[DONE]') continue;

                        try {
                            const parsed = JSON.parse(raw) as {
                                choices?: Array<{
                                    delta?: { content?: string };
                                    finish_reason?: string;
                                }>;
                            };
                            const delta = parsed.choices?.[0]?.delta?.content;
                            if (delta) {
                                controller.enqueue(encoder.encode(delta));
                            }
                        } catch {
                            // Geçersiz JSON satırı — yoksay
                        }
                    }
                }
            } catch (err) {
                controller.error(err);
            } finally {
                controller.close();
            }
        },
        cancel() {
            reader.cancel();
        },
    });
}

// ─── Route Handler ───────────────────────────────────────────────────────────

export async function POST(req: Request): Promise<Response> {
    try {
        // 1. Auth
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
            return NextResponse.json(
                { error: { code: 'UNAUTHORIZED', message: 'Authentication required', retryable: false } },
                { status: 401 },
            );
        }

        // 2. Parse & validate
        let rawBody: unknown;
        try {
            rawBody = await req.json();
        } catch {
            return NextResponse.json(
                { error: { code: 'INVALID_JSON', message: 'Request body is not valid JSON', retryable: false } },
                { status: 400 },
            );
        }

        const parsed = RequestSchema.safeParse(rawBody);
        if (!parsed.success) {
            return NextResponse.json(
                { error: { code: 'VALIDATION_ERROR', message: 'Invalid payload', details: parsed.error.format(), retryable: false } },
                { status: 400 },
            );
        }
        const { messages, step, formData, locale } = parsed.data;

        // 3. Kullanıcı tier'ı
        const { data: profile } = await supabase
            .from('profiles')
            .select('subscription_tier')
            .eq('id', user.id)
            .single();

        const isPro =
            profile?.subscription_tier === 'pro' ||
            profile?.subscription_tier === 'pro_unlimited' ||
            profile?.subscription_tier === 'unlimited';

        // 4. Sistem mesajı
        const systemContent = buildSystemPrompt(step, formData, locale ?? 'English');

        const apiMessages: Array<{ role: 'user' | 'assistant' | 'system'; content: string }> = [
            { role: 'system', content: systemContent },
            ...messages,
        ];

        // 5. OpenRouter dene
        const openrouterKey = process.env.OPENROUTER_API_KEY;
        const groqKey = process.env.GROQ_API_KEY;

        let upstreamResponse: Response | null = null;
        let activeProvider = 'openrouter';

        if (openrouterKey) {
            try {
                const orModel = isPro ? OPENROUTER_PRO_MODEL : OPENROUTER_FREE_MODEL;
                const orResp = await callLLM(
                    OPENROUTER_BASE_URL,
                    openrouterKey,
                    { model: orModel, messages: apiMessages, stream: true },
                    {
                        'HTTP-Referer': 'https://cvmaker-beta.vercel.app',
                        'X-Title': 'OmniCV Assistant',
                    },
                );

                if (orResp.ok) {
                    upstreamResponse = orResp;
                } else if (OPENROUTER_FALLBACK_STATUSES.has(orResp.status)) {
                    // Groq'a düş
                    console.warn(`[AI] OpenRouter ${orResp.status} — falling back to Groq`);
                } else {
                    // Beklenmeyen hata — direkt döndür
                    const errText = await orResp.text();
                    console.error('[AI] OpenRouter error:', orResp.status, errText);
                    return NextResponse.json(
                        { error: { code: 'PROVIDER_ERROR', message: 'AI provider error', retryable: true } },
                        { status: 502 },
                    );
                }
            } catch (err) {
                // Network/timeout — Groq'a düş
                console.warn('[AI] OpenRouter network error — falling back to Groq:', err);
            }
        }

        // 6. Groq fallback
        if (!upstreamResponse && groqKey) {
            activeProvider = 'groq';
            try {
                const groqResp = await callLLM(
                    GROQ_BASE_URL,
                    groqKey,
                    { model: GROQ_FALLBACK_MODEL, messages: apiMessages, stream: true },
                );
                if (groqResp.ok) {
                    upstreamResponse = groqResp;
                } else {
                    const errText = await groqResp.text();
                    console.error('[AI] Groq error:', groqResp.status, errText);
                    return NextResponse.json(
                        { error: { code: 'PROVIDER_ERROR', message: 'AI provider unavailable', retryable: true } },
                        { status: 502 },
                    );
                }
            } catch (err) {
                console.error('[AI] Groq network error:', err);
                return NextResponse.json(
                    { error: { code: 'PROVIDER_TIMEOUT', message: 'AI provider timed out', retryable: true } },
                    { status: 504 },
                );
            }
        }

        if (!upstreamResponse) {
            return NextResponse.json(
                { error: { code: 'NO_PROVIDER', message: 'No AI provider available', retryable: false } },
                { status: 503 },
            );
        }

        console.log(`[AI] Provider: ${activeProvider}`);

        // 7. Stream döndür
        const textStream = sseToTextStream(upstreamResponse);
        return new Response(textStream, {
            headers: {
                'Content-Type': 'text/plain; charset=utf-8',
                'X-AI-Provider': activeProvider,
                'Cache-Control': 'no-cache',
                'Transfer-Encoding': 'chunked',
            },
        });
    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : 'Internal Server Error';
        console.error('[AI] Unhandled error:', error);
        return NextResponse.json(
            { error: { code: 'INTERNAL_ERROR', message, retryable: false } },
            { status: 500 },
        );
    }
}
