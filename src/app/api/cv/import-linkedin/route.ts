import { NextResponse } from 'next/server';
import { z } from 'zod';

import { createClient } from '@/lib/supabase/server';
import { checkAndDeductCredit } from '@/lib/credits';
import { supabaseAdmin } from '@/lib/supabase/admin';

export const dynamic = 'force-dynamic';

const schema = z.object({
    linkedinUrl: z.string().url()
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
            return NextResponse.json({ error: 'Invalid payload: Must be a valid LinkedIn URL' }, { status: 400 });
        }
        const { linkedinUrl } = parsed.data;

        if (!linkedinUrl.includes('linkedin.com/in/')) {
            return NextResponse.json({ error: 'Please provide a valid LinkedIn profile URL (e.g., https://www.linkedin.com/in/username/)' }, { status: 400 });
        }

        const { data: profile } = await supabase.from('profiles').select('subscription_tier').eq('id', user.id).single();
        const isPro = profile?.subscription_tier === 'pro';
        const isDev = process.env.NODE_ENV === 'development';

        if (!isPro && !isDev) {
            return NextResponse.json({ error: 'LinkedIn Import is a Pro feature. Please upgrade to Pro Yearly to unlock this tool.' }, { status: 403 });
        }

        // 1. Check User Credits Securely
        const creditCheck = await checkAndDeductCredit(user.id, 1);
        if (!creditCheck.allowed) {
            return NextResponse.json({ error: creditCheck.reason }, { status: 402 });
        }

        // 2. Initialize Apify Client
        if (!process.env.APIFY_API_TOKEN) {
            console.error('APIFY_API_TOKEN is not set in environment variables');
            return NextResponse.json({ error: 'LinkedIn import service is currently unavailable.' }, { status: 503 });
        }

        // 3. Call Apify Actor (dev_fusion/linkedin-profile-scraper)


        // Using native fetch to bypass Turbopack dynamic module resolution error
        const apifyUrl = `https://api.apify.com/v2/acts/dev_fusion~linkedin-profile-scraper/run-sync-get-dataset-items`;

        const runRes = await fetch(apifyUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${process.env.APIFY_API_TOKEN}`
            },
            body: JSON.stringify({
                "profileUrls": [linkedinUrl]
            })
        });

        if (!runRes.ok) {
            await supabaseAdmin.rpc('add_credits', { user_id_param: user.id, amount_param: 1 });
            const errorText = await runRes.text();
            console.error("Apify API Error:", errorText);
            throw new Error(`Apify returned ${runRes.status}`);
        }

        const items = await runRes.json();

        // 4. Fetch the results
        if (!items || items.length === 0) {
            await supabaseAdmin.rpc('add_credits', { user_id_param: user.id, amount_param: 1 });
            console.error('Apify returned no data for:', linkedinUrl);
            return NextResponse.json({ error: 'Could not extract data from this LinkedIn profile. Please ensure it is a public profile.' }, { status: 404 });
        }

        const profileDataRaw = items[0] as any;

        // 5. Format the data for our Wizard (Defensive extraction for dev_fusion)
        // Extracting experiences
        let experienceFormatted = '';
        const rawExperience = profileDataRaw.experience || profileDataRaw.experiences || [];
        if (Array.isArray(rawExperience)) {
            experienceFormatted = rawExperience.map((exp: any) => {
                const title = exp.title || exp.position || exp.role || 'Role';
                const company = exp.company || exp.companyName || 'Company';
                const duration = exp.dateRange || exp.duration || exp.period || 'Dates';
                const desc = exp.description || exp.summary || '';
                return `${title} at ${company} (${duration}).\n${desc}`;
            }).join('\n\n');
        }

        // Extracting education
        let educationFormatted = '';
        const rawEdu = profileDataRaw.education || profileDataRaw.educations || [];
        if (Array.isArray(rawEdu)) {
            educationFormatted = rawEdu.map((edu: any) => {
                const degree = edu.degree || edu.degreeName || 'Degree';
                const school = edu.school || edu.schoolName || edu.institution || 'School';
                const duration = edu.dateRange || edu.duration || edu.period || 'Dates';
                return `${degree} at ${school} (${duration})`;
            }).join('\n\n');
        }

        // Extracting skills
        let skillsFormatted = profileDataRaw.skills || '';
        if (Array.isArray(profileDataRaw.skills)) {
            skillsFormatted = profileDataRaw.skills.map((s: any) => typeof s === 'string' ? s : s.name || s.title || JSON.stringify(s)).join(', ');
        } else if (typeof profileDataRaw.skills === 'string') {
            skillsFormatted = profileDataRaw.skills;
        }

        // Extracting summary
        const summaryFormatted = profileDataRaw.about || profileDataRaw.summary || profileDataRaw.description || '';

        const fullName = profileDataRaw.fullName || `${profileDataRaw.firstName || ''} ${profileDataRaw.lastName || ''}`.trim();
        const headline = profileDataRaw.headline || profileDataRaw.position || '';

        const formattedResult = {
            experience: experienceFormatted.trim(),
            education: educationFormatted.trim(),
            skills: skillsFormatted,
            summary: summaryFormatted,
            fullName: fullName,
            targetRole: headline
        };

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

        // 8. (Deduction transaction handled atomically by deduct_credits RPC)

        return NextResponse.json(formattedResult);

    } catch (err: any) {
        console.error('LinkedIn Import Error:', err);
        return NextResponse.json({ error: err.message || 'An unexpected error occurred during import.' }, { status: 500 });
    }
}
