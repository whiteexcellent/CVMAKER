'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Printer, ArrowLeft, ChevronLeft, ChevronRight, Download } from 'lucide-react'
import Link from 'next/link'
import { useTranslation } from '@/components/I18nProvider'

export default function PresentationViewer({ presentation }: { presentation: any }) {
    const [parsedContent] = useState(() => {
        try {
            return typeof presentation.content === 'string' ? JSON.parse(presentation.content) : presentation.content
        } catch {
            return {}
        }
    })
    const { t } = useTranslation()

    const [currentSlideIndex, setCurrentSlideIndex] = useState(0)
    const slides = parsedContent?.slides || []

    // We treat the Cover and Conclusion as their own slides
    const totalSlides = slides.length + 2

    const handlePrint = () => {
        window.print()
    }

    const presentonUrl = process.env.NEXT_PUBLIC_PRESENTON_URL || 'http://localhost:5000';

    return (
        <div className="min-h-screen bg-slate-100 dark:bg-zinc-950 p-4 md:p-8 font-sans flex flex-col items-center">

            {/* INVISIBLE ON PRINT */}
            <div className="w-full max-w-5xl flex flex-col sm:flex-row items-center justify-between bg-white dark:bg-black p-4 rounded-xl shadow-sm border border-black/10 dark:border-white/10 print:hidden gap-4 mb-8">
                <Button variant="ghost" asChild className="text-black dark:text-white hover:bg-black/5 dark:hover:bg-white/5 font-semibold">
                    <Link href="/dashboard"><ArrowLeft className="w-4 h-4 mr-2" /> {t('common.back')}</Link>
                </Button>

                <div className="flex items-center gap-4 text-black font-bold dark:text-white">
                    <Button
                        variant="outline"
                        size="icon"
                        onClick={() => setCurrentSlideIndex(Math.max(0, currentSlideIndex - 1))}
                        disabled={currentSlideIndex === 0}
                        className="rounded-full"
                    >
                        <ChevronLeft className="w-5 h-5" />
                    </Button>
                    <span>{currentSlideIndex + 1} / {totalSlides}</span>
                    <Button
                        variant="outline"
                        size="icon"
                        onClick={() => setCurrentSlideIndex(Math.min(totalSlides - 1, currentSlideIndex + 1))}
                        disabled={currentSlideIndex === totalSlides - 1}
                        className="rounded-full"
                    >
                        <ChevronRight className="w-5 h-5" />
                    </Button>
                </div>

                <div className="flex gap-2 w-full sm:w-auto">
                    {presentation.pptx_path && (
                        <Button asChild variant="outline" className="w-full sm:w-auto font-bold h-10 border-black/20 dark:border-white/20">
                            <a href={`${presentonUrl}${presentation.pptx_path}`} target="_blank" rel="noopener noreferrer">
                                <Download className="w-4 h-4 mr-2" /> PPTX
                            </a>
                        </Button>
                    )}
                    <Button onClick={handlePrint} className="w-full sm:w-auto bg-black hover:bg-black/80 dark:bg-white dark:hover:bg-white/90 text-white dark:text-black font-bold h-10">
                        <Printer className="w-4 h-4 mr-2" /> {t('common.exportPdf')}
                    </Button>
                </div>
            </div>

            {/* PRESENTATION SLIDES (Web preview shows 1 at a time, Print shows all stacked) */}
            <div className="w-full max-w-5xl">
                {/* SLIDE 1: TITLE (Only visible if web index is 0, or always visible in Print mode) */}
                <div className={`aspect-video w-full bg-slate-900 border-4 border-slate-800 rounded-3xl shadow-2xl flex flex-col justify-center p-12 md:p-24 
                    ${currentSlideIndex === 0 ? 'flex' : 'hidden print:flex'} print:rounded-none print:shadow-none print:border-none print:bg-white print:text-black print:page-break-after-always print:aspect-auto print:h-screen text-white relative overflow-hidden`}
                >
                    <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 print:hidden" />
                    <h1 className="text-5xl md:text-7xl font-black tracking-tighter mb-6">{parsedContent.title || t('viewer.pitchDeck')}</h1>
                    <h2 className="text-2xl md:text-3xl text-slate-400 font-light">{parsedContent.subtitle || presentation.target_company}</h2>
                    <div className="mt-auto pt-16 border-t border-slate-800 print:border-black/20">
                        <p className="font-bold tracking-widest uppercase text-sm text-slate-500 print:text-black/50">Confidential Pitch // {new Date(presentation.created_at).toLocaleDateString()}</p>
                    </div>
                </div>

                {/* SLIDES 2 to N-1: CONTENT */}
                {slides.map((slide: any, idx: number) => {
                    const slideActualIndex = idx + 1;
                    return (
                        <div key={idx} className={`aspect-video w-full bg-white dark:bg-zinc-900 border border-black/10 dark:border-white/10 rounded-3xl shadow-2xl flex flex-col p-12 md:p-16 
                            ${currentSlideIndex === slideActualIndex ? 'flex' : 'hidden print:flex'} print:rounded-none print:shadow-none print:border-none print:bg-white print:text-black print:page-break-after-always print:aspect-auto print:h-screen text-black dark:text-white relative`}
                        >
                            <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 print:hidden" />
                            <h2 className="text-4xl md:text-5xl font-black tracking-tight mb-12 border-b-2 border-black/10 dark:border-white/10 pb-6">{slide.heading}</h2>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-12 h-full">
                                <div>
                                    <h3 className="text-xl font-bold mb-6 text-black/50 dark:text-white/50 uppercase tracking-widest">{t('viewer.talkingPoints')}</h3>
                                    <ul className="space-y-4">
                                        {slide.talking_points?.map((point: string, i: number) => (
                                            <li key={i} className="flex items-start text-lg md:text-xl font-medium leading-relaxed">
                                                <span className="w-2 h-2 mt-3 mr-4 rounded-full bg-blue-500 flex-shrink-0" />
                                                {point}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                                <div className="bg-slate-50 dark:bg-black/50 p-8 rounded-2xl print:bg-slate-50 border border-black/5 dark:border-white/5">
                                    <h3 className="text-xl font-bold mb-4 text-blue-600 dark:text-blue-400">{t('viewer.whyFit')}</h3>
                                    <p className="text-lg leading-relaxed font-serif italic text-black/80 dark:text-white/80">
                                        "{slide.why_im_a_fit}"
                                    </p>
                                </div>
                            </div>
                        </div>
                    )
                })}

                {/* FINAL SLIDE: CONCLUSION */}
                <div className={`aspect-video w-full bg-slate-900 border-4 border-slate-800 rounded-3xl shadow-2xl flex flex-col justify-center items-center text-center p-12 md:p-24 
                    ${currentSlideIndex === totalSlides - 1 ? 'flex' : 'hidden print:flex'} print:rounded-none print:shadow-none print:border-none print:bg-white print:text-black print:aspect-auto print:h-screen text-white relative`}
                >
                    <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 print:hidden" />
                    <h2 className="text-4xl md:text-6xl font-black mb-8">{t('viewer.conclusion')}</h2>
                    <p className="text-2xl md:text-3xl font-light text-slate-300 max-w-3xl leading-relaxed print:text-black/80">
                        "{parsedContent.conclusion || 'Thank you for your time. I look forward to contributing to your team.'}"
                    </p>
                </div>
            </div>

            {/* Print Styles Overrides */}
            <style jsx global>{`
                @media print {
                    @page {
                        size: landscape;
                        margin: 0;
                    }
                    body * {
                        visibility: hidden;
                    }
                    .print\\:page-break-after-always {
                        page-break-after: always;
                    }
                    .print\\:flex, .print\\:flex * {
                        visibility: visible;
                    }
                    .print\\:flex {
                        position: relative;
                        left: 0;
                        top: 0;
                        margin: 0 !important;
                        padding: 15mm !important;
                        width: 100vw !important;
                        height: 100vh !important;
                        box-sizing: border-box;
                    }
                }
            `}</style>
        </div>
    )
}
