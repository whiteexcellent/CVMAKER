import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { MonitorPlay, Plus } from 'lucide-react'
import Link from 'next/link'
import { useTranslation } from '@/components/I18nProvider'

interface PresentationsTabProps {
    presentations: any[];
}

export function PresentationsTab({ presentations }: PresentationsTabProps) {
    const { t } = useTranslation()

    return (
        <Card className="liquid-glass border-none shadow-xl rounded-3xl text-black dark:text-white">
            <CardHeader className="flex flex-row items-center justify-between">
                <div>
                    <CardTitle className="text-2xl font-black tracking-tight flex items-center gap-2">
                        <MonitorPlay className="w-5 h-5" /> {t('dashboard.presentations')}
                    </CardTitle>
                    <CardDescription className="text-black/50 dark:text-white/50 font-light">
                        {t('dashboard.presentationsDesc')}
                    </CardDescription>
                </div>
                {presentations && presentations.length > 0 && (
                    <Button asChild className="rounded-xl bg-black hover:bg-black/80 dark:bg-white dark:hover:bg-white/90 text-white dark:text-black font-bold h-12 px-6">
                        <Link href="/presentation/new">
                            <Plus className="w-4 h-4 mr-2" />
                            {t('dashboard.createPresentation')}
                        </Link>
                    </Button>
                )}
            </CardHeader>
            <CardContent>
                {presentations && presentations.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {presentations.map((p) => {
                            const date = new Date(p.created_at).toLocaleDateString()
                            return (
                                <div key={p.id} className="p-6 flex flex-col justify-between rounded-2xl bg-white/50 dark:bg-zinc-900/50 backdrop-blur-sm border border-black/5 dark:border-white/5 hover:shadow-xl hover:-translate-y-1 transition-all duration-500">
                                    <div>
                                        <div className="flex justify-between items-start mb-2">
                                            <h3 className="font-bold text-lg text-black dark:text-white line-clamp-1 pr-2">{p.title || t('dashboard.untitledPresentation')}</h3>
                                        </div>
                                        <p className="text-sm font-medium text-black/50 dark:text-white/50 mb-4">{t('dashboard.created')} {date}</p>
                                    </div>
                                    <Button asChild className="w-full rounded-xl bg-black hover:bg-black/80 dark:bg-white dark:hover:bg-white/90 text-white dark:text-black font-bold h-12">
                                        <Link href={`/presentation/${p.id}`}>{t('dashboard.viewEdit')}</Link>
                                    </Button>
                                </div>
                            )
                        })}
                    </div>
                ) : (
                    <div className="p-12 text-center rounded-3xl bg-slate-50/50 dark:bg-zinc-900/50 backdrop-blur-md border border-black/5 dark:border-white/5 liquid-glass">
                        <h3 className="font-bold text-xl mb-2">{t('dashboard.noPresentations')}</h3>
                        <p className="text-black/50 dark:text-white/50 mb-6">{t('dashboard.noPresentationsDesc')}</p>
                        <Button asChild className="rounded-xl h-12 px-6 bg-black hover:bg-black/80 dark:bg-white dark:hover:bg-white/90 text-white dark:text-black font-bold border-0 shadow-lg">
                            <Link href="/presentation/new">{t('dashboard.createPresentation')}</Link>
                        </Button>
                    </div>
                )}
            </CardContent>
        </Card>
    )
}
