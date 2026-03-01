import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { MessageSquareText, Plus } from 'lucide-react'
import Link from 'next/link'
import { useTranslation } from '@/components/I18nProvider'

interface CoverLettersTabProps {
    coverLetters: any[];
}

export function CoverLettersTab({ coverLetters }: CoverLettersTabProps) {
    const { t } = useTranslation()

    return (
        <Card className="bg-white dark:bg-black border-black/10 dark:border-white/10 text-black dark:text-white shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between">
                <div>
                    <CardTitle className="text-2xl font-black tracking-tight flex items-center gap-2">
                        <MessageSquareText className="w-5 h-5" /> {t('dashboard.coverLetters')}
                    </CardTitle>
                    <CardDescription className="text-black/50 dark:text-white/50 font-light">
                        {t('dashboard.coverLettersDesc')}
                    </CardDescription>
                </div>
                {coverLetters && coverLetters.length > 0 && (
                    <Button asChild className="bg-black hover:bg-black/80 dark:bg-white dark:hover:bg-white/90 text-white dark:text-black font-bold h-10 px-4">
                        <Link href="/cover-letter/new">
                            <Plus className="w-4 h-4 mr-2" />
                            {t('dashboard.createLetter')}
                        </Link>
                    </Button>
                )}
            </CardHeader>
            <CardContent>
                {coverLetters && coverLetters.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {coverLetters.map((cl) => {
                            const date = new Date(cl.created_at).toLocaleDateString()
                            return (
                                <div key={cl.id} className="p-5 flex flex-col justify-between rounded-xl bg-slate-50 dark:bg-zinc-900 border border-black/10 dark:border-white/10 hover:border-black/30 dark:hover:border-white/30 transition-all">
                                    <div>
                                        <div className="flex justify-between items-start mb-2">
                                            <h3 className="font-bold text-lg text-black dark:text-white line-clamp-1 pr-2">{cl.title || t('dashboard.untitledLetter')}</h3>
                                        </div>
                                        <p className="text-sm font-medium text-black/50 dark:text-white/50 mb-4">{t('dashboard.created')} {date}</p>
                                    </div>
                                    <Button asChild className="w-full bg-black hover:bg-black/80 dark:bg-white dark:hover:bg-white/90 text-white dark:text-black font-bold h-10">
                                        <Link href={`/cover-letter/${cl.id}`}>{t('dashboard.viewEdit')}</Link>
                                    </Button>
                                </div>
                            )
                        })}
                    </div>
                ) : (
                    <div className="p-12 text-center rounded-xl bg-slate-50 dark:bg-zinc-900 border border-black/10 dark:border-white/10">
                        <h3 className="font-bold text-xl mb-2">{t('dashboard.noLetters')}</h3>
                        <p className="text-black/50 dark:text-white/50 mb-6">{t('dashboard.noLettersDesc')}</p>
                        <Button asChild className="bg-black hover:bg-black/80 dark:bg-white dark:hover:bg-white/90 text-white dark:text-black font-bold">
                            <Link href="/cover-letter/new">{t('dashboard.createLetter')}</Link>
                        </Button>
                    </div>
                )}
            </CardContent>
        </Card>
    )
}
