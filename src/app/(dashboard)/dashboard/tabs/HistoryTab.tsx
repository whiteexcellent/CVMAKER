import { HugeiconsIcon } from "@hugeicons/react";
import { Note01Icon, Delete02Icon } from "@hugeicons/core-free-icons";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import Link from 'next/link';
import { useTranslation } from '@/components/I18nProvider';
import { TiltCard } from '@/components/reactbits/TiltCard';

interface HistoryTabProps {
  resumes: any[];
  handleDeleteResume: (id: string) => void;
}

export function HistoryTab({ resumes, handleDeleteResume }: HistoryTabProps) {
  const { t } = useTranslation();

  return (
    <Card className="liquid-glass rounded-[2rem] border border-black/8 bg-white/72 text-zinc-950 shadow-[0_24px_90px_rgba(15,23,42,0.08)] dark:border-white/10 dark:bg-white/[0.04] dark:text-white dark:shadow-[0_30px_120px_rgba(0,0,0,0.42)]">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-2xl font-black tracking-tight">
          <HugeiconsIcon icon={Note01Icon} className="h-5 w-5"  strokeWidth={1.5} /> {t('dashboard.docHistory')}
        </CardTitle>
        <CardDescription className="font-light text-zinc-600 dark:text-white/55">
          {t('dashboard.docHistoryDesc')}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {resumes && resumes.length > 0 ? (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {resumes.map((resume) => {
              const title = resume.title || t('dashboard.untitledCv');
              const date = new Date(resume.created_at).toLocaleDateString();
              return (
                <TiltCard
                  key={resume.id}
                  className="flex h-full min-h-[160px] flex-col justify-between rounded-[1.5rem] border border-black/8 bg-black/[0.02] backdrop-blur-sm transition-all duration-500 hover:border-black/12 hover:bg-black/[0.04] hover:shadow-[0_24px_60px_rgba(15,23,42,0.08)] dark:border-white/10 dark:bg-white/[0.04] dark:hover:border-white/20 dark:hover:bg-white/[0.07] dark:hover:shadow-[0_24px_60px_rgba(0,0,0,0.36)]"
                >
                  <div className="z-10 flex h-full flex-col p-6">
                    <div className="mb-2 flex items-start justify-between">
                      <h3 className="line-clamp-1 pr-2 text-lg font-bold text-zinc-950 dark:text-white">
                        {title}
                      </h3>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <button
                            onClick={(e) => {
                              e.preventDefault();
                              handleDeleteResume(resume.id);
                            }}
                            className="relative z-20 flex-shrink-0 cursor-pointer rounded-full border border-red-500/25 bg-red-500/10 p-1.5 text-red-700 transition-colors hover:bg-red-500/20 dark:text-red-200"
                            title={t('toast.deleteCv') || 'Delete CV'}
                          >
                            <HugeiconsIcon icon={Delete02Icon} className="h-4 w-4"  strokeWidth={1.5} />
                          </button>
                        </TooltipTrigger>
                        <TooltipContent>{t('toast.deleteCv') || 'Delete CV'}</TooltipContent>
                      </Tooltip>
                    </div>
                    <p className="mb-auto pb-4 text-sm font-medium text-zinc-600 dark:text-white/55">
                      {t('dashboard.created')} {date}
                    </p>
                    <Button
                      asChild
                      className="relative z-20 h-12 w-full rounded-full bg-zinc-950 font-bold text-white transition-transform duration-300 hover:scale-[1.02] hover:bg-black/90 dark:bg-white dark:text-black dark:hover:bg-white/90"
                    >
                      <Link href={`/cv/${resume.id}`}>{t('dashboard.viewEdit')}</Link>
                    </Button>
                  </div>
                </TiltCard>
              );
            })}
          </div>
        ) : (
          <div className="liquid-glass rounded-[1.75rem] border border-black/8 bg-black/[0.02] p-12 text-center backdrop-blur-md dark:border-white/10 dark:bg-white/[0.04]">
            <h3 className="mb-2 text-xl font-bold">{t('dashboard.noCvs')}</h3>
            <p className="mb-6 text-zinc-600 dark:text-white/55">{t('dashboard.noCvsDesc')}</p>
            <Button
              asChild
              className="relative z-20 h-12 rounded-full border-0 bg-zinc-950 px-6 font-bold text-white shadow-lg transition-transform duration-300 hover:scale-[1.02] hover:bg-black/90 dark:bg-white dark:text-black dark:hover:bg-white/90"
            >
              <Link href="/wizard">{t('dashboard.startBuilding')}</Link>
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
