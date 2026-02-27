import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import DashboardClient from './DashboardClient'
import { ThemeToggle } from '@/components/ThemeToggle'
import { LanguageToggle } from '@/components/LanguageToggle'

export default async function DashboardPage() {
    const supabase = await createClient()

    // Middleware already protects this route, but we double-check for safety
    const { data, error } = await supabase.auth.getUser()
    if (error || !data?.user) {
        redirect('/login')
    }

    // Fetch the user's profile to display credits
    const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', data.user.id)
        .single()

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

    // Fetch the user's generated CVs
    const { data: resumes } = await supabase
        .from('resumes')
        .select('*')
        .eq('user_id', data.user.id)
        .order('created_at', { ascending: false })

    // Fetch the user's generated Cover Letters
    const { data: coverLetters } = await supabase
        .from('cover_letters')
        .select('*')
        .eq('user_id', data.user.id)
        .order('created_at', { ascending: false })

    // Fetch the user's generated Presentations
    const { data: presentations } = await supabase
        .from('presentations')
        .select('*')
        .eq('user_id', data.user.id)
        .order('created_at', { ascending: false })

    return (
        <div className="flex min-h-screen flex-col bg-white dark:bg-black text-black dark:text-white">
            <header className="flex h-16 items-center border-b border-black/10 dark:border-white/10 px-6">
                <div className="flex flex-1 items-center justify-between">
                    <Link href="/" className="font-bold text-lg tracking-tight">
                        OMNICV
                    </Link>
                    <div className="flex items-center gap-4">
                        <LanguageToggle />
                        <ThemeToggle />
                        <div className="text-sm font-medium text-black/50 dark:text-white/50 mr-4">
                            Credits: <span className="text-black dark:text-white font-bold text-lg leading-none">{profile?.subscription_tier === 'pro' ? '∞' : displayCredits}</span>
                        </div>
                        <Link href="/settings">
                            <Button variant="ghost" size="sm" className="font-semibold hidden sm:inline-flex">
                                Settings
                            </Button>
                        </Link>
                        <form action="/auth/signout" method="post">
                            <Button variant="outline" size="sm" type="submit" className="border-black/20 dark:border-white/20 hover:bg-black/5 dark:hover:bg-white/5 font-semibold">
                                Log out
                            </Button>
                        </form>
                    </div>
                </div>
            </header>

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
