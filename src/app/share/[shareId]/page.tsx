import { notFound } from 'next/navigation';
import { createClient } from '@supabase/supabase-js';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Lock, FileText, CheckCircle2 } from 'lucide-react';
import ViewTracker from './ViewTracker';
import PDFExportButton from '../../cv/[id]/PDFExportButton';

// Sanitize HTML to prevent XSS on public-facing pages
function sanitizeHtml(html: string): string {
    if (!html) return '';
    return html
        .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
        .replace(/on\w+="[^"]*"/gi, '')
        .replace(/on\w+='[^']*'/gi, '')
        .replace(/javascript:/gi, '')
        .replace(/data:/gi, 'blocked:');
}

// Shared Viewer Page (Public)
export default async function SharedDocumentPage({ params }: { params: Promise<{ shareId: string }> }) {
    const resolvedParams = await params;
    const shareId = resolvedParams.shareId;

    // Must use Admin Client to read shared documents, since public viewers are entirely unauthenticated (anon)
    const supabaseAdmin = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    let docRenderData: any = null;
    let docType: 'resume' | 'cover_letter' | 'presentation' | null = null;
    let isExpired = false;

    // 1. Try Resumes
    const { data: resumeDoc } = await supabaseAdmin
        .from('resumes')
        .select('*')
        .eq('share_id', shareId)
        .eq('share_enabled', true)
        .single();

    if (resumeDoc) {
        docType = 'resume';
        docRenderData = resumeDoc;
        const expiryDate = new Date(resumeDoc.share_expires_at);
        if (new Date() > expiryDate) isExpired = true;
    } else {
        // 2. Try Cover Letters
        const { data: coverDoc } = await supabaseAdmin
            .from('cover_letters')
            .select('*')
            .eq('share_id', shareId)
            .eq('share_enabled', true)
            .single();

        if (coverDoc) {
            docType = 'cover_letter';
            docRenderData = coverDoc;
            const expiryDate = new Date(coverDoc.share_expires_at);
            if (new Date() > expiryDate) isExpired = true;
        } else {
            // 3. Try Presentations
            const { data: presDoc } = await supabaseAdmin
                .from('presentations')
                .select('*')
                .eq('share_id', shareId)
                .eq('share_enabled', true)
                .single();

            if (presDoc) {
                docType = 'presentation';
                docRenderData = presDoc;
                const expiryDate = new Date(presDoc.share_expires_at);
                if (new Date() > expiryDate) isExpired = true;
            }
        }
    }

    if (!docRenderData) {
        notFound();
    }

    // -- BLOCKED VIEW: EXPIRED / PAYWALL --
    if (isExpired) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-muted/30 p-4">
                <Card className="max-w-md w-full shadow-2xl border-primary/20 bg-background/60 backdrop-blur-xl">
                    <CardHeader className="text-center space-y-4">
                        <div className="mx-auto w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                            <Lock className="w-8 h-8 text-primary" />
                        </div>
                        <CardTitle className="text-2xl">Link Expired</CardTitle>
                        <CardDescription className="text-base">
                            The 7-day free sharing period for this document has ended.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6 pt-2">
                        <div className="bg-muted p-4 rounded-lg space-y-3">
                            <h4 className="font-semibold text-sm flex items-center gap-2">
                                <FileText className="w-4 h-4 text-primary" />
                                Owner Access Required
                            </h4>
                            <p className="text-sm text-muted-foreground leading-relaxed">
                                If you are the owner of this {docType === 'resume' ? 'CV' : docType === 'presentation' ? 'Presentation' : 'Motivation Letter'}, you must upgrade your account to Premium to unlock permanent web links and advanced analytics.
                            </p>
                        </div>
                        <Button className="w-full text-md font-semibold h-12" asChild>
                            <Link href="/pricing">View Upgrade Options</Link>
                        </Button>
                        <div className="text-center">
                            <Link href="/" className="text-xs text-muted-foreground hover:text-primary transition-colors">
                                Powered by OmniCV Maker
                            </Link>
                        </div>
                    </CardContent>
                </Card>
            </div>
        );
    }

    // -- OPEN VIEW: ACTIVE DOCUMENT --
    // Render either the structured CV JSON or the Cover Letter HTML
    return (
        <div className="min-h-screen bg-muted/20 pb-24">
            {/* View Analytics Tracker (Silent) */}
            <ViewTracker shareId={shareId} />

            <div className="bg-primary text-primary-foreground text-center py-2 text-sm font-medium flex items-center justify-center gap-2">
                <CheckCircle2 className="w-4 h-4" />
                Verified active document generated via OmniCV
            </div>

            <main className="max-w-4xl mx-auto mt-8 p-4">
                {docType === 'resume' && (
                    <div className="flex justify-end mb-4">
                        <PDFExportButton pdfUrl={docRenderData.pdf_url} userFullName={(docRenderData.content as any).targetRole || docRenderData.title || 'Professional Resume'} />
                    </div>
                )}
                <Card className="w-full bg-background shadow-xl rounded-xl overflow-hidden border-muted">
                    {docType === 'resume' ? (
                        <div className="p-10 space-y-8">
                            <div className="border-b pb-6 text-center">
                                <h1 className="text-4xl font-extrabold tracking-tight mb-2 text-foreground">
                                    {(docRenderData.content as any).targetRole || docRenderData.title || 'Professional Resume'}
                                </h1>
                                <p className="text-muted-foreground text-lg italic max-w-2xl mx-auto">
                                    {(docRenderData.content as any).personalSummary}
                                </p>
                            </div>

                            <div className="grid md:grid-cols-3 gap-8">
                                {/* Sidebar (Skills/Education) */}
                                <div className="space-y-8 md:col-span-1 border-r pr-6 border-muted">
                                    <section>
                                        <h2 className="font-bold text-lg border-b pb-2 mb-4 text-primary">Core Skills</h2>
                                        <div className="flex flex-wrap gap-2">
                                            {((docRenderData.content as any).skills || []).map((skill: string, idx: number) => (
                                                <span key={idx} className="bg-muted text-muted-foreground px-3 py-1 rounded-md text-sm font-medium">
                                                    {skill}
                                                </span>
                                            ))}
                                        </div>
                                    </section>
                                    <section>
                                        <h2 className="font-bold text-lg border-b pb-2 mb-4 text-primary">Education</h2>
                                        <div className="space-y-4">
                                            {((docRenderData.content as any).education || []).map((edu: any, idx: number) => (
                                                <div key={idx}>
                                                    <h3 className="font-semibold text-foreground">{edu.degree}</h3>
                                                    <p className="text-sm font-medium text-primary">{edu.institution} ({edu.year})</p>
                                                    {edu.details && <p className="text-xs text-muted-foreground mt-1">{edu.details}</p>}
                                                </div>
                                            ))}
                                        </div>
                                    </section>
                                </div>

                                {/* Main Body (Experience/Projects) */}
                                <div className="space-y-8 md:col-span-2">
                                    <section>
                                        <h2 className="font-bold text-xl border-b pb-2 mb-5 text-primary">Professional Experience</h2>
                                        <div className="space-y-6">
                                            {((docRenderData.content as any).experience || []).map((exp: any, idx: number) => (
                                                <div key={idx} className="relative pl-4 border-l-2 border-primary/20">
                                                    <div className="absolute w-2 h-2 bg-primary rounded-full -left-[5px] top-2 shadow-[0_0_8px_hsl(var(--primary))]"></div>
                                                    <h3 className="font-bold text-lg text-foreground">{exp.title}</h3>
                                                    <div className="flex justify-between items-center text-sm mb-3">
                                                        <span className="font-semibold text-primary">{exp.company}</span>
                                                        <span className="text-muted-foreground px-2 py-0.5 bg-muted rounded">{exp.duration}</span>
                                                    </div>
                                                    <ul className="list-disc ml-5 space-y-1 text-sm text-foreground/80 leading-relaxed marker:text-primary">
                                                        {(exp.bullets || []).map((bullet: string, bldx: number) => (
                                                            <li key={bldx}>{bullet}</li>
                                                        ))}
                                                    </ul>
                                                </div>
                                            ))}
                                        </div>
                                    </section>
                                </div>
                            </div>
                        </div>
                    ) : (
                        // Render Cover Letter HTML safely
                        <div className="p-12">
                            <h1 className="text-3xl font-bold border-b pb-6 mb-8 text-foreground">
                                {docRenderData.title || `To: ${(docRenderData.company_name) || 'Hiring Manager'}`}
                            </h1>
                            <div
                                className="prose prose-sm sm:prose-base dark:prose-invert max-w-none text-foreground leading-loose"
                                dangerouslySetInnerHTML={{ __html: sanitizeHtml(docRenderData.content) }}
                            />
                        </div>
                    )}
                </Card>
            </main>
        </div>
    );
}
