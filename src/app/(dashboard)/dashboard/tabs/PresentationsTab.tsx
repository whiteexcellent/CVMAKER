import { HugeiconsIcon } from "@hugeicons/react";
import { ComputerIcon, PlusSignIcon } from "@hugeicons/core-free-icons";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { useTranslation } from '@/components/I18nProvider';

interface PresentationsTabProps {
  presentations: any[];
}

export function PresentationsTab({ presentations }: PresentationsTabProps) {
  const { t } = useTranslation();

  return (
    <Card className="liquid-glass rounded-[2rem] border border-black/8 bg-white/72 text-zinc-950 shadow-[0_24px_90px_rgba(15,23,42,0.08)] dark:border-white/10 dark:bg-white/[0.04] dark:text-white dark:shadow-[0_30px_120px_rgba(0,0,0,0.42)]">
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle className="flex items-center gap-2 text-2xl font-black tracking-tight">
            <HugeiconsIcon icon={ComputerIcon} className="h-5 w-5"  strokeWidth={1.5} /> {t('dashboard.presentations')}
          </CardTitle>
          <CardDescription className="font-light text-zinc-600 dark:text-white/55">
            {t('dashboard.presentationsDesc')}
          </CardDescription>
        </div>
        {presentations && presentations.length > 0 && (
          <Button
            asChild
            className="h-12 rounded-full bg-zinc-950 px-6 font-bold text-white transition-all duration-300 hover:bg-black/90 dark:bg-white dark:text-black dark:hover:bg-white/90"
          >
            <Link href="/presentation/new">
              <HugeiconsIcon icon={PlusSignIcon} className="mr-2 h-4 w-4"  strokeWidth={1.5} />
              {t('dashboard.createPresentation')}
            </Link>
          </Button>
        )}
      </CardHeader>
      <CardContent>
        {presentations && presentations.length > 0 ? (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {presentations.map((p) => {
              const date = new Date(p.created_at).toLocaleDateString();
              return (
                <div
                  key={p.id}
                  className="flex flex-col justify-between rounded-[1.5rem] border border-black/8 bg-black/[0.02] p-6 backdrop-blur-sm transition-all duration-500 hover:-translate-y-1 hover:border-black/12 hover:bg-black/[0.04] hover:shadow-[0_24px_60px_rgba(15,23,42,0.08)] dark:border-white/10 dark:bg-white/[0.04] dark:hover:border-white/20 dark:hover:bg-white/[0.07] dark:hover:shadow-[0_24px_60px_rgba(0,0,0,0.36)]"
                >
                  <div>
                    <div className="mb-2 flex items-start justify-between">
                      <h3 className="line-clamp-1 pr-2 text-lg font-bold text-zinc-950 dark:text-white">
                        {p.title || t('dashboard.untitledPresentation')}
                      </h3>
                    </div>
                    <p className="mb-4 text-sm font-medium text-zinc-600 dark:text-white/55">
                      {t('dashboard.created')} {date}
                    </p>
                  </div>
                  <Button
                    asChild
                    className="h-12 w-full rounded-full bg-zinc-950 font-bold text-white transition-all duration-300 hover:bg-black/90 dark:bg-white dark:text-black dark:hover:bg-white/90"
                  >
                    <Link href={`/presentation/${p.id}`}>{t('dashboard.viewEdit')}</Link>
                  </Button>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="liquid-glass rounded-[1.75rem] border border-black/8 bg-black/[0.02] p-12 text-center backdrop-blur-md dark:border-white/10 dark:bg-white/[0.04]">
            <h3 className="mb-2 text-xl font-bold">{t('dashboard.noPresentations')}</h3>
            <p className="mb-6 text-zinc-600 dark:text-white/55">
              {t('dashboard.noPresentationsDesc')}
            </p>
            <Button
              asChild
              className="h-12 rounded-full border-0 bg-zinc-950 px-6 font-bold text-white shadow-lg transition-all duration-300 hover:bg-black/90 dark:bg-white dark:text-black dark:hover:bg-white/90"
            >
              <Link href="/presentation/new">{t('dashboard.createPresentation')}</Link>
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
