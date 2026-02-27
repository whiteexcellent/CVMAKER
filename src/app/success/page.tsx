'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { useSearchParams } from 'next/navigation';
import { CheckCircle2, ArrowRight, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ThemeToggle } from '@/components/ThemeToggle';
import { LanguageToggle } from '@/components/LanguageToggle';
import { useTranslation } from '@/components/I18nProvider';

export default function SuccessPage() {
    const { t } = useTranslation();
    const searchParams = useSearchParams();
    const sessionId = searchParams.get('session_id'); // useful if we want to trace later
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    if (!mounted) return null;

    return (
        <div className="min-h-screen bg-white dark:bg-black text-black dark:text-white font-sans selection:bg-black/10 dark:selection:bg-white/20 transition-colors duration-300 flex flex-col relative overflow-hidden">

            {/* BACKGROUND GLOWS (Subtle & Premium) */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-blue-100/40 dark:bg-blue-600/10 rounded-full blur-[100px] pointer-events-none" />
            <div className="absolute top-[40%] left-[60%] -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] bg-purple-100/40 dark:bg-purple-600/10 rounded-full blur-[80px] pointer-events-none" />

            {/* HEADER NAV (Same as Landing) */}
            <header className="absolute top-0 w-full z-50 px-6 py-6 flex justify-between items-center max-w-7xl mx-auto left-0 right-0">
                <Link href="/" className="text-xl font-black tracking-tighter text-black dark:text-white">
                    OMNICV
                </Link>
                <div className="flex items-center gap-4">
                    <LanguageToggle />
                    <ThemeToggle />
                </div>
            </header>

            {/* MAIN CONTENT CENTERED */}
            <main className="flex-1 flex flex-col items-center justify-center p-6 relative z-10 w-full max-w-3xl mx-auto text-center">

                <motion.div
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ type: "spring", stiffness: 200, damping: 20, delay: 0.1 }}
                    className="relative mb-10 inline-flex"
                >
                    <div className="absolute inset-0 bg-blue-500/20 dark:bg-blue-500/30 blur-2xl rounded-full" />
                    <CheckCircle2 className="w-24 h-24 sm:w-32 sm:h-32 text-blue-600 dark:text-blue-500 relative z-10 drop-shadow-md" />
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.3 }}
                >
                    <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-black/10 dark:border-white/20 text-black/60 dark:text-white/80 text-xs font-semibold uppercase tracking-widest mb-6 bg-slate-50 dark:bg-white/5">
                        <Sparkles className="w-3.5 h-3.5" />
                        <span>{t('success.paymentVerified')}</span>
                    </div>

                    <h1 className="text-5xl sm:text-7xl font-black tracking-tighter text-black dark:text-white mb-6 leading-[0.9] font-display">
                        {t('success.title')}
                        <span className="text-black/40 dark:text-white/60">.</span>
                    </h1>

                    <p className="text-xl sm:text-2xl text-black/50 dark:text-white/50 max-w-xl mx-auto font-light leading-relaxed mb-12 relative">
                        {t('success.subtitle')}
                    </p>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.5 }}
                    className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto mt-4"
                >
                    <Button size="lg" className="h-16 px-12 bg-black dark:bg-white hover:bg-black/80 dark:hover:bg-white/90 text-white dark:text-black font-bold text-xl rounded-none transition-transform hover:-translate-y-1 w-full sm:w-auto shadow-2xl" asChild>
                        <Link href="/dashboard">
                            {t('success.goToDashboard')} <ArrowRight className="w-5 h-5 ml-3" />
                        </Link>
                    </Button>
                </motion.div>

                <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 1, delay: 1 }}
                    className="mt-16 text-sm text-black/30 dark:text-white/30 font-medium tracking-wide"
                >
                    {t('success.transactionDesc')}
                </motion.p>
            </main>
        </div>
    );
}

