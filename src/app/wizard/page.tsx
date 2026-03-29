"use client";





import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
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
import { InteractiveGridPattern } from '@/components/ui/interactive-grid-pattern';
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
    <div className="relative flex min-h-screen flex-col overflow-hidden bg-[#fafafa] font-sans text-zinc-950 transition-colors duration-300 selection:bg-orange-500/20 dark:bg-[#050505] dark:text-white dark:selection:bg-green-500/20">       
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-[#fafafa] dark:bg-[#050505] pointer-events-none" />     

        {/* Soft Orange + Green Ambient Glow Background */}
        <div className="absolute top-[-10%] left-[-10%] h-[60%] w-[60%] rounded-full bg-orange-500/10 blur-[140px] mix-blend-multiply dark:bg-orange-500/10 dark:mix-blend-screen pointer-events-none" />
        <div className="absolute bottom-[-10%] right-[-10%] h-[60%] w-[60%] rounded-full bg-green-500/10 blur-[140px] mix-blend-multiply dark:bg-green-500/10 dark:mix-blend-screen pointer-events-none" />
        <div className="absolute top-[40%] left-[30%] h-[40%] w-[40%] rounded-full bg-orange-400/5 blur-[120px] mix-blend-multiply dark:bg-orange-400/5 dark:mix-blend-screen pointer-events-none" />

        <svg aria-hidden="true" className="pointer-events-none absolute inset-0 h-0 w-0">
          <defs>
            <linearGradient id="orangeGreenMix" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#f97316" />
              <stop offset="100%" stopColor="#22c55e" />
            </linearGradient>
            <linearGradient id="orangeGreenMixDark" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#fb923c" />
              <stop offset="100%" stopColor="#4ade80" />
            </linearGradient>
          </defs>
        </svg>

        <InteractiveGridPattern
          className="absolute inset-0 opacity-100 mix-blend-multiply dark:mix-blend-screen"
          width={40}
          height={40}
          squares={[48, 48]}
          squaresClassName="hover:fill-[url(#orangeGreenMix)] duration-500 ease-out dark:hover:fill-[url(#orangeGreenMixDark)] transition-all"
        />
      </div>

      <div className="pointer-events-none pt-4 px-4 sm:px-6 w-full max-w-5xl mx-auto z-50 sticky top-4">
        <header className="pointer-events-auto flex items-center justify-between rounded-full border border-black/5 bg-white/70 px-5 py-3 shadow-[0_8px_32px_rgba(0,0,0,0.04)] backdrop-blur-2xl supports-[backdrop-filter]:bg-white/60 dark:border-white/10 dark:bg-black/50 dark:shadow-[0_8px_32px_rgba(0,0,0,0.4)] dark:supports-[backdrop-filter]:bg-black/40">
          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="inline-flex items-center rounded-full border border-orange-500/20 bg-orange-500/5 px-4 py-2 text-sm font-semibold tracking-[0.22em] text-orange-600 uppercase transition-all duration-300 hover:bg-orange-500/10 dark:border-green-500/20 dark:bg-green-500/10 dark:text-green-400 dark:hover:bg-green-500/20"
            >
              OMNICV
            </Link>
            <div className="hidden rounded-full border border-black/5 bg-white/60 px-4 py-2 text-sm font-bold text-zinc-600 sm:block dark:border-white/10 dark:bg-white/5 dark:text-white/70">
              {t('wizard.step')} {step} {t('wizard.of')} {totalSteps}
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="hidden items-center rounded-full border border-black/5 bg-white/60 p-1 backdrop-blur-xl sm:flex dark:border-white/10 dark:bg-white/5">
              <LanguageToggle />
              <ThemeToggle />
            </div>
            <Button
              variant={isAISidebarOpen ? 'default' : 'outline'}
              size="sm"
              onClick={() => setIsAISidebarOpen((prev) => !prev)}
              className={`flex h-11 items-center gap-2 rounded-full px-6 font-bold transition-all duration-300 ${
                isAISidebarOpen
                  ? 'border-transparent bg-gradient-to-r from-orange-500 to-green-500 text-white shadow-lg hover:opacity-90'
                  : 'border-black/5 bg-white/60 text-zinc-900 hover:bg-black/5 dark:border-white/10 dark:bg-white/5 dark:text-white dark:hover:bg-white/10'
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
          className="pointer-events-none absolute left-0 right-0 top-full mt-4 h-1.5 w-full rounded-full bg-black/5 transition-all duration-300 dark:bg-white/5 [&>div]:bg-gradient-to-r [&>div]:from-orange-500 [&>div]:to-green-500"
        />
      </div>

      <div className="relative z-10 flex flex-1 pointer-events-none">
        <main className="pointer-events-none flex flex-1 flex-col items-center px-4 py-8 sm:px-6 lg:py-12 mt-6">
          <div className="pointer-events-auto relative w-full max-w-[46rem] mb-20 group">
            {/* Main content ambient glow */}
            <div className="absolute -inset-0.5 z-0 rounded-[3rem] bg-gradient-to-br from-orange-500/30 via-transparent to-green-500/30 blur-2xl opacity-50 dark:from-orange-400/20 dark:to-green-400/20 transition-opacity duration-500 group-hover:opacity-80" />
            
            <div className="relative z-10 w-full rounded-[2.5rem] bg-white/95 p-6 shadow-[0_8px_40px_rgba(0,0,0,0.08)] backdrop-blur-3xl border border-black/5 sm:p-12 dark:border-white/10 dark:bg-[#0a0a0a]/95 dark:shadow-[0_8px_40px_rgba(0,0,0,0.4)] transition-all duration-300">
              <div className="w-full">
              <AnimatePresence mode="wait">
                <motion.div
                  key={step}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.3 }}
                >
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
                </motion.div>
              </AnimatePresence>

              <div className="mt-12 flex flex-col-reverse items-center justify-between gap-4 border-t border-black/5 pt-8 sm:flex-row dark:border-white/5">
                <Button
                  variant="ghost"
                  onClick={handlePrev}
                  disabled={step === 1}
                  className="h-12 w-full rounded-full px-6 font-medium text-zinc-600 transition-colors hover:bg-black/5 hover:text-zinc-900 focus-visible:ring-1 focus-visible:ring-zinc-400 sm:w-auto dark:text-zinc-400 dark:hover:bg-white/5 dark:hover:text-white dark:focus-visible:ring-zinc-600"        
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
                    className="h-12 w-full rounded-full bg-zinc-900 px-8 font-medium text-white shadow-sm transition-all hover:bg-zinc-800 focus-visible:ring-2 focus-visible:ring-zinc-400 focus-visible:ring-offset-2 disabled:opacity-50 sm:w-auto dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-white dark:focus-visible:ring-zinc-600 dark:focus-visible:ring-offset-zinc-950"
                  >
                    {t('wizard.continue')} <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                ) : (
                  <Button
                    onClick={handleSubmit}
                    disabled={isGenerating || !formData.skills.trim()}
                    className="h-12 w-full rounded-full bg-zinc-900 px-8 font-medium text-white shadow-sm transition-all hover:bg-zinc-800 focus-visible:ring-2 focus-visible:ring-zinc-400 focus-visible:ring-offset-2 disabled:opacity-50 sm:w-auto dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-white dark:focus-visible:ring-zinc-600 dark:focus-visible:ring-offset-zinc-950"        
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
            </div>
            </div>
          </div>
        </main>

        <div className="pointer-events-auto">
          <AIChatSidebar
            isOpen={isAISidebarOpen}
            onClose={() => setIsAISidebarOpen(false)}
            step={step}
            formData={formData}
            setFormData={setFormData}
          />
        </div>
      </div>
    </div>
  );
}


