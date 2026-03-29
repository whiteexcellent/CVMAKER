"use client";
import { HugeiconsIcon } from "@hugeicons/react";
import { Note01Icon, ComputerIcon, Message01Icon, AddCircleHalfDotIcon, ArrowRight01Icon } from "@hugeicons/core-free-icons";


import { useTranslation } from '@/components/I18nProvider';
import { MagicCard } from '@/components/ui/magic-card';
import { NumberTicker } from '@/components/ui/number-ticker';
import { AnimatedList } from '@/components/ui/animated-list';
import { FlickeringGrid } from '@/components/ui/flickering-grid';
import { AnimatedShinyText } from '@/components/ui/animated-shiny-text';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useTheme } from 'next-themes';
import { formatDistanceToNow } from 'date-fns';

interface OverviewTabProps {
  totalCredits: number;
  resumes: any[];
  coverLetters: any[];
  presentations: any[];
  isPro: boolean;
}

export function OverviewTab({
  totalCredits,
  resumes,
  coverLetters,
  presentations,
  isPro,
}: OverviewTabProps) {
  const { t } = useTranslation();
  const { theme } = useTheme();

  // Combine top 5 recent activities across resumes/covers/presentations
  const recentActivities = [
    ...resumes.map((r) => ({ ...r, type: 'resume', icon: Note01Icon, color: 'text-emerald-500', bg: 'bg-emerald-500/10' })),
    ...coverLetters.map((c) => ({ ...c, type: 'cover_letter', icon: Message01Icon, color: 'text-orange-500', bg: 'bg-orange-500/10' })),
    ...presentations.map((p) => ({ ...p, type: 'presentation', icon: ComputerIcon, color: 'text-blue-500', bg: 'bg-blue-500/10' })),
  ]
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    .slice(0, 5);

  return (
    <div className="relative w-full overflow-hidden rounded-[2rem] border border-black/8 bg-white/72 p-6 md:p-8 dark:border-white/10 dark:bg-black/40">
      {/* Background Effect */}
      <div className="absolute inset-0 z-0">
        <FlickeringGrid
          className="absolute inset-0 h-full w-full opacity-30 [mask-image:radial-gradient(ellipse_at_center,white,transparent_70%)]"
          squareSize={4}
          gridGap={6}
          color={theme === 'dark' ? '#ffffff' : '#000000'}
          maxOpacity={0.15}
          flickerChance={0.1}
        />
      </div>

      <div className="relative z-10 grid grid-cols-1 gap-6 md:grid-cols-4 md:grid-rows-2">
        {/* ACTION / BUILDER CARD (Takes up 2 columns, 2 rows) */}
        <MagicCard
          className="col-span-1 flex flex-col justify-between p-8 shadow-xl md:col-span-2 md:row-span-2"
          gradientColor={theme === 'dark' ? '#262626' : '#E5E7EB'}
        >
          <div className="flex flex-col gap-6 h-full justify-between">
            <div className="space-y-4">
              <div className="inline-flex items-center justify-center rounded-2xl bg-black/5 p-4 dark:bg-white/10">
                <SparklesIcon className="h-8 w-8 text-black dark:text-white" />
              </div>
              <div>
                <h3 className="text-3xl font-black tracking-tight text-zinc-950 dark:text-white">
                  {t('dashboard.builder') || 'AI Builder'}
                </h3>
                <p className="mt-2 leading-relaxed text-zinc-600 dark:text-zinc-400">
                  {t('dashboard.builderDesc') || 'Create stunning, AI-powered professional assets in seconds.'}
                </p>
              </div>
            </div>

            <Button
              asChild
              className="group relative h-14 w-full overflow-hidden rounded-xl bg-zinc-950 px-8 text-base font-bold text-white transition-all hover:scale-[1.02] hover:bg-zinc-900 dark:bg-white dark:text-black dark:hover:bg-zinc-100"
            >
              <Link href="/wizard">
                <span className="relative z-10 flex items-center gap-2">
                  <AnimatedShinyText className="inline-flex items-center justify-center font-bold text-white transition ease-out hover:text-white dark:text-black dark:hover:text-black">
                    {t('dashboard.startWizard') || 'Start Wizard'}
                  </AnimatedShinyText>
                  <HugeiconsIcon icon={ArrowRight01Icon} className="h-4 w-4 transition-transform group-hover:translate-x-1"  strokeWidth={1.5} />
                </span>
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent translate-x-[-100%] animate-[shimmer_2s_infinite] dark:via-black/10" />
              </Link>
            </Button>
          </div>
        </MagicCard>

        {/* CREDITS CARD */}
        <MagicCard
          className="col-span-1 flex flex-col items-center justify-center p-6 text-center md:col-span-1 md:row-span-1"
          gradientColor={theme === 'dark' ? '#262626' : '#E5E7EB'}
        >
          <p className="font-semibold uppercase tracking-widest text-zinc-500 dark:text-zinc-400 text-xs">
            {t('credits.title') || 'Available Credits'}
          </p>
          <div className="mt-4 flex items-baseline justify-center gap-1 font-black text-6xl text-zinc-950 dark:text-white">
            <NumberTicker value={totalCredits} />
          </div>
        </MagicCard>

        {/* TOTAL DOCUMENTS CARD */}
        <MagicCard
          className="col-span-1 flex flex-col items-center justify-center p-6 text-center md:col-span-1 md:row-span-1"
          gradientColor={theme === 'dark' ? '#262626' : '#E5E7EB'}
        >
          <p className="font-semibold uppercase tracking-widest text-zinc-500 dark:text-zinc-400 text-xs">
            Total Documents
          </p>
          <div className="mt-4 flex items-baseline justify-center gap-1 font-black text-6xl text-zinc-950 dark:text-white">
            <NumberTicker value={resumes.length + coverLetters.length + presentations.length} />
          </div>
        </MagicCard>

        {/* RECENT ACTIVITY LIST (Takes up 2 columns, 1 row) */}
        <MagicCard
          className="col-span-1 flex flex-col overflow-hidden p-6 md:col-span-2 md:row-span-1"
          gradientColor={theme === 'dark' ? '#262626' : '#E5E7EB'}
        >
          <div className="mb-4 flex items-center justify-between">
            <h4 className="font-bold text-zinc-950 dark:text-white">Recent Activity</h4>
          </div>
          <div className="flex-1 overflow-hidden">
            {recentActivities.length > 0 ? (
              <AnimatedList>
                {recentActivities.map((item, idx) => (
                  <div
                    key={item.id + idx}
                    className="mb-3 flex items-center gap-4 rounded-2xl border border-black/5 bg-black/[0.02] p-3 transition-colors hover:bg-black/[0.04] dark:border-white/5 dark:bg-white/[0.02] dark:hover:bg-white/[0.04]"
                  >
                    <div className={cn("flex h-10 w-10 shrink-0 items-center justify-center rounded-xl", item.bg, item.color)}>
                      <item.icon className="h-5 w-5" />
                    </div>
                    <div className="flex flex-col overflow-hidden">
                      <span className="truncate text-sm font-bold text-zinc-950 dark:text-white">
                        {item.title || 'Untitled Document'}
                      </span>
                      <span className="text-xs text-zinc-500 dark:text-zinc-400">
                        {`${item.type === 'cover_letter' ? 'Cover Letter' : item.type === 'presentation' ? 'Presentation' : 'Resume'} • ${formatDistanceToNow(new Date(item.created_at), { addSuffix: true })}`}
                      </span>
                    </div>
                  </div>
                ))}
              </AnimatedList>
            ) : (
              <div className="flex h-full flex-col items-center justify-center text-center">
                <p className="text-sm font-medium text-zinc-500 dark:text-zinc-400">
                  No activity yet.
                </p>
                <p className="text-xs text-zinc-400 dark:text-zinc-500">
                  Start creating your first asset!
                </p>
              </div>
            )}
          </div>
        </MagicCard>
      </div>
    </div>
  );
}

function SparklesIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <path d="M9.937 15.5A2 2 0 0 0 8.5 14.063l-6.135-1.582a.5.5 0 0 1 0-.962L8.5 9.936A2 2 0 0 0 9.937 8.5l1.582-6.135a.5.5 0 0 1 .963 0L14.063 8.5A2 2 0 0 0 15.5 9.937l6.135 1.581a.5.5 0 0 1 0 .964L15.5 14.063a2 2 0 0 0-1.437 1.437l-1.582 6.135a.5.5 0 0 1-.963 0z" />
    </svg>
  );
}
