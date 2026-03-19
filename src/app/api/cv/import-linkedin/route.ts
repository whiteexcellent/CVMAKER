import { NextResponse } from 'next/server';

import { createClient } from '@/lib/supabase/server';
import { checkAndDeductCredit, refundCredit } from '@/lib/credits';
import { linkedinImportRequestSchema, linkedinImportResponseSchema } from '@/lib/schemas';
import { parseJsonBody, RequestGuardError, getRateLimitIdentifier } from '@/lib/request-guards';
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
                routeKey: 'linkedin_import',
                maxRequests: 6,
                windowSeconds: 3600,
            });
        } catch (rateLimitError: any) {
            return NextResponse.json({ error: rateLimitError.message }, { status: 429 });
        }

        const { linkedinUrl } = await parseJsonBody(req, linkedinImportRequestSchema, {
            maxBytes: 4_000,
            invalidPayloadMessage: 'Invalid payload: Must be a valid LinkedIn URL',
        });

        if (!linkedinUrl.includes('linkedin.com/in/')) {
            return NextResponse.json({ error: 'Please provide a valid LinkedIn profile URL (e.g., https://www.linkedin.com/in/username/)' }, { status: 400 });
        }

        const { data: profile } = await supabase.from('profiles').select('subscription_tier').eq('id', user.id).single();
        const isPro = profile?.subscription_tier === 'pro';

        if (!isPro) {
            return NextResponse.json({ error: 'LinkedIn Import is a Pro feature. Please upgrade to Pro Yearly to unlock this tool.' }, { status: 403 });
        }

        const creditCheck = await checkAndDeductCredit(user.id, 1, 'linkedin_import');
        if (!creditCheck.allowed) {
            return NextResponse.json({ error: creditCheck.reason }, { status: 402 });
        }

        if (!process.env.APIFY_API_TOKEN) {
            console.error('APIFY_API_TOKEN is not set in environment variables');
            await refundCredit(user.id, 1, 'linkedin_import_refund');
            return NextResponse.json({ error: 'LinkedIn import service is currently unavailable.' }, { status: 503 });
        }

        const apifyUrl = 'https://api.apify.com/v2/acts/dev_fusion~linkedin-profile-scraper/run-sync-get-dataset-items';
        const runRes = await fetch(apifyUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${process.env.APIFY_API_TOKEN}`
            },
            body: JSON.stringify({
                profileUrls: [linkedinUrl]
            }),
            signal: AbortSignal.timeout(30_000),
        });

        if (!runRes.ok) {
            await refundCredit(user.id, 1, 'linkedin_import_refund');
            const errorText = await runRes.text();
            console.error('Apify API Error:', errorText);
            throw new Error(`Apify returned ${runRes.status}`);
        }

        const items = await runRes.json();
        if (!items || items.length === 0) {
            await refundCredit(user.id, 1, 'linkedin_import_refund');
            return NextResponse.json({ error: 'Could not extract data from this LinkedIn profile. Please ensure it is a public profile.' }, { status: 404 });
        }

        const profileDataRaw = items[0] as any;

        const rawExperience = profileDataRaw.experience || profileDataRaw.experiences || [];
        const experienceFormatted = Array.isArray(rawExperience)
            ? rawExperience.map((exp: any) => {
                const title = exp.title || exp.position || exp.role || 'Role';
                const company = exp.company || exp.companyName || 'Company';
                const duration = exp.dateRange || exp.duration || exp.period || 'Dates';
                const desc = exp.description || exp.summary || '';
                return `${title} at ${company} (${duration}).\n${desc}`;
            }).join('\n\n').trim()
            : '';

        const rawEdu = profileDataRaw.education || profileDataRaw.educations || [];
        const educationFormatted = Array.isArray(rawEdu)
            ? rawEdu.map((edu: any) => {
                const degree = edu.degree || edu.degreeName || 'Degree';
                const school = edu.school || edu.schoolName || edu.institution || 'School';
                const duration = edu.dateRange || edu.duration || edu.period || 'Dates';
                return `${degree} at ${school} (${duration})`;
            }).join('\n\n').trim()
            : '';

        let skillsFormatted = '';
        if (Array.isArray(profileDataRaw.skills)) {
            skillsFormatted = profileDataRaw.skills
                .map((skill: any) => typeof skill === 'string' ? skill : skill.name || skill.title || '')
                .filter(Boolean)
                .join(', ');
        } else if (typeof profileDataRaw.skills === 'string') {
            skillsFormatted = profileDataRaw.skills;
        }

        const structuredResult = linkedinImportResponseSchema.parse({
            experience: experienceFormatted,
            education: educationFormatted,
            skills: skillsFormatted,
            summary: profileDataRaw.about || profileDataRaw.summary || profileDataRaw.description || '',
            fullName: profileDataRaw.fullName || `${profileDataRaw.firstName || ''} ${profileDataRaw.lastName || ''}`.trim(),
            targetRole: profileDataRaw.headline || profileDataRaw.position || '',
        });

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

        return NextResponse.json({
            ...structuredResult,
            trackRecord: structuredResult.experience,
            capabilities: structuredResult.skills,
        });

    } catch (err: any) {
        if (err instanceof RequestGuardError) {
            return NextResponse.json(err.payload, { status: err.status });
        }

        console.error('LinkedIn Import Error:', err);
        return NextResponse.json({ error: err.message || 'An unexpected error occurred during import.' }, { status: 500 });
    }
}
