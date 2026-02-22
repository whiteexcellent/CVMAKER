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
        const { linkedinUrl } = body;

        if (!linkedinUrl || !linkedinUrl.includes('linkedin.com/in/')) {
            return NextResponse.json({ error: 'Please provide a valid LinkedIn profile URL (e.g., https://www.linkedin.com/in/username/)' }, { status: 400 });
        }

        // 1. Check if user has at least 1 credit
        const { data: profileData, error: profileError } = await supabase
            .from('profiles')
            .select('total_credits')
            .eq('id', user.id)
            .single();

        if (profileError || !profileData || profileData.total_credits < 1) {
            return NextResponse.json({ error: 'Insufficient credits. Please purchase more credits to use this feature.' }, { status: 403 });
        }

        // 2. Initialize Apify Client
        if (!process.env.APIFY_API_TOKEN) {
            console.error('APIFY_API_TOKEN is not set in environment variables');
            return NextResponse.json({ error: 'LinkedIn import service is currently unavailable.' }, { status: 503 });
        }

        const client = new ApifyClient({
            token: process.env.APIFY_API_TOKEN,
        });

        // 3. Call Apify Actor (rocketrpm/linkedin-profile-scraper)
        console.log(`Starting Apify scrape for: ${linkedinUrl}`);

        // This is the fastest, no-cookie scraper. 
        const run = await client.actor("rocketrpm/linkedin-profile-scraper").call({
            "urls": [linkedinUrl],
            "minDelay": 1,
            "maxDelay": 3
        });

        // 4. Fetch the results
        const { items } = await client.dataset(run.defaultDatasetId).listItems();

        if (!items || items.length === 0) {
            console.error('Apify returned no data for:', linkedinUrl);
            return NextResponse.json({ error: 'Could not extract data from this LinkedIn profile. Please ensure it is a public profile.' }, { status: 404 });
        }

        const profileDataRaw = items[0] as any;

        // 5. Format the data for our Wizard
        // Extracting experiences
        let experienceFormatted = '';
        if (profileDataRaw.experience && Array.isArray(profileDataRaw.experience)) {
            experienceFormatted = profileDataRaw.experience.map((exp: any) => {
                return `${exp.title || 'Role'} at ${exp.company || 'Company'} (${exp.dateRange || 'Dates'}).\n${exp.description || ''}`;
            }).join('\n\n');
        }

        // Extracting education
        let educationFormatted = '';
        if (profileDataRaw.education && Array.isArray(profileDataRaw.education)) {
            educationFormatted = profileDataRaw.education.map((edu: any) => {
                return `${edu.degree || 'Degree'} at ${edu.school || 'School'} (${edu.dateRange || 'Dates'})`;
            }).join('\n\n');
        }

        // Extracting skills
        let skillsFormatted = profileDataRaw.skills || '';
        if (Array.isArray(profileDataRaw.skills)) {
            skillsFormatted = profileDataRaw.skills.join(', ');
        }

        // Extracting summary
        const summaryFormatted = profileDataRaw.about || profileDataRaw.summary || '';

        const formattedResult = {
            experience: experienceFormatted.trim(),
            education: educationFormatted.trim(),
            skills: skillsFormatted,
            summary: summaryFormatted, // Optional: User might want to use it
            fullName: `${profileDataRaw.firstName || ''} ${profileDataRaw.lastName || ''}`.trim(),
            targetRole: profileDataRaw.headline || ''
        };

        // 6. Deduct 1 credit from user
        const newCreditBalance = profileData.total_credits - 1;
        const { error: updateError } = await supabase
            .from('profiles')
            .update({ total_credits: newCreditBalance })
            .eq('id', user.id);

        if (updateError) {
            console.error('Error updating user credits:', updateError);
            return NextResponse.json({ error: 'Failed to deduct credits. Scraping data might be lost.' }, { status: 500 });
        }

        // 7. Save scraped data to database
        const { error: insertError } = await supabase
            .from('scraped_profiles')
            .insert({
                user_id: user.id,
                source_url: linkedinUrl,
                raw_data: profileDataRaw
            });

        if (insertError) {
            console.error('Error saving scraped profile to db (non-fatal):', insertError);
        }

        // 8. Log the transaction
        await supabase
            .from('credit_transactions')
            .insert({
                user_id: user.id,
                amount: -1,
                type: 'usage',
                stripe_session_id: `linkedin_scrape_${run.id}` // Link it to the Apify run
            });

        console.log(`Successfully scraped and deducted 1 credit from user ${user.id}`);

        return NextResponse.json(formattedResult);

    } catch (err: any) {
        console.error('LinkedIn Import Error:', err);
        return NextResponse.json({ error: err.message || 'An unexpected error occurred during import.' }, { status: 500 });
    }
}
