import { createClient } from '@/lib/supabase/server';
import { notFound, redirect } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import PDFExportButton from './PDFExportButton';

export default async function CVResultPage({ params }: { params: Promise<{ id: string }> }) {
    const resolvedParams = await params;
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        redirect('/login');
    }

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

    const cvData = resume.content;

    return (
        <div className="flex min-h-screen flex-col bg-muted/20 pb-20">
            <header className="border-b bg-background px-6 py-4 flex items-center justify-between sticky top-0 z-10 shadow-sm">
                <div className="flex items-center gap-4">
                    <Button variant="outline" size="sm" asChild>
                        <Link href="/dashboard">&larr; Back to Dashboard</Link>
                    </Button>
                    <h1 className="font-bold text-lg hidden sm:block">CV Preview: {resume.title}</h1>
                </div>
                <PDFExportButton cvData={cvData} userFullName={user.user_metadata?.full_name || 'Your Name'} />
            </header>

            <main className="flex-1 p-6 w-full max-w-4xl mx-auto mt-6">
                <div className="bg-white dark:bg-zinc-950 shadow-2xl ring-1 ring-gray-900/5 sm:rounded-2xl p-8 sm:p-12 mb-8">
                    {/* Simple visual rendering of the JSON data (Minimalist Template Concept) */}

                    <div className="border-b pb-6 mb-6">
                        <h1 className="text-4xl font-extrabold tracking-tight mb-4">{user.user_metadata?.full_name || 'Your Name'}</h1>
                        <p className="text-muted-foreground text-sm uppercase tracking-wider font-semibold mb-2">Professional Summary</p>
                        <p className="leading-relaxed text-foreground/90">{cvData.personalSummary}</p>
                    </div>

                    <div className="mb-8">
                        <p className="text-muted-foreground text-sm uppercase tracking-wider font-semibold mb-4 border-b pb-2">Experience</p>
                        <div className="space-y-6">
                            {cvData.experience?.map((exp: any, i: number) => (
                                <div key={i}>
                                    <div className="flex justify-between items-baseline mb-1">
                                        <h3 className="font-bold text-lg">{exp.title}</h3>
                                        <span className="text-sm font-medium text-muted-foreground">{exp.duration}</span>
                                    </div>
                                    <p className="text-primary font-medium mb-2">{exp.company}</p>
                                    <ul className="list-disc pl-5 space-y-1">
                                        {exp.bullets?.map((bullet: string, j: number) => (
                                            <li key={j} className="text-foreground/80 leading-relaxed text-sm">{bullet}</li>
                                        ))}
                                    </ul>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="mb-8">
                        <p className="text-muted-foreground text-sm uppercase tracking-wider font-semibold mb-4 border-b pb-2">Education</p>
                        <div className="space-y-4">
                            {cvData.education?.map((edu: any, i: number) => (
                                <div key={i}>
                                    <div className="flex justify-between items-baseline mb-1">
                                        <h3 className="font-bold text-lg">{edu.degree}</h3>
                                        <span className="text-sm font-medium text-muted-foreground">{edu.year}</span>
                                    </div>
                                    <p className="font-medium mb-1">{edu.institution}</p>
                                    {edu.details && <p className="text-foreground/80 text-sm leading-relaxed">{edu.details}</p>}
                                </div>
                            ))}
                        </div>
                    </div>

                    <div>
                        <p className="text-muted-foreground text-sm uppercase tracking-wider font-semibold mb-4 border-b pb-2">Skills & Competencies</p>
                        <div className="flex flex-wrap gap-2">
                            {cvData.skills?.map((skill: string, i: number) => (
                                <span key={i} className="inline-flex items-center rounded-md bg-primary/10 px-2.5 py-0.5 text-sm font-medium text-primary ring-1 ring-inset ring-primary/20">
                                    {skill}
                                </span>
                            ))}
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
