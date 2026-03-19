'use client'

import { useState, useRef } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { FileText, Linkedin, Briefcase, Building2, Search, Loader2, Trash2, MonitorPlay, MessageSquareText, Plus, Sparkles } from 'lucide-react'
import { toast } from 'sonner'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useTranslation } from '@/components/I18nProvider'

import { JobSearchTab } from './tabs/JobSearchTab'
import { CompanySearchTab } from './tabs/CompanySearchTab'
import { HistoryTab } from './tabs/HistoryTab'
import { CoverLettersTab } from './tabs/CoverLettersTab'
import { PresentationsTab } from './tabs/PresentationsTab'

interface DashboardClientProps {
    totalCredits: number
    resumes: any[]
    coverLetters?: any[]
    presentations?: any[]
    isPro?: boolean
}

export default function DashboardClient({ totalCredits, resumes, coverLetters = [], presentations = [], isPro }: DashboardClientProps) {
    const [state, setState] = useState({
        isLinkedinImporting: false,
        error: '',
        deleteId: null as string | null,
        localResumes: resumes,
        localCoverLetters: coverLetters,
        localPresentations: presentations,
        linkedinUrl: ''
    });

    const updateState = (updates: Partial<typeof state>) => setState(prev => ({ ...prev, ...updates }));

    const { isLinkedinImporting, error, deleteId, localResumes, localCoverLetters, localPresentations, linkedinUrl } = state;

    const setIsLinkedinImporting = (val: boolean) => updateState({ isLinkedinImporting: val });
    const setError = (val: string) => updateState({ error: val });
    const setDeleteId = (val: string | null) => updateState({ deleteId: val });
    const setLocalResumes = (fn: (prev: any[]) => any[]) => updateState({ localResumes: fn(state.localResumes) });
    const setLinkedinUrl = (val: string) => updateState({ linkedinUrl: val });

    const router = useRouter()
    const { t } = useTranslation()



    // States for LinkedIn are now in the single state object


    const handleLinkedinImport = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!linkedinUrl) return
        setIsLinkedinImporting(true)
        setError('')
        try {
            const res = await fetch('/api/cv/import-linkedin', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ linkedinUrl })
            })
            const data = await res.json()
            if (!res.ok) throw new Error(data.error || 'Failed to import')
            // Save to local storage to pass to wizard
            localStorage.setItem('scrapedCvData', JSON.stringify(data))
            router.push('/wizard')
        } catch (err: any) {
            setError(err.message)
        } finally {
            setIsLinkedinImporting(false)
        }
    }

    const handleDeleteResume = async (id: string) => {
        setDeleteId(id);
        try {
            const res = await fetch(`/api/cv/${id}`, { method: 'DELETE' });
            if (!res.ok) throw new Error('Failed to delete CV');

            setLocalResumes(prev => prev.filter(r => r.id !== id));
            toast.success('CV deleted successfully');
        } catch (err: any) {
            toast.error(err.message || 'Could not delete CV');
        } finally {
            setDeleteId(null);
        }
    }

    return (
        <div className="space-y-6">
            {!isPro && (
                <div className="bg-black dark:bg-white dark:text-black text-white rounded-3xl p-6 md:p-10 flex flex-col md:flex-row items-center justify-between shadow-2xl mb-8 relative overflow-hidden ring-1 ring-black/5 dark:ring-white/5">
                    <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent pointer-events-none mix-blend-overlay"></div>
                    <div className="relative z-10">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-white/20 dark:border-black/20 bg-white/10 dark:bg-black/10 text-xs font-bold uppercase tracking-widest mb-4 backdrop-blur-md">
                            <Sparkles className="w-3.5 h-3.5" /> OMNICV PRO
                        </div>
                        <h3 className="font-black text-2xl md:text-3xl tracking-tight mb-2">
                            {t('dashboard.upgradePro')}
                        </h3>
                        <p className="text-white/70 dark:text-black/70 font-medium max-w-xl">
                            {t('dashboard.upgradeDesc')}
                        </p>
                    </div>
                    <Button asChild className="relative z-10 mt-6 md:mt-0 bg-white text-black hover:bg-white/90 dark:bg-black dark:text-white dark:hover:bg-black/90 font-black text-lg h-14 px-10 whitespace-nowrap border-0 rounded-xl transition-transform hover:scale-105">
                        <Link href="/pricing">
                            {t('dashboard.upgradeBtn')}
                        </Link>
                    </Button>
                </div>
            )}

            <Tabs defaultValue="create" className="space-y-6">
                <TabsList className="bg-slate-100/50 dark:bg-white/5 backdrop-blur-md border border-black/5 dark:border-white/5 p-1.5 rounded-2xl flex flex-wrap h-auto gap-2">
                    <TabsTrigger value="create" className="data-[state=active]:bg-black dark:data-[state=active]:bg-white data-[state=active]:text-white dark:data-[state=active]:text-black text-black/60 dark:text-white/60 rounded-xl transition-all duration-300">
                        <FileText className="w-4 h-4 mr-2" />
                        {t('dashboard.builder')}
                    </TabsTrigger>
                    <TabsTrigger value="history" className="data-[state=active]:bg-black dark:data-[state=active]:bg-white data-[state=active]:text-white dark:data-[state=active]:text-black text-black/60 dark:text-white/60 rounded-xl transition-all duration-300">
                        <FileText className="w-4 h-4 mr-2" />
                        {t('dashboard.history')}
                    </TabsTrigger>
                    <TabsTrigger value="cover-letters" className="data-[state=active]:bg-black dark:data-[state=active]:bg-white data-[state=active]:text-white dark:data-[state=active]:text-black text-black/60 dark:text-white/60 rounded-xl transition-all duration-300">
                        <MessageSquareText className="w-4 h-4 mr-2" />
                        {t('dashboard.coverLetters')}
                    </TabsTrigger>
                    <TabsTrigger value="presentations" className="data-[state=active]:bg-black dark:data-[state=active]:bg-white data-[state=active]:text-white dark:data-[state=active]:text-black text-black/60 dark:text-white/60 rounded-xl transition-all duration-300">
                        <MonitorPlay className="w-4 h-4 mr-2" />
                        {t('dashboard.presentations')}
                    </TabsTrigger>
                    <TabsTrigger value="linkedin" className="data-[state=active]:bg-black dark:data-[state=active]:bg-white data-[state=active]:text-white dark:data-[state=active]:text-black text-black/60 dark:text-white/60 rounded-xl transition-all duration-300">
                        <Linkedin className="w-4 h-4 mr-2" />
                        {t('dashboard.linkedin')}
                    </TabsTrigger>
                    <TabsTrigger value="jobs" className="data-[state=active]:bg-black dark:data-[state=active]:bg-white data-[state=active]:text-white dark:data-[state=active]:text-black text-black/60 dark:text-white/60 rounded-xl transition-all duration-300">
                        <Briefcase className="w-4 h-4 mr-2" />
                        {t('dashboard.findJobs')}
                    </TabsTrigger>
                    <TabsTrigger value="companies" className="data-[state=active]:bg-black dark:data-[state=active]:bg-white data-[state=active]:text-white dark:data-[state=active]:text-black text-black/60 dark:text-white/60 rounded-xl transition-all duration-300">
                        <Building2 className="w-4 h-4 mr-2" />
                        {t('dashboard.findCompanies')}
                    </TabsTrigger>
                    <TabsTrigger value="analytics" className="data-[state=active]:bg-black dark:data-[state=active]:bg-white data-[state=active]:text-white dark:data-[state=active]:text-black text-black/60 dark:text-white/60 rounded-xl transition-all duration-300">
                        <Search className="w-4 h-4 mr-2" />
                        {t('dashboard.analytics')}
                    </TabsTrigger>
                </TabsList>

                {error && (
                    <div className="p-4 bg-red-100 dark:bg-red-500/10 border border-red-500/20 rounded-lg text-red-600 dark:text-red-400 text-sm font-medium">
                        {error}
                    </div>
                )}

                {/* CREATE FROM SCRATCH TAB */}
                <TabsContent value="create">
                    <Card className="liquid-glass border-none shadow-xl rounded-3xl text-black dark:text-white">
                        <CardHeader>
                            <CardTitle className="text-2xl font-black tracking-tight">{t('dashboard.startFromScratch')}</CardTitle>
                            <CardDescription className="text-black/50 dark:text-white/50 font-light">
                                {t('dashboard.builderDesc')}
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="p-8 rounded-3xl bg-white/50 dark:bg-white/5 backdrop-blur-sm border border-black/5 dark:border-white/5 flex flex-col items-center justify-center text-center space-y-4 hover:shadow-xl hover:-translate-y-1 transition-all duration-500">
                                    <div className="p-5 bg-black/5 dark:bg-white/10 rounded-full">
                                        <FileText className="w-8 h-8 text-black dark:text-white" />
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-lg">{t('dashboard.aiWizard')}</h3>
                                        <p className="text-sm text-black/50 dark:text-white/50 mt-2 font-light">{t('dashboard.aiWizardDesc')}</p>
                                    </div>
                                    <Button className="w-full rounded-xl h-12 bg-black hover:bg-black/80 dark:bg-white dark:hover:bg-white/90 text-white dark:text-black font-bold" asChild>
                                        <Link href="/wizard">{t('dashboard.startWizard')}</Link>
                                    </Button>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* MY CVS (HISTORY) TAB */}
                <TabsContent value="history">
                    <HistoryTab resumes={localResumes} handleDeleteResume={handleDeleteResume} />                </TabsContent>

                {/* COVER LETTERS TAB */}
                <TabsContent value="cover-letters">
                    <CoverLettersTab coverLetters={localCoverLetters} />                </TabsContent>

                {/* PRESENTATIONS TAB */}
                <TabsContent value="presentations">
                    <PresentationsTab presentations={localPresentations} />                </TabsContent>

                {/* LINKEDIN IMPORT TAB */}
                <TabsContent value="linkedin">
                    <Card className="liquid-glass border-none shadow-xl rounded-3xl text-black dark:text-white">
                        <CardHeader>
                            <CardTitle className="text-2xl font-black tracking-tight flex items-center gap-2">
                                <Linkedin className="w-5 h-5" /> {t('dashboard.linkedinTitle')}
                            </CardTitle>
                            <CardDescription className="text-black/50 dark:text-white/50 font-light">
                                {t('dashboard.linkedinDesc')}
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <form onSubmit={handleLinkedinImport} className="space-y-4 max-w-xl">
                                <div className="space-y-2">
                                    <Label htmlFor="linkedinUrl" className="text-black/80 dark:text-white/80 font-semibold">{t('dashboard.linkedinUrlLabel')}</Label>
                                    <Input
                                        id="linkedinUrl"
                                        placeholder={t('dashboard.linkedinPlaceholder')}
                                        value={linkedinUrl}
                                        onChange={(e) => setLinkedinUrl(e.target.value)}
                                        className="bg-white/50 dark:bg-black/50 backdrop-blur-sm border-black/10 dark:border-white/10 text-black dark:text-white placeholder:text-black/30 dark:placeholder:text-white/30 h-14 rounded-xl shadow-sm focus-visible:ring-black dark:focus-visible:ring-white transition-all duration-300"
                                    />
                                </div>
                                <Button type="submit" disabled={isLinkedinImporting} className="bg-black hover:bg-black/80 dark:bg-white dark:hover:bg-white/90 text-white dark:text-black h-14 rounded-xl w-full md:w-auto font-bold px-8">
                                    {isLinkedinImporting ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Linkedin className="w-4 h-4 mr-2" />}
                                    {t('dashboard.importConvert')}
                                </Button>
                            </form>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* FIND JOBS TAB */}
                <TabsContent value="jobs">
                    <JobSearchTab />
                </TabsContent>

                {/* FIND COMPANIES TAB */}
                <TabsContent value="companies">
                    <CompanySearchTab />
                </TabsContent>
                {/* ANALYTICS TAB */}
                <TabsContent value="analytics">
                    <Card className="liquid-glass border-none shadow-xl rounded-3xl text-black dark:text-white">
                        <CardHeader>
                            <CardTitle className="text-2xl font-black tracking-tight flex items-center gap-2">
                                <Search className="w-5 h-5" /> {t('dashboard.analytics')}
                            </CardTitle>
                            <CardDescription className="text-black/50 dark:text-white/50 font-light">
                                {t('dashboard.analyticsDesc')}
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {[...localResumes, ...localCoverLetters, ...localPresentations].filter(doc => doc.share_enabled).length === 0 ? (
                                    <div className="col-span-full py-16 text-center border border-black/5 dark:border-white/5 rounded-3xl bg-slate-50/50 dark:bg-zinc-900/50 backdrop-blur-md liquid-glass">
                                        <div className="mx-auto w-12 h-12 rounded-full bg-black/10 dark:bg-white/10 flex items-center justify-center mb-4">
                                            <FileText className="w-6 h-6 text-black/50 dark:text-white/50" />
                                        </div>
                                        <h3 className="text-xl font-bold tracking-tight mb-2">{t('dashboard.noLinks')}</h3>
                                        <p className="text-black/50 dark:text-white/50 font-light max-w-sm mx-auto mb-6">
                                            {t('dashboard.noLinksDesc')}
                                        </p>
                                    </div>
                                ) : (
                                    [...localResumes, ...localCoverLetters, ...localPresentations]
                                        .filter(doc => doc.share_enabled)
                                        .map((doc) => {
                                            const isExpired = new Date() > new Date(doc.share_expires_at);
                                            let typeLabel = t('dashboard.documentType');
                                            if (doc.documentType === 'resume') typeLabel = t('dashboard.cvType');
                                            else if (doc.documentType === 'presentation') typeLabel = t('dashboard.presentationType');
                                            else if (doc.documentType === 'cover_letter') typeLabel = t('dashboard.coverLetterType');

                                            return (
                                                <div key={doc.id} className="p-6 flex flex-col justify-between rounded-2xl bg-white/50 dark:bg-zinc-900/50 backdrop-blur-sm border border-black/5 dark:border-white/5 hover:shadow-xl hover:-translate-y-1 transition-all duration-500">
                                                    <div>
                                                        <div className="flex justify-between items-start mb-2">
                                                            <div>
                                                                <h3 className="font-bold text-lg text-black dark:text-white line-clamp-1 pr-2">{doc.title || `Untitled ${typeLabel}`}</h3>
                                                                <span className="text-xs font-bold text-black/50 dark:text-white/50 uppercase tracking-widest">{typeLabel}</span>
                                                            </div>
                                                            <span className={`text-xs px-2.5 py-1 rounded-full font-bold ${isExpired ? 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-400 border border-red-200 dark:border-red-800' : 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-400 border border-green-200 dark:border-green-800'}`}>
                                                                {isExpired ? t('common.expired').toUpperCase() : t('common.active').toUpperCase()}
                                                            </span>
                                                        </div>
                                                        <div className="mt-6 mb-6">
                                                            <div className="flex justify-between items-center py-2 border-b border-black/10 dark:border-white/10">
                                                                <span className="text-sm font-semibold text-black/60 dark:text-white/60">{t('dashboard.totalViews')}</span>
                                                                <span className="text-xl font-black">{doc.views || 0}</span>
                                                            </div>
                                                            <div className="pt-2 text-sm font-medium text-black/60 dark:text-white/60">
                                                                {t('dashboard.expires')} <span className="font-bold text-black dark:text-white">{new Date(doc.share_expires_at).toLocaleDateString()}</span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <Button asChild className="w-full rounded-xl bg-black hover:bg-black/80 dark:bg-white dark:hover:bg-white/90 text-white dark:text-black font-bold h-12">
                                                        <Link href={`/share/${doc.share_id}`} target="_blank">{t('dashboard.viewPublicLink')}</Link>
                                                    </Button>
                                                </div>
                                            );
                                        })
                                )}
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    )
}
