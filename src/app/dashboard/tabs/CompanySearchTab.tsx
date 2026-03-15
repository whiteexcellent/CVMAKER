'use client'

import { useState, useRef } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Search, Loader2, Building2 } from 'lucide-react'
import { useTranslation } from '@/components/I18nProvider'

export function CompanySearchTab() {
    const { t } = useTranslation()
    const [state, setState] = useState({
        compQuery: '',
        compLoc: '',
        companies: [] as any[],
        compProgress: 0,
        isCompanySearching: false,
        error: ''
    });

    const updateState = (updates: Partial<typeof state>) => setState(prev => ({ ...prev, ...updates }));
    const { compQuery, compLoc, companies, compProgress, isCompanySearching, error } = state;

    const setCompQuery = (val: string) => updateState({ compQuery: val });
    const setCompLoc = (val: string) => updateState({ compLoc: val });
    const setCompanies = (val: any[]) => updateState({ companies: val });
    const setCompProgress = (val: number | ((prev: number) => number)) =>
        updateState({ compProgress: typeof val === 'function' ? val(state.compProgress) : val });
    const setIsCompanySearching = (val: boolean) => updateState({ isCompanySearching: val });
    const setError = (val: string) => updateState({ error: val });
    const compProgressRef = useRef<ReturnType<typeof setInterval> | null>(null)

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

    const handleCompanySearch = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!compQuery) return
        setIsCompanySearching(true)
        setCompanies([])
        setError('')
        startProgress(setCompProgress, compProgressRef)
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
            finishProgress(setCompProgress, compProgressRef)
            setIsCompanySearching(false)
        }
    }

    return (
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
                {error && (
                    <div className="p-4 mb-4 bg-red-100 dark:bg-red-500/10 border border-red-500/20 rounded-lg text-red-600 dark:text-red-400 text-sm font-medium">
                        {error}
                    </div>
                )}
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

                {isCompanySearching && (
                    <div className="mb-8 rounded-xl overflow-hidden border border-black/10 dark:border-white/10 bg-slate-50 dark:bg-white/5 p-5">
                        <div className="flex justify-between items-center mb-3">
                            <div className="flex items-center gap-2">
                                <Loader2 className="w-4 h-4 animate-spin text-black dark:text-white" />
                                <span className="text-sm font-semibold text-black dark:text-white">
                                    {t('dashboard.searchingCompanies')}
                                </span>
                            </div>
                            <span className="text-sm font-bold text-black/60 dark:text-white/60">{Math.round(compProgress)}%</span>
                        </div>
                        <div className="w-full h-2 bg-black/10 dark:bg-white/10 rounded-full overflow-hidden">
                            <div
                                className="h-full bg-black dark:bg-white rounded-full transition-all duration-300 ease-out"
                                style={{ width: `${compProgress}%` }}
                            />
                        </div>
                        <p className="text-xs text-black/40 dark:text-white/40 mt-3">
                            {t('dashboard.searchingNote')}
                        </p>
                    </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {companies.map((comp, idx) => (
                        <div key={comp.website || `comp-${idx}`} className="p-4 rounded-xl bg-slate-50 dark:bg-white/5 border border-black/10 dark:border-white/10 flex flex-col justify-between hover:border-black/30 dark:hover:border-white/30 transition-colors">
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
    )
}
