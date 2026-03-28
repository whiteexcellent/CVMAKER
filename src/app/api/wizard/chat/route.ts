import { NextResponse } from 'next/server';
import { z } from 'zod';

import { createClient } from '@/lib/supabase/server';
import { getSiteUrl } from '@/lib/env';
import { enforceRateLimit } from '@/lib/rate-limit';
import { getRateLimitIdentifier, parseJsonBody, RequestGuardError } from '@/lib/request-guards';

export const dynamic = 'force-dynamic';
export const maxDuration = 60;

const OPENROUTER_BASE_URL = 'https://openrouter.ai/api/v1/chat/completions';
const GROQ_BASE_URL = 'https://api.groq.com/openai/v1/chat/completions';
const OPENROUTER_FREE_MODEL = 'deepseek/deepseek-chat-v3-0324:free';
const OPENROUTER_PRO_MODEL = 'deepseek/deepseek-r1:free';
const GROQ_FALLBACK_MODEL = 'llama-3.3-70b-versatile';
const PROVIDER_TIMEOUT_MS = 30_000;
const FALLBACK_FRIENDLY_ERROR = 'AI assistant is temporarily unavailable. Please try again.';

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

type AssistantResponse = z.infer<typeof assistantResponseSchema>;
type ProviderName = 'openrouter' | 'groq';
type ProviderAttemptResult = {
    provider: ProviderName;
    status?: number;
    parseStrategy?: 'json' | 'text-wrap';
    payload?: AssistantResponse;
    errorCode?: 'http_error' | 'network_error' | 'empty_response' | 'parse_error';
    errorMessage?: string;
};

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
        signal: AbortSignal.timeout(PROVIDER_TIMEOUT_MS),
    });

    return response;
}

async function parseProviderResponse(response: Response) {
    const payload = await response.json() as any;
    return payload?.choices?.[0]?.message?.content || '{}';
}

function extractJsonObject(raw: string): string | null {
    const trimmed = raw.trim();
    if (!trimmed) {
        return null;
    }

    const fencedMatch = trimmed.match(/```(?:json)?\s*([\s\S]*?)```/i);
    const candidate = (fencedMatch?.[1] || trimmed).trim();

    if (candidate.startsWith('{') && candidate.endsWith('}')) {
        return candidate;
    }

    const start = candidate.indexOf('{');
    if (start === -1) {
        return null;
    }

    let depth = 0;
    let inString = false;
    let isEscaped = false;

    for (let i = start; i < candidate.length; i += 1) {
        const char = candidate[i];

        if (isEscaped) {
            isEscaped = false;
            continue;
        }

        if (char === '\\' && inString) {
            isEscaped = true;
            continue;
        }

        if (char === '"') {
            inString = !inString;
            continue;
        }

        if (inString) {
            continue;
        }

        if (char === '{') {
            depth += 1;
        } else if (char === '}') {
            depth -= 1;

            if (depth === 0) {
                return candidate.slice(start, i + 1);
            }
        }
    }

    return null;
}

function normalizeTextResponse(raw: string): string | null {
    const trimmed = raw
        .replace(/```(?:json)?/gi, '')
        .replace(/```/g, '')
        .trim();

    if (!trimmed) {
        return null;
    }

    if (trimmed.startsWith('{') && trimmed.endsWith('}')) {
        return null;
    }

    return trimmed.slice(0, 4_000);
}

function parseAssistantPayload(raw: string): { payload?: AssistantResponse; parseStrategy?: 'json' | 'text-wrap'; errorMessage?: string } {
    const extractedJson = extractJsonObject(raw);

    if (extractedJson) {
        try {
            return {
                payload: assistantResponseSchema.parse(JSON.parse(extractedJson)),
                parseStrategy: 'json',
            };
        } catch (error) {
            const normalizedText = normalizeTextResponse(raw);
            if (normalizedText) {
                return {
                    payload: {
                        message: normalizedText,
                        suggestions: [],
                    },
                    parseStrategy: 'text-wrap',
                };
            }

            return {
                errorMessage: error instanceof Error ? error.message : 'Invalid JSON payload',
            };
        }
    }

    const normalizedText = normalizeTextResponse(raw);
    if (normalizedText) {
        return {
            payload: {
                message: normalizedText,
                suggestions: [],
            },
            parseStrategy: 'text-wrap',
        };
    }

    return { errorMessage: 'No usable assistant payload found' };
}

function logProviderAttempt(
    userId: string,
    step: number,
    locale: string | undefined,
    attempt: ProviderAttemptResult,
) {
    const baseMeta = {
        route: 'wizard_chat',
        provider: attempt.provider,
        userId,
        step,
        locale: locale || 'English',
        status: attempt.status,
        parseStrategy: attempt.parseStrategy,
        errorCode: attempt.errorCode,
        errorMessage: attempt.errorMessage,
    };

    if (attempt.payload) {
        console.info('[AI][wizard-chat] Provider succeeded', baseMeta);
        return;
    }

    console.warn('[AI][wizard-chat] Provider failed', baseMeta);
}

async function attemptProvider(params: {
    provider: ProviderName;
    url: string;
    apiKey?: string;
    model: string;
    messages: Array<{ role: 'system' | 'user' | 'assistant'; content: string }>;
    extraHeaders?: Record<string, string>;
    userId: string;
    step: number;
    locale?: string;
}): Promise<ProviderAttemptResult | null> {
    if (!params.apiKey) {
        return null;
    }

    try {
        const response = await callJsonProvider(params.url, params.apiKey, {
            model: params.model,
            messages: params.messages,
            extraHeaders: params.extraHeaders,
        });

        if (!response.ok) {
            const attempt: ProviderAttemptResult = {
                provider: params.provider,
                status: response.status,
                errorCode: 'http_error',
                errorMessage: `Provider returned HTTP ${response.status}`,
            };
            logProviderAttempt(params.userId, params.step, params.locale, attempt);
            return attempt;
        }

        const rawAssistantResponse = await parseProviderResponse(response);
        if (!rawAssistantResponse || !rawAssistantResponse.trim()) {
            const attempt: ProviderAttemptResult = {
                provider: params.provider,
                status: response.status,
                errorCode: 'empty_response',
                errorMessage: 'Provider returned an empty response payload',
            };
            logProviderAttempt(params.userId, params.step, params.locale, attempt);
            return attempt;
        }

        const parsed = parseAssistantPayload(rawAssistantResponse);
        if (parsed.payload) {
            const attempt: ProviderAttemptResult = {
                provider: params.provider,
                status: response.status,
                parseStrategy: parsed.parseStrategy,
                payload: parsed.payload,
            };
            logProviderAttempt(params.userId, params.step, params.locale, attempt);
            return attempt;
        }

        const attempt: ProviderAttemptResult = {
            provider: params.provider,
            status: response.status,
            errorCode: 'parse_error',
            errorMessage: parsed.errorMessage || 'Assistant payload could not be normalized',
        };
        logProviderAttempt(params.userId, params.step, params.locale, attempt);
        return attempt;
    } catch (error) {
        const attempt: ProviderAttemptResult = {
            provider: params.provider,
            errorCode: 'network_error',
            errorMessage: error instanceof Error ? error.message : 'Unknown network error',
        };
        logProviderAttempt(params.userId, params.step, params.locale, attempt);
        return attempt;
    }
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
        const providerAttempts: ProviderAttemptResult[] = [];
        const siteUrl = getSiteUrl();

        const openRouterAttempt = await attemptProvider({
            provider: 'openrouter',
            url: OPENROUTER_BASE_URL,
            apiKey: openrouterKey,
            model: isPro ? OPENROUTER_PRO_MODEL : OPENROUTER_FREE_MODEL,
            messages: apiMessages,
            extraHeaders: {
                'HTTP-Referer': siteUrl,
                'X-Title': 'OmniCV Assistant',
            },
            userId: user.id,
            step,
            locale,
        });
        if (openRouterAttempt) {
            providerAttempts.push(openRouterAttempt);
        }

        const groqAttempt = !openRouterAttempt?.payload
            ? await attemptProvider({
                provider: 'groq',
                url: GROQ_BASE_URL,
                apiKey: groqKey,
                model: GROQ_FALLBACK_MODEL,
                messages: apiMessages,
                userId: user.id,
                step,
                locale,
            })
            : null;

        if (groqAttempt) {
            providerAttempts.push(groqAttempt);
        }

        const successfulAttempt = providerAttempts.find((attempt) => attempt.payload);

        if (!successfulAttempt?.payload) {
            const hasAnyProviderConfigured = Boolean(openrouterKey || groqKey);
            const encounteredNetworkOnlyFailure =
                providerAttempts.length > 0 &&
                providerAttempts.every((attempt) => attempt.errorCode === 'network_error');

            if (!hasAnyProviderConfigured) {
                return NextResponse.json(
                    { error: { code: 'NO_PROVIDER', message: 'No AI provider available', retryable: false } },
                    { status: 503 },
                );
            }

            if (encounteredNetworkOnlyFailure) {
                return NextResponse.json(
                    { error: { code: 'PROVIDER_TIMEOUT', message: FALLBACK_FRIENDLY_ERROR, retryable: true } },
                    { status: 504 },
                );
            }

            console.error('[AI][wizard-chat] All providers failed', {
                route: 'wizard_chat',
                userId: user.id,
                step,
                locale: locale || 'English',
                attempts: providerAttempts.map((attempt) => ({
                    provider: attempt.provider,
                    status: attempt.status,
                    errorCode: attempt.errorCode,
                    parseStrategy: attempt.parseStrategy,
                })),
            });

            return NextResponse.json(
                { error: { code: 'PROVIDER_ERROR', message: FALLBACK_FRIENDLY_ERROR, retryable: true } },
                { status: 502 },
            );
        }

        return NextResponse.json(successfulAttempt.payload);
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
