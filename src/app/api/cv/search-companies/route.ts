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
            return NextResponse.json({ error: 'Company Search is a Premium Feature. Please upgrade to Pro.' }, { status: 403 });
        }

        if (!process.env.APIFY_API_TOKEN) {
            return NextResponse.json({ error: 'Company Search service is unavailable.' }, { status: 503 });
        }

        const fullQuery = `${query} companies in ${location || 'San Francisco'}`;


        const apifyUrl = `https://api.apify.com/v2/acts/compass~crawler-google-places/run-sync-get-dataset-items`;

        const runRes = await fetch(apifyUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${process.env.APIFY_API_TOKEN}`
            },
            body: JSON.stringify({
                "searchStringsArray": [fullQuery],
                "maxCrawledPlacesPerSearch": 10 // Limit the results for faster response
            })
        });

        if (!runRes.ok) {
            const errorText = await runRes.text();
            console.error("Apify API Error:", errorText);
            throw new Error(`Apify error: ${runRes.status} - ${errorText}`);
        }

        const items = await runRes.json();

        if (!items || items.length === 0) {
            return NextResponse.json({ companies: [] });
        }

        // Map defensively
        const formattedCompanies = items.map((company: any) => ({
            title: company.title || company.name || 'Unknown Company',
            category: company.categoryName || company.type || '',
            website: company.website || '',
            phone: company.phone || '',
            address: company.address || company.street || '',
            rating: company.totalScore || company.rating || 0,
            reviews: company.reviewsCount || 0
        }));

        return NextResponse.json({ companies: formattedCompanies });

    } catch (err: any) {
        console.error('Company Search Error:', err);
        return NextResponse.json({ error: err.message || 'Internal Server Error' }, { status: 500 });
    }
}
