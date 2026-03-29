"use client";

import React, { useEffect, useState, Suspense } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { useSearchParams } from 'next/navigation';
import { CheckCircle2, ArrowRight, Sparkles, ArrowLeft } from 'lucide-react';
import { ThemeToggle } from '@/components/ThemeToggle';
import { LanguageToggle } from '@/components/LanguageToggle';
import { useTranslation } from '@/components/I18nProvider';

function SuccessPageContent() {
    const { t } = useTranslation();
    const searchParams = useSearchParams();
    const sessionId = searchParams.get('session_id'); // useful if we want to trace later
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    const containerVariants = {
        hidden: { opacity: 0 },
        show: {
            opacity: 1,
            transition: { staggerChildren: 0.1 },
        },
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 15 },
        show: { opacity: 1, y: 0, transition: { type: 'spring' as const, stiffness: 300, damping: 24 } },
    };

    if (!mounted) return null;

    return (
        <div className="relative flex min-h-screen flex-col overflow-hidden bg-zinc-950 font-sans text-white selection:bg-green-500/20">
            {/* Ambient Background Glows */}
            <motion.div
                animate={{ opacity: [0.3, 0.5, 0.3], scale: [1, 1.05, 1] }}
                transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
                className="absolute top-[-10%] left-[-10%] w-[600px] h-[600px] rounded-full bg-gradient-to-br from-[#34d399]/20 to-transparent blur-[120px] pointer-events-none"
            />
            <motion.div
                animate={{ opacity: [0.2, 0.4, 0.2], rotate: [0, -90, 0] }}
                transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
                className="absolute bottom-0 -right-[20%] w-[800px] h-[800px] bg-gradient-to-tl from-[#4ade80]/15 to-transparent rounded-full blur-[150px] pointer-events-none"
            />

            {/* Header */}
            <motion.header
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, ease: [0.25, 1, 0.5, 1] }}
                className="relative z-50 mx-auto flex w-full max-w-7xl items-center justify-between px-6 py-8"
            >
                <Link
                    href="/"
                    className="flex items-center gap-3 text-lg font-bold tracking-[0.1em] text-white transition-opacity hover:opacity-80 group/logo"
                >
                    <motion.div whileHover={{ x: -4 }} className="flex items-center gap-3">
                        <ArrowLeft className="h-4 w-4 text-zinc-400 group-hover/logo:text-white transition-colors" /> OMNICV
                    </motion.div>
                </Link>
                <div className="flex items-center gap-4">
                    <LanguageToggle />
                </div>
            </motion.header>

            {/* Main Content Centers */}
            <div className="relative z-10 flex w-full flex-1 items-center justify-center p-6">
                <motion.div
                    initial={{ opacity: 0, scale: 0.96, y: 30 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    transition={{ type: 'spring' as const, stiffness: 200, damping: 20 }}
                    className="relative w-full max-w-lg group"
                >
                    {/* Animated Outer Glow behind the card */}
                    <div className="absolute -inset-[2px] rounded-3xl opacity-50 blur-lg transition duration-1000 group-hover:duration-200 pointer-events-none" />
                    <motion.div
                        animate={{ backgroundPosition: ['0% 0%', '100% 100%', '0% 0%'] }}
                        transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
                        className="absolute -inset-[2px] rounded-[24px] z-0 blur-[20px] opacity-60 bg-[size:200%_200%] bg-gradient-to-r from-[#4ade80]/40 via-transparent to-[#34d399]/40 pointer-events-none"
                    />

                    {/* Glassmorphism Card */}
                    <div className="relative rounded-3xl border border-white/10 bg-black/60 p-10 shadow-2xl backdrop-blur-2xl z-10 text-center">
                        <motion.div
                            variants={containerVariants}
                            initial="hidden"
                            animate="show"
                            className="relative z-10 flex flex-col items-center"
                        >
                            <motion.div variants={itemVariants} className="mb-8 flex h-24 w-24 items-center justify-center rounded-full bg-gradient-to-tr from-[#4ade80]/20 to-[#34d399]/20 border border-white/10 shadow-[0_0_40px_rgba(74,222,128,0.2)]">
                                <CheckCircle2 className="h-12 w-12 text-[#4ade80]" />
                            </motion.div>

                            <motion.div variants={itemVariants} className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-white/10 bg-white/5 text-white/80 text-xs font-semibold uppercase tracking-widest mb-6 backdrop-blur-md">
                                <Sparkles className="w-3.5 h-3.5 text-[#4ade80]" />
                                <span>{t('success.paymentVerified')}</span>
                            </motion.div>
                            
                            <motion.h1 variants={itemVariants} className="text-4xl sm:text-5xl font-bold tracking-tight text-white mb-4">
                                {t('success.title')}
                            </motion.h1>
                            
                            <motion.p variants={itemVariants} className="text-base text-zinc-400 mb-10 leading-relaxed max-w-sm mx-auto">
                                {t('success.subtitle')}
                            </motion.p>
                            
                            <motion.div variants={itemVariants} className="w-full">
                                <Link 
                                    href="/dashboard"
                                    className="flex w-full items-center justify-center gap-2 rounded-xl bg-white px-8 py-4 font-bold text-black transition-transform hover:-translate-y-1 hover:shadow-[0_0_20px_rgba(255,255,255,0.3)] shadow-lg"
                                >
                                    {t('success.goToDashboard')} <ArrowRight className="h-5 w-5" />
                                </Link>
                            </motion.div>

                            <motion.p variants={itemVariants} className="mt-8 text-xs text-zinc-600 font-medium tracking-wide">
                                {t('success.transactionDesc')}
                            </motion.p>
                        </motion.div>
                    </div>
                </motion.div>
            </div>
        </div>
    );
}

export default function SuccessPage() {
    return (
        <Suspense fallback={<div className="min-h-screen flex items-center justify-center bg-zinc-950 text-white">Loading...</div>}> 
            <SuccessPageContent />
        </Suspense>
    );
}
