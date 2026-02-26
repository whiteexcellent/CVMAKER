'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { FileText, Linkedin, Briefcase, Building2, Search, Loader2, Trash2, MonitorPlay, MessageSquareText, Plus } from 'lucide-react'
import { toast } from 'sonner'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useTranslation } from '@/components/I18nProvider'

interface DashboardClientProps {
    totalCredits: number
    resumes: any[]
    coverLetters?: any[]
    presentations?: any[]
}

export default function DashboardClient({ totalCredits, resumes, coverLetters = [], presentations = [] }: DashboardClientProps) {
    const [isJobSearching, setIsJobSearching] = useState(false)
    const [isCompanySearching, setIsCompanySearching] = useState(false)
    const [isLinkedinImporting, setIsLinkedinImporting] = useState(false)
    const [error, setError] = useState('')
    const [deleteId, setDeleteId] = useState<string | null>(null)
    const [localResumes, setLocalResumes] = useState(resumes)
    const [localCoverLetters, setLocalCoverLetters] = useState(coverLetters)
    const [localPresentations, setLocalPresentations] = useState(presentations)
    const router = useRouter()
    const { t } = useTranslation()

    // States for Job Search
    const [jobQuery, setJobQuery] = useState('')
    const [jobLoc, setJobLoc] = useState('')
    const [jobs, setJobs] = useState<any[]>([])

    // States for Company Search
    const [compQuery, setCompQuery] = useState('')
    const [compLoc, setCompLoc] = useState('')
    const [companies, setCompanies] = useState<any[]>([])

    // States for LinkedIn
    const [linkedinUrl, setLinkedinUrl] = useState('')

    const handleJobSearch = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!jobQuery) return
        setIsJobSearching(true)
        setError('')
        try {
            const res = await fetch('/api/cv/search-jobs', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ query: jobQuery, location: jobLoc })
            })
            const data = await res.json()
            if (!res.ok) throw new Error(data.error || 'Failed to fetch jobs')
            setJobs(data.jobs || [])
        } catch (err: any) {
            setError(err.message)
        } finally {
            setIsJobSearching(false)
        }
    }

    const handleCompanySearch = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!compQuery) return
        setIsCompanySearching(true)
        setError('')
        try {
            const res = await fetch('/api/cv/search-companies', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ query: compQuery, location: compLoc })
            })
            const data = await res.json()
            if (!res.ok) throw new Error(data.error || 'Failed to fetch companies')
            setCompanies(data.companies || [])
        } catch (err: any) {
            setError(err.message)
        } finally {
            setIsCompanySearching(false)
        }
    }

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
        <Tabs defaultValue="create" className="space-y-6">
            <TabsList className="bg-slate-100 dark:bg-white/5 border border-black/10 dark:border-white/10 p-1 rounded-xl flex flex-wrap h-auto gap-2">
                <TabsTrigger value="create" className="data-[state=active]:bg-black dark:data-[state=active]:bg-white data-[state=active]:text-white dark:data-[state=active]:text-black text-black/60 dark:text-white/60">
                    <FileText className="w-4 h-4 mr-2" />
                    {t('dashboard.builder')}
                </TabsTrigger>
                <TabsTrigger value="history" className="data-[state=active]:bg-black dark:data-[state=active]:bg-white data-[state=active]:text-white dark:data-[state=active]:text-black text-black/60 dark:text-white/60">
                    <FileText className="w-4 h-4 mr-2" />
                    {t('dashboard.history')}
                </TabsTrigger>
                <TabsTrigger value="cover-letters" className="data-[state=active]:bg-black dark:data-[state=active]:bg-white data-[state=active]:text-white dark:data-[state=active]:text-black text-black/60 dark:text-white/60">
                    <MessageSquareText className="w-4 h-4 mr-2" />
                    {t('dashboard.coverLetters')}
                </TabsTrigger>
                <TabsTrigger value="presentations" className="data-[state=active]:bg-black dark:data-[state=active]:bg-white data-[state=active]:text-white dark:data-[state=active]:text-black text-black/60 dark:text-white/60">
                    <MonitorPlay className="w-4 h-4 mr-2" />
                    {t('dashboard.presentations')}
                </TabsTrigger>
                <TabsTrigger value="linkedin" className="data-[state=active]:bg-black dark:data-[state=active]:bg-white data-[state=active]:text-white dark:data-[state=active]:text-black text-black/60 dark:text-white/60">
                    <Linkedin className="w-4 h-4 mr-2" />
                    {t('dashboard.linkedin')}
                </TabsTrigger>
                <TabsTrigger value="jobs" className="data-[state=active]:bg-black dark:data-[state=active]:bg-white data-[state=active]:text-white dark:data-[state=active]:text-black text-black/60 dark:text-white/60">
                    <Briefcase className="w-4 h-4 mr-2" />
                    {t('dashboard.findJobs')}
                </TabsTrigger>
                <TabsTrigger value="companies" className="data-[state=active]:bg-black dark:data-[state=active]:bg-white data-[state=active]:text-white dark:data-[state=active]:text-black text-black/60 dark:text-white/60">
                    <Building2 className="w-4 h-4 mr-2" />
                    {t('dashboard.findCompanies')}
                </TabsTrigger>
                <TabsTrigger value="analytics" className="data-[state=active]:bg-black dark:data-[state=active]:bg-white data-[state=active]:text-white dark:data-[state=active]:text-black text-black/60 dark:text-white/60">
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
                <Card className="bg-white dark:bg-black border-black/10 dark:border-white/10 text-black dark:text-white shadow-sm">
                    <CardHeader>
                        <CardTitle className="text-2xl font-black tracking-tight">{t('dashboard.startFromScratch')}</CardTitle>
                        <CardDescription className="text-black/50 dark:text-white/50 font-light">
                            {t('dashboard.builderDesc')}
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="p-6 rounded-2xl bg-slate-50 dark:bg-white/5 border border-black/10 dark:border-white/10 flex flex-col items-center justify-center text-center space-y-4 hover:border-black/30 dark:hover:border-white/30 transition-colors">
                                <div className="p-4 bg-black/5 dark:bg-white/10 rounded-full">
                                    <FileText className="w-8 h-8 text-black dark:text-white" />
                                </div>
                                <div>
                                    <h3 className="font-bold text-lg">{t('dashboard.aiWizard')}</h3>
                                    <p className="text-sm text-black/50 dark:text-white/50 mt-2 font-light">{t('dashboard.aiWizardDesc')}</p>
                                </div>
                                <Button className="w-full bg-black hover:bg-black/80 dark:bg-white dark:hover:bg-white/90 text-white dark:text-black font-bold" asChild>
                                    <Link href="/wizard">{t('dashboard.startWizard')}</Link>
                                </Button>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </TabsContent>

            {/* MY CVS (HISTORY) TAB */}
            <TabsContent value="history">
                <Card className="bg-white dark:bg-black border-black/10 dark:border-white/10 text-black dark:text-white shadow-sm">
                    <CardHeader>
                        <CardTitle className="text-2xl font-black tracking-tight flex items-center gap-2">
                            <FileText className="w-5 h-5" /> {t('dashboard.docHistory')}
                        </CardTitle>
                        <CardDescription className="text-black/50 dark:text-white/50 font-light">
                            {t('dashboard.docHistoryDesc')}
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        {localResumes && localResumes.length > 0 ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {localResumes.map((resume) => {
                                    const parsedContent = typeof resume.content === 'string' ? JSON.parse(resume.content) : resume.content;
                                    const title = parsedContent?.experience?.[0]?.title || t('dashboard.untitledCv');
                                    const date = new Date(resume.created_at).toLocaleDateString();
                                    return (
                                        <div key={resume.id} className="p-5 flex flex-col justify-between rounded-xl bg-slate-50 dark:bg-zinc-900 border border-black/10 dark:border-white/10 hover:border-black/30 dark:hover:border-white/30 transition-all">
                                            <div>
                                                <div className="flex justify-between items-start mb-2">
                                                    <h3 className="font-bold text-lg text-black dark:text-white line-clamp-1 pr-2">{title}</h3>
                                                    <button
                                                        onClick={() => handleDeleteResume(resume.id)}
                                                        className="text-red-500 hover:text-red-700 p-1 flex-shrink-0"
                                                        title="Delete CV"
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                </div>
                                                <p className="text-sm font-medium text-black/50 dark:text-white/50 mb-4">{t('dashboard.created')} {date}</p>
                                            </div>
                                            <Button asChild className="w-full bg-black hover:bg-black/80 dark:bg-white dark:hover:bg-white/90 text-white dark:text-black font-bold h-10">
                                                <Link href={`/cv/${resume.id}`}>{t('dashboard.viewEdit')}</Link>
                                            </Button>
                                        </div>
                                    )
                                })}
                            </div>
                        ) : (
                            <div className="p-12 text-center rounded-xl bg-slate-50 dark:bg-zinc-900 border border-black/10 dark:border-white/10">
                                <h3 className="font-bold text-xl mb-2">{t('dashboard.noCvs')}</h3>
                                <p className="text-black/50 dark:text-white/50 mb-6">{t('dashboard.noCvsDesc')}</p>
                                <Button asChild className="bg-black hover:bg-black/80 dark:bg-white dark:hover:bg-white/90 text-white dark:text-black font-bold">
                                    <Link href="/wizard">{t('dashboard.startBuilding')}</Link>
                                </Button>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </TabsContent>

            {/* COVER LETTERS TAB */}
            <TabsContent value="cover-letters">
                <Card className="bg-white dark:bg-black border-black/10 dark:border-white/10 text-black dark:text-white shadow-sm">
                    <CardHeader className="flex flex-row items-center justify-between">
                        <div>
                            <CardTitle className="text-2xl font-black tracking-tight flex items-center gap-2">
                                <MessageSquareText className="w-5 h-5" /> {t('dashboard.coverLetters')}
                            </CardTitle>
                            <CardDescription className="text-black/50 dark:text-white/50 font-light">
                                {t('dashboard.coverLettersDesc')}
                            </CardDescription>
                        </div>
                        {localCoverLetters && localCoverLetters.length > 0 && (
                            <Button asChild className="bg-black hover:bg-black/80 dark:bg-white dark:hover:bg-white/90 text-white dark:text-black font-bold h-10 px-4">
                                <Link href="/cover-letter/new">
                                    <Plus className="w-4 h-4 mr-2" />
                                    {t('dashboard.createLetter')}
                                </Link>
                            </Button>
                        )}
                    </CardHeader>
                    <CardContent>
                        {localCoverLetters && localCoverLetters.length > 0 ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {localCoverLetters.map((cl) => {
                                    const date = new Date(cl.created_at).toLocaleDateString()
                                    return (
                                        <div key={cl.id} className="p-5 flex flex-col justify-between rounded-xl bg-slate-50 dark:bg-zinc-900 border border-black/10 dark:border-white/10 hover:border-black/30 dark:hover:border-white/30 transition-all">
                                            <div>
                                                <div className="flex justify-between items-start mb-2">
                                                    <h3 className="font-bold text-lg text-black dark:text-white line-clamp-1 pr-2">{cl.title || t('dashboard.untitledLetter')}</h3>
                                                </div>
                                                <p className="text-sm font-medium text-black/50 dark:text-white/50 mb-4">{t('dashboard.created')} {date}</p>
                                            </div>
                                            <Button asChild className="w-full bg-black hover:bg-black/80 dark:bg-white dark:hover:bg-white/90 text-white dark:text-black font-bold h-10">
                                                <Link href={`/cover-letter/${cl.id}`}>{t('dashboard.viewEdit')}</Link>
                                            </Button>
                                        </div>
                                    )
                                })}
                            </div>
                        ) : (
                            <div className="p-12 text-center rounded-xl bg-slate-50 dark:bg-zinc-900 border border-black/10 dark:border-white/10">
                                <h3 className="font-bold text-xl mb-2">{t('dashboard.noLetters')}</h3>
                                <p className="text-black/50 dark:text-white/50 mb-6">{t('dashboard.noLettersDesc')}</p>
                                <Button asChild className="bg-black hover:bg-black/80 dark:bg-white dark:hover:bg-white/90 text-white dark:text-black font-bold">
                                    <Link href="/cover-letter/new">{t('dashboard.createLetter')}</Link>
                                </Button>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </TabsContent>

            {/* PRESENTATIONS TAB */}
            <TabsContent value="presentations">
                <Card className="bg-white dark:bg-black border-black/10 dark:border-white/10 text-black dark:text-white shadow-sm">
                    <CardHeader className="flex flex-row items-center justify-between">
                        <div>
                            <CardTitle className="text-2xl font-black tracking-tight flex items-center gap-2">
                                <MonitorPlay className="w-5 h-5" /> {t('dashboard.presentations')}
                            </CardTitle>
                            <CardDescription className="text-black/50 dark:text-white/50 font-light">
                                {t('dashboard.presentationsDesc')}
                            </CardDescription>
                        </div>
                        {localPresentations && localPresentations.length > 0 && (
                            <Button asChild className="bg-black hover:bg-black/80 dark:bg-white dark:hover:bg-white/90 text-white dark:text-black font-bold h-10 px-4">
                                <Link href="/presentation/new">
                                    <Plus className="w-4 h-4 mr-2" />
                                    {t('dashboard.generatePresentation')}
                                </Link>
                            </Button>
                        )}
                    </CardHeader>
                    <CardContent>
                        {localPresentations && localPresentations.length > 0 ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {localPresentations.map((pres) => {
                                    const date = new Date(pres.created_at).toLocaleDateString()
                                    return (
                                        <div key={pres.id} className="p-5 flex flex-col justify-between rounded-xl bg-slate-50 dark:bg-zinc-900 border border-black/10 dark:border-white/10 hover:border-black/30 dark:hover:border-white/30 transition-all">
                                            <div>
                                                <div className="flex justify-between items-start mb-2">
                                                    <h3 className="font-bold text-lg text-black dark:text-white line-clamp-1 pr-2">{pres.target_company || t('dashboard.interviewPrep')}</h3>
                                                </div>
                                                <p className="text-sm font-medium text-black/50 dark:text-white/50 mb-4">{t('dashboard.created')} {date}</p>
                                            </div>
                                            <Button asChild className="w-full bg-black hover:bg-black/80 dark:bg-white dark:hover:bg-white/90 text-white dark:text-black font-bold h-10">
                                                <Link href={`/presentation/${pres.id}`}>{t('dashboard.viewPresentation')}</Link>
                                            </Button>
                                        </div>
                                    )
                                })}
                            </div>
                        ) : (
                            <div className="p-12 text-center rounded-xl bg-slate-50 dark:bg-zinc-900 border border-black/10 dark:border-white/10">
                                <h3 className="font-bold text-xl mb-2">{t('dashboard.noPresentations')}</h3>
                                <p className="text-black/50 dark:text-white/50 mb-6">{t('dashboard.noPresentationsDesc')}</p>
                                <Button asChild className="bg-black hover:bg-black/80 dark:bg-white dark:hover:bg-white/90 text-white dark:text-black font-bold">
                                    <Link href="/presentation/new">{t('dashboard.generatePresentation')}</Link>
                                </Button>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </TabsContent>

            {/* LINKEDIN IMPORT TAB */}
            <TabsContent value="linkedin">
                <Card className="bg-white dark:bg-black border-black/10 dark:border-white/10 text-black dark:text-white shadow-sm">
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
                                    className="bg-transparent border-black/20 dark:border-white/20 text-black dark:text-white placeholder:text-black/30 dark:placeholder:text-white/30 h-12"
                                />
                            </div>
                            <Button type="submit" disabled={isLinkedinImporting} className="bg-black hover:bg-black/80 dark:bg-white dark:hover:bg-white/90 text-white dark:text-black h-11 w-full md:w-auto font-bold">
                                {isLinkedinImporting ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Linkedin className="w-4 h-4 mr-2" />}
                                {t('dashboard.importConvert')}
                            </Button>
                        </form>
                    </CardContent>
                </Card>
            </TabsContent>

            {/* FIND JOBS TAB */}
            <TabsContent value="jobs">
                <Card className="bg-white dark:bg-black border-black/10 dark:border-white/10 text-black dark:text-white shadow-sm">
                    <CardHeader>
                        <CardTitle className="text-2xl font-black tracking-tight flex items-center gap-2">
                            <Briefcase className="w-5 h-5" /> {t('dashboard.discoverOpportunities')}
                        </CardTitle>
                        <CardDescription className="text-black/50 dark:text-white/50 font-light">
                            {t('dashboard.discoverDesc')}
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleJobSearch} className="flex flex-col md:flex-row gap-4 mb-8">
                            <Input
                                placeholder={t('dashboard.jobKeywordLabel')}
                                value={jobQuery}
                                onChange={(e) => setJobQuery(e.target.value)}
                                className="bg-transparent border-black/20 dark:border-white/20 text-black dark:text-white placeholder:text-black/30 dark:placeholder:text-white/30 h-11 focus-visible:ring-black dark:focus-visible:ring-white"
                            />
                            <Input
                                placeholder={t('dashboard.jobLocationLabel')}
                                value={jobLoc}
                                onChange={(e) => setJobLoc(e.target.value)}
                                className="bg-transparent border-black/20 dark:border-white/20 text-black dark:text-white placeholder:text-black/30 dark:placeholder:text-white/30 h-11 md:w-1/3 focus-visible:ring-black dark:focus-visible:ring-white"
                            />
                            <Button type="submit" disabled={isJobSearching} className="bg-black hover:bg-black/80 dark:bg-white dark:hover:bg-white/90 text-white dark:text-black h-11 font-bold">
                                {isJobSearching ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4 mr-2" />}
                                {t('dashboard.searchJobsBtn')}
                            </Button>
                        </form>

                        <div className="space-y-4">
                            {jobs.map((job, idx) => (
                                <div key={idx} className="p-4 rounded-xl bg-slate-50 dark:bg-white/5 border border-black/10 dark:border-white/10 hover:border-black/30 dark:hover:border-white/30 transition-colors">
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <h4 className="font-bold text-black dark:text-white text-lg">{job.title}</h4>
                                            <p className="text-sm text-black/60 dark:text-white/60 font-medium">{job.company} • {job.location}</p>
                                        </div>
                                        <Button variant="outline" size="sm" className="border-black/20 dark:border-white/20 text-black dark:text-white hover:bg-black/5 dark:hover:bg-white/10 font-bold" asChild>
                                            <a href={job.url} target="_blank" rel="noopener noreferrer">{t('dashboard.apply')}</a>
                                        </Button>
                                    </div>
                                    <p className="text-xs text-black/50 dark:text-white/50 mt-3 line-clamp-2 md:line-clamp-3 leading-relaxed">{job.snippet}</p>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            </TabsContent>

            {/* FIND COMPANIES TAB */}
            <TabsContent value="companies">
                <Card className="bg-white dark:bg-black border-black/10 dark:border-white/10 text-black dark:text-white shadow-sm">
                    <CardHeader>
                        <CardTitle className="text-2xl font-black tracking-tight flex items-center gap-2">
                            <Building2 className="w-5 h-5" /> {t('dashboard.findCompanies')}
                        </CardTitle>
                        <CardDescription className="text-black/50 dark:text-white/50 font-light">
                            {t('dashboard.targetCompaniesDesc')}
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleCompanySearch} className="flex flex-col md:flex-row gap-4 mb-8">
                            <Input
                                placeholder={t('dashboard.companyKeywordLabel')}
                                value={compQuery}
                                onChange={(e) => setCompQuery(e.target.value)}
                                className="bg-transparent border-black/20 dark:border-white/20 text-black dark:text-white placeholder:text-black/30 dark:placeholder:text-white/30 h-11 focus-visible:ring-black dark:focus-visible:ring-white"
                            />
                            <Input
                                placeholder={t('dashboard.companyLocationLabel')}
                                value={compLoc}
                                onChange={(e) => setCompLoc(e.target.value)}
                                className="bg-transparent border-black/20 dark:border-white/20 text-black dark:text-white placeholder:text-black/30 dark:placeholder:text-white/30 h-11 md:w-1/3 focus-visible:ring-black dark:focus-visible:ring-white"
                            />
                            <Button type="submit" disabled={isCompanySearching} className="bg-black hover:bg-black/80 dark:bg-white dark:hover:bg-white/90 text-white dark:text-black font-bold h-11">
                                {isCompanySearching ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4 mr-2" />}
                                {t('dashboard.findCompaniesBtn')}
                            </Button>
                        </form>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {companies.map((comp, idx) => (
                                <div key={idx} className="p-4 rounded-xl bg-slate-50 dark:bg-white/5 border border-black/10 dark:border-white/10 flex flex-col justify-between hover:border-black/30 dark:hover:border-white/30 transition-colors">
                                    <div>
                                        <h4 className="font-bold text-black dark:text-white text-lg line-clamp-1">{comp.title}</h4>
                                        <p className="text-xs text-black/50 dark:text-white/50 mt-1 uppercase font-semibold tracking-wider">{comp.category}</p>
                                        <p className="text-sm mt-3 text-black/70 dark:text-white/70 line-clamp-1">📍 {comp.address}</p>
                                        <p className="text-sm mt-1 text-black/70 dark:text-white/70 font-medium">⭐ {comp.rating} ({comp.reviews} reviews)</p>
                                    </div>
                                    {comp.website && (
                                        <Button variant="link" className="mt-4 p-0 h-auto text-black dark:text-white hover:text-black/70 dark:hover:text-white/70 font-bold self-start" asChild>
                                            <a href={comp.website} target="_blank" rel="noopener noreferrer">{t('dashboard.visitWebsite')}</a>
                                        </Button>
                                    )}
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            </TabsContent>
            {/* ANALYTICS TAB */}
            <TabsContent value="analytics">
                <Card className="bg-white dark:bg-black border-black/10 dark:border-white/10 text-black dark:text-white shadow-sm">
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
                                <div className="col-span-full py-16 text-center border-2 border-dashed border-black/10 dark:border-white/10 rounded-xl bg-black/5 dark:bg-white/5">
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
                                        if (doc.template_id !== undefined) typeLabel = t('dashboard.cvType');
                                        else if (doc.target_company !== undefined) typeLabel = t('dashboard.presentationType');
                                        else typeLabel = t('dashboard.coverLetterType');

                                        return (
                                            <div key={doc.id} className="p-5 flex flex-col justify-between rounded-xl bg-slate-50 dark:bg-zinc-900 border border-black/10 dark:border-white/10 hover:border-black/30 dark:hover:border-white/30 transition-all">
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
                                                <Button asChild className="w-full bg-black hover:bg-black/80 dark:bg-white dark:hover:bg-white/90 text-white dark:text-black font-bold h-10">
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
    )
}
