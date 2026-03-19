import { NextResponse } from 'next/server';
import { z } from 'zod';

import { createClient } from '@/lib/supabase/server';
import { parseJsonBody, RequestGuardError, getRateLimitIdentifier } from '@/lib/request-guards';
import { enforceRateLimit } from '@/lib/rate-limit';

export const dynamic = 'force-dynamic';

const schema = z.object({
    query: z.string().trim().min(1, 'Search query is required.').max(160),
    location: z.string().trim().max(160).optional()
}).strict();

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
                routeKey: 'search_companies',
                maxRequests: 10,
                windowSeconds: 3600,
            });
        } catch (rateLimitError: any) {
            return NextResponse.json({ error: rateLimitError.message }, { status: 429 });
        }

        const { query, location } = await parseJsonBody(req, schema, { maxBytes: 4_000 });

        const { data: profileData, error: profileError } = await supabase
            .from('profiles')
            .select('subscription_tier')
            .eq('id', user.id)
            .single();

        if (profileError || !profileData || profileData.subscription_tier !== 'pro') {
            return NextResponse.json({ error: 'Company Search is a Premium Feature. Please upgrade to Pro.' }, { status: 403 });
        }

        if (!process.env.APIFY_API_TOKEN) {
            return NextResponse.json({ error: 'Company Search service is unavailable.' }, { status: 503 });
        }

        const fullQuery = `${query} companies in ${location || 'San Francisco'}`;
        const apifyUrl = 'https://api.apify.com/v2/acts/compass~crawler-google-places/run-sync-get-dataset-items';

        const runRes = await fetch(apifyUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${process.env.APIFY_API_TOKEN}`
            },
            body: JSON.stringify({
                searchStringsArray: [fullQuery],
                maxCrawledPlacesPerSearch: 10
            }),
            signal: AbortSignal.timeout(30_000),
        });

        if (!runRes.ok) {
            const errorText = await runRes.text();
            console.warn('Apify API Error:', errorText);
            return NextResponse.json({ error: 'External company search provider failed.' }, { status: 502 });
        }

        const items = await runRes.json();
        const formattedCompanies = items && items.length > 0
            ? items.map((company: any) => ({
                title: company.title || company.name || 'Unknown Company',
                category: company.categoryName || company.type || '',
                website: company.website || '',
                phone: company.phone || '',
                address: company.address || company.street || '',
                rating: company.totalScore || company.rating || 0,
                reviews: company.reviewsCount || 0
            }))
            : [];

        return NextResponse.json({ companies: formattedCompanies });

    } catch (err: any) {
        if (err instanceof RequestGuardError) {
            return NextResponse.json(err.payload, { status: err.status });
        }

        console.error('Company Search Error:', err);
        return NextResponse.json({ error: err.message || 'Internal Server Error' }, { status: 500 });
    }
}
