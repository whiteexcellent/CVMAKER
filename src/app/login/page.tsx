'use client';

import { Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { signInWithMagicLink, signInWithPassword } from '@/app/auth-actions'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Mail, Lock } from 'lucide-react'
import Link from 'next/link'
import { ThemeToggle } from '@/components/ThemeToggle'
import { useTranslation } from '@/components/I18nProvider'
import { LanguageToggle } from '@/components/LanguageToggle'

function LoginContent() {
    const { t } = useTranslation();
    const searchParams = useSearchParams();
    const message = searchParams.get('message');
    const error = searchParams.get('error');

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
                    <Card className="bg-white/40 dark:bg-black/40 border border-black/10 dark:border-white/10 text-black dark:text-white shadow-2xl rounded-3xl liquid-glass overflow-hidden">
                        <CardHeader className="space-y-1 text-center pt-10">
                            <CardTitle className="text-4xl font-display font-black tracking-tight">{t('auth.welcomeBack')}</CardTitle>
                            <CardDescription className="text-black/60 dark:text-white/60 text-sm mt-2 font-medium">
                                {t('auth.loginDesc')}
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="pb-8 px-8">
                            {message === 'account_exists' && (
                                <div className="mb-6 p-4 bg-black/5 dark:bg-white/5 border border-black/20 dark:border-white/20 text-sm font-bold">
                                    {t('auth.accountExists')}
                                </div>
                            )}
                            {error === 'user_not_found' && (
                                <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-400 text-sm font-bold">
                                    {t('auth.userNotFound')}
                                </div>
                            )}
                            <form className="grid gap-6">
                                <div className="grid gap-3">
                                    <Label htmlFor="email" className="text-black/80 dark:text-white/80 font-bold">{t('auth.emailLabel')}</Label>
                                    <Input
                                        id="email"
                                        name="email"
                                        type="email"
                                        placeholder={t('auth.emailPlaceholder')}
                                        required
                                        className="bg-transparent border-black/20 dark:border-white/20 text-black dark:text-white placeholder:text-black/30 dark:placeholder:text-white/30 h-14 rounded-xl text-base"
                                    />
                                </div>

                                <div className="flex flex-col gap-4 mt-2">
                                    <Button formAction={signInWithMagicLink} className="w-full h-14 bg-black hover:bg-black/80 dark:bg-white dark:hover:bg-white/90 text-white dark:text-black font-bold rounded-xl border-0 transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]">
                                        <Mail className="w-4 h-4 mr-2" /> {t('auth.sendMagicLink')}
                                    </Button>

                                    <div className="relative my-4">
                                        <div className="absolute inset-0 flex items-center">
                                            <span className="w-full border-t border-black/10 dark:border-white/10"></span>
                                        </div>
                                        <div className="relative flex justify-center text-xs uppercase font-bold tracking-widest">
                                            <span className="bg-transparent px-4 text-black/40 dark:text-white/40">{t('auth.newToOmnicv')}</span>
                                        </div>
                                    </div>

                                    <Button asChild variant="outline" className="w-full h-14 bg-transparent border-2 border-black/20 dark:border-white/20 text-black dark:text-white hover:bg-black/5 dark:hover:bg-white/10 transition-all duration-300 font-bold rounded-xl hover:scale-[1.02] active:scale-[0.98]">
                                        <Link href="/signup">{t('auth.createFreeAccount')}</Link>
                                    </Button>
                                </div>
                            </form>

                            {process.env.NODE_ENV === 'development' && (
                                <div className="mt-6 pt-6 border-t border-black/10 dark:border-white/10">
                                    <p className="text-xs font-bold uppercase tracking-widest text-black/30 dark:text-white/30 mb-4">⚠ {t('auth.devMode') || 'Dev Mode — Password Login'}</p>
                                    <form className="grid gap-3">
                                        <Input
                                            id="dev-email"
                                            name="email"
                                            type="email"
                                            placeholder="Email"
                                            required
                                            className="bg-transparent border-black/20 dark:border-white/20 text-black dark:text-white placeholder:text-black/30 dark:placeholder:text-white/30 h-10 rounded-none text-sm"
                                        />
                                        <Input
                                            id="dev-password"
                                            name="password"
                                            type="password"
                                            placeholder="Password"
                                            required
                                            className="bg-transparent border-black/20 dark:border-white/20 text-black dark:text-white placeholder:text-black/30 dark:placeholder:text-white/30 h-10 rounded-none text-sm"
                                        />
                                        <Button formAction={signInWithPassword} variant="outline" className="w-full h-10 bg-transparent border border-black/30 dark:border-white/30 text-black dark:text-white hover:bg-black/5 dark:hover:bg-white/10 font-bold rounded-none text-sm">
                                            <Lock className="w-3 h-3 mr-2" /> {t('auth.signInPassword') || 'Sign in with Password'}
                                        </Button>
                                    </form>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    )
}

export default function LoginPage() {
    return (
        <Suspense fallback={<div className="min-h-screen bg-white dark:bg-black" />}>
            <LoginContent />
        </Suspense>
    )
}
