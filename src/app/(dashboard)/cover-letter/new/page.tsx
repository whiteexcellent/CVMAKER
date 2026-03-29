import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import CoverLetterWizardClient from './CoverLetterWizardClient'
import Link from 'next/link'
import { cookies } from 'next/headers'
import { getDictionary, resolveLocale } from '@/lib/i18n'
import { isDevAuthBypassEnabled } from '@/lib/env'
import { HugeiconsIcon } from "@hugeicons/react";
import { ArrowLeft01Icon, Note01Icon } from "@hugeicons/core-free-icons";

export default async function NewCoverLetterPage() {
    const supabase = await createClient()

    const { data, error } = await supabase.auth.getUser()
    const bypassAuth = isDevAuthBypassEnabled();
    if (!bypassAuth && (error || !data?.user)) {
        redirect('/login')
    }

    const cookieStore = await cookies()
    const localeCookie = cookieStore.get('NEXT_LOCALE')?.value
    const locale = resolveLocale(localeCookie)
    const dict = await getDictionary(locale)

    const { data: resumes } = await supabase
        .from('resumes')
        .select('id, title, created_at')
        .eq('user_id', data?.user?.id || '00000000-0000-0000-0000-000000000000')
        .order('created_at', { ascending: false })

    const finalResumes = bypassAuth && (!resumes || resumes.length === 0)       
        ? [{ id: '00000000-0000-0000-0000-000000000000', title: 'Test CV (Developer Mock)', created_at: new Date().toISOString() }]
        : resumes || [];

    return (
        <div className="flex flex-col h-full bg-zinc-950/50 text-white font-geist selection:bg-orange-500/30">
            {/* Workspace Header */}
            <div className="sticky top-0 z-20 flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 md:px-8 md:py-6 border-b border-white/5 bg-zinc-950/80 backdrop-blur-xl shrink-0">
                <div className="flex items-center gap-5">
                    <Link href="/cover-letter" className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-white/60 hover:text-white hover:bg-white/10 transition-colors">
                        <HugeiconsIcon icon={ArrowLeft01Icon} strokeWidth={1.5} className="w-5 h-5" />
                    </Link>
                    <div>
                        <p className="text-[12px] uppercase tracking-[0.18em] text-white/45 mb-1">Cover Letter Flow</p>
                        <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
                            <HugeiconsIcon icon={Note01Icon} className="w-6 h-6 text-orange-400" strokeWidth={1.5} />
                            {dict.generate.coverLetterTitle}
                        </h1>
                    </div>
                </div>
            </div>

            {/* Scrollable Container */}
            <div className="flex-1 overflow-y-auto p-6 md:p-8 animate-in fade-in duration-500">
                <div className="max-w-[700px] mx-auto space-y-8 mt-4">
                    <p className="text-[15px] text-white/60 font-light">
                        {dict.generate.coverLetterDesc}
                    </p>

                    <div className="rounded-[24px] border border-white/[0.08] bg-[#0A0A0A] p-6 md:p-8 shadow-[0_10px_30px_rgba(0,0,0,0.2)]">
                        <CoverLetterWizardClient resumes={finalResumes} />
                    </div>
                </div>
            </div>
        </div>
    )
}
