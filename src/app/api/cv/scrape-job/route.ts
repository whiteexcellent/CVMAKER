import { NextResponse } from 'next/server';

import { createClient } from '@/lib/supabase/server';
import { checkAndDeductCredit, refundCredit } from '@/lib/credits';
import { jobScrapeResponseSchema } from '@/lib/schemas';
import { RequestGuardError, getRateLimitIdentifier } from '@/lib/request-guards';
import { enforceRateLimit } from '@/lib/rate-limit';

export const dynamic = 'force-dynamic';

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
                routeKey: 'job_scrape',
                maxRequests: 8,
                windowSeconds: 3600,
            });
        } catch (rateLimitError: any) {
            return NextResponse.json({ error: rateLimitError.message }, { status: 429 });
        }

        const rawBody = await req.text();
        if (new TextEncoder().encode(rawBody).length > 4_000) {
            throw new RequestGuardError(413, { error: 'Payload too large. Maximum 4000 bytes allowed.' });
        }

        let parsedBody: any = {};
        try {
            parsedBody = rawBody ? JSON.parse(rawBody) : {};
        } catch {
            throw new RequestGuardError(400, { error: 'Invalid payload: Must be valid JSON.' });
        }

        const jobUrl = typeof parsedBody.jobUrl === 'string'
            ? parsedBody.jobUrl
            : typeof parsedBody.url === 'string'
                ? parsedBody.url
                : '';

        try {
            new URL(jobUrl);
        } catch {
            throw new RequestGuardError(400, { error: 'Invalid payload: Must be a valid Job URL' });
        }

        const { data: profile } = await supabase.from('profiles').select('subscription_tier').eq('id', user.id).single();
        const isPro = profile?.subscription_tier === 'pro';

        if (!isPro) {
            return NextResponse.json({ error: 'Job Search and ATS Bypass is a Pro feature. Please upgrade to Pro Yearly to unlock this tool.' }, { status: 403 });
        }

        const creditCheck = await checkAndDeductCredit(user.id, 1, 'job_scrape');
        if (!creditCheck.allowed) {
            return NextResponse.json({ error: creditCheck.reason }, { status: 402 });
        }

        if (!process.env.APIFY_API_TOKEN) {
            await refundCredit(user.id, 1, 'job_scrape_refund');
            return NextResponse.json({ error: 'Job scraper service is currently unavailable.' }, { status: 503 });
        }

        let actorId = '';
        let inputPayload = {};

        if (jobUrl.includes('indeed.com')) {
            actorId = 'misceres~indeed-scraper';
            inputPayload = {
                startUrls: [{ url: jobUrl }],
                urls: [jobUrl],
                maxItems: 1
            };
        }
        else if (jobUrl.includes('linkedin.com/jobs') || jobUrl.includes('linkedin.com/posts')) {
            actorId = 'curious_coder~linkedin-jobs-scraper';
            inputPayload = {
                jobUrls: [jobUrl],
                urls: [jobUrl]
            };
        }
        else if (jobUrl.includes('glassdoor.com')) {
            actorId = 'epctex~glassdoor-scraper';
            inputPayload = {
                startUrls: [{ url: jobUrl }],
                maxItems: 1
            };
        }
        else {
            await refundCredit(user.id, 1, 'job_scrape_refund');
            return NextResponse.json({ error: 'Unsupported URL. Please provide an Indeed, LinkedIn Jobs, or Glassdoor link.' }, { status: 400 });
        }

        const apifyUrl = `https://api.apify.com/v2/acts/${actorId}/run-sync-get-dataset-items`;
        const runRes = await fetch(apifyUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${process.env.APIFY_API_TOKEN}`
            },
            body: JSON.stringify(inputPayload),
            signal: AbortSignal.timeout(30_000),
        });

        if (!runRes.ok) {
            await refundCredit(user.id, 1, 'job_scrape_refund');
            const errorText = await runRes.text();
            console.error('Apify API Error:', errorText);
            throw new Error(`Apify returned ${runRes.status}`);
        }

        const items = await runRes.json();

        let title = '';
        let company = '';
        let description = '';

        if (items && items.length > 0) {
            const jobData = items[0] as any;
            if (jobUrl.includes('indeed.com')) {
                title = jobData.positionName || jobData.jobTitle || jobData.title || '';
                company = jobData.company || jobData.companyName || jobData.employerName || '';
                description = jobData.description || jobData.jobDescription || jobData.fullDescription || '';
            } else if (jobUrl.includes('linkedin.com')) {
                title = jobData.title || jobData.jobTitle || '';
                company = jobData.company || jobData.companyName || '';
                description = jobData.description || jobData.jobDescription || '';
            } else if (jobUrl.includes('glassdoor.com')) {
                title = jobData.jobTitle || jobData.title || '';
                company = jobData.employerName || jobData.company || '';
                description = jobData.jobDescription || jobData.description || '';
            }
        }

        if (!description) {
            await refundCredit(user.id, 1, 'job_scrape_refund');
            return NextResponse.json({ error: 'Could not extract job description from the provided URL.' }, { status: 404 });
        }

        const structuredResult = jobScrapeResponseSchema.parse({
            title,
            company,
            description,
        });

        const { error: insertError } = await supabase
            .from('scraped_jobs')
            .insert({
                user_id: user.id,
                source_url: jobUrl,
                job_title: structuredResult.title,
                company_name: structuredResult.company,
                raw_description: structuredResult.description
            });

        if (insertError) {
            console.error('Error saving scraped job to db (non-fatal):', insertError);
        }

        return NextResponse.json({
            ...structuredResult,
            jobTitle: structuredResult.title,
            companyName: structuredResult.company,
            jobDescription: structuredResult.description,
        });
    } catch (err: any) {
        if (err instanceof RequestGuardError) {
            return NextResponse.json(err.payload, { status: err.status });
        }

        console.error('Job Scrape Error:', err);
        return NextResponse.json({ error: err.message || 'Internal Server Error' }, { status: 500 });
    }
}
