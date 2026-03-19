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
                routeKey: 'search_jobs',
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
            return NextResponse.json({ error: 'Job Search is a Premium Feature. Please upgrade to Pro.' }, { status: 403 });
        }

        if (!process.env.APIFY_API_TOKEN) {
            return NextResponse.json({ error: 'Job scraper service is unavailable.' }, { status: 503 });
        }

        const apifyUrl = 'https://api.apify.com/v2/acts/apify~google-search-scraper/run-sync-get-dataset-items';
        const runRes = await fetch(apifyUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${process.env.APIFY_API_TOKEN}`
            },
            body: JSON.stringify({
                queries: `site:linkedin.com/jobs/view/ ${query} in ${location || 'Worldwide'}`,
                resultsPerPage: 10,
                maxPagesPerQuery: 1
            }),
            signal: AbortSignal.timeout(30_000),
        });

        if (!runRes.ok) {
            const errorText = await runRes.text();
            console.warn('Apify API Error:', errorText);
            return NextResponse.json({ error: 'External job search provider failed.' }, { status: 502 });
        }

        const items = await runRes.json();
        const formattedJobs = items && items.length > 0 && items[0].organicResults
            ? items[0].organicResults.map((job: any) => {
                let cleanTitle = job.title || 'Unknown Role';
                let company = 'Unknown Company';

                if (cleanTitle.includes('-')) {
                    const parts = cleanTitle.split('-');
                    cleanTitle = parts[0].trim();
                    company = parts.slice(1).join('-').replace('| LinkedIn', '').trim();
                } else if (cleanTitle.includes('| LinkedIn')) {
                    cleanTitle = cleanTitle.replace('| LinkedIn', '').trim();
                }

                return {
                    title: cleanTitle,
                    company,
                    location: location || '',
                    url: job.url || '',
                    snippet: job.description || job.snippet || 'No description available',
                    postedAt: new Date().toISOString()
                };
            })
            : [];

        return NextResponse.json({ jobs: formattedJobs });

    } catch (err: any) {
        if (err instanceof RequestGuardError) {
            return NextResponse.json(err.payload, { status: err.status });
        }

        console.error('Job Search Error:', err);
        return NextResponse.json({ error: err.message || 'Internal Server Error' }, { status: 500 });
    }
}
