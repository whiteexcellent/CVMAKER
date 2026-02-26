import { NextResponse } from 'next/server';
import { z } from 'zod';

import { createClient } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';

const schema = z.object({
    query: z.string().min(1, 'Search query is required.'),
    location: z.string().optional()
});

export async function POST(req: Request) {
    try {
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await req.json();
        const parsed = schema.safeParse(body);
        if (!parsed.success) {
            return NextResponse.json({ error: 'Invalid payload' }, { status: 400 });
        }
        const { query, location } = parsed.data;

        // 1. Check if user is a PRO Subscriber
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



        const apifyUrl = `https://api.apify.com/v2/acts/curious_coder~linkedin-jobs-scraper/run-sync-get-dataset-items`;

        const runRes = await fetch(apifyUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${process.env.APIFY_API_TOKEN}`
            },
            body: JSON.stringify({
                "queries": [query],
                "urls": [`https://www.linkedin.com/jobs/search/?keywords=${encodeURIComponent(query)}&location=${encodeURIComponent(location || 'Worldwide')}`],
                "maxItems": 10 // Limit the results for faster response
            })
        });

        if (!runRes.ok) {
            const errorText = await runRes.text();
            console.error("Apify API Error:", errorText);
            throw new Error(`Apify error: ${runRes.status} - ${errorText}`);
        }

        const items = await runRes.json();

        if (!items || items.length === 0) {
            return NextResponse.json({ jobs: [] });
        }

        // Map defensive to ensure safe array
        const formattedJobs = items.map((job: any) => ({
            title: job.title || job.jobTitle || 'Unknown Role',
            company: job.company || job.companyName || 'Unknown Company',
            location: job.location || '',
            url: job.url || job.jobUrl || '',
            snippet: job.descriptionSnippet || job.description || 'No description available',
            postedAt: job.postedAt || job.date || ''
        }));

        return NextResponse.json({ jobs: formattedJobs });

    } catch (err: any) {
        console.error('Job Search Error:', err);
        return NextResponse.json({ error: err.message || 'Internal Server Error' }, { status: 500 });
    }
}
