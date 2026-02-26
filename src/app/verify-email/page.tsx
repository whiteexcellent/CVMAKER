'use client';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { MailCheck } from 'lucide-react'
import Link from 'next/link'
import { ThemeToggle } from '@/components/ThemeToggle'
import { useTranslation } from '@/components/I18nProvider'
import { LanguageToggle } from '@/components/LanguageToggle'

export default function VerifyEmailPage() {
    const { t } = useTranslation();

    return (
        <div className="flex min-h-screen w-full flex-col bg-white dark:bg-black text-black dark:text-white font-sans selection:bg-black/10 dark:selection:bg-white/20 transition-colors duration-300">
            <header className="absolute top-0 w-full z-50 px-6 py-6 flex justify-between items-center max-w-7xl mx-auto left-0 right-0">
                <Link href="/" className="text-xl font-black tracking-tighter hover:opacity-80 transition-opacity">
                    OMNICV
                </Link>
                <div className="flex items-center gap-4">
                    <LanguageToggle />
                    <ThemeToggle />
                </div>
            </header>

            <div className="flex-1 flex items-center justify-center p-6 mt-16">
                <div className="w-full max-w-md">
                    <Card className="bg-white dark:bg-black border-2 border-black dark:border-white text-black dark:text-white shadow-none rounded-none relative overflow-hidden">
                        <CardHeader className="space-y-4 text-center pt-10 pb-4 relative z-10">
                            <div className="mx-auto w-16 h-16 bg-black/5 dark:bg-white/10 rounded-full flex items-center justify-center mb-2 border border-black/20 dark:border-white/20">
                                <MailCheck className="w-8 h-8 text-black dark:text-white" />
                            </div>
                            <CardTitle className="text-4xl font-display font-black tracking-tight">{t('auth.checkEmail') || 'Check email'}</CardTitle>
                            <CardDescription className="text-black/60 dark:text-white/60 text-base mt-2 font-medium">
                                {t('auth.checkEmailDesc') || "We've sent a magic link to your email address. Click the link to log in securely."}
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="pb-10 text-center relative z-10">
                            <p className="text-sm text-black/40 dark:text-white/40 mb-8 font-bold">{t('auth.safelyClose') || 'You can safely close this window.'}</p>
                            <Link href="/" className="text-sm text-black dark:text-white hover:text-black/60 dark:hover:text-white/60 transition-colors font-bold uppercase tracking-wider">
                                &larr; {t('auth.returnHome') || 'Return to Home'}
                            </Link>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    )
}
