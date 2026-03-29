"use client";



﻿

import { Suspense, useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { signInWithMagicLink, signInWithPassword } from '@/app/auth-actions';
import { Mail, Lock, ArrowLeft, Loader2, Github } from 'lucide-react';
import Link from 'next/link';
import { useTranslation } from '@/components/I18nProvider';
import { motion } from 'framer-motion';

function LoginContent() {
  const { t } = useTranslation();
  const searchParams = useSearchParams();
  const message = searchParams.get('message');
  const error = searchParams.get('error');
  const next = searchParams.get('redirect') || searchParams.get('next') || '/dashboard';
  
  const [magicLoading, setMagicLoading] = useState(false);
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [isDev, setIsDev] = useState(false);

  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      setIsDev(true);
    }
  }, []);

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.1, delayChildren: 0.2 },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 15 },
    show: { opacity: 1, y: 0, transition: { type: 'spring' as const, stiffness: 300, damping: 24 } },
  };

  return (
    <div className="relative min-h-screen w-full bg-black font-geist selection:bg-white/20 overflow-hidden flex flex-col group/body">
      
      {/* Dynamic Animated Ambient Backgrounds */}
      <motion.div 
        animate={{ 
          scale: [1, 1.1, 1],
          opacity: [0.3, 0.5, 0.3],
          rotate: [0, 90, 0]
        }}
        transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
        className="absolute top-0 -left-[20%] w-[800px] h-[800px] bg-gradient-to-tr from-[#34d399]/20 to-transparent rounded-full blur-[150px] pointer-events-none" 
      />
      <motion.div 
        animate={{ 
          scale: [1, 1.2, 1],
          opacity: [0.2, 0.4, 0.2],
          rotate: [0, -90, 0]
        }}
        transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
        className="absolute bottom-0 -right-[20%] w-[800px] h-[800px] bg-gradient-to-tl from-[#fb923c]/15 to-transparent rounded-full blur-[150px] pointer-events-none" 
      />

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
             <ArrowLeft className="h-4 w-4 text-zinc-400 group-hover/logo:text-white transition-colors" /> CVMAKER
          </motion.div>
        </Link>
      </motion.header>

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
            animate={{ 
              backgroundPosition: ['0% 0%', '100% 100%', '0% 0%'],
            }}
            transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
            className="absolute -inset-[2px] rounded-[24px] z-0 blur-[20px] opacity-60 bg-[size:200%_200%] bg-gradient-to-r from-[#34d399]/40 via-transparent to-[#fb923c]/40 pointer-events-none"
          />

          {/* Glassmorphism Card */}
          <div className="relative rounded-3xl border border-white/10 bg-black/60 p-8 shadow-2xl backdrop-blur-2xl z-10">

            <motion.div 
              variants={containerVariants}
              initial="hidden"
              animate="show"
              className="relative z-10 flex flex-col"
            >
              <div className="text-center mb-8 relative">
                <motion.h1 variants={itemVariants} className="text-3xl font-bold text-white tracking-tight mb-2">
                  {t('auth.welcomeBack')}
                </motion.h1>
                <motion.p variants={itemVariants} className="text-sm text-zinc-400">
                  {t('auth.loginDesc')}
                </motion.p>
              </div>

              {message === 'account_exists' && (
                <motion.div variants={itemVariants} className="mb-6 rounded-xl border border-white/10 bg-white/5 p-4 text-sm font-medium text-white">
                  {t('auth.accountExists')}
                </motion.div>
              )}
              {error === 'user_not_found' && (
                <motion.div variants={itemVariants} className="mb-6 rounded-xl border border-red-500/20 bg-red-500/10 p-4 text-sm font-medium text-red-400">
                  {t('auth.userNotFound')}
                </motion.div>
              )}                {error === 'invalid_credentials' && (
                  <motion.div variants={itemVariants} className="mb-6 rounded-xl border border-red-500/20 bg-red-500/10 p-4 text-sm font-medium text-red-400">
                    Geçersiz e-posta veya şifre (Dev mode)
                  </motion.div>
                )}
              <form className="space-y-5">
                <input type="hidden" name="next" value={next} />
                
                <motion.div variants={itemVariants} className="space-y-2 group">
                  <label htmlFor="email" className="text-xs font-semibold text-zinc-300 transition-colors group-focus-within:text-[#34d399]">
                    {t('auth.emailLabel')}
                  </label>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    placeholder={t('auth.emailPlaceholder') || 'hello@example.com'}
                    required
                    className="w-full h-12 rounded-xl border border-white/10 bg-black/50 px-4 text-sm text-white placeholder:text-zinc-600 focus:border-[#34d399]/50 focus:outline-none focus:ring-1 focus:ring-[#34d399]/50 transition-all hover:bg-white/5"
                  />
                </motion.div>

                <motion.div variants={itemVariants} className="relative group mt-6 rounded-xl flex bg-transparent">
                  {/* Sharp 1px Border clipped to rounded edges */}
                  <div className="absolute inset-0 rounded-xl overflow-hidden pointer-events-none">
                    <div className="absolute -inset-[100%] bg-[conic-gradient(from_0deg_at_50%_50%,transparent_0%,#34d399_25%,transparent_50%,#fb923c_75%,transparent_100%)] animate-[spin_3s_linear_infinite] opacity-60 group-hover:opacity-100 transition-opacity duration-300" />
                  </div>

                  <button
                    type="submit"
                    formAction={signInWithMagicLink}
                    onClick={() => setMagicLoading(true)}
                    className="relative flex-1 flex h-12 items-center justify-center mx-[1px] my-[1px] bg-[#09090b] hover:bg-black rounded-[11px] text-sm font-bold text-white transition-transform group-hover:scale-[0.99] z-10"
                  >
                    {magicLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Mail className="mr-2 h-4 w-4" />}
                    {t('auth.sendMagicLink')}
                  </button>
                </motion.div>
              </form>

              {/* Dev Mode Only Password Login */}
              {isDev && (
                <motion.div variants={itemVariants} className="mt-8 pt-6 border-t border-white/10">
                  <div className="flex items-center justify-center gap-2 mb-4 text-xs font-bold tracking-widest text-[#fb923c] uppercase">
                    <Lock className="w-3 h-3" /> Dev Mode Local Login
                  </div>
                  <form className="space-y-4">
                    <input type="hidden" name="next" value={next} />
                    <div className="space-y-2">
                      <input
                        id="dev-email"
                        name="email"
                        type="email"
                        placeholder="Dev Email"
                        className="w-full h-10 rounded-lg border border-white/5 bg-zinc-900 px-3 text-sm text-white placeholder:text-zinc-600 focus:border-[#fb923c]/50 focus:outline-none focus:ring-1 focus:ring-[#fb923c]/50 transition-all"
                      />
                      <input
                        id="dev-password"
                        name="password"
                        type="password"
                        placeholder="Dev Password"
                        className="w-full h-10 rounded-lg border border-white/5 bg-zinc-900 px-3 text-sm text-white placeholder:text-zinc-600 focus:border-[#fb923c]/50 focus:outline-none focus:ring-1 focus:ring-[#fb923c]/50 transition-all"
                      />
                    </div>
                    <button
                      type="submit"
                      formAction={signInWithPassword}
                      onClick={() => setPasswordLoading(true)}
                      className="flex h-10 w-full items-center justify-center rounded-lg border border-[#fb923c]/20 bg-[#fb923c]/10 hover:bg-[#fb923c]/20 text-sm font-bold text-[#fb923c] transition-all"
                    >
                      {passwordLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Lock className="mr-2 h-4 w-4" />}
                      Test Sign In
                    </button>
                  </form>
                </motion.div>
              )}

              <motion.div variants={itemVariants} className="mt-8 text-center">
                <p className="text-sm text-zinc-500">
                  {t('auth.newToOmnicv')}{' '}
                  <Link
                    href="/signup"
                    className="font-bold text-white hover:text-[#34d399] transition-colors"
                  >
                    {t('auth.createFreeAccount')}
                  </Link>
                </p>
              </motion.div>

            </motion.div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="flex min-h-screen items-center justify-center bg-black"><div className="h-8 w-8 animate-spin rounded-full border-b-2 border-[#34d399]"></div></div>}>
      <LoginContent />
    </Suspense>
  );
}
