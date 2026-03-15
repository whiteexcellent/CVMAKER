'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { createBrowserClient } from '@supabase/ssr';
import { Button } from '@/components/ui/button';
import { Sparkles, Command, ArrowRight, CheckCircle2, Building2, Briefcase, Linkedin } from 'lucide-react';
import { ThemeToggle } from '@/components/ThemeToggle';
import { LanguageToggle } from '@/components/LanguageToggle';
import { useTranslation } from '@/components/I18nProvider';
import { motion } from 'framer-motion';

export default function Home() {
  const { t } = useTranslation();
  const [authHref, setAuthHref] = useState('/login?redirect=/wizard'); // default safe

  useEffect(() => {
    const supabase = createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) setAuthHref('/wizard');
    });
  }, []);

  return (
    <div className="min-h-screen bg-white dark:bg-black text-black dark:text-white font-sans selection:bg-black/10 dark:selection:bg-white/20 transition-colors duration-300">

      {/* HEADER NAV */}
      <motion.header 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
        className="fixed top-0 w-full z-50 px-6 py-4 flex justify-between items-center left-0 right-0 liquid-glass border-b border-black/5 dark:border-white/5"
      >
        <div className="flex items-center">
          <Link href="/" className="text-xl font-black tracking-tighter text-black dark:text-white ml-2 lg:ml-8 hover:opacity-80 transition-opacity">
            OMNICV
          </Link>
          <div className="hidden md:flex ml-10 space-x-6">
            <Link href="/pricing" className="text-sm font-semibold text-black/60 dark:text-white/60 hover:text-black dark:hover:text-white transition-colors">
              Pricing
            </Link>
          </div>
        </div>
        <div className="flex items-center gap-4 mr-2 lg:mr-8">
          <Link href={authHref === '/wizard' ? '/dashboard' : '/login'} className="hidden md:inline-flex text-sm font-semibold text-black/60 dark:text-white/60 hover:text-black dark:hover:text-white transition-colors mr-2">
            {authHref === '/wizard' ? t('landing.dashboard') : 'Login'}
          </Link>
          <LanguageToggle />
          <ThemeToggle />
        </div>
      </motion.header>

      {/* HERO SECTION */}
      <section className="relative min-h-[90vh] flex flex-col items-center justify-center pt-32 pb-32 px-6">
        <div className="w-full max-w-5xl mx-auto flex flex-col items-center text-center">

          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ type: "spring", stiffness: 300, damping: 25, delay: 0.1 }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-black/10 dark:border-white/20 text-black/60 dark:text-white/80 text-xs font-semibold uppercase tracking-widest mb-10 bg-white/50 dark:bg-black/50 backdrop-blur-md shadow-sm"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>{t('landing.system')}</span>
          </motion.div>

          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: [0.4, 0, 0.2, 1], delay: 0.2 }}
            className="text-6xl md:text-8xl lg:text-9xl font-black tracking-tighter text-black dark:text-white max-w-5xl leading-[0.9] font-display"
          >
            {t('landing.title').replace('.', '')}
            <span className="text-black/40 dark:text-white/60">.</span>
          </motion.h1>

          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: [0.4, 0, 0.2, 1], delay: 0.3 }}
            className="mt-10 text-xl md:text-2xl text-black/50 dark:text-white/50 max-w-2xl font-light leading-relaxed"
          >
            {t('landing.subtitle')}
          </motion.p>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: [0.4, 0, 0.2, 1], delay: 0.4 }}
            className="mt-14 flex flex-col sm:flex-row gap-4 w-full justify-center items-center"
          >
            <Button size="lg" className="h-14 px-10 bg-black dark:bg-white text-white dark:text-black font-bold text-lg rounded-xl shadow-md hover:shadow-lg transition-all duration-300 w-full sm:w-auto hover:scale-[1.02] active:scale-[0.97]" asChild>
              <Link href={authHref}>
                {t('landing.deployAgent')} <ArrowRight className="w-5 h-5 ml-3" />
              </Link>
            </Button>
            <Button size="lg" variant="outline" className="h-14 px-10 bg-transparent border-black/20 dark:border-white/20 hover:bg-black/5 dark:hover:bg-white/5 text-black dark:text-white font-medium text-lg rounded-xl shadow-sm hover:shadow-md transition-all duration-300 w-full sm:w-auto hover:scale-[1.02] active:scale-[0.97]" asChild>
              <Link href="/login">
                {t('landing.dashboard')} <Command className="w-5 h-5 ml-3" />
              </Link>
            </Button>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            className="mt-20 flex flex-wrap justify-center gap-8 text-sm font-medium text-black/40 dark:text-white/40"
          >
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-black dark:text-white" /> {t('landing.featureAts')}
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-black dark:text-white" /> {t('landing.featureLinkedin')}
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-black dark:text-white" /> {t('landing.featureJob')}
            </div>
          </motion.div>
        </div>
      </section>

      {/* CORE ENGINES DEMO SECTION */}
      <section className="py-32 border-t border-black/5 dark:border-white/10 bg-slate-50/50 dark:bg-transparent">
        <div className="max-w-7xl mx-auto px-6">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, ease: [0.4, 0, 0.2, 1] }}
            className="text-center mb-24"
          >
            <h2 className="text-4xl md:text-6xl font-black tracking-tight text-black dark:text-white mb-8">{t('landing.arsenal')}</h2>
            <p className="text-black/50 dark:text-white/50 max-w-2xl mx-auto text-lg font-light leading-relaxed">{t('landing.arsenalSub')}</p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Engine 1 */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.1 }}
              whileHover={{ y: -4, scale: 1.01 }}
              className="p-10 rounded-3xl shadow-sm hover:shadow-lg transition-all duration-500 liquid-glass"
            >
              <Linkedin className="w-8 h-8 text-black dark:text-white mb-8" />
              <h3 className="text-2xl font-bold text-black dark:text-white mb-4 tracking-tight">{t('landing.sync')}</h3>
              <p className="text-black/50 dark:text-white/50 leading-relaxed font-light">{t('landing.syncDesc')}</p>
            </motion.div>

            {/* Engine 2 */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.2 }}
              whileHover={{ y: -4, scale: 1.01 }}
              className="p-10 rounded-3xl shadow-sm hover:shadow-lg transition-all duration-500 liquid-glass"
            >
              <Briefcase className="w-8 h-8 text-black dark:text-white mb-8" />
              <h3 className="text-2xl font-bold text-black dark:text-white mb-4 tracking-tight">{t('landing.scraper')}</h3>
              <p className="text-black/50 dark:text-white/50 leading-relaxed font-light">{t('landing.scraperDesc')}</p>
            </motion.div>

            {/* Engine 3 */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.3 }}
              whileHover={{ y: -4, scale: 1.01 }}
              className="p-10 rounded-3xl shadow-sm hover:shadow-lg transition-all duration-500 liquid-glass"
            >
              <Building2 className="w-8 h-8 text-black dark:text-white mb-8" />
              <h3 className="text-2xl font-bold text-black dark:text-white mb-4 tracking-tight">{t('landing.radar')}</h3>
              <p className="text-black/50 dark:text-white/50 leading-relaxed font-light">{t('landing.radarDesc')}</p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* PRE-FOOTER CTA */}
      <section className="py-40 relative border-t border-black/5 dark:border-white/10 bg-black/5 dark:bg-zinc-950">
        <div className="w-full max-w-4xl mx-auto px-6 text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
          >
            <h2 className="text-5xl md:text-7xl font-black tracking-tighter text-black dark:text-white mb-8">{t('landing.cta')}</h2>
            <p className="text-2xl text-black/50 dark:text-white/50 mb-12 font-light">{t('landing.ctaSub')}</p>
            <Button size="lg" className="h-16 px-12 bg-black dark:bg-white text-white dark:text-black font-black text-xl rounded-2xl shadow-lg transition-transform hover:scale-[1.02] active:scale-[0.97] border-0" asChild>
              <Link href="/login">
                {t('landing.createAccount')}
              </Link>
            </Button>
          </motion.div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="border-t border-black/10 dark:border-white/10 bg-slate-50 dark:bg-black py-12">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="text-black dark:text-white font-black tracking-tighter text-xl">
            OMNICV
          </div>
          <div className="text-sm font-light text-black/40 dark:text-white/40 flex flex-wrap items-center justify-center gap-4">
            <span>Protected Authentication</span>
            <span className="hidden md:inline">•</span>
            <span>Google & Anthropic</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
