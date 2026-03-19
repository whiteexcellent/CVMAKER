'use client'

import { useMemo } from 'react'
import { Button } from '@/components/ui/button'
import { Printer, ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import { useTranslation } from '@/components/I18nProvider'
import { normalizeCoverLetterContent } from '@/lib/cover-letter'

export default function CoverLetterViewer({ coverLetter }: { coverLetter: any }) {
    const parsedContent = useMemo(() => normalizeCoverLetterContent(coverLetter.content), [coverLetter.content])
    const { t } = useTranslation()

    const handlePrint = () => {
        window.print()
    }

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-zinc-950 p-4 pt-24 md:p-8 md:pt-32 font-sans relative">
            {/* FLOATING ACTION BAR */}
            <div className="fixed top-4 left-1/2 -translate-x-1/2 w-[calc(100%-2rem)] max-w-4xl z-50 flex flex-col sm:flex-row items-center justify-between p-3 rounded-2xl border border-black/10 dark:border-white/10 liquid-glass shadow-lg print:hidden gap-4 transition-all duration-300">
                <Button variant="ghost" asChild className="text-black dark:text-white hover:bg-black/5 dark:hover:bg-white/10 font-bold rounded-xl h-12 px-6">
                    <Link href="/dashboard"><ArrowLeft className="w-5 h-5 mr-2" /> {t('common.back')}</Link>
                </Button>
                <div className="flex gap-2 w-full sm:w-auto">
                    <Button onClick={handlePrint} className="w-full sm:w-auto bg-black hover:bg-black/80 dark:bg-white dark:hover:bg-white/90 text-white dark:text-black font-bold h-12 px-8 rounded-xl shadow-md hover:shadow-xl transition-all duration-300 hover:-translate-y-0.5">
                        <Printer className="w-5 h-5 mr-2" /> {t('common.exportPdf')}
                    </Button>
                </div>
            </div>

            <div className="max-w-4xl mx-auto flex flex-col gap-6">

                {/* A4 PAPER TEMPLATE */}
                <div className="bg-white text-black p-10 md:p-16 shadow-2xl mx-auto w-full max-w-[210mm] min-h-[297mm] rounded-sm print:shadow-none print:m-0 print:p-0">
                    <header className="mb-12 border-b-2 border-black/10 pb-6">
                        <h1 className="text-4xl font-serif font-extrabold tracking-tight text-gray-900 uppercase">
                            {parsedContent.sender_name || t('viewer.senderName')}
                        </h1>
                        <p className="text-gray-600 font-sans mt-2 font-medium tracking-wide">
                            {parsedContent.sender_contact || 'contact@example.com'}
                        </p>
                    </header>

                    <main className="font-serif leading-8 text-gray-800 space-y-8 text-justify opacity-90">
                        <div className="flex justify-between items-start font-sans text-sm">
                            <div className="space-y-1 text-gray-700">
                                <p className="font-bold text-black">{parsedContent.recipient_name || t('viewer.hiringManager')}</p>
                                <p className="font-bold">{coverLetter.company_name || parsedContent.meta?.target_company || t('viewer.targetCompany')}</p>
                            </div>
                            <p className="text-gray-500 font-medium">{parsedContent.date || new Date().toLocaleDateString()}</p>
                        </div>

                        {parsedContent.subject && (
                            <p className="font-sans font-bold text-black border-l-4 border-black pl-4">
                                {t('viewer.subject')}: {parsedContent.subject}
                            </p>
                        )}

                        <div className="space-y-6">
                            {parsedContent.paragraphs?.length > 0 ? (
                                parsedContent.paragraphs.map((p: string, i: number) => (
                                    <p key={`para-${i}`}>{p}</p>
                                ))
                            ) : (
                                <div className="space-y-4 py-4 animate-pulse">
                                    <div className="h-4 bg-black/10 dark:bg-black/20 rounded-full w-full"></div>
                                    <div className="h-4 bg-black/10 dark:bg-black/20 rounded-full w-[95%]"></div>
                                    <div className="h-4 bg-black/10 dark:bg-black/20 rounded-full w-[98%]"></div>
                                    <div className="h-4 bg-black/10 dark:bg-black/20 rounded-full w-[90%]"></div>
                                    <div className="h-4 bg-black/10 dark:bg-black/20 rounded-full w-3/4"></div>
                                </div>
                            )}
                        </div>

                        <div className="pt-12 font-sans">
                            <p className="text-gray-600">{t('viewer.sincerely')}</p>
                            <p className="mt-8 text-xl font-bold font-serif text-black">{parsedContent.sender_name}</p>
                        </div>
                    </main>
                </div>
            </div>

            {/* Print Styles Overrides */}
            <style jsx global>{`
                @media print {
                    body * {
                        visibility: hidden;
                    }
                    .print\\:shadow-none, .print\\:shadow-none * {
                        visibility: visible;
                    }
                    .print\\:shadow-none {
                        position: absolute;
                        left: 0;
                        top: 0;
                        margin: 0 !important;
                        padding: 20mm !important;
                        box-shadow: none !important;
                        width: 100% !important;
                    }
                }
            `}</style>
        </div>
    )
}
