"use client";

import { MailCheck, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { ThemeToggle } from '@/components/ThemeToggle';
import { useTranslation } from '@/components/I18nProvider';
import { LanguageToggle } from '@/components/LanguageToggle';
import { motion } from 'framer-motion';

export default function VerifyEmailPage() {
    const { t } = useTranslation();

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

    return (
        <div className="relative flex min-h-screen flex-col overflow-hidden bg-zinc-950 font-sans text-white selection:bg-orange-500/20">
            {/* Ambient Background Glows */}
            <motion.div
                animate={{ opacity: [0.3, 0.5, 0.3], scale: [1, 1.05, 1] }}
                transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
                className="absolute top-[-10%] left-[-10%] w-[600px] h-[600px] rounded-full bg-gradient-to-br from-[#34d399]/20 to-transparent blur-[120px] pointer-events-none"
            />
            <motion.div
                animate={{ opacity: [0.2, 0.4, 0.2], rotate: [0, -90, 0] }}
                transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
                className="absolute bottom-0 -right-[20%] w-[800px] h-[800px] bg-gradient-to-tl from-[#fb923c]/15 to-transparent rounded-full blur-[150px] pointer-events-none"
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

            {/* Main Content */}
            <div className="relative z-10 flex w-full flex-1 items-center justify-center p-6">
                <motion.div
                    initial={{ opacity: 0, scale: 0.96, y: 30 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    transition={{ type: 'spring' as const, stiffness: 200, damping: 20 }}
                    className="relative w-full max-w-md group"
                >
                    {/* Animated Outer Glow behind the card */}
                    <div className="absolute -inset-[2px] rounded-3xl opacity-50 blur-lg transition duration-1000 group-hover:duration-200 pointer-events-none" />
                    <motion.div
                        animate={{ backgroundPosition: ['0% 0%', '100% 100%', '0% 0%'] }}
                        transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
                        className="absolute -inset-[2px] rounded-[24px] z-0 blur-[20px] opacity-60 bg-[size:200%_200%] bg-gradient-to-r from-[#34d399]/40 via-transparent to-[#fb923c]/40 pointer-events-none"
                    />

                    {/* Glassmorphism Card */}
                    <div className="relative rounded-3xl border border-white/10 bg-black/60 p-8 shadow-2xl backdrop-blur-2xl z-10 text-center">
                        <motion.div
                            variants={containerVariants}
                            initial="hidden"
                            animate="show"
                            className="relative z-10 flex flex-col items-center"
                        >
                            <motion.div variants={itemVariants} className="mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-tr from-[#fb923c]/20 to-[#34d399]/20 border border-white/10">
                                <MailCheck className="h-10 w-10 text-white" />
                            </motion.div>
                            
                            <motion.h1 variants={itemVariants} className="text-3xl font-bold text-white tracking-tight mb-3">
                                {t('auth.checkEmail') || 'Check email'}
                            </motion.h1>
                            
                            <motion.p variants={itemVariants} className="text-sm text-zinc-400 mb-8 leading-relaxed">
                                {t('auth.checkEmailDesc') || "We've sent a magic link to your email address. Click the link to log in securely."}
                            </motion.p>
                            
                            <motion.div variants={itemVariants} className="w-full pt-4 border-t border-white/10">
                                <p className="text-xs text-zinc-500 mb-4">{t('auth.safelyClose') || 'You can safely close this window.'}</p>
                                <Link href="/" className="inline-flex items-center gap-2 text-sm text-zinc-300 hover:text-white transition-colors font-medium">
                                    <ArrowLeft className="h-4 w-4" /> {t('auth.returnHome') || 'Return to Home'}
                                </Link>
                            </motion.div>
                        </motion.div>
                    </div>
                </motion.div>
            </div>
        </div>
    );
}
