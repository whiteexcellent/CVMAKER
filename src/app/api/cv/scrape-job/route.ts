import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { ApifyClient } from 'apify-client';

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
    try {
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await req.json();
        const { jobUrl } = body;

        if (!jobUrl) {
            return NextResponse.json({ error: 'Please provide a valid job posting URL.' }, { status: 400 });
        }

        // 1. Check if user has at least 2 credits for this premium feature
        const { data: profileData, error: profileError } = await supabase
            .from('profiles')
            .select('total_credits')
            .eq('id', user.id)
            .single();

        if (profileError || !profileData || profileData.total_credits < 2) {
            return NextResponse.json({ error: 'Insufficient credits. This premium feature requires 2 credits.' }, { status: 403 });
        }

        if (!process.env.APIFY_API_TOKEN) {
            return NextResponse.json({ error: 'Job scraper service is currently unavailable.' }, { status: 503 });
        }

        const client = new ApifyClient({
            token: process.env.APIFY_API_TOKEN,
        });

        console.log(`Starting Apify scrape for job: ${jobUrl}`);
        let run;
        let jobTitle = '';
        let companyName = '';
        let jobDescription = '';

        // 2. Determine platform and run appropriate scraper
        if (jobUrl.includes('indeed.com')) {
            // Indeed Scraper: misioslav/indeed-scraper
            run = await client.actor("misioslav/indeed-scraper").call({
                "startUrls": [{ "url": jobUrl }],
                "maxItems": 1
            });
            const { items } = await client.dataset(run.defaultDatasetId).listItems();
            if (items && items.length > 0) {
                const jobData = items[0] as any;
                jobTitle = jobData.positionName || '';
                companyName = jobData.company || '';
                jobDescription = jobData.description || '';
            }
        }
        else if (jobUrl.includes('linkedin.com/jobs')) {
            // LinkedIn Jobs Scraper: jaymcdowell/linkedin-jobs-scraper
            run = await client.actor("jaymcdowell/linkedin-jobs-scraper").call({
                "jobUrls": [jobUrl]
            });
            const { items } = await client.dataset(run.defaultDatasetId).listItems();
            if (items && items.length > 0) {
                const jobData = items[0] as any;
                jobTitle = jobData.title || '';
                companyName = jobData.company || '';
                jobDescription = jobData.description || '';
            }
        }
        else if (jobUrl.includes('glassdoor.com')) {
            // Glassdoor Scraper: epctex/glassdoor-scraper
            run = await client.actor("epctex/glassdoor-scraper").call({
                "startUrls": [{ "url": jobUrl }],
                "maxItems": 1
            });
            const { items } = await client.dataset(run.defaultDatasetId).listItems();
            if (items && items.length > 0) {
                const jobData = items[0] as any;
                jobTitle = jobData.jobTitle || '';
                companyName = jobData.employerName || '';
                jobDescription = jobData.jobDescription || '';
            }
        }
        else {
            return NextResponse.json({ error: 'Unsupported URL. Please provide an Indeed, LinkedIn Jobs, or Glassdoor link.' }, { status: 400 });
        }

        if (!jobDescription) {
            return NextResponse.json({ error: 'Could not extract job description from the provided URL.' }, { status: 404 });
        }

        // 3. Deduct 2 credits from user
        const newCreditBalance = profileData.total_credits - 2;
        const { error: updateError } = await supabase
            .from('profiles')
            .update({ total_credits: newCreditBalance })
            .eq('id', user.id);

        if (updateError) {
            console.error('Error updating user credits:', updateError);
            return NextResponse.json({ error: 'Failed to deduct credits. Operation cancelled.' }, { status: 500 });
        }

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

        // 5. Log the transaction
        await supabase
            .from('credit_transactions')
            .insert({
                user_id: user.id,
                amount: -2,
                type: 'usage',
                stripe_session_id: `job_scrape_${run.id}`
            });

        console.log(`Successfully scraped job and deducted 2 credits from user ${user.id}`);

        return NextResponse.json({
            jobTitle,
            companyName,
            jobDescription
        });

    } catch (err: any) {
        console.error('Job Scraper Error:', err);
        return NextResponse.json({ error: err.message || 'An unexpected error occurred during import.' }, { status: 500 });
    }
}
