"use client";
import { HugeiconsIcon } from "@hugeicons/react";
import { Briefcase08Icon, Search01Icon, SquareArrowReload01Icon } from "@hugeicons/core-free-icons";
import { useState, useRef } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

import { useTranslation } from '@/components/I18nProvider'

export function JobSearchTab() {
    const { t } = useTranslation()
    const [state, setState] = useState({
        jobQuery: '',
        jobLoc: '',
        jobs: [] as any[],
        jobProgress: 0,
        isJobSearching: false,
        error: ''
    });

    const updateState = (updates: Partial<typeof state>) => setState(prev => ({ ...prev, ...updates }));
    const { jobQuery, jobLoc, jobs, jobProgress, isJobSearching, error } = state;

    const setJobQuery = (val: string) => updateState({ jobQuery: val });
    const setJobLoc = (val: string) => updateState({ jobLoc: val });
    const setJobs = (val: any[]) => updateState({ jobs: val });
    const setJobProgress = (val: number | ((prev: number) => number)) =>
        updateState({ jobProgress: typeof val === 'function' ? val(state.jobProgress) : val });
    const setIsJobSearching = (val: boolean) => updateState({ isJobSearching: val });
    const setError = (val: string) => updateState({ error: val });
    const jobProgressRef = useRef<ReturnType<typeof setInterval> | null>(null)

    const startProgress = (setter: React.Dispatch<React.SetStateAction<number>>, intervalRef: React.MutableRefObject<ReturnType<typeof setInterval> | null>) => {
        setter(0)
        if (intervalRef.current) clearInterval(intervalRef.current)
        intervalRef.current = setInterval(() => {
            setter(prev => {
                if (prev >= 90) { if (intervalRef.current) clearInterval(intervalRef.current); return 90 }
                return Math.min(prev + (90 - prev) * 0.04 + 0.3, 90)
            })
        }, 250)
    }

    const finishProgress = (setter: React.Dispatch<React.SetStateAction<number>>, intervalRef: React.MutableRefObject<ReturnType<typeof setInterval> | null>) => {
        if (intervalRef.current) clearInterval(intervalRef.current)
        setter(100)
        setTimeout(() => setter(0), 900)
    }

    const handleJobSearch = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!jobQuery) return
        setIsJobSearching(true)
        setJobs([])
        setError('')
        startProgress(setJobProgress, jobProgressRef)
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
            finishProgress(setJobProgress, jobProgressRef)
            setIsJobSearching(false)
        }
    }

    return (
        <Card className="bg-white dark:bg-black border-black/10 dark:border-white/10 text-black dark:text-white shadow-sm">
            <CardHeader>
                <CardTitle className="text-2xl font-black tracking-tight flex items-center gap-2">
                    <HugeiconsIcon icon={Briefcase08Icon} className="w-5 h-5"  strokeWidth={1.5} /> {t('dashboard.discoverOpportunities')}
                </CardTitle>
                <CardDescription className="text-black/50 dark:text-white/50 font-light">
                    {t('dashboard.discoverDesc')}
                </CardDescription>
            </CardHeader>
            <CardContent>
                {error && (
                    <div className="p-4 mb-4 bg-red-100 dark:bg-red-500/10 border border-red-500/20 rounded-lg text-red-600 dark:text-red-400 text-sm font-medium">
                        {error}
                    </div>
                )}
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
                        {isJobSearching ? <HugeiconsIcon icon={SquareArrowReload01Icon} className="w-4 h-4 animate-spin"  strokeWidth={1.5} /> : <HugeiconsIcon icon={Search01Icon} className="w-4 h-4 mr-2"  strokeWidth={1.5} />}
                        {t('dashboard.searchJobsBtn')}
                    </Button>
                </form>

                {isJobSearching && (
                    <div className="mb-8 rounded-xl overflow-hidden border border-black/10 dark:border-white/10 bg-slate-50 dark:bg-white/5 p-5">
                        <div className="flex justify-between items-center mb-3">
                            <div className="flex items-center gap-2">
                                <HugeiconsIcon icon={SquareArrowReload01Icon} className="w-4 h-4 animate-spin text-black dark:text-white"  strokeWidth={1.5} />
                                <span className="text-sm font-semibold text-black dark:text-white">
                                    {t('dashboard.searchingJobs')}
                                </span>
                            </div>
                            <span className="text-sm font-bold text-black/60 dark:text-white/60">{Math.round(jobProgress)}%</span>
                        </div>
                        <div className="w-full h-2 bg-black/10 dark:bg-white/10 rounded-full overflow-hidden">
                            <div
                                className="h-full bg-black dark:bg-white rounded-full transition-all duration-300 ease-out"
                                style={{ width: `${jobProgress}%` }}
                            />
                        </div>
                        <p className="text-xs text-black/40 dark:text-white/40 mt-3">
                            {t('dashboard.searchingNote')}
                        </p>
                    </div>
                )}

                <div className="space-y-4">
                    {jobs.map((job, idx) => (
                        <div key={job.url || `job-${idx}`} className="p-4 rounded-xl bg-slate-50 dark:bg-white/5 border border-black/10 dark:border-white/10 hover:border-black/30 dark:hover:border-white/30 transition-colors">
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
    )
}
