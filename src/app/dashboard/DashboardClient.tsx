'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import {
  FileText,
  Linkedin,
  Briefcase,
  Building2,
  Search,
  Loader2,
  MessageSquareText,
  MonitorPlay,
  Sparkles,
} from 'lucide-react';
import { toast } from 'sonner';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useTranslation } from '@/components/I18nProvider';
import { motion, AnimatePresence } from 'framer-motion';
import { BlurFade } from '@/components/reactbits/BlurFade';
import { CountUp } from '@/components/reactbits/CountUp';

import { JobSearchTab } from './tabs/JobSearchTab';
import { CompanySearchTab } from './tabs/CompanySearchTab';
import { HistoryTab } from './tabs/HistoryTab';
import { CoverLettersTab } from './tabs/CoverLettersTab';
import { PresentationsTab } from './tabs/PresentationsTab';

interface DashboardClientProps {
  totalCredits: number;
  resumes: any[];
  coverLetters?: any[];
  presentations?: any[];
  isPro?: boolean;
}

export default function DashboardClient({
  totalCredits,
  resumes,
  coverLetters = [],
  presentations = [],
  isPro,
}: DashboardClientProps) {
  const [state, setState] = useState({
    isLinkedinImporting: false,
    error: '',
    deleteId: null as string | null,
    localResumes: resumes,
    localCoverLetters: coverLetters,
    localPresentations: presentations,
    linkedinUrl: '',
  });

  const [activeTab, setActiveTab] = useState('create');

  const updateState = (updates: Partial<typeof state>) =>
    setState((prev) => ({ ...prev, ...updates }));

  const {
    isLinkedinImporting,
    error,
    localResumes,
    localCoverLetters,
    localPresentations,
    linkedinUrl,
  } = state;

  const setIsLinkedinImporting = (val: boolean) => updateState({ isLinkedinImporting: val });
  const setError = (val: string) => updateState({ error: val });
  const setDeleteId = (val: string | null) => updateState({ deleteId: val });
  const setLocalResumes = (fn: (prev: any[]) => any[]) =>
    updateState({ localResumes: fn(state.localResumes) });
  const setLinkedinUrl = (val: string) => updateState({ linkedinUrl: val });

  const router = useRouter();
  const { t } = useTranslation();

  const handleLinkedinImport = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!linkedinUrl) return;
    setIsLinkedinImporting(true);
    setError('');
    try {
      const res = await fetch('/api/cv/import-linkedin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ linkedinUrl }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to import');
      // Save to local storage to pass to wizard
      localStorage.setItem('scrapedCvData', JSON.stringify(data));
      router.push('/wizard');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLinkedinImporting(false);
    }
  };

  const handleDeleteResume = async (id: string) => {
    setDeleteId(id);
    try {
      const res = await fetch(`/api/cv/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed to delete CV');

      setLocalResumes((prev) => prev.filter((r) => r.id !== id));
      toast.success('CV deleted successfully');
    } catch (err: any) {
      toast.error(err.message || 'Could not delete CV');
    } finally {
      setDeleteId(null);
    }
  };

  const TABS = [
    { id: 'create', icon: FileText, label: t('dashboard.builder') },
    { id: 'history', icon: FileText, label: t('dashboard.history') },
    { id: 'cover-letters', icon: MessageSquareText, label: t('dashboard.coverLetters') },
    { id: 'presentations', icon: MonitorPlay, label: t('dashboard.presentations') },
    { id: 'linkedin', icon: Linkedin, label: t('dashboard.linkedin') },
    { id: 'jobs', icon: Briefcase, label: t('dashboard.findJobs') },
    { id: 'companies', icon: Building2, label: t('dashboard.findCompanies') },
    { id: 'analytics', icon: Search, label: t('dashboard.analytics') },
  ];

  return (
    <div className="relative mx-auto max-w-7xl space-y-8 text-zinc-950 dark:text-white">
      {!isPro && (
        <BlurFade delay={0.1}>
          <div className="relative flex flex-col items-start justify-between overflow-hidden rounded-[2rem] border border-black/8 bg-[linear-gradient(135deg,rgba(255,255,255,0.92),rgba(255,255,255,0.58))] p-6 shadow-[0_24px_90px_rgba(15,23,42,0.1)] ring-1 ring-black/4 md:flex-row md:items-center md:p-10 dark:border-white/10 dark:bg-[linear-gradient(135deg,rgba(255,255,255,0.08),rgba(255,255,255,0.02))] dark:shadow-[0_30px_120px_rgba(0,0,0,0.45)] dark:ring-white/5">
            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(255,255,255,0.85),transparent_36%),linear-gradient(135deg,transparent,rgba(255,255,255,0.35))] dark:bg-[radial-gradient(circle_at_top_left,rgba(255,255,255,0.18),transparent_36%),linear-gradient(135deg,transparent,rgba(255,255,255,0.05))]" />
            <div className="relative z-10">
              <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-black/8 bg-black/[0.04] px-3 py-1 text-xs font-bold tracking-[0.24em] text-zinc-700 uppercase backdrop-blur-md dark:border-white/15 dark:bg-white/[0.08] dark:text-white/80">
                <Sparkles className="h-3.5 w-3.5" /> OMNICV PRO
              </div>
              <h3 className="mb-2 text-2xl font-black tracking-tight text-zinc-950 md:text-3xl dark:text-white">
                {t('dashboard.upgradePro')}
              </h3>
              <p className="max-w-xl text-sm leading-relaxed font-medium text-zinc-600 md:text-base dark:text-white/65">
                {t('dashboard.upgradeDesc')}
              </p>
            </div>
            <Button
              asChild
              className="relative z-10 mt-6 h-14 rounded-full border border-black/10 bg-zinc-950 px-10 text-lg font-black whitespace-nowrap text-white transition-all duration-300 hover:scale-[1.02] hover:bg-black/90 md:mt-0 dark:border-white/10 dark:bg-white dark:text-black dark:hover:bg-white/90"
            >
              <Link href="/pricing">{t('dashboard.upgradeBtn')}</Link>
            </Button>
          </div>
        </BlurFade>
      )}

      <Tabs
        value={activeTab}
        onValueChange={setActiveTab}
        orientation="vertical"
        className="flex flex-col gap-8 md:flex-row"
      >
        {/* Sidebar Navigation */}
        <aside className="w-full shrink-0 md:w-64">
          <TabsList className="flex h-auto flex-col items-stretch gap-2 border-none bg-transparent p-0">
            {TABS.map((tab) => (
              <TabsTrigger
                key={tab.id}
                value={tab.id}
                className="relative z-0 flex h-13 w-full items-center justify-start rounded-2xl border border-transparent bg-transparent px-4 py-3 text-left text-zinc-500 shadow-none transition-all duration-300 hover:border-black/10 hover:bg-black/[0.03] hover:text-zinc-950 data-[state=active]:bg-transparent data-[state=active]:text-zinc-950 data-[state=active]:shadow-none dark:text-white/55 dark:hover:border-white/10 dark:hover:bg-white/[0.04] dark:hover:text-white dark:data-[state=active]:text-white"
              >
                {activeTab === tab.id && (
                  <motion.div
                    layoutId="activeTabPill"
                    className="absolute inset-0 rounded-2xl border border-black/8 bg-white/72 shadow-[0_18px_50px_rgba(15,23,42,0.08)] dark:border-white/12 dark:bg-white/[0.08] dark:shadow-[0_18px_50px_rgba(0,0,0,0.32)]"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                  />
                )}
                <span className="relative z-10 flex items-center">
                  <tab.icon className="mr-3 h-5 w-5" />
                  <span className="font-bold">{tab.label}</span>
                </span>
              </TabsTrigger>
            ))}
          </TabsList>
        </aside>

        {/* Main Content Area */}
        <main className="min-w-0 flex-1">
          {error && (
            <div className="mb-6 rounded-2xl border border-red-500/25 bg-red-500/10 p-4 text-sm font-medium text-red-700 backdrop-blur-md dark:text-red-200">
              {error}
            </div>
          )}

          <AnimatePresence mode="wait">
            {/* CREATE FROM SCRATCH TAB */}
            <TabsContent value="create" className="mt-0 outline-none">
              <BlurFade delay={0.1} key="create">
                <Card className="liquid-glass rounded-[2rem] border border-black/8 bg-white/72 text-zinc-950 shadow-[0_24px_90px_rgba(15,23,42,0.08)] dark:border-white/10 dark:bg-white/[0.04] dark:text-white dark:shadow-[0_30px_120px_rgba(0,0,0,0.42)]">
                  <CardHeader>
                    <CardTitle className="text-2xl font-black tracking-tight">
                      {t('dashboard.startFromScratch')}
                    </CardTitle>
                    <CardDescription className="font-light text-zinc-600 dark:text-white/55">
                      {t('dashboard.builderDesc')}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                      <div className="flex flex-col items-center justify-center space-y-5 rounded-[1.75rem] border border-black/8 bg-black/[0.02] p-8 text-center backdrop-blur-sm transition-all duration-500 hover:-translate-y-1.5 hover:border-black/12 hover:bg-black/[0.04] hover:shadow-[0_24px_60px_rgba(15,23,42,0.08)] dark:border-white/10 dark:bg-white/[0.04] dark:hover:border-white/20 dark:hover:bg-white/[0.07] dark:hover:shadow-[0_24px_60px_rgba(0,0,0,0.36)]">
                        <div className="rounded-full border border-black/8 bg-white/72 p-5 shadow-[0_0_40px_rgba(15,23,42,0.06)] dark:border-white/10 dark:bg-white/10 dark:shadow-[0_0_40px_rgba(255,255,255,0.08)]">
                          <FileText className="h-8 w-8 text-zinc-950 dark:text-white" />
                        </div>
                        <div>
                          <h3 className="text-lg font-bold text-zinc-950 dark:text-white">
                            {t('dashboard.aiWizard')}
                          </h3>
                          <p className="mt-2 text-sm leading-relaxed font-light text-zinc-600 dark:text-white/55">
                            {t('dashboard.aiWizardDesc')}
                          </p>
                        </div>
                        <Separator className="bg-black/8 dark:bg-white/10" />
                        <Button
                          className="h-12 w-full rounded-full bg-zinc-950 font-bold text-white transition-all duration-300 hover:bg-black/90 dark:bg-white dark:text-black dark:hover:bg-white/90"
                          asChild
                        >
                          <Link href="/wizard">{t('dashboard.startWizard')}</Link>
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </BlurFade>
            </TabsContent>

            {/* MY CVS (HISTORY) TAB */}
            <TabsContent value="history" className="mt-0 outline-none">
              <BlurFade delay={0.1} key="history">
                <HistoryTab resumes={localResumes} handleDeleteResume={handleDeleteResume} />
              </BlurFade>
            </TabsContent>

            {/* COVER LETTERS TAB */}
            <TabsContent value="cover-letters" className="mt-0 outline-none">
              <BlurFade delay={0.1} key="cover-letters">
                <CoverLettersTab coverLetters={localCoverLetters} />
              </BlurFade>
            </TabsContent>

            {/* PRESENTATIONS TAB */}
            <TabsContent value="presentations" className="mt-0 outline-none">
              <BlurFade delay={0.1} key="presentations">
                <PresentationsTab presentations={localPresentations} />
              </BlurFade>
            </TabsContent>

            {/* LINKEDIN IMPORT TAB */}
            <TabsContent value="linkedin" className="mt-0 outline-none">
              <BlurFade delay={0.1} key="linkedin">
                <Card className="liquid-glass rounded-[2rem] border border-black/8 bg-white/72 text-zinc-950 shadow-[0_24px_90px_rgba(15,23,42,0.08)] dark:border-white/10 dark:bg-white/[0.04] dark:text-white dark:shadow-[0_30px_120px_rgba(0,0,0,0.42)]">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-2xl font-black tracking-tight">
                      <Linkedin className="h-5 w-5" /> {t('dashboard.linkedinTitle')}
                    </CardTitle>
                    <CardDescription className="font-light text-zinc-600 dark:text-white/55">
                      {t('dashboard.linkedinDesc')}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <form onSubmit={handleLinkedinImport} className="max-w-xl space-y-4">
                      <div className="space-y-2">
                        <Label
                          htmlFor="linkedinUrl"
                          className="font-semibold text-zinc-700 dark:text-white/80"
                        >
                          {t('dashboard.linkedinUrlLabel')}
                        </Label>
                        <Input
                          id="linkedinUrl"
                          placeholder={t('dashboard.linkedinPlaceholder')}
                          value={linkedinUrl}
                          onChange={(e) => setLinkedinUrl(e.target.value)}
                          className="h-14 rounded-2xl border-black/10 bg-white/82 text-zinc-950 shadow-inner shadow-black/5 transition-all duration-300 placeholder:text-zinc-400 focus-visible:border-black/20 focus-visible:ring-black/6 dark:border-white/10 dark:bg-black/35 dark:text-white dark:shadow-black/30 dark:placeholder:text-white/28 dark:focus-visible:border-white/20 dark:focus-visible:ring-white/10"
                        />
                      </div>
                      <Button
                        type="submit"
                        disabled={isLinkedinImporting}
                        className="h-14 w-full rounded-full bg-zinc-950 px-8 font-bold text-white transition-all duration-300 hover:bg-black/90 md:w-auto dark:bg-white dark:text-black dark:hover:bg-white/90"
                      >
                        {isLinkedinImporting ? (
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        ) : (
                          <Linkedin className="mr-2 h-4 w-4" />
                        )}
                        {t('dashboard.importConvert')}
                      </Button>
                    </form>
                  </CardContent>
                </Card>
              </BlurFade>
            </TabsContent>

            {/* FIND JOBS TAB */}
            <TabsContent value="jobs" className="mt-0 outline-none">
              <BlurFade delay={0.1} key="jobs">
                <JobSearchTab />
              </BlurFade>
            </TabsContent>

            {/* FIND COMPANIES TAB */}
            <TabsContent value="companies" className="mt-0 outline-none">
              <BlurFade delay={0.1} key="companies">
                <CompanySearchTab />
              </BlurFade>
            </TabsContent>

            {/* ANALYTICS TAB */}
            <TabsContent value="analytics" className="mt-0 outline-none">
              <BlurFade delay={0.1} key="analytics">
                <Card className="liquid-glass rounded-[2rem] border border-black/8 bg-white/72 text-zinc-950 shadow-[0_24px_90px_rgba(15,23,42,0.08)] dark:border-white/10 dark:bg-white/[0.04] dark:text-white dark:shadow-[0_30px_120px_rgba(0,0,0,0.42)]">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-2xl font-black tracking-tight">
                      <Search className="h-5 w-5" /> {t('dashboard.analytics')}
                    </CardTitle>
                    <CardDescription className="font-light text-zinc-600 dark:text-white/55">
                      {t('dashboard.analyticsDesc')}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                      {[...localResumes, ...localCoverLetters, ...localPresentations].filter(
                        (doc) => doc.share_enabled
                      ).length === 0 ? (
                        <div className="liquid-glass col-span-full rounded-[1.75rem] border border-black/8 bg-black/[0.02] py-16 text-center backdrop-blur-md dark:border-white/10 dark:bg-white/[0.04]">
                          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full border border-black/8 bg-white/72 dark:border-white/10 dark:bg-white/10">
                            <FileText className="h-6 w-6 text-zinc-500 dark:text-white/50" />
                          </div>
                          <h3 className="mb-2 text-xl font-bold tracking-tight">
                            {t('dashboard.noLinks')}
                          </h3>
                          <p className="mx-auto mb-6 max-w-sm font-light text-zinc-600 dark:text-white/55">
                            {t('dashboard.noLinksDesc')}
                          </p>
                        </div>
                      ) : (
                        [...localResumes, ...localCoverLetters, ...localPresentations]
                          .filter((doc) => doc.share_enabled)
                          .map((doc) => {
                            const isExpired = new Date() > new Date(doc.share_expires_at);
                            let typeLabel = t('dashboard.documentType');
                            if (doc.documentType === 'resume') typeLabel = t('dashboard.cvType');
                            else if (doc.documentType === 'presentation')
                              typeLabel = t('dashboard.presentationType');
                            else if (doc.documentType === 'cover_letter')
                              typeLabel = t('dashboard.coverLetterType');

                            return (
                              <div
                                key={doc.id}
                                className="flex flex-col justify-between rounded-[1.5rem] border border-black/8 bg-black/[0.02] p-6 backdrop-blur-sm transition-all duration-500 hover:-translate-y-1 hover:border-black/12 hover:bg-black/[0.04] hover:shadow-[0_24px_60px_rgba(15,23,42,0.08)] dark:border-white/10 dark:bg-white/[0.04] dark:hover:border-white/20 dark:hover:bg-white/[0.07] dark:hover:shadow-[0_24px_60px_rgba(0,0,0,0.36)]"
                              >
                                <div>
                                  <div className="mb-2 flex items-start justify-between">
                                    <div>
                                      <h3 className="line-clamp-1 pr-2 text-lg font-bold text-zinc-950 dark:text-white">
                                        {doc.title || `Untitled ${typeLabel}`}
                                      </h3>
                                      <span className="text-xs font-bold tracking-[0.24em] text-zinc-500 uppercase dark:text-white/45">
                                        {typeLabel}
                                      </span>
                                    </div>
                                    <Tooltip>
                                      <TooltipTrigger asChild>
                                        <span
                                          className={`rounded-full border px-2.5 py-1 text-xs font-bold ${isExpired ? 'border-red-500/30 bg-red-500/10 text-red-700 dark:text-red-200' : 'border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-100'}`}
                                        >
                                          {isExpired
                                            ? t('common.expired').toUpperCase()
                                            : t('common.active').toUpperCase()}
                                        </span>
                                      </TooltipTrigger>
                                      <TooltipContent side="left">
                                        {isExpired
                                          ? t('dashboard.expires')
                                          : t('dashboard.viewPublicLink')}
                                      </TooltipContent>
                                    </Tooltip>
                                  </div>
                                  <div className="mt-6 mb-6">
                                    <div className="flex items-center justify-between border-b border-black/8 py-2 dark:border-white/10">
                                      <span className="text-sm font-semibold text-zinc-500 dark:text-white/60">
                                        {t('dashboard.totalViews')}
                                      </span>
                                      <CountUp to={doc.views || 0} className="text-xl font-black" />
                                    </div>
                                    <div className="pt-2 text-sm font-medium text-zinc-500 dark:text-white/60">
                                      {t('dashboard.expires')}{' '}
                                      <span className="font-bold text-zinc-950 dark:text-white">
                                        {new Date(doc.share_expires_at).toLocaleDateString()}
                                      </span>
                                    </div>
                                  </div>
                                </div>
                                <Button
                                  asChild
                                  className="h-12 w-full rounded-full bg-zinc-950 font-bold text-white transition-all duration-300 hover:bg-black/90 dark:bg-white dark:text-black dark:hover:bg-white/90"
                                >
                                  <Link href={`/share/${doc.share_id}`} target="_blank">
                                    {t('dashboard.viewPublicLink')}
                                  </Link>
                                </Button>
                              </div>
                            );
                          })
                      )}
                    </div>
                  </CardContent>
                </Card>
              </BlurFade>
            </TabsContent>
          </AnimatePresence>
        </main>
      </Tabs>
    </div>
  );
}
