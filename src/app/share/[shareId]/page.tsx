import Link from 'next/link';
import { notFound } from 'next/navigation';
import { CheckCircle2, FileText, Lock } from 'lucide-react';

import { getSupabaseAdminClient } from '@/lib/supabase/admin';
import { normalizeCoverLetterContent } from '@/lib/cover-letter';
import { createSignedPdfUrl } from '@/lib/pdf';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import ViewTracker from './ViewTracker';
import PDFExportButton from '../../(dashboard)/cv/[id]/PDFExportButton';

type SharedDocument = {
    id: string;
    title?: string | null;
    content: any;
    share_expires_at?: string | null;
    pdf_path?: string | null;
    pdf_url?: string | null;
    company_name?: string | null;
    target_company?: string | null;
    created_at?: string | null;
};

export default async function SharedDocumentPage({ params }: { params: Promise<{ shareId: string }> }) {
    const { shareId } = await params;
    const supabaseAdmin = getSupabaseAdminClient();

    let docRenderData: SharedDocument | null = null;
    let docType: 'resume' | 'cover_letter' | 'presentation' | null = null;

    const { data: resumeDoc } = await supabaseAdmin
        .from('resumes')
        .select('id, title, content, share_expires_at, pdf_path, pdf_url, created_at')
        .eq('share_id', shareId)
        .eq('share_enabled', true)
        .single();

    if (resumeDoc) {
        docType = 'resume';
        docRenderData = resumeDoc as SharedDocument;
    } else {
        const { data: coverDoc } = await supabaseAdmin
            .from('cover_letters')
            .select('id, title, content, share_expires_at, company_name, created_at')
            .eq('share_id', shareId)
            .eq('share_enabled', true)
            .single();

        if (coverDoc) {
            docType = 'cover_letter';
            docRenderData = coverDoc as SharedDocument;
        } else {
            const { data: presDoc } = await supabaseAdmin
                .from('presentations')
                .select('id, title, target_company, content, share_expires_at, created_at')
                .eq('share_id', shareId)
                .eq('share_enabled', true)
                .single();

            if (presDoc) {
                docType = 'presentation';
                docRenderData = presDoc as SharedDocument;
            }
        }
    }

    if (!docRenderData || !docType) {
        notFound();
    }

    const isExpired = docRenderData.share_expires_at
        ? new Date() > new Date(docRenderData.share_expires_at)
        : true;

    if (isExpired) {
        return (
            <div className="relative flex min-h-screen flex-col overflow-hidden bg-zinc-950 font-sans text-white selection:bg-orange-500/20">
                {/* Ambient Background Glows */}
                <div className="absolute top-[-10%] left-[-10%] w-[600px] h-[600px] rounded-full bg-gradient-to-br from-[#fb923c]/20 to-transparent blur-[120px] pointer-events-none" />
                <div className="absolute bottom-0 -right-[20%] w-[800px] h-[800px] bg-gradient-to-tl from-[#fb923c]/15 to-transparent rounded-full blur-[150px] pointer-events-none" />

                <div className="relative z-10 flex w-full flex-1 items-center justify-center p-6">
                    <div className="relative w-full max-w-md group">
                        <div className="absolute -inset-[2px] rounded-[24px] z-0 blur-[20px] opacity-60 bg-[size:200%_200%] bg-gradient-to-r from-red-500/40 via-transparent to-[#fb923c]/40 pointer-events-none" />
                        
                        <div className="relative rounded-3xl border border-white/10 bg-black/60 p-10 shadow-2xl backdrop-blur-2xl z-10 text-center">
                            <div className="mb-6 flex mx-auto h-20 w-20 items-center justify-center rounded-full bg-gradient-to-tr from-red-500/20 to-[#fb923c]/20 border border-white/10">
                                <Lock className="h-10 w-10 text-[#fb923c]" />
                            </div>
                            <h1 className="text-3xl font-bold text-white mb-2 tracking-tight">Link Expired</h1>
                            <p className="text-sm text-zinc-400 mb-8">
                                The 7-day sharing period for this document has ended.
                            </p>
                            
                            <div className="bg-white/5 p-5 rounded-2xl border border-white/5 mb-8 text-left">
                                <h4 className="font-semibold text-sm flex items-center gap-2 text-white mb-2">
                                    <FileText className="w-4 h-4 text-[#fb923c]" />   
                                    Owner Access Required
                                </h4>
                                <p className="text-xs text-zinc-400 leading-relaxed">
                                    If you are the owner of this {docType === 'resume' ? 'CV' : docType === 'presentation' ? 'presentation' : 'cover letter'}, you must upgrade your account to unlock permanent links and analytics.
                                </p>
                            </div>

                            <Link href="/pricing" className="flex w-full items-center justify-center gap-2 rounded-xl bg-white px-8 py-4 font-bold text-black transition-transform hover:-translate-y-1 hover:shadow-[0_0_20px_rgba(255,255,255,0.3)] shadow-lg mb-6">
                                View Upgrade Options
                            </Link>
                            
                            <Link href="/" className="text-xs text-zinc-500 hover:text-white transition-colors">
                                Powered by OMNICV
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    const signedPdfUrl = docType === 'resume'
        ? await createSignedPdfUrl(docRenderData.pdf_path || docRenderData.pdf_url, 600)
        : null;

    const resumeContent = docType === 'resume' ? docRenderData.content : null;
    const coverLetterContent = docType === 'cover_letter' ? normalizeCoverLetterContent(docRenderData.content) : null;
    const presentationContent = docType === 'presentation'
        ? (() => {
            try {
                return typeof docRenderData.content === 'string'
                    ? JSON.parse(docRenderData.content)
                    : docRenderData.content;
            } catch {
                return {};
            }
        })()
        : null;

    return (
        <div className="relative flex min-h-screen flex-col overflow-hidden bg-zinc-950 font-sans text-white selection:bg-orange-500/20 pb-24">
            <div className="absolute top-[-10%] left-[-10%] w-[600px] h-[600px] rounded-full bg-gradient-to-br from-[#34d399]/20 to-transparent blur-[120px] pointer-events-none" />
            <div className="absolute bottom-[-10%] right-[-10%] w-[800px] h-[800px] bg-gradient-to-tl from-[#fb923c]/15 to-transparent rounded-full blur-[150px] pointer-events-none" />

            <ViewTracker shareId={shareId} />

            <div className="bg-white/5 border-b border-white/10 text-zinc-300 text-center py-3 text-sm font-medium flex items-center justify-center gap-2 backdrop-blur-md relative z-20">
                <CheckCircle2 className="w-4 h-4 text-[#4ade80]" />
                <span className="tracking-wide">Verified active document generated via <strong className="text-white">OMNICV</strong></span>
            </div>

            <main className="max-w-4xl mx-auto mt-12 p-4 relative z-10 w-full">
                {docType === 'resume' && (
                    <div className="flex justify-end mb-6">
                        <PDFExportButton
                            pdfUrl={signedPdfUrl}
                            userFullName={(resumeContent as any)?.targetRole || docRenderData.title || 'Professional Resume'}
                        />
                    </div>
                )}

                <div className="relative w-full group">
                    <div className="absolute -inset-[2px] rounded-3xl opacity-50 blur-xl transition duration-1000 group-hover:duration-200 pointer-events-none bg-gradient-to-r from-[#34d399]/30 via-transparent to-[#fb923c]/30" />
                    
                    <Card className="relative w-full rounded-[2.5rem] bg-white/95 p-6 shadow-[0_8px_40px_rgba(0,0,0,0.08)] backdrop-blur-3xl border border-black/5 sm:p-12 dark:border-white/10 dark:bg-[#0a0a0a]/95 dark:shadow-[0_8px_40px_rgba(0,0,0,0.4)] transition-all duration-300">
                        {docType === 'resume' && resumeContent && (
                        <div className="p-10 space-y-8">
                            <div className="border-b pb-6 text-center">
                                <h1 className="text-4xl font-extrabold tracking-tight mb-2 text-foreground">
                                    {(resumeContent as any).targetRole || docRenderData.title || 'Professional Resume'}
                                </h1>
                                <p className="text-muted-foreground text-lg italic max-w-2xl mx-auto">
                                    {(resumeContent as any).personalSummary}
                                </p>
                            </div>

                            <div className="grid md:grid-cols-3 gap-8">
                                <div className="space-y-8 md:col-span-1 border-r pr-6 border-muted">
                                    <section>
                                        <h2 className="font-bold text-lg border-b pb-2 mb-4 text-primary">Core Skills</h2>
                                        <div className="flex flex-wrap gap-2">
                                            {((resumeContent as any).skills || []).map((skill: string, idx: number) => (
                                                <span key={skill || `skill-${idx}`} className="bg-muted text-muted-foreground px-3 py-1 rounded-md text-sm font-medium">
                                                    {skill}
                                                </span>
                                            ))}
                                        </div>
                                    </section>
                                    <section>
                                        <h2 className="font-bold text-lg border-b pb-2 mb-4 text-primary">Education</h2>
                                        <div className="space-y-4">
                                            {((resumeContent as any).education || []).map((edu: any, idx: number) => (
                                                <div key={edu.degree || `edu-${idx}`}>
                                                    <h3 className="font-semibold text-foreground">{edu.degree}</h3>
                                                    <p className="text-sm font-medium text-primary">{edu.institution} ({edu.year})</p>
                                                    {edu.details && <p className="text-xs text-muted-foreground mt-1">{edu.details}</p>}
                                                </div>
                                            ))}
                                        </div>
                                    </section>
                                </div>

                                <div className="space-y-8 md:col-span-2">
                                    <section>
                                        <h2 className="font-bold text-xl border-b pb-2 mb-5 text-primary">Professional Experience</h2>
                                        <div className="space-y-6">
                                            {((resumeContent as any).experience || []).map((exp: any, idx: number) => (
                                                <div key={exp.company || `exp-${idx}`} className="relative pl-4 border-l-2 border-primary/20">
                                                    <div className="absolute w-2 h-2 bg-primary rounded-full -left-[5px] top-2 shadow-[0_0_8px_hsl(var(--primary))]"></div>
                                                    <h3 className="font-bold text-lg text-foreground">{exp.title}</h3>
                                                    <div className="flex justify-between items-center text-sm mb-3">
                                                        <span className="font-semibold text-primary">{exp.company}</span>
                                                        <span className="text-muted-foreground px-2 py-0.5 bg-muted rounded">{exp.duration}</span>
                                                    </div>
                                                    <ul className="list-disc ml-5 space-y-1 text-sm text-foreground/80 leading-relaxed marker:text-primary">
                                                        {(exp.bullets || []).map((bullet: string, bulletIndex: number) => (
                                                            <li key={`bullet-${bulletIndex}`}>{bullet}</li>
                                                        ))}
                                                    </ul>
                                                </div>
                                            ))}
                                        </div>
                                    </section>
                                </div>
                            </div>
                        </div>
                    )}

                    {docType === 'cover_letter' && coverLetterContent && (
                        <div className="p-12 space-y-8">
                            <h1 className="text-3xl font-bold border-b pb-6 text-foreground">
                                {docRenderData.title || `To: ${docRenderData.company_name || 'Hiring Manager'}`}
                            </h1>
                            <div className="space-y-4">
                                {coverLetterContent.subject && (
                                    <p className="font-semibold text-foreground">{coverLetterContent.subject}</p>
                                )}
                                {coverLetterContent.paragraphs.map((paragraph, index) => (
                                    <p key={`paragraph-${index}`} className="text-foreground/90 leading-loose">
                                        {paragraph}
                                    </p>
                                ))}
                            </div>
                        </div>
                    )}

                    {docType === 'presentation' && presentationContent && (
                        <div className="p-10 space-y-8">
                            <div className="border-b pb-6">
                                <h1 className="text-4xl font-extrabold tracking-tight mb-2 text-foreground">
                                    {presentationContent.title || docRenderData.title || 'Presentation'}
                                </h1>
                                <p className="text-muted-foreground text-lg">
                                    {presentationContent.subtitle || docRenderData.target_company}
                                </p>
                            </div>
                            <div className="space-y-6">
                                {(presentationContent.slides || []).map((slide: any, index: number) => (
                                    <section key={slide.heading || `slide-${index}`} className="rounded-xl border border-muted p-6 space-y-4">
                                        <h2 className="text-2xl font-bold text-foreground">{slide.heading}</h2>
                                        <ul className="list-disc ml-5 space-y-2 text-foreground/90">
                                            {(slide.talking_points || []).map((point: string, pointIndex: number) => (
                                                <li key={`point-${pointIndex}`}>{point}</li>
                                            ))}
                                        </ul>
                                        {slide.why_im_a_fit && (
                                            <p className="text-sm italic text-muted-foreground">{slide.why_im_a_fit}</p>
                                        )}
                                    </section>
                                ))}
                                {presentationContent.conclusion && (
                                    <section className="rounded-xl border border-muted p-6">
                                        <h2 className="text-xl font-bold mb-2">Conclusion</h2>
                                        <p className="text-foreground/90">{presentationContent.conclusion}</p>
                                    </section>
                                )}
                            </div>
                        </div>
                    )}
                </Card>
                </div>
            </main>
        </div>
    );
}
