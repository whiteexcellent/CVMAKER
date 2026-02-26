'use client'

import { useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Loader2, MonitorPlay } from 'lucide-react'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useTranslation } from '@/components/I18nProvider'

interface Props {
    resumes: any[]
}

export default function PresentationWizardClient({ resumes }: Props) {
    const [resumeId, setResumeId] = useState('')
    const [targetRole, setTargetRole] = useState('')
    const [targetCompany, setTargetCompany] = useState('')
    const [jobDescription, setJobDescription] = useState('')
    const [isLoading, setIsLoading] = useState(false)
    const router = useRouter()
    const { t, locale } = useTranslation()

    const languageMap: Record<string, string> = {
        en: 'English',
        tr: 'Turkish',
        de: 'German',
        ar: 'Arabic',
        ru: 'Russian'
    }

    const handleGenerate = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!resumeId || !targetRole || !targetCompany) {
            toast.error('Please select a CV, enter a target role, and target company.')
            return
        }

        setIsLoading(true)
        try {
            const res = await fetch('/api/presentation/generate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    resumeId,
                    targetRole,
                    targetCompany,
                    jobDescription,
                    language: languageMap[locale] || 'English'
                })
            })
            const data = await res.json()
            if (!res.ok) throw new Error(data.error || 'Failed to generate')

            toast.success('Presentation Generated!')
            router.push(`/presentation/${data.presentationId}`)
        } catch (err: any) {
            toast.error(err.message)
        } finally {
            setIsLoading(false)
        }
    }

    if (resumes.length === 0) {
        return (
            <Card className="bg-white dark:bg-black border-black/10 dark:border-white/10 text-center p-8">
                <h3 className="text-xl font-bold mb-2">{t('generate.missingCv')}</h3>
                <Button asChild className="bg-black text-white dark:bg-white dark:text-black font-bold mt-6">
                    <Link href="/dashboard">&larr; {t('common.back')}</Link>
                </Button>
            </Card>
        )
    }

    return (
        <form onSubmit={handleGenerate} className="space-y-6">
            <Card className="bg-white dark:bg-black border-black/10 dark:border-white/10 shadow-sm">
                <CardContent className="pt-6 space-y-6">
                    <div className="space-y-2">
                        <Label>{t('generate.selectCv')}</Label>
                        <Select value={resumeId} onValueChange={setResumeId}>
                            <SelectTrigger className="w-full bg-transparent border-black/20 dark:border-white/20 text-black dark:text-white h-11">
                                <SelectValue placeholder="Select CV..." />
                            </SelectTrigger>
                            <SelectContent>
                                {resumes.map(r => (
                                    <SelectItem key={r.id} value={r.id}>
                                        {r.title} ({new Date(r.created_at).toLocaleDateString()})
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="space-y-2">
                        <Label>{t('wizard.targetRole')} *</Label>
                        <Input
                            required
                            placeholder="e.g. Senior Frontend Engineer"
                            value={targetRole}
                            onChange={e => setTargetRole(e.target.value)}
                            className="bg-transparent border-black/20 dark:border-white/20 h-11 text-black dark:text-white"
                        />
                    </div>

                    <div className="space-y-2">
                        <Label>{t('generate.targetCompany')} *</Label>
                        <Input
                            required
                            placeholder={t('generate.targetCompanyPlaceholder')}
                            value={targetCompany}
                            onChange={e => setTargetCompany(e.target.value)}
                            className="bg-transparent border-black/20 dark:border-white/20 h-11 text-black dark:text-white"
                        />
                    </div>

                    <div className="space-y-2">
                        <Label>{t('generate.jobDesc')}</Label>
                        <Textarea
                            placeholder={t('generate.jobDescPlaceholder')}
                            value={jobDescription}
                            onChange={e => setJobDescription(e.target.value)}
                            className="h-32 bg-transparent border-black/20 dark:border-white/20 text-black dark:text-white resize-none"
                        />
                    </div>
                </CardContent>
            </Card>

            <Button type="submit" disabled={isLoading} className="w-full bg-black hover:bg-black/80 dark:bg-white dark:hover:bg-white/90 text-white dark:text-black font-bold h-12 text-lg transition-transform active:scale-[0.98]">
                {isLoading ? <Loader2 className="w-5 h-5 mr-2 animate-spin" /> : <MonitorPlay className="w-5 h-5 mr-2" />}
                {isLoading ? t('generate.generating') : `${t('generate.createPresentation')} (1 Credit)`}
            </Button>
        </form>
    )
}
