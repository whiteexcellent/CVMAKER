import { NextResponse } from 'next/server';
import { z } from 'zod';

import { createClient } from '@/lib/supabase/server';
import { enforceRateLimit } from '@/lib/rate-limit';
import { getRateLimitIdentifier, parseJsonBody, RequestGuardError } from '@/lib/request-guards';

export const dynamic = 'force-dynamic';
export const maxDuration = 60;

const OPENROUTER_BASE_URL = 'https://openrouter.ai/api/v1/chat/completions';
const GROQ_BASE_URL = 'https://api.groq.com/openai/v1/chat/completions';
const OPENROUTER_FREE_MODEL = 'deepseek/deepseek-chat-v3-0324:free';
const OPENROUTER_PRO_MODEL = 'deepseek/deepseek-r1:free';
const GROQ_FALLBACK_MODEL = 'llama-3.3-70b-versatile';
const OPENROUTER_FALLBACK_STATUSES = new Set([402, 429, 503, 529]);

const STEP_LABELS: Record<number, string> = {
    1: 'Trajectory / Target Role',
    2: 'Education',
    3: 'Track Record / Experience',
    4: 'Capabilities / Skills',
};

const messageSchema = z.object({
    role: z.enum(['user', 'assistant']),
    content: z.string().trim().min(1).max(2_000),
});

const formDataSchema = z.object({
    profileType: z.string().trim().max(120).optional(),
    targetRole: z.string().trim().max(160).optional(),
    education: z.string().trim().max(8_000).optional(),
    experience: z.string().trim().max(12_000).optional(),
    skills: z.string().trim().max(4_000).optional(),
    jobDescription: z.string().trim().max(12_000).optional(),
}).optional();

const requestSchema = z.object({
    messages: z.array(messageSchema).min(1).max(12),
    step: z.number().int().min(1).max(4),
    formData: formDataSchema,
    locale: z.string().trim().max(20).optional(),
}).strict();

const assistantResponseSchema = z.object({
    message: z.string().trim().min(1),
    suggestions: z.array(z.object({
        field: z.enum(['experience', 'education', 'skills', 'targetRole', 'profileType']),
        proposedValue: z.string().trim().min(1),
        confidence: z.number().min(0).max(1),
    })).max(3).default([]),
});

function buildSystemPrompt(
    step: number,
    formData: z.infer<typeof formDataSchema>,
    locale: string,
): string {
    const stepLabel = STEP_LABELS[step] ?? 'General';
    const langInstruction =
        locale === 'tr'
            ? 'Cevaplarini tamamen Turkce yaz.'
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
- Job Description: ${formData?.jobDescription ?? 'Not answered'}

Instructions:
1. Be concise, direct, and highly professional. No generic fluff.
2. Answer the user's question first.
3. Only include suggestions when you have field-ready content they can import directly.
4. Return raw JSON only in this exact shape:
{
  "message": "string",
  "suggestions": [
    {
      "field": "experience" | "education" | "skills" | "targetRole" | "profileType",
      "proposedValue": "string",
      "confidence": 0.0
    }
  ]
}`;
}

async function callJsonProvider(
    url: string,
    apiKey: string,
    options: {
        model: string;
        messages: Array<{ role: 'system' | 'user' | 'assistant'; content: string }>;
        extraHeaders?: Record<string, string>;
    }
) {
    const response = await fetch(url, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${apiKey}`,
            ...(options.extraHeaders || {}),
        },
        body: JSON.stringify({
            model: options.model,
            messages: options.messages,
            temperature: 0.3,
            response_format: { type: 'json_object' },
        }),
        signal: AbortSignal.timeout(30_000),
    });

    return response;
}

async function parseProviderResponse(response: Response) {
    const payload = await response.json() as any;
    return payload?.choices?.[0]?.message?.content || '{}';
}

export async function POST(req: Request): Promise<Response> {
    try {
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
            return NextResponse.json(
                { error: { code: 'UNAUTHORIZED', message: 'Authentication required', retryable: false } },
                { status: 401 },
            );
        }

        try {
            await enforceRateLimit(supabase, {
                identifier: getRateLimitIdentifier(req, user.id),
                routeKey: 'wizard_chat',
                maxRequests: 40,
                windowSeconds: 3600,
            });
        } catch (rateLimitError: any) {
            return NextResponse.json(
                { error: { code: 'RATE_LIMITED', message: rateLimitError.message, retryable: true } },
                { status: 429 },
            );
        }

        const { messages, step, formData, locale } = await parseJsonBody(req, requestSchema, {
            maxBytes: 48_000,
        });

        const { data: profile } = await supabase
            .from('profiles')
            .select('subscription_tier')
            .eq('id', user.id)
            .single();

        const isPro =
            profile?.subscription_tier === 'pro' ||
            profile?.subscription_tier === 'pro_unlimited' ||
            profile?.subscription_tier === 'unlimited';

        const apiMessages: Array<{ role: 'system' | 'user' | 'assistant'; content: string }> = [
            { role: 'system', content: buildSystemPrompt(step, formData, locale ?? 'English') },
            ...messages,
        ];

        const openrouterKey = process.env.OPENROUTER_API_KEY;
        const groqKey = process.env.GROQ_API_KEY;

        let rawAssistantResponse: string | null = null;

        if (openrouterKey) {
            try {
                const orModel = isPro ? OPENROUTER_PRO_MODEL : OPENROUTER_FREE_MODEL;
                const openRouterResponse = await callJsonProvider(
                    OPENROUTER_BASE_URL,
                    openrouterKey,
                    {
                        model: orModel,
                        messages: apiMessages,
                        extraHeaders: {
                            'HTTP-Referer': 'https://cvmaker-beta.vercel.app',
                            'X-Title': 'OmniCV Assistant',
                        }
                    }
                );

                if (openRouterResponse.ok) {
                    rawAssistantResponse = await parseProviderResponse(openRouterResponse);
                } else if (!OPENROUTER_FALLBACK_STATUSES.has(openRouterResponse.status)) {
                    return NextResponse.json(
                        { error: { code: 'PROVIDER_ERROR', message: 'AI provider error', retryable: true } },
                        { status: 502 },
                    );
                }
            } catch (error) {
                console.warn('[AI] OpenRouter failed, falling back to Groq:', error);
            }
        }

        if (!rawAssistantResponse && groqKey) {
            try {
                const groqResponse = await callJsonProvider(
                    GROQ_BASE_URL,
                    groqKey,
                    {
                        model: GROQ_FALLBACK_MODEL,
                        messages: apiMessages,
                    }
                );

                if (!groqResponse.ok) {
                    return NextResponse.json(
                        { error: { code: 'PROVIDER_ERROR', message: 'AI provider unavailable', retryable: true } },
                        { status: 502 },
                    );
                }

                rawAssistantResponse = await parseProviderResponse(groqResponse);
            } catch (error) {
                console.error('[AI] Groq network error:', error);
                return NextResponse.json(
                    { error: { code: 'PROVIDER_TIMEOUT', message: 'AI provider timed out', retryable: true } },
                    { status: 504 },
                );
            }
        }

        if (!rawAssistantResponse) {
            return NextResponse.json(
                { error: { code: 'NO_PROVIDER', message: 'No AI provider available', retryable: false } },
                { status: 503 },
            );
        }

        let parsedAssistantResponse;
        try {
            parsedAssistantResponse = assistantResponseSchema.parse(JSON.parse(rawAssistantResponse));
        } catch (error) {
            console.error('[AI] Structured response parsing failed:', rawAssistantResponse, error);
            return NextResponse.json(
                { error: { code: 'STRUCTURED_OUTPUT_ERROR', message: 'Assistant returned an invalid structure', retryable: true } },
                { status: 502 },
            );
        }

        return NextResponse.json(parsedAssistantResponse);
    } catch (error: unknown) {
        if (error instanceof RequestGuardError) {
            return NextResponse.json(
                { error: { code: 'VALIDATION_ERROR', message: error.payload.error, details: error.payload.details, retryable: false } },
                { status: error.status },
            );
        }

        const message = error instanceof Error ? error.message : 'Internal Server Error';
        console.error('[AI] Unhandled error:', error);
        return NextResponse.json(
            { error: { code: 'INTERNAL_ERROR', message, retryable: false } },
            { status: 500 },
        );
    }
}
