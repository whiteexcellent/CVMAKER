import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import CoverLetterWizardClient from './CoverLetterWizardClient'
import Link from 'next/link'
import { ThemeToggle } from '@/components/ThemeToggle'
import { LanguageToggle } from '@/components/LanguageToggle'
import { cookies } from 'next/headers'
import { getDictionary, resolveLocale } from '@/lib/i18n'
import { isDevAuthBypassEnabled } from '@/lib/env'

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
        <div className="flex min-h-screen flex-col bg-white dark:bg-black text-black dark:text-white">
            <header className="flex h-16 items-center border-b border-black/10 dark:border-white/10 px-6">
                <div className="flex flex-1 items-center justify-between">
                    <Link href="/dashboard" className="font-bold text-lg tracking-tight">
                        &larr; {dict.common.back}
                    </Link>
                    <div className="flex items-center gap-4">
                        <LanguageToggle />
                        <ThemeToggle />
                    </div>
                </div>
            </header>
            <main className="flex-1 p-6 lg:p-12 max-w-3xl mx-auto w-full">
                <div className="mb-8">
                    <h1 className="text-3xl font-black tracking-tight mb-2">{dict.generate.coverLetterTitle}</h1>
                    <p className="text-black/60 dark:text-white/60">{dict.generate.coverLetterDesc}</p>
                </div>
                <CoverLetterWizardClient resumes={finalResumes} />
            </main>
        </div>
    )
}
