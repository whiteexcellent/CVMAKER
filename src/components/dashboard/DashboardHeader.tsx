'use client'

import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { LanguageToggle } from '@/components/LanguageToggle'
import { ThemeToggle } from '@/components/ThemeToggle'
import { useTranslation } from '@/components/I18nProvider'

interface DashboardHeaderProps {
    displayCredits: number;
    isPro: boolean;
}

export function DashboardHeader({ displayCredits, isPro }: DashboardHeaderProps) {
    const { t } = useTranslation()

    return (
        <header className="flex h-16 items-center border-b border-black/10 dark:border-white/10 px-6">
            <div className="flex flex-1 items-center justify-between">
                <Link href="/" className="font-bold text-lg tracking-tight">
                    OMNICV
                </Link>
                <div className="flex items-center gap-4">
                    <LanguageToggle />
                    <ThemeToggle />
                    <div className="text-sm font-medium text-black/50 dark:text-white/50 mr-4">
                        {t('dashboard.credits')} <span className="text-black dark:text-white font-bold text-lg leading-none">
                            {isPro ? '∞' : displayCredits}
                        </span>
                    </div>
                    <Link href="/settings">
                        <Button variant="ghost" size="sm" className="font-semibold hidden sm:inline-flex">
                            {t('dashboard.settings')}
                        </Button>
                    </Link>
                    <form action="/auth/signout" method="post">
                        <Button variant="outline" size="sm" type="submit" className="border-black/20 dark:border-white/20 hover:bg-black/5 dark:hover:bg-white/5 font-semibold">
                            {t('dashboard.logout')}
                        </Button>
                    </form>
                </div>
            </div>
        </header>
    )
}
