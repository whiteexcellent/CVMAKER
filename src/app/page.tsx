'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { createBrowserClient } from '@supabase/ssr';
import { Button } from '@/components/ui/button';
import { Sparkles, Command, ArrowRight, CheckCircle2, Building2, Briefcase, Linkedin } from 'lucide-react';
import { ThemeToggle } from '@/components/ThemeToggle';
import { LanguageToggle } from '@/components/LanguageToggle';
import { useTranslation } from '@/components/I18nProvider';

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
      <header className="absolute top-0 w-full z-50 px-6 py-6 flex justify-between items-center max-w-7xl mx-auto left-0 right-0">
        <div className="text-xl font-black tracking-tighter text-black dark:text-white">
          OMNICV
        </div>
        <div className="flex items-center gap-4">
          <LanguageToggle />
          <ThemeToggle />
        </div>
      </header>

      {/* HERO SECTION */}
      <section className="relative min-h-[90vh] flex flex-col items-center justify-center pt-24 px-6">
        <div className="w-full max-w-5xl mx-auto flex flex-col items-center text-center">

          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-black/10 dark:border-white/20 text-black/60 dark:text-white/80 text-xs font-semibold uppercase tracking-widest mb-10 bg-slate-50 dark:bg-white/5">
            <Sparkles className="w-3.5 h-3.5" />
            <span>{t('landing.system')}</span>
          </div>

          <h1 className="text-6xl md:text-8xl lg:text-9xl font-black tracking-tighter text-black dark:text-white max-w-5xl leading-[0.9] font-display">
            {t('landing.title').replace('.', '')}
            <span className="text-black/40 dark:text-white/60">.</span>
          </h1>

          <p className="mt-10 text-xl md:text-2xl text-black/50 dark:text-white/50 max-w-2xl font-light leading-relaxed">
            {t('landing.subtitle')}
          </p>

          <div className="mt-14 flex flex-col sm:flex-row gap-4 w-full justify-center items-center">
            <Button size="lg" className="h-14 px-10 bg-black dark:bg-white hover:bg-black/80 dark:hover:bg-white/90 text-white dark:text-black font-bold text-lg rounded-none transition-transform hover:-translate-y-1 w-full sm:w-auto" asChild>
              <Link href={authHref}>
                {t('landing.deployAgent')} <ArrowRight className="w-5 h-5 ml-3" />
              </Link>
            </Button>
            <Button size="lg" variant="outline" className="h-14 px-10 bg-transparent border-black/20 dark:border-white/20 hover:bg-black/5 dark:hover:bg-white/5 text-black dark:text-white font-medium text-lg rounded-none transition-transform hover:-translate-y-1 w-full sm:w-auto" asChild>
              <Link href="/login">
                {t('landing.dashboard')} <Command className="w-5 h-5 ml-3" />
              </Link>
            </Button>
          </div>

          {/* Feature Micro-Badges */}
          <div className="mt-20 flex flex-wrap justify-center gap-8 text-sm font-medium text-black/40 dark:text-white/40">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-black dark:text-white" /> {t('landing.featureAts')}
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-black dark:text-white" /> {t('landing.featureLinkedin')}
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-black dark:text-white" /> {t('landing.featureJob')}
            </div>
          </div>
        </div>
      </section>

      {/* CORE ENGINES DEMO SECTION */}
      <section className="py-32 border-t border-black/5 dark:border-white/10 bg-slate-50/50 dark:bg-transparent">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-20">
            <h2 className="text-4xl md:text-6xl font-black tracking-tight text-black dark:text-white mb-6">{t('landing.arsenal')}</h2>
            <p className="text-black/50 dark:text-white/50 max-w-2xl mx-auto text-lg font-light">{t('landing.arsenalSub')}</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Engine 1 */}
            <div className="p-10 border border-black/10 dark:border-white/10 hover:border-black/30 dark:hover:border-white/40 transition-colors duration-300 bg-white dark:bg-transparent">
              <Linkedin className="w-8 h-8 text-black dark:text-white mb-8" />
              <h3 className="text-2xl font-bold text-black dark:text-white mb-4 tracking-tight">{t('landing.sync')}</h3>
              <p className="text-black/50 dark:text-white/50 leading-relaxed font-light">{t('landing.syncDesc')}</p>
            </div>

            {/* Engine 2 */}
            <div className="p-10 border border-black/10 dark:border-white/10 hover:border-black/30 dark:hover:border-white/40 transition-colors duration-300 bg-white dark:bg-transparent">
              <Briefcase className="w-8 h-8 text-black dark:text-white mb-8" />
              <h3 className="text-2xl font-bold text-black dark:text-white mb-4 tracking-tight">{t('landing.scraper')}</h3>
              <p className="text-black/50 dark:text-white/50 leading-relaxed font-light">{t('landing.scraperDesc')}</p>
            </div>

            {/* Engine 3 */}
            <div className="p-10 border border-black/10 dark:border-white/10 hover:border-black/30 dark:hover:border-white/40 transition-colors duration-300 bg-white dark:bg-transparent">
              <Building2 className="w-8 h-8 text-black dark:text-white mb-8" />
              <h3 className="text-2xl font-bold text-black dark:text-white mb-4 tracking-tight">{t('landing.radar')}</h3>
              <p className="text-black/50 dark:text-white/50 leading-relaxed font-light">{t('landing.radarDesc')}</p>
            </div>
          </div>
        </div>
      </section>

      {/* PRE-FOOTER CTA */}
      <section className="py-40 relative border-t border-black/5 dark:border-white/10 bg-white dark:bg-black">
        <div className="w-full max-w-4xl mx-auto px-6 text-center">
          <h2 className="text-5xl md:text-7xl font-black tracking-tighter text-black dark:text-white mb-8">{t('landing.cta')}</h2>
          <p className="text-2xl text-black/50 dark:text-white/50 mb-12 font-light">{t('landing.ctaSub')}</p>
          <Button size="lg" className="h-16 px-12 bg-black dark:bg-white text-white dark:text-black font-black text-xl rounded-none transition-transform hover:scale-105 border-0" asChild>
            <Link href="/login">
              {t('landing.createAccount')}
            </Link>
          </Button>
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
