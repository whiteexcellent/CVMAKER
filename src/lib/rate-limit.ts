export async function enforceRateLimit(
    supabase: any,
    options: {
        identifier: string;
        routeKey: string;
        maxRequests: number;
        windowSeconds: number;
    }
) {
    const { data, error } = await supabase.rpc('enforce_api_rate_limit', {
        identifier_param: options.identifier,
        route_key_param: options.routeKey,
        max_requests_param: options.maxRequests,
        window_seconds_param: options.windowSeconds,
    });

    if (error) {
        console.error('Rate limit RPC failed:', error);
        throw new Error('Rate limiting is unavailable. Please try again later.');
    }

    if (!data?.allowed) {
        throw new Error(data?.reason || 'Rate limit exceeded. Please try again later.');
    }

    return data;
}
