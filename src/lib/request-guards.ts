import crypto from 'crypto';
import { z } from 'zod';

type RequestGuardIssue = {
    error: string;
    details?: unknown;
};

export class RequestGuardError extends Error {
    constructor(public readonly status: number, public readonly payload: RequestGuardIssue) {
        super(payload.error);
    }
}

export async function parseJsonBody<TSchema extends z.ZodTypeAny>(
    req: Request,
    schema: TSchema,
    options?: { maxBytes?: number; invalidPayloadMessage?: string }
): Promise<z.infer<TSchema>> {
    const maxBytes = options?.maxBytes ?? 32_000;
    const rawBody = await req.text();
    const rawBytes = new TextEncoder().encode(rawBody).length;

    if (rawBytes > maxBytes) {
        throw new RequestGuardError(413, { error: `Payload too large. Maximum ${maxBytes} bytes allowed.` });
    }

    let parsedJson: unknown;
    try {
        parsedJson = rawBody ? JSON.parse(rawBody) : {};
    } catch {
        throw new RequestGuardError(400, { error: 'Request body must be valid JSON.' });
    }

    const parsed = schema.safeParse(parsedJson);
    if (!parsed.success) {
        throw new RequestGuardError(400, {
            error: options?.invalidPayloadMessage || 'Invalid payload',
            details: parsed.error.format(),
        });
    }

    return parsed.data;
}

export function getClientIp(req: Request): string {
    const forwardedFor = req.headers.get('x-forwarded-for');
    if (forwardedFor) {
        return forwardedFor.split(',')[0]?.trim() || 'unknown';
    }

    return req.headers.get('x-real-ip') || 'unknown';
}

export function getRateLimitIdentifier(req: Request, userId?: string): string {
    if (userId) {
        return `user:${userId}`;
    }

    const ipHash = crypto.createHash('sha256').update(getClientIp(req)).digest('hex');
    return `ip:${ipHash}`;
}
