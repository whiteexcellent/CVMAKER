'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { HoverCard, HoverCardContent, HoverCardTrigger } from '@/components/ui/hover-card';
import { LanguageToggle } from '@/components/LanguageToggle';
import { ThemeToggle } from '@/components/ThemeToggle';
import { useTranslation } from '@/components/I18nProvider';
import { Sparkles } from 'lucide-react';

interface DashboardHeaderProps {
  displayCredits: number;
  isPro: boolean;
}

export function DashboardHeader({ displayCredits, isPro }: DashboardHeaderProps) {
  const { t } = useTranslation();

  return (
    <header className="sticky top-0 z-40 border-b border-black/8 bg-white/58 px-4 py-4 backdrop-blur-2xl supports-[backdrop-filter]:bg-white/48 sm:px-6 dark:border-white/10 dark:bg-black/45 dark:supports-[backdrop-filter]:bg-black/35">
      <div className="mx-auto flex w-full max-w-7xl items-center justify-between gap-4">
        <Link
          href="/"
          className="group inline-flex items-center gap-3 rounded-full border border-black/8 bg-black/[0.03] px-4 py-2 text-sm font-semibold tracking-[0.18em] text-zinc-900 uppercase transition-all duration-300 hover:border-black/12 hover:bg-black/[0.05] dark:border-white/10 dark:bg-white/[0.04] dark:text-white/88 dark:hover:border-white/20 dark:hover:bg-white/[0.07]"
        >
          <span className="flex h-8 w-8 items-center justify-center rounded-full border border-black/8 bg-white/75 shadow-[0_0_24px_rgba(15,23,42,0.08)] dark:border-white/10 dark:bg-white/10 dark:shadow-[0_0_24px_rgba(255,255,255,0.12)]">
            <Sparkles className="h-4 w-4" />
          </span>
          <span className="hidden sm:inline">OMNICV</span>
        </Link>

        <div className="flex items-center gap-2 sm:gap-3">
          <div className="hidden items-center rounded-full border border-black/8 bg-black/[0.03] p-1 backdrop-blur-xl sm:flex dark:border-white/10 dark:bg-white/[0.04]">
            <LanguageToggle />
            <ThemeToggle />
          </div>

          <HoverCard openDelay={120} closeDelay={80}>
            <HoverCardTrigger asChild>
              <button
                type="button"
                className="inline-flex h-11 items-center gap-3 rounded-full border border-black/8 bg-white/68 px-4 text-sm font-semibold text-zinc-900 transition-all duration-300 hover:border-black/12 hover:bg-white/88 dark:border-white/10 dark:bg-white/[0.05] dark:text-white dark:hover:border-white/20 dark:hover:bg-white/[0.08]"
              >
                <span className="text-zinc-500 dark:text-white/55">{t('dashboard.credits')}</span>
                <span className="text-lg leading-none font-black">
                  {isPro ? '∞' : displayCredits}
                </span>
              </button>
            </HoverCardTrigger>
            <HoverCardContent className="space-y-3">
              <div>
                <p className="text-xs font-bold tracking-[0.24em] text-zinc-500 uppercase dark:text-white/45">
                  {t('dashboard.credits')}
                </p>
                <p className="mt-2 text-2xl font-black text-zinc-950 dark:text-white">
                  {isPro ? 'Unlimited' : displayCredits}
                </p>
              </div>
              <p className="text-sm leading-relaxed text-zinc-600 dark:text-white/60">
                {t('dashboard.upgradeDesc')}
              </p>
            </HoverCardContent>
          </HoverCard>

          <Link href="/settings">
            <Button
              variant="ghost"
              size="sm"
              className="hidden h-11 rounded-full border border-black/8 bg-black/[0.03] px-5 font-semibold text-zinc-800 transition-all duration-300 hover:bg-black/[0.06] hover:text-black sm:inline-flex dark:border-white/10 dark:bg-white/[0.04] dark:text-white/82 dark:hover:bg-white/[0.08] dark:hover:text-white"
            >
              {t('dashboard.settings')}
            </Button>
          </Link>
          <form action="/auth/signout" method="post">
            <Button
              variant="outline"
              size="sm"
              type="submit"
              className="h-11 rounded-full border-black/10 bg-white/70 px-5 font-semibold text-zinc-900 transition-all duration-300 hover:bg-white dark:border-white/12 dark:bg-black/30 dark:text-white dark:hover:bg-white/[0.07] dark:hover:text-white"
            >
              {t('dashboard.logout')}
            </Button>
          </form>
        </div>
      </div>
    </header>
  );
}
