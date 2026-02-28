import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { ThemeToggle } from '@/components/ThemeToggle'
import { LanguageToggle } from '@/components/LanguageToggle'
import SettingsClient from './SettingsClient'
import { ArrowLeft } from 'lucide-react'

export default async function SettingsPage() {
    const supabase = await createClient()

    // Fetch user
    const { data: authData, error: authErr } = await supabase.auth.getUser()
    if (authErr || !authData?.user) {
        redirect('/login')
    }

    const user = authData.user;

    // Fetch profile
    const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single()

    // Fetch specific credit usage using our RPC
    // Note: The credits logic was moved to an RPC in previous tasks.
    // If you check '01_add_credits_rpc.sql', it calculates this.
    const { data: creditsData } = await supabase.rpc('get_user_credits', { p_user_id: user.id });

    let isUnlimited = false;
    let remainingCredits = 0;

    if (creditsData && Array.isArray(creditsData) && creditsData.length > 0) {
        isUnlimited = creditsData[0].is_unlimited;
        remainingCredits = creditsData[0].remaining_credits;
        if (!isUnlimited) {
            remainingCredits = Math.min(remainingCredits, 2);
        }
    } else if (profile) {
        // Fallback to local calculation if RPC fails
        const now = new Date()
        const lastReset = profile.last_credit_reset ? new Date(profile.last_credit_reset) : new Date(0)
        const isNewDay =
            now.getUTCFullYear() > lastReset.getUTCFullYear() ||
            now.getUTCMonth() > lastReset.getUTCMonth() ||
            now.getUTCDate() > lastReset.getUTCDate()

        const currentDaily = isNewDay ? 1 : (profile.daily_credits || 0)
        remainingCredits = profile.total_credits + currentDaily
        isUnlimited = profile.subscription_tier === 'pro'
        if (!isUnlimited) {
            remainingCredits = Math.min(remainingCredits, 2)
        }
    }


    return (
        <div className="flex min-h-screen flex-col bg-slate-50 dark:bg-zinc-950 text-black dark:text-white font-sans">
            <header className="flex h-16 items-center border-b border-black/10 dark:border-white/10 px-6 bg-white dark:bg-black">
                <div className="flex flex-1 items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Link href="/dashboard" className="text-black/60 dark:text-white/60 hover:text-black dark:hover:text-white transition-colors">
                            <ArrowLeft className="w-5 h-5" />
                        </Link>
                        <Link href="/" className="font-bold text-lg tracking-tight hover:opacity-80 transition-opacity">
                            OMNICV
                        </Link>
                    </div>

                    <div className="flex items-center gap-4">
                        <LanguageToggle />
                        <ThemeToggle />
                    </div>
                </div>
            </header>

            <main className="flex-1 p-6 lg:p-12 max-w-4xl mx-auto w-full">
                <SettingsClient
                    user={{
                        email: user.email || 'Unknown',
                        id: user.id
                    }}
                    credits={{
                        remaining: remainingCredits,
                        isUnlimited: isUnlimited
                    }}
                    subscriptionTier={profile?.subscription_tier || 'free'}
                />
            </main>
        </div>
    )
}
