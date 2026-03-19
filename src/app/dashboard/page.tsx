import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import DashboardClient from './DashboardClient'
import { DashboardHeader } from '@/components/dashboard/DashboardHeader'

export default async function DashboardPage() {
    const supabase = await createClient()

    // Middleware already protects this route, but we double-check for safety
    const { data, error } = await supabase.auth.getUser()
    if (error || !data?.user) {
        redirect('/login')
    }

    const [profileResult, resumesResult, coverLettersResult, presentationsResult] = await Promise.all([
        supabase
            .from('profiles')
            .select('id, total_credits, daily_credits, last_credit_reset, subscription_tier')
            .eq('id', data.user.id)
            .single(),
        supabase
            .from('resumes')
            .select('id, title, created_at, share_enabled, share_id, share_expires_at, views')
            .eq('user_id', data.user.id)
            .order('created_at', { ascending: false })
            .limit(50),
        supabase
            .from('cover_letters')
            .select('id, title, created_at, share_enabled, share_id, share_expires_at, views, company_name')
            .eq('user_id', data.user.id)
            .order('created_at', { ascending: false })
            .limit(50),
        supabase
            .from('presentations')
            .select('id, title, created_at, share_enabled, share_id, share_expires_at, views, target_company')
            .eq('user_id', data.user.id)
            .order('created_at', { ascending: false })
            .limit(50),
    ]);

    const profile = profileResult.data;

    // Calculate Display Credits (Considering UTC Daily Resets)
    let displayCredits = profile?.total_credits || 0
    if (profile) {
        const now = new Date()
        const lastReset = profile.last_credit_reset ? new Date(profile.last_credit_reset) : new Date(0)

        const isNewDay =
            now.getUTCFullYear() > lastReset.getUTCFullYear() ||
            now.getUTCMonth() > lastReset.getUTCMonth() ||
            now.getUTCDate() > lastReset.getUTCDate()

        const currentDaily = isNewDay ? 1 : (profile.daily_credits || 0)
        displayCredits += currentDaily

        // Cap free users to maximum 2 credits
        if (profile.subscription_tier !== 'pro') {
            displayCredits = Math.min(displayCredits, 2)
        }
    }

    const resumes = (resumesResult.data || []).map((resume) => ({ ...resume, documentType: 'resume' }));
    const coverLetters = (coverLettersResult.data || []).map((coverLetter) => ({ ...coverLetter, documentType: 'cover_letter' }));
    const presentations = (presentationsResult.data || []).map((presentation) => ({ ...presentation, documentType: 'presentation' }));

    return (
        <div className="flex min-h-screen flex-col bg-white dark:bg-black text-black dark:text-white">
            <DashboardHeader
                displayCredits={displayCredits}
                isPro={profile?.subscription_tier === 'pro'}
            />

            <main className="flex-1 p-6 lg:p-12 max-w-7xl mx-auto w-full">
                <DashboardClient
                    totalCredits={displayCredits}
                    resumes={resumes || []}
                    coverLetters={coverLetters || []}
                    presentations={presentations || []}
                    isPro={profile?.subscription_tier === 'pro'}
                />
            </main>
        </div>
    )
}
