"use client";
import { HugeiconsIcon } from "@hugeicons/react";
import { ArrowLeft01Icon, PrinterIcon } from "@hugeicons/core-free-icons";
import { useMemo } from 'react'
import { Button } from '@/components/ui/button'

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
        <div className="flex flex-col h-full bg-zinc-950/50 relative">
            <header className="sticky top-0 z-40 bg-zinc-950/80 backdrop-blur-xl border-b border-white/5 py-4 px-6 md:px-8 flex items-center justify-between shadow-2xl print:hidden">
                <div className="flex items-center gap-4">
                    <Link
                        href="/cover-letter"
                        className="text-zinc-400 hover:text-orange-400 bg-zinc-900/50 hover:bg-orange-500/10 p-2 lg:p-2.5 rounded-xl border border-white/5 transition-all duration-300 group"
                    >
                        <HugeiconsIcon icon={ArrowLeft01Icon} className="w-5 h-5 lg:w-6 lg:h-6 group-hover:-translate-x-1 transition-transform" strokeWidth={2} />
                    </Link>
                    <h1 className="text-xl lg:text-3xl font-extrabold tracking-tight text-white flex items-center gap-3">
                        {coverLetter.company_name || parsedContent.meta?.target_company || t('viewer.targetCompany') || "Cover Letter"}
                    </h1>
                </div>
                
                <div className="flex gap-2 w-full sm:w-auto">
                    <Button onClick={handlePrint} className="w-full sm:w-auto bg-[#141414] hover:bg-orange-500/20 hover:text-orange-400 border border-white/10 text-white font-bold h-11 lg:h-12 px-6 rounded-xl shadow-md transition-all duration-300">
                        <HugeiconsIcon icon={PrinterIcon} className="w-5 h-5 mr-0 lg:mr-2" strokeWidth={2} /> 
                        <span className="hidden lg:inline">{t('common.exportPdf')}</span>
                    </Button>
                </div>
            </header>
            
            <main className="flex-1 overflow-y-auto p-4 md:p-8 custom-scrollbar">
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

                    <div className="font-serif leading-8 text-gray-800 space-y-8 text-justify opacity-90">
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
                                parsedContent.paragraphs.map((p, i) => (
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
                    </div>
                </div>
            </div>
            </main>
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
