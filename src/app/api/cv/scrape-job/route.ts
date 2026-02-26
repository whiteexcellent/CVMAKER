import { NextResponse } from 'next/server';
import { z } from 'zod';

import { createClient } from '@/lib/supabase/server';
import { checkAndDeductCredit } from '@/lib/credits';
import { supabaseAdmin } from '@/lib/supabase/admin';
export const dynamic = 'force-dynamic';

const schema = z.object({
    jobUrl: z.string().url()
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
            return NextResponse.json({ error: 'Invalid payload: Must be a valid Job URL' }, { status: 400 });
        }
        const { jobUrl } = parsed.data;

        const { data: profile } = await supabase.from('profiles').select('subscription_tier').eq('id', user.id).single();
        const isPro = profile?.subscription_tier === 'pro';
        const isDev = process.env.NODE_ENV === 'development';

        if (!isPro && !isDev) {
            return NextResponse.json({ error: 'Job Search and ATS Bypass is a Pro feature. Please upgrade to Pro Yearly to unlock this tool.' }, { status: 403 });
        }

        // 1. Check User Credits Securely (Costs 1 credit for scraping)
        const creditCheck = await checkAndDeductCredit(user.id, 1);
        if (!creditCheck.allowed) {
            return NextResponse.json({ error: creditCheck.reason }, { status: 402 });
        }

        if (!process.env.APIFY_API_TOKEN) {
            return NextResponse.json({ error: 'Job scraper service is currently unavailable.' }, { status: 503 });
        }




        let actorId = '';
        let inputPayload = {};

        // 2. Determine platform and run appropriate scraper
        if (jobUrl.includes('indeed.com')) {
            actorId = "misceres~indeed-scraper";
            inputPayload = {
                "startUrls": [{ "url": jobUrl }],
                "urls": [jobUrl],
                "maxItems": 1
            };
        }
        else if (jobUrl.includes('linkedin.com/jobs') || jobUrl.includes('linkedin.com/posts')) {
            actorId = "curious_coder~linkedin-jobs-scraper";
            inputPayload = {
                "jobUrls": [jobUrl],
                "urls": [jobUrl]
            }
        }
        else if (jobUrl.includes('glassdoor.com')) {
            actorId = "epctex~glassdoor-scraper";
            inputPayload = {
                "startUrls": [{ "url": jobUrl }],
                "maxItems": 1
            }
        }
        else {
            return NextResponse.json({ error: 'Unsupported URL. Please provide an Indeed, LinkedIn Jobs, or Glassdoor link.' }, { status: 400 });
        }

        // Call Apify via native fetch to bypass Turbopack dynamic module handling
        const apifyUrl = `https://api.apify.com/v2/acts/${actorId}/run-sync-get-dataset-items`;

        const runRes = await fetch(apifyUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${process.env.APIFY_API_TOKEN}`
            },
            body: JSON.stringify(inputPayload)
        });

        if (!runRes.ok) {
            await supabaseAdmin.rpc('add_credits', { user_id_param: user.id, amount_param: 1 });
            const errorText = await runRes.text();
            console.error("Apify API Error:", errorText);
            throw new Error(`Apify returned ${runRes.status}`);
        }

        const items = await runRes.json();

        let jobTitle = '';
        let companyName = '';
        let jobDescription = '';

        if (items && items.length > 0) {
            const jobData = items[0] as any;
            if (jobUrl.includes('indeed.com')) {
                jobTitle = jobData.positionName || jobData.jobTitle || jobData.title || '';
                companyName = jobData.company || jobData.companyName || jobData.employerName || '';
                jobDescription = jobData.description || jobData.jobDescription || jobData.fullDescription || '';
            } else if (jobUrl.includes('linkedin.com')) {
                jobTitle = jobData.title || jobData.jobTitle || '';
                companyName = jobData.company || jobData.companyName || '';
                jobDescription = jobData.description || jobData.jobDescription || '';
            } else if (jobUrl.includes('glassdoor.com')) {
                jobTitle = jobData.jobTitle || jobData.title || '';
                companyName = jobData.employerName || jobData.company || '';
                jobDescription = jobData.jobDescription || jobData.description || '';
            }
        }

        if (!jobDescription) {
            await supabaseAdmin.rpc('add_credits', { user_id_param: user.id, amount_param: 1 });
            return NextResponse.json({ error: 'Could not extract job description from the provided URL.' }, { status: 404 });
        }

        // 3. Deduction was already securely completed at step 1.

        // 4. Save scraped job data to database
        const { error: insertError } = await supabase
            .from('scraped_jobs')
            .insert({
                user_id: user.id,
                source_url: jobUrl,
                job_title: jobTitle,
                company_name: companyName,
                raw_description: jobDescription
            });

        if (insertError) {
            console.error('Error saving scraped job to db (non-fatal):', insertError);
        }

        // 5. Log the transaction (Currently Deductions are disabled for testing)
        // await supabase
        //     .from('credit_transactions')
        //     .insert({
        //         user_id: user.id,
        //         amount: -2,
        //         type: 'usage',
        //         stripe_session_id: `job_scrape_${Date.now()}` // Link it to the Apify run
        //     });
        //


        return NextResponse.json({
            title: jobTitle,
            company: companyName,
            description: jobDescription
        });
    } catch (err: any) {
        console.error('Job Scrape Error:', err);
        return NextResponse.json({ error: err.message || 'Internal Server Error' }, { status: 500 });
    }
}
