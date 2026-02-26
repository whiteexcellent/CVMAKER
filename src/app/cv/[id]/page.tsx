import { createClient } from '@/lib/supabase/server';
import { notFound, redirect } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import PDFExportButton from './PDFExportButton';
import CVPreviewClient from './CVPreviewClient';
import { cookies } from 'next/headers';
import { getDictionary, resolveLocale } from '@/lib/i18n';

export default async function CVResultPage({ params }: { params: Promise<{ id: string }> }) {
    const resolvedParams = await params;
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        redirect('/login');
    }

    const cookieStore = await cookies();
    const locale = resolveLocale(cookieStore.get('locale')?.value);
    const dict = getDictionary(locale);

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

    const cvData = resume.content;

    return (
        <div className="flex min-h-screen flex-col bg-black/5 dark:bg-white/5 pb-20 selection:bg-black/10 dark:selection:bg-white/20">
            <header className="border-b bg-background px-6 py-4 flex items-center justify-between sticky top-0 z-10 shadow-sm">
                <div className="flex items-center gap-4">
                    <Button variant="outline" size="sm" asChild>
                        <Link href="/dashboard">{dict.cvDetail.backToDashboard}</Link>
                    </Button>
                    <h1 className="font-bold text-lg hidden sm:block">{dict.cvDetail.cvPreview} {resume.title}</h1>
                </div>
                <PDFExportButton pdfUrl={resume.pdf_url} userFullName={resolvedName} />
            </header>

            <main className="flex-1 p-6 w-full max-w-4xl mx-auto mt-6">
                <CVPreviewClient
                    initialCvData={cvData}
                    userName={resolvedName}
                    resumeId={resume.id}
                />
            </main>
        </div>
    );
}

