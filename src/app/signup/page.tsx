'use client';

import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { signUpWithMagicLink } from '@/app/auth-actions';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Mail, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { ThemeToggle } from '@/components/ThemeToggle';
import { useTranslation } from '@/components/I18nProvider';
import { LanguageToggle } from '@/components/LanguageToggle';
import { AuroraBackground } from '@/components/reactbits/AuroraBackground';
import { SplitText } from '@/components/reactbits/SplitText';
import { motion } from 'framer-motion';
import { MagnetButton } from '@/components/reactbits/MagnetButton';

function SignupContent() {
  const { t } = useTranslation();
  const searchParams = useSearchParams();
  const next = searchParams.get('next') || '/dashboard';

  return (
    <AuroraBackground className="flex min-h-screen w-full flex-col font-sans selection:bg-black/10 dark:selection:bg-white/20">
      <motion.header
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.25, 1, 0.5, 1] }}
        className="absolute top-0 right-0 left-0 z-50 mx-auto flex w-full max-w-7xl items-center justify-between px-6 py-6"
      >
        <Link
          href="/"
          className="flex items-center gap-2 text-xl font-black tracking-tighter text-zinc-900 transition-opacity hover:opacity-80 dark:text-white"
        >
          <ArrowLeft className="h-5 w-5" /> OMNICV
        </Link>
        <div className="flex items-center gap-4">
          <LanguageToggle />
          <ThemeToggle />
        </div>
      </motion.header>

      <div className="z-10 mt-16 flex w-full flex-1 items-center justify-center p-6">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ type: 'spring', stiffness: 300, damping: 25 }}
          className="relative w-full max-w-md"
        >
          <div className="absolute inset-0 -z-10 animate-pulse rounded-[3rem] bg-black/[0.06] blur-3xl dark:bg-black/20" />
          <Card className="liquid-glass overflow-hidden rounded-3xl border border-black/10 bg-white/68 text-zinc-950 shadow-2xl backdrop-blur-3xl dark:border-white/10 dark:bg-black/40 dark:text-white">
            <CardHeader className="space-y-2 pt-10 text-center">
              <CardTitle className="font-display mb-2 text-4xl font-black tracking-tight">
                <SplitText text={t('auth.createAccount')} />
              </CardTitle>
              <CardDescription className="mt-2 text-sm font-medium text-zinc-600 dark:text-white/60">
                {t('auth.signupDesc')}
              </CardDescription>
            </CardHeader>
            <CardContent className="px-8 pb-8">
              <form className="grid gap-6">
                <input type="hidden" name="next" value={next} />
                <div className="grid gap-3">
                  <Label htmlFor="email" className="font-bold text-zinc-700 dark:text-white/80">
                    {t('auth.emailLabel')}
                  </Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    placeholder={t('auth.emailPlaceholder')}
                    required
                    className="h-14 rounded-xl border-black/10 bg-white/82 text-base text-zinc-950 shadow-inner placeholder:text-zinc-400 focus-visible:ring-black/6 dark:border-white/10 dark:bg-white/5 dark:text-white dark:placeholder:text-white/30 dark:focus-visible:ring-white/20"
                  />
                </div>

                <div className="mt-2 flex flex-col gap-4">
                  <MagnetButton
                    magnetStrength={0.1}
                    className="flex h-14 w-full items-center justify-center rounded-xl border-0 bg-zinc-950 font-bold text-white shadow-lg transition-all duration-300 hover:bg-black/80 dark:bg-white dark:text-black dark:hover:bg-white/90"
                    formAction={signUpWithMagicLink}
                  >
                    <Mail className="mr-2 h-4 w-4" /> {t('auth.continueWithEmail')}
                  </MagnetButton>

                  <div className="mt-1 pb-1 text-center">
                    <span className="text-xs font-bold tracking-wide text-zinc-700 dark:text-white">
                      {t('auth.freeCredits')}
                    </span>
                  </div>

                  <div className="relative my-4">
                    <div className="absolute inset-0 flex items-center">
                      <span className="w-full border-t border-black/10 dark:border-white/10"></span>
                    </div>
                    <div className="relative flex justify-center text-xs font-bold tracking-widest uppercase">
                      <span className="bg-transparent px-4 text-zinc-500 dark:text-white/40">
                        {t('auth.alreadyHaveAccount')}
                      </span>
                    </div>
                  </div>

                  <Button
                    asChild
                    variant="outline"
                    className="h-14 w-full rounded-xl border-2 border-black/10 bg-white/70 font-bold text-zinc-900 transition-all duration-300 hover:scale-[1.02] hover:bg-white active:scale-[0.98] dark:border-white/10 dark:bg-transparent dark:text-white dark:hover:bg-white/10"
                  >
                    <Link href={`/login?next=${encodeURIComponent(next)}`}>
                      {t('auth.logInInstead')}
                    </Link>
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </AuroraBackground>
  );
}

export default function SignupPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#f6f2ea] dark:bg-black" />}>
      <SignupContent />
    </Suspense>
  );
}
