const DEFAULT_LOCAL_SITE_URL = 'http://localhost:3000';

export function getRequiredEnv(name: string): string {
    const value = process.env[name];

    if (!value) {
        throw new Error(`Missing required environment variable: ${name}`);
    }

    return value;
}

export function getSiteUrl(): string {
    const configuredUrl = process.env.NEXT_PUBLIC_SITE_URL || process.env.SITE_URL;

    if (configuredUrl) {
        return configuredUrl.replace(/\/$/, '');
    }

    if (process.env.NODE_ENV !== 'production') {
        return DEFAULT_LOCAL_SITE_URL;
    }

    throw new Error('NEXT_PUBLIC_SITE_URL or SITE_URL must be configured in production.');
}

export function sanitizeNextPath(nextPath: string | null | undefined, fallback = '/dashboard'): string {
    if (!nextPath) {
        return fallback;
    }

    if (!nextPath.startsWith('/') || nextPath.startsWith('//') || nextPath.includes('\\')) {
        return fallback;
    }

    return nextPath;
}

export function isDevAuthBypassEnabled(): boolean {
    const bypassFlag = process.env.NEXT_PUBLIC_ALLOW_DEV_AUTH_BYPASS || process.env.ALLOW_DEV_AUTH_BYPASS;
    return process.env.NODE_ENV === 'development' && bypassFlag === 'true';
}
