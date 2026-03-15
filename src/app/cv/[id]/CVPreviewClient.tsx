'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { Save, Edit2, X, Loader2, Share2, Printer, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import PDFExportButton from './PDFExportButton';

interface CVData {
    personalSummary: string;
    experience: {
        title: string;
        company: string;
        duration: string;
        bullets: string[];
    }[];
    education: {
        degree: string;
        institution: string;
        school?: string;
        year: string;
        details?: string;
    }[];
    skills: string[];
    pdfUrl?: string | null;
}

export default function CVPreviewClient({
    initialCvData,
    userName,
    resumeId
}: {
    initialCvData: CVData;
    userName: string;
    resumeId: string;
}) {
    const [isEditing, setIsEditing] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [isSharing, setIsSharing] = useState(false);

    // Safety fallback for parsed data
    const [cvData, setCvData] = useState<CVData>(() => {
        try {
            return typeof initialCvData === 'string' ? JSON.parse(initialCvData) : initialCvData;
        } catch {
            return initialCvData; // if object
        }
    });

    const handleShare = async () => {
        setIsSharing(true);
        const shareToast = toast.loading('Generating public link...');
        try {
            const res = await fetch('/api/share/enable', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ documentId: resumeId, type: 'resume' })
            });

            const data = await res.json();
            if (!res.ok) throw new Error(data.error || 'Failed to generate link');

            await navigator.clipboard.writeText(data.shareUrl);
            toast.success('Link copied to clipboard! (Active for 7 days)', { id: shareToast });
        } catch (error: any) {
            console.error('Share error:', error);
            toast.error(error.message || 'Could not generate link.', { id: shareToast });
        } finally {
            setIsSharing(false);
        }
    };

    const handleSave = async () => {
        setIsSaving(true);
        const saveToast = toast.loading('Saving changes...');

        try {
            const res = await fetch(`/api/cv/${resumeId}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ content: cvData })
            });

            if (!res.ok) {
                const errorData = await res.json();
                throw new Error(errorData.error || 'Failed to save CV');
            }

            toast.success('CV Updated Successfully!', { id: saveToast });
            setIsEditing(false);
        } catch (error: any) {
            console.error('Save error:', error);
            toast.error(error.message || 'Could not save changes.', { id: saveToast });
        } finally {
            setIsSaving(false);
        }
    };

    const handlePrint = () => {
        window.print();
    };

    const handleExperienceChange = (index: number, field: keyof CVData['experience'][0], value: any) => {
        const newExp = [...cvData.experience];
        newExp[index] = { ...newExp[index], [field]: value };
        setCvData({ ...cvData, experience: newExp });
    };

    const handleExperienceBulletChange = (expIndex: number, bulletIndex: number, value: string) => {
        const newExp = [...cvData.experience];
        newExp[expIndex].bullets[bulletIndex] = value;
        setCvData({ ...cvData, experience: newExp });
    };

    const handleEducationChange = (index: number, field: keyof CVData['education'][0], value: any) => {
        const newEdu = [...cvData.education];
        newEdu[index] = { ...newEdu[index], [field]: value };
        setCvData({ ...cvData, education: newEdu });
    };

    const handleSkillsChange = (value: string) => {
        const skillsArray = value.split(',').map(s => s.trim()).filter(s => s !== '');
        setCvData({ ...cvData, skills: skillsArray });
    };

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-zinc-950 p-4 pt-24 md:p-8 md:pt-32 font-sans relative">

            {/* Control Panel (Invisible on Print) */}
            <div className="fixed top-4 left-1/2 -translate-x-1/2 w-[calc(100%-2rem)] max-w-[210mm] z-50 flex flex-col sm:flex-row items-center justify-between p-3 rounded-2xl border border-black/10 dark:border-white/10 liquid-glass shadow-lg print:hidden gap-4 transition-all duration-300">
                <Button variant="ghost" asChild className="text-black dark:text-white hover:bg-black/5 dark:hover:bg-white/10 font-bold rounded-xl h-12 px-6">
                    <Link href="/dashboard"><ArrowLeft className="w-5 h-5 mr-2" /> Back</Link>
                </Button>

                <div className="flex flex-wrap items-center justify-end gap-2 w-full sm:w-auto">
                    {isEditing ? (
                        <>
                            <Button
                                variant="outline"
                                onClick={() => { setCvData(typeof initialCvData === 'string' ? JSON.parse(initialCvData) : initialCvData); setIsEditing(false); }}
                                disabled={isSaving}
                                className="bg-red-50 text-red-600 border-red-200 hover:bg-red-100 hover:text-red-700 dark:bg-red-950/30 dark:border-red-900/50"
                            >
                                <X className="w-4 h-4 mr-2" /> Cancel
                            </Button>
                            <Button
                                onClick={handleSave}
                                disabled={isSaving}
                                className="bg-green-600 hover:bg-green-700 text-white font-bold h-10"
                            >
                                {isSaving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
                                Save Changes
                            </Button>
                        </>
                    ) : (
                        <Button
                            onClick={() => setIsEditing(true)}
                            className="bg-black hover:bg-black/80 dark:bg-white dark:hover:bg-white/90 text-white dark:text-black font-bold h-10"
                        >
                            <Edit2 className="w-4 h-4 mr-2" /> Edit CV
                        </Button>
                    )}

                    <PDFExportButton pdfUrl={cvData.pdfUrl || null} userFullName={userName} />

                    <Button onClick={handleShare} disabled={isSharing} className="bg-blue-600 hover:bg-blue-700 text-white font-bold h-10">
                        {isSharing ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Share2 className="w-4 h-4 mr-2" />}
                        Share 7-Day Link
                    </Button>
                </div>
            </div>

            {/* A4 Premium Paper Template */}
            <div className="bg-white text-black p-10 md:p-14 shadow-2xl mx-auto w-full max-w-[210mm] min-h-[297mm] print:shadow-none print:m-0 print:p-8 font-sans">

                {/* Header */}
                <header className="border-b-[3px] border-black pb-4 mb-6">
                    <h1 className="text-4xl md:text-5xl font-black uppercase tracking-tighter text-black mb-1">{userName}</h1>
                    {isEditing ? (
                        <Input
                            className="text-sm uppercase tracking-widest font-bold border-black/20 mt-2 h-8"
                            value={cvData.experience?.[0]?.title || 'Professional Title'}
                            onChange={(e) => handleExperienceChange(0, 'title', e.target.value)}
                        />
                    ) : (
                        <p className="text-black/70 font-bold uppercase tracking-widest text-sm">
                            {(cvData.experience || [])[0]?.title || 'Professional'}
                        </p>
                    )}
                </header>

                <main className="space-y-6">
                    {/* Professional Summary */}
                    <section>
                        <h2 className="text-lg font-bold uppercase tracking-widest text-black border-b border-black/20 pb-1 mb-3">Profile</h2>
                        {isEditing ? (
                            <Textarea
                                value={cvData.personalSummary}
                                onChange={(e) => setCvData({ ...cvData, personalSummary: e.target.value })}
                                className="min-h-[100px] bg-slate-50 border-black/20 text-black text-sm"
                            />
                        ) : (
                            <p className="text-sm leading-relaxed text-black/90 text-justify">{cvData.personalSummary}</p>
                        )}
                    </section>

                    {/* Experience */}
                    <section>
                        <h2 className="text-lg font-bold uppercase tracking-widest text-black border-b border-black/20 pb-1 mb-3">Experience</h2>
                        <div className="space-y-5">
                            {(cvData.experience || []).map((exp, i) => (
                                <div key={exp.company || `exp-${i}`} className={isEditing ? "p-3 border border-dashed border-black/20 bg-slate-50 rounded" : ""}>
                                    <div className="flex justify-between items-baseline mb-1">
                                        {isEditing ? (
                                            <div className="flex gap-2 w-full">
                                                <Input value={exp.title} onChange={(e) => handleExperienceChange(i, 'title', e.target.value)} className="font-bold text-sm h-8" />
                                                <Input value={exp.company} onChange={(e) => handleExperienceChange(i, 'company', e.target.value)} className="font-semibold text-sm h-8" />
                                                <Input value={exp.duration} onChange={(e) => handleExperienceChange(i, 'duration', e.target.value)} className="text-sm h-8 w-32" />
                                            </div>
                                        ) : (
                                            <>
                                                <h3 className="font-bold text-black text-sm uppercase tracking-wide">
                                                    {exp.title} <span className="text-black/60 font-semibold normal-case">| {exp.company}</span>
                                                </h3>
                                                <span className="text-xs font-bold text-black/70 uppercase tracking-wider whitespace-nowrap">{exp.duration}</span>
                                            </>
                                        )}
                                    </div>
                                    <ul className="list-disc ml-4 space-y-1">
                                        {(exp.bullets || []).map((bullet, bIndex) => (
                                            <li key={`bullet-${bIndex}`} className="text-sm text-black/90 leading-relaxed pl-1">
                                                {isEditing ? (
                                                    <Textarea
                                                        value={bullet}
                                                        onChange={(e) => handleExperienceBulletChange(i, bIndex, e.target.value)}
                                                        className="min-h-[60px] text-sm mt-1 bg-white border-black/20"
                                                    />
                                                ) : (
                                                    bullet
                                                )}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            ))}
                        </div>
                    </section>

                    {/* Education */}
                    <section>
                        <h2 className="text-lg font-bold uppercase tracking-widest text-black border-b border-black/20 pb-1 mb-3">Education</h2>
                        <div className="space-y-4">
                            {(cvData.education || []).map((edu, i) => (
                                <div key={edu.institution || edu.school || `edu-${i}`} className={isEditing ? "p-3 border border-dashed border-black/20 bg-slate-50 rounded flex gap-2" : "flex justify-between items-baseline"}>
                                    {isEditing ? (
                                        <>
                                            <Input value={edu.degree} onChange={(e) => handleEducationChange(i, 'degree', e.target.value)} className="font-bold text-sm h-8" />
                                            <Input value={edu.institution || edu.school} onChange={(e) => handleEducationChange(i, 'institution', e.target.value)} className="text-sm h-8" />
                                            <Input value={edu.year} onChange={(e) => handleEducationChange(i, 'year', e.target.value)} className="text-sm h-8 w-24" />
                                        </>
                                    ) : (
                                        <>
                                            <div>
                                                <h3 className="font-bold text-black text-sm uppercase tracking-wide">{edu.degree}</h3>
                                                <p className="text-sm text-black/80">{edu.institution || edu.school}</p>
                                            </div>
                                            <span className="text-xs font-bold text-black/70 uppercase tracking-wider">{edu.year}</span>
                                        </>
                                    )}
                                </div>
                            ))}
                        </div>
                    </section>

                    {/* Core Skills */}
                    <section>
                        <h2 className="text-lg font-bold uppercase tracking-widest text-black border-b border-black/20 pb-1 mb-3">Core Competencies</h2>
                        {isEditing ? (
                            <Textarea
                                value={(cvData.skills || []).join(', ')}
                                onChange={(e) => handleSkillsChange(e.target.value)}
                                className="min-h-[80px] bg-slate-50 border-black/20 text-black text-sm"
                                placeholder="Comma separated skills..."
                            />
                        ) : (
                            <p className="text-sm font-semibold leading-relaxed text-black/90">
                                {(cvData.skills || []).join(' • ')}
                            </p>
                        )}
                    </section>
                </main>
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
                        padding: 10mm 15mm !important;
                        box-shadow: none !important;
                        width: 100% !important;
                    }
                }
            `}</style>
        </div>
    );
}
