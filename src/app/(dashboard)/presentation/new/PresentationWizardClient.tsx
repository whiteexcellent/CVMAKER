"use client";
import { HugeiconsIcon } from "@hugeicons/react";
import { Loading03Icon, ComputerIcon, Tv01Icon } from "@hugeicons/core-free-icons";       
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

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
        ru: 'Russian',
        fr: 'French'
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
            if (!res.ok) throw new Error(data.error || 'Failed to generate presentation')

            toast.success(t('generate.presentationReady'))
            router.push(`/presentation/${data.id}`);
        } catch (error: any) {
            toast.error(error.message)
            setIsLoading(false)
        }
    }

    if (resumes.length === 0) {
        return (
            <div className="text-center py-10">
                <div className="mx-auto w-16 h-16 rounded-full bg-white/5 border border-white/10 flex items-center justify-center mb-6">
                    <HugeiconsIcon icon={Tv01Icon} className="w-8 h-8 text-white/40" strokeWidth={1.5} />
                </div>
                <h3 className="text-xl font-bold mb-2 text-white">{t('generate.missingCv')}</h3>
                <p className="text-white/50 mb-8 max-w-sm mx-auto">You need to have at least one resume created in your library before generating a presentation.</p>
                <Link href="/cv/new" className="inline-flex items-center justify-center rounded-[14px] bg-cyan-500 text-white px-6 py-3 text-sm font-medium hover:bg-cyan-600 transition-colors shadow-[0_0_15px_rgba(6,182,212,0.3)]">
                    Create a Resume First
                </Link>
            </div>
        )
    }

    return (
        <form onSubmit={handleGenerate} className="space-y-6">
            <div className="space-y-6">
                <div className="space-y-2">
                    <Label className="text-white/80 font-medium">{t('generate.selectCv')} <span className="text-cyan-400">*</span></Label>
                    <Select value={resumeId} onValueChange={setResumeId}>
                        <SelectTrigger className="w-full bg-[#141414] border-white/10 text-white h-12 rounded-[14px] hover:border-white/20 transition-colors focus:ring-cyan-500/50">
                            <SelectValue placeholder="Select CV..." />
                        </SelectTrigger>
                        <SelectContent className="bg-[#141414] border-white/10 text-white rounded-[14px]">
                            {resumes.map(r => (
                                <SelectItem key={r.id} value={r.id} className="focus:bg-white/10 focus:text-white rounded-[10px] cursor-pointer">
                                    {r.title} <span className="text-white/40 ml-2">({new Date(r.created_at).toLocaleDateString()})</span>
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                        <Label className="text-white/80 font-medium">{t('generate.targetRole')} <span className="text-cyan-400">*</span></Label>
                        <Input
                            placeholder="e.g. Sales Manager"
                            value={targetRole}
                            onChange={e => setTargetRole(e.target.value)}
                            required
                            className="bg-[#141414] border-white/10 text-white h-12 rounded-[14px] hover:border-white/20 transition-colors focus-visible:ring-cyan-500/50 placeholder:text-white/30"
                        />
                    </div>
                    <div className="space-y-2">
                        <Label className="text-white/80 font-medium">{t('generate.targetCompany')} <span className="text-cyan-400">*</span></Label>
                        <Input
                            placeholder="e.g. Microsoft"
                            value={targetCompany}
                            onChange={e => setTargetCompany(e.target.value)}
                            required
                            className="bg-[#141414] border-white/10 text-white h-12 rounded-[14px] hover:border-white/20 transition-colors focus-visible:ring-cyan-500/50 placeholder:text-white/30"
                        />
                    </div>
                </div>

                <div className="space-y-2 pt-2">
                    <Label className="text-white/80 font-medium flex items-center justify-between">
                        {t('generate.jobDescription')}
                        <span className="text-white/30 text-xs font-normal">Optional</span>
                    </Label>
                    <Textarea
                        placeholder={t('generate.jobDescriptionPlaceholder')}
                        value={jobDescription}
                        onChange={e => setJobDescription(e.target.value)}
                        rows={6}
                        className="bg-[#141414] border-white/10 text-white rounded-[16px] hover:border-white/20 transition-colors focus-visible:ring-cyan-500/50 placeholder:text-white/30 resize-none p-4"
                    />
                </div>

                <div className="pt-4 border-t border-white/10 flex justify-end">
                    <Button 
                        type="submit" 
                        disabled={isLoading} 
                        className="bg-cyan-500 hover:bg-cyan-600 text-white rounded-[14px] px-8 h-12 text-[15px] font-semibold transition-all shadow-[0_4px_14px_rgba(6,182,212,0.25)] disabled:opacity-50 disabled:shadow-none min-w-[200px]"
                    >
                        {isLoading ? <HugeiconsIcon icon={Loading03Icon} className="w-5 h-5 mr-2 animate-spin" strokeWidth={1.5} /> : <HugeiconsIcon icon={ComputerIcon} className="w-5 h-5 mr-2" strokeWidth={1.5} />}
                        {isLoading ? t('common.generating') : t('generate.button')}
                    </Button>
                </div>
            </div>
        </form>
    )
}
