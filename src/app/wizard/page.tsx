'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import { useTranslation } from '@/components/I18nProvider';
import { Linkedin, Loader2, ArrowRight, ArrowLeft, Bot } from 'lucide-react';
import { ThemeToggle } from '@/components/ThemeToggle';
import { LanguageToggle } from '@/components/LanguageToggle';
import Link from 'next/link';
import { createBrowserClient } from '@supabase/ssr';
import { AIChatSidebar } from '@/components/wizard/AIChatSidebar';
import { Particles } from '@/components/ui/particles';
import { WizardStep1 } from './steps/WizardStep1';
import { WizardStep2 } from './steps/WizardStep2';
import { WizardStep3 } from './steps/WizardStep3';
import { WizardStep4 } from './steps/WizardStep4';
import { isDevAuthBypassEnabled } from '@/lib/env';

export default function WizardPage() {
  const router = useRouter();
  const [state, setState] = useState({
    step: 1,
    isGenerating: false,
    isAuthChecking: true,
    isAISidebarOpen: false,
    linkedinUrl: '',
    isImporting: false,
    jobUrl: '',
    isScrapingJob: false,
  });

  const updateState = (updates: Partial<typeof state>) =>
    setState((prev) => ({ ...prev, ...updates }));
  const {
    step,
    isGenerating,
    isAuthChecking,
    isAISidebarOpen,
    linkedinUrl,
    isImporting,
    jobUrl,
    isScrapingJob,
  } = state;

  const setStep = (s: number | ((prev: number) => number)) =>
    updateState({ step: typeof s === 'function' ? s(state.step) : s });
  const setIsGenerating = (val: boolean) => updateState({ isGenerating: val });
  const setIsAuthChecking = (val: boolean) => updateState({ isAuthChecking: val });
  const setIsAISidebarOpen = (val: boolean | ((prev: boolean) => boolean)) =>
    updateState({ isAISidebarOpen: typeof val === 'function' ? val(state.isAISidebarOpen) : val });
  const setLinkedinUrl = (val: string) => updateState({ linkedinUrl: val });
  const setIsImporting = (val: boolean) => updateState({ isImporting: val });
  const setJobUrl = (val: string) => updateState({ jobUrl: val });
  const setIsScrapingJob = (val: boolean) => updateState({ isScrapingJob: val });

  const { t } = useTranslation();
  const totalSteps = 4;

  // Auth guard — temporarily bypassed for browser subagent testing
  useEffect(() => {
    let isMounted = true;

    if (isDevAuthBypassEnabled()) {
      setIsAuthChecking(false);
      return;
    }

    const supabase = createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!isMounted) return;
      if (!user) {
        router.replace('/login?next=/wizard');
        return;
      }
      setIsAuthChecking(false);
    });

    return () => {
      isMounted = false;
    };
  }, [router]);

  const [formData, setFormData] = useState({
    profileType: '',
    targetRole: '',
    education: '',
    experience: '',
    skills: '',
    jobDescription: '',
  });

  useEffect(() => {
    const rawPrefill = localStorage.getItem('scrapedCvData');
    if (!rawPrefill) return;

    try {
      const parsed = JSON.parse(rawPrefill);
      setFormData((prev) => ({
        ...prev,
        targetRole: parsed.targetRole || prev.targetRole,
        education: parsed.education || prev.education,
        experience: parsed.experience || parsed.trackRecord || prev.experience,
        skills: parsed.skills || parsed.capabilities || prev.skills,
      }));
    } catch (error) {
      console.error('Failed to load wizard prefill:', error);
    } finally {
      localStorage.removeItem('scrapedCvData');
    }
  }, []);

  const handleLinkedInImport = async () => {
    if (!linkedinUrl || !linkedinUrl.includes('linkedin.com/in/')) {
      toast.error(t('toast.invalidLinkedinUrl'));
      return;
    }

    setIsImporting(true);
    const importToast = toast.loading(t('toast.importingLinkedin'), {
      duration: 20000,
    });

    try {
      const response = await fetch('/api/cv/import-linkedin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ linkedinUrl }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || t('toast.importFailed'));
      }

      // Map imported data to our form schema
      setFormData((prev) => ({
        ...prev,
        targetRole: data.targetRole || prev.targetRole,
        education: data.education || prev.education,
        experience: data.experience || data.trackRecord || prev.experience,
        skills: data.skills || data.capabilities || prev.skills,
      }));

      toast.success(t('toast.importSuccess'), { id: importToast });
      setLinkedinUrl('');
      setStep(2);
    } catch (error: any) {
      console.error('LinkedIn import failed:', error);
      toast.error(error.message || t('toast.importFailed'), { id: importToast });
    } finally {
      setIsImporting(false);
    }
  };

  const handleScraping = async () => {
    // Renamed from handleJobScrape
    if (
      !jobUrl ||
      (!jobUrl.includes('indeed.com') &&
        !jobUrl.includes('glassdoor.com') &&
        !jobUrl.includes('linkedin.com'))
    ) {
      toast.error(t('toast.invalidJobUrl'));
      return;
    }

    setIsScrapingJob(true);
    const scrapeToast = toast.loading(t('toast.scrapingJob'), {
      duration: 20000,
    });

    try {
      const response = await fetch('/api/cv/scrape-job', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ jobUrl }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || t('toast.scrapeFailed'));
      }

      setFormData((prev) => ({
        ...prev,
        targetRole: data.title || data.jobTitle || prev.targetRole,
        jobDescription: data.description || data.jobDescription || '',
      }));

      toast.success(
        t('toast.scrapeSuccess')
          .replace('{company}', data.company || data.companyName || '')
          .replace('{role}', data.title || data.jobTitle || ''),
        { id: scrapeToast }
      );
      setJobUrl('');
    } catch (error: any) {
      console.error('Job scraping failed:', error);
      toast.error(error.message || t('toast.scrapeFailed'), { id: scrapeToast });
    } finally {
      setIsScrapingJob(false);
    }
  };

  const progressPercentage = (step / totalSteps) * 100;
  const handleNext = () => setStep((s) => Math.min(s + 1, totalSteps));
  const handlePrev = () => setStep((s) => Math.max(s - 1, 1));

  const handleSubmit = async () => {
    setIsGenerating(true);
    const loadingToastId = toast.loading(t('toast.initializingAI'));

    try {
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const result = await response.json();
      if (!response.ok) throw new Error(result.error || t('toast.generationError'));

      toast.success(t('toast.cvGenerated'), { id: loadingToastId });

      if (result.isDevBypass) {
        // For subagent testing: attach to window for easy reading
        (window as any).__DEV_BYPASS_RESULT = result.data;
        (window as any).__DEV_BYPASS_PDF = result.pdf_url;
        toast.success('DEV BYPASS: Check window.__DEV_BYPASS_RESULT or console');
        console.log('DEV GENERATED CV:', result.data, 'PDF URL:', result.pdf_url);
      } else {
        router.push(`/cv/${result.resumeId}`);
      }
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || t('toast.generationError'), { id: loadingToastId });
    } finally {
      setIsGenerating(false);
    }
  };

  return isAuthChecking ? (
    <div className="flex min-h-screen items-center justify-center bg-[#f6f2ea] text-zinc-950 dark:bg-[#020202] dark:text-white">
      <div className="flex items-center gap-3 rounded-full border border-black/8 bg-white/68 px-5 py-3 backdrop-blur-xl dark:border-white/10 dark:bg-white/[0.04]">
        <Loader2 className="h-5 w-5 animate-spin text-zinc-950 dark:text-white" />
        <span className="text-sm font-medium text-zinc-600 dark:text-white/70">Loading wizard</span>
      </div>
    </div>
  ) : (
    <div className="relative flex min-h-screen flex-col overflow-hidden bg-[#f6f2ea] font-sans text-zinc-950 transition-colors duration-300 selection:bg-black/10 dark:bg-[#020202] dark:text-white dark:selection:bg-white/20">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.92),transparent_32%),radial-gradient(circle_at_78%_20%,rgba(255,255,255,0.62),transparent_24%),linear-gradient(180deg,#fbf8f2_0%,#f3ede3_50%,#ece4d7_100%)] dark:bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.14),transparent_32%),radial-gradient(circle_at_78%_20%,rgba(255,255,255,0.08),transparent_24%),linear-gradient(180deg,#050505_0%,#020202_50%,#000_100%)]" />
        <div className="absolute top-16 left-[-8%] h-80 w-80 rounded-full bg-black/[0.05] blur-[140px] dark:bg-white/8" />
        <div className="absolute right-[-8%] bottom-[-10%] h-[26rem] w-[26rem] rounded-full bg-black/[0.04] blur-[180px] dark:bg-white/7" />
        <div className="absolute inset-0 [background-image:linear-gradient(rgba(24,24,27,0.08)_1px,transparent_1px),linear-gradient(90deg,rgba(24,24,27,0.08)_1px,transparent_1px)] [background-size:96px_96px] opacity-[0.06] dark:[background-image:linear-gradient(rgba(255,255,255,0.14)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.14)_1px,transparent_1px)]" />
        <Particles
          className="absolute inset-0 opacity-25"
          quantity={36}
          ease={70}
          size={0.9}
          color="#8f8f8f"
          refresh
        />
      </div>

      <header className="sticky top-0 z-50 flex items-center justify-between border-b border-black/8 bg-white/58 px-4 py-4 backdrop-blur-2xl supports-[backdrop-filter]:bg-white/48 sm:px-6 dark:border-white/10 dark:bg-black/45 dark:supports-[backdrop-filter]:bg-black/35">
        <div className="flex items-center gap-3">
          <Link
            href="/"
            className="inline-flex items-center rounded-full border border-black/8 bg-black/[0.03] px-4 py-2 text-sm font-semibold tracking-[0.22em] text-zinc-900 uppercase transition-all duration-300 hover:border-black/12 hover:bg-black/[0.05] dark:border-white/10 dark:bg-white/[0.04] dark:text-white/85 dark:hover:border-white/20 dark:hover:bg-white/[0.08]"
          >
            OMNICV
          </Link>
          <div className="hidden rounded-full border border-black/8 bg-white/60 px-4 py-2 text-sm font-semibold text-zinc-600 sm:block dark:border-white/10 dark:bg-white/[0.04] dark:text-white/70">
            {t('wizard.step')} {step} {t('wizard.of')} {totalSteps}
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="hidden items-center rounded-full border border-black/8 bg-black/[0.03] p-1 backdrop-blur-xl sm:flex dark:border-white/10 dark:bg-white/[0.04]">
            <LanguageToggle />
            <ThemeToggle />
          </div>
          <Button
            variant={isAISidebarOpen ? 'default' : 'outline'}
            size="sm"
            onClick={() => setIsAISidebarOpen((prev) => !prev)}
            className={`flex h-11 items-center gap-2 rounded-full px-5 font-bold transition-all duration-300 ${
              isAISidebarOpen
                ? 'border-black/10 bg-zinc-950 text-white hover:bg-black/90 dark:border-white/10 dark:bg-white dark:text-black dark:hover:bg-white/90'
                : 'border-black/8 bg-black/[0.03] text-zinc-900 hover:bg-black/[0.05] dark:border-white/10 dark:bg-white/[0.04] dark:text-white dark:hover:bg-white/[0.08]'
            }`}
            aria-label="Toggle AI Assistant"
          >
            <Bot className="h-4 w-4" />
            <span className="hidden sm:inline">{t('wizard.aiAssistant') || 'AI Assistant'}</span>
          </Button>
        </div>
      </header>

      <Progress
        value={progressPercentage}
        className="relative z-10 h-1.5 w-full rounded-none bg-black/5 transition-all duration-300 dark:bg-white/5 [&>div]:bg-zinc-950 dark:[&>div]:bg-white"
      />

      <div className="relative z-10 flex flex-1">
        <main className="flex flex-1 flex-col items-center px-4 py-10 sm:px-6 lg:py-12">
          <div className="relative w-full max-w-3xl transition-all duration-300">
            <Card className="liquid-glass w-full overflow-hidden rounded-[2rem] border border-black/8 bg-white/72 shadow-[0_24px_90px_rgba(15,23,42,0.08)] dark:border-white/10 dark:bg-white/[0.04] dark:shadow-[0_30px_120px_rgba(0,0,0,0.45)]">
              {step === 1 && (
                <WizardStep1
                  linkedinUrl={linkedinUrl}
                  setLinkedinUrl={setLinkedinUrl}
                  isImporting={isImporting}
                  handleLinkedInImport={handleLinkedInImport}
                  formData={formData}
                  setFormData={setFormData}
                  jobUrl={jobUrl}
                  setJobUrl={setJobUrl}
                  isScrapingJob={isScrapingJob}
                  handleScraping={handleScraping}
                />
              )}

              {step === 2 && <WizardStep2 formData={formData} setFormData={setFormData} />}

              {step === 3 && <WizardStep3 formData={formData} setFormData={setFormData} />}

              {step === 4 && <WizardStep4 formData={formData} setFormData={setFormData} />}

              <div className="flex items-center justify-between border-t border-black/8 bg-black/[0.03] p-6 backdrop-blur-xl dark:border-white/10 dark:bg-black/10">
                <Button
                  variant="outline"
                  onClick={handlePrev}
                  disabled={step === 1}
                  className="h-12 rounded-full border-black/10 bg-white/72 px-6 font-bold text-zinc-900 transition-all duration-300 hover:bg-white dark:border-white/10 dark:bg-white/[0.04] dark:text-white dark:hover:bg-white/[0.08]"
                >
                  <ArrowLeft className="mr-2 h-4 w-4" /> {t('common.back')}
                </Button>

                {step < totalSteps ? (
                  <Button
                    onClick={handleNext}
                    disabled={
                      (step === 1 && (!formData.profileType || !formData.targetRole.trim())) ||
                      (step === 2 && !formData.education.trim()) ||
                      (step === 3 && !formData.experience.trim())
                    }
                    className="h-12 rounded-full bg-zinc-950 px-8 font-bold text-white transition-all duration-300 hover:bg-black/90 disabled:opacity-50 dark:bg-white dark:text-black dark:hover:bg-white/90"
                  >
                    {t('wizard.continue')} <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                ) : (
                  <Button
                    onClick={handleSubmit}
                    disabled={isGenerating || !formData.skills.trim()}
                    className="h-12 w-full rounded-full border-0 bg-zinc-950 px-8 font-bold text-white transition-all duration-300 hover:bg-black/90 disabled:opacity-50 sm:w-auto dark:bg-white dark:text-black dark:hover:bg-white/90"
                  >
                    {isGenerating ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" /> {t('wizard.compiling')}
                      </>
                    ) : (
                      <>
                        <Bot className="mr-2 h-4 w-4" /> {t('wizard.generateOmnicv')}
                      </>
                    )}
                  </Button>
                )}
              </div>
            </Card>
          </div>
        </main>

        <AIChatSidebar
          isOpen={isAISidebarOpen}
          onClose={() => setIsAISidebarOpen(false)}
          step={step}
          formData={formData}
          setFormData={setFormData}
        />
      </div>
    </div>
  );
}
