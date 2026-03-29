import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import DashboardClient from './DashboardClient';

export default async function DashboardPage() {
  const supabase = await createClient();

  const isBypassed = process.env.NODE_ENV === 'development';

  // Middleware already protects this route, but we double-check for safety
  const { data, error } = await supabase.auth.getUser();
  if (!isBypassed && (error || !data?.user)) {
    redirect('/login');
  }

  let profile: any = null;
  let resumesResult: any = { data: [] };
  let coverLettersResult: any = { data: [] };
  let presentationsResult: any = { data: [] };

  if (isBypassed && !data?.user) {
    // Mock data for dev bypass
    profile = {
      id: 'mock-user',
      total_credits: 10,
      daily_credits: 1,
      last_credit_reset: new Date().toISOString(),
      subscription_tier: 'free'
    };
  } else {
    // Standard Fetch
    const [pRes, rRes, cRes, prRes] = await Promise.all([
      supabase
        .from('profiles')
        .select('id, total_credits, daily_credits, last_credit_reset, subscription_tier')
        .eq('id', data.user!.id)
        .single(),
      supabase
        .from('resumes')
        .select('id, title, created_at, share_enabled, share_id, share_expires_at, views')
        .eq('user_id', data.user!.id)
        .order('created_at', { ascending: false })
        .limit(50),
      supabase
        .from('cover_letters')
        .select(
          'id, title, created_at, share_enabled, share_id, share_expires_at, views, company_name'
        )
        .eq('user_id', data.user!.id)
        .order('created_at', { ascending: false })
        .limit(50),
      supabase
        .from('presentations')
        .select(
          'id, title, created_at, share_enabled, share_id, share_expires_at, views, target_company'
        )
        .eq('user_id', data.user!.id)
        .order('created_at', { ascending: false })
        .limit(50),
    ]);

    profile = pRes.data;
    resumesResult = rRes;
    coverLettersResult = cRes;
    presentationsResult = prRes;
  }
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

  const resumes = (resumesResult.data || []).map((resume: any) => ({
    ...resume,
    documentType: 'resume',
  }));
  const coverLetters = (coverLettersResult.data || []).map((coverLetter: any) => ({
    ...coverLetter,
    documentType: 'cover_letter',
  }));
  const presentations = (presentationsResult.data || []).map((presentation: any) => ({
    ...presentation,
    documentType: 'presentation',
  }));

  return (
    <div className="relative flex flex-1 flex-col w-full h-full">
      <DashboardClient
        totalCredits={displayCredits}
        resumes={resumes || []}
        coverLetters={coverLetters || []}
        presentations={presentations || []}
        isPro={profile?.subscription_tier === 'pro'}
      />
    </div>
  );
}
