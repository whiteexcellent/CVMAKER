import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import DashboardClient from './DashboardClient';
import { DashboardHeader } from '@/components/dashboard/DashboardHeader';

export default async function DashboardPage() {
  const supabase = await createClient();

  // Middleware already protects this route, but we double-check for safety
  const { data, error } = await supabase.auth.getUser();
  if (error || !data?.user) {
    redirect('/login');
  }

  const [profileResult, resumesResult, coverLettersResult, presentationsResult] = await Promise.all(
    [
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
        .select(
          'id, title, created_at, share_enabled, share_id, share_expires_at, views, company_name'
        )
        .eq('user_id', data.user.id)
        .order('created_at', { ascending: false })
        .limit(50),
      supabase
        .from('presentations')
        .select(
          'id, title, created_at, share_enabled, share_id, share_expires_at, views, target_company'
        )
        .eq('user_id', data.user.id)
        .order('created_at', { ascending: false })
        .limit(50),
    ]
  );

  const profile = profileResult.data;

  // Calculate Display Credits (Considering UTC Daily Resets)
  let displayCredits = profile?.total_credits || 0;
  if (profile) {
    const now = new Date();
    const lastReset = profile.last_credit_reset ? new Date(profile.last_credit_reset) : new Date(0);

    const isNewDay =
      now.getUTCFullYear() > lastReset.getUTCFullYear() ||
      now.getUTCMonth() > lastReset.getUTCMonth() ||
      now.getUTCDate() > lastReset.getUTCDate();

    const currentDaily = isNewDay ? 1 : profile.daily_credits || 0;
    displayCredits += currentDaily;

    // Cap free users to maximum 2 credits
    if (profile.subscription_tier !== 'pro') {
      displayCredits = Math.min(displayCredits, 2);
    }
  }

  const resumes = (resumesResult.data || []).map((resume) => ({
    ...resume,
    documentType: 'resume',
  }));
  const coverLetters = (coverLettersResult.data || []).map((coverLetter) => ({
    ...coverLetter,
    documentType: 'cover_letter',
  }));
  const presentations = (presentationsResult.data || []).map((presentation) => ({
    ...presentation,
    documentType: 'presentation',
  }));

  return (
    <div className="relative flex min-h-screen flex-col overflow-hidden bg-[#f6f2ea] text-zinc-950 dark:bg-[#020202] dark:text-white">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.9),transparent_30%),radial-gradient(circle_at_82%_20%,rgba(255,255,255,0.55),transparent_24%),linear-gradient(180deg,#fbf8f2_0%,#f3ede3_55%,#ece4d7_100%)] dark:bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.13),transparent_34%),radial-gradient(circle_at_80%_18%,rgba(255,255,255,0.08),transparent_24%),linear-gradient(180deg,#050505_0%,#020202_55%,#000_100%)]" />
        <div className="absolute top-24 left-[-10%] h-72 w-72 rounded-full bg-black/[0.05] blur-[140px] dark:bg-white/8" />
        <div className="absolute right-[-8%] bottom-[-10%] h-96 w-96 rounded-full bg-black/[0.04] blur-[160px] dark:bg-white/6" />
        <div className="absolute inset-0 [background-image:linear-gradient(rgba(24,24,27,0.08)_1px,transparent_1px),linear-gradient(90deg,rgba(24,24,27,0.08)_1px,transparent_1px)] [background-size:96px_96px] opacity-[0.06] dark:[background-image:linear-gradient(rgba(255,255,255,0.12)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.12)_1px,transparent_1px)]" />
      </div>

      <div className="relative z-10 flex min-h-screen flex-col">
        <DashboardHeader
          displayCredits={displayCredits}
          isPro={profile?.subscription_tier === 'pro'}
        />

        <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-6 sm:px-6 lg:px-12 lg:py-10">
          <DashboardClient
            totalCredits={displayCredits}
            resumes={resumes || []}
            coverLetters={coverLetters || []}
            presentations={presentations || []}
            isPro={profile?.subscription_tier === 'pro'}
          />
        </main>
      </div>
    </div>
  );
}
