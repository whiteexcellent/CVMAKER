import { createClient } from '@/lib/supabase/server';
import { notFound, redirect } from 'next/navigation';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import PDFExportButton from './PDFExportButton';
import CVPreviewClient from './CVPreviewClient';
import { cookies } from 'next/headers';
import { getDictionary, resolveLocale } from '@/lib/i18n';
import { createSignedPdfUrl } from '@/lib/pdf';

export default async function CVResultPage({ params }: { params: Promise<{ id: string }> }) {
    const resolvedParams = await params;
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        redirect('/login');
    }

    const cookieStore = await cookies();
    const locale = resolveLocale(cookieStore.get('NEXT_LOCALE')?.value);
    const dict = await getDictionary(locale);

    const { data: resume, error } = await supabase
        .from('resumes')
        .select('*')
        .eq('id', resolvedParams.id)
        .single();

    if (error || !resume) {
        notFound();
    }

    // Ensure user owns this resume
    if (resume.user_id !== user.id) {
        redirect('/dashboard');
    }

    const { data: profile } = await supabase.from('profiles').select('full_name').eq('id', user.id).single();
    const resolvedName = profile?.full_name || user.user_metadata?.full_name || 'Your Name';

    const signedPdfUrl = await createSignedPdfUrl(resume.pdf_path || resume.pdf_url, 600);
    let cvData = resume.content;
    if (typeof resume.content === 'string') {
        try {
            cvData = JSON.parse(resume.content);
        } catch {
            cvData = {};
        }
    }
    cvData = {
        ...cvData,
        pdfUrl: signedPdfUrl,
    };

    return (
        <div className="p-6 md:p-8 space-y-6 text-white selection:bg-emerald-500/30">
            <header className="rounded-[24px] border border-white/10 bg-[#0A0A0A] px-6 py-4 flex items-center justify-between sticky top-4 z-10 shadow-[0_10px_30px_rgba(0,0,0,0.2)]">
                <div className="flex items-center gap-4">
                    <Button variant="outline" size="sm" asChild className="border-white/15 bg-[#141414] text-white/90 hover:bg-[#1A1A1A] hover:text-white">
                        <Link href="/cv">{dict.cvDetail.backToDashboard}</Link>
                    </Button>
                    <h1 className="font-bold text-lg hidden sm:block text-white/90">{dict.cvDetail.cvPreview} {resume.title}</h1>
                </div>
                <PDFExportButton pdfUrl={signedPdfUrl} userFullName={resolvedName} />
            </header>

            <main className="w-full max-w-5xl mx-auto rounded-[24px] border border-white/10 bg-[#0A0A0A] p-4 md:p-6">
                <CVPreviewClient
                    initialCvData={cvData}
                    userName={resolvedName}
                    resumeId={resume.id}
                />
            </main>
        </div>
    );
}

