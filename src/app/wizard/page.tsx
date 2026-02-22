'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import { Linkedin, Loader2, Sparkles, Briefcase, ArrowRight, ArrowLeft, Bot } from 'lucide-react';

export default function WizardPage() {
    const router = useRouter();
    const [step, setStep] = useState(1);
    const [isGenerating, setIsGenerating] = useState(false);
    const totalSteps = 4;

    const [formData, setFormData] = useState({
        profileType: '',
        targetRole: '',
        education: '',
        experience: '',
        skills: '',
        jobDescription: ''
    });

    const [linkedinUrl, setLinkedinUrl] = useState('');
    const [isImporting, setIsImporting] = useState(false);
    const [jobUrl, setJobUrl] = useState('');
    const [isScrapingJob, setIsScrapingJob] = useState(false);

    const handleLinkedinImport = async () => {
        if (!linkedinUrl || !linkedinUrl.includes('linkedin.com/in/')) {
            toast.error('Please enter a valid LinkedIn profile URL');
            return;
        }

        setIsImporting(true);
        const importToast = toast.loading('Initializing Agent... This may take up to 20 seconds.', {
            duration: 30000
        });

        try {
            const res = await fetch('/api/cv/import-linkedin', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ linkedinUrl })
            });

            const data = await res.json();
            if (!res.ok) throw new Error(data.error || 'Failed to import LinkedIn profile');

            setFormData(prev => ({
                ...prev,
                experience: data.experience || prev.experience,
                education: data.education || prev.education,
                skills: data.skills || prev.skills,
                targetRole: data.targetRole || prev.targetRole,
                profileType: prev.profileType || 'experienced'
            }));

            toast.success('Successfully imported! (1 Credit used)', { id: importToast });
            setLinkedinUrl('');
            setStep(2);
        } catch (error: any) {
            console.error('Import failed:', error);
            toast.error(error.message || 'Import failed. Please try again later.', { id: importToast });
        } finally {
            setIsImporting(false);
        }
    };

    const handleJobScrape = async () => {
        if (!jobUrl || (!jobUrl.includes('indeed.com') && !jobUrl.includes('glassdoor.com') && !jobUrl.includes('linkedin.com/jobs'))) {
            toast.error('Please enter a valid Indeed, Glassdoor or LinkedIn Jobs URL');
            return;
        }

        setIsScrapingJob(true);
        const scrapeToast = toast.loading('Extracting job requirements... This may take up to 20 seconds.', {
            duration: 30000
        });

        try {
            const res = await fetch('/api/cv/scrape-job', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ jobUrl })
            });

            const data = await res.json();
            if (!res.ok) throw new Error(data.error || 'Failed to scrape job details');

            setFormData(prev => ({
                ...prev,
                targetRole: data.jobTitle || prev.targetRole,
                jobDescription: data.jobDescription
            }));

            toast.success(`Job imported: ${data.jobTitle} at ${data.companyName} (2 Credits used)`, { id: scrapeToast });
            setJobUrl('');
        } catch (error: any) {
            console.error('Scrape failed:', error);
            toast.error(error.message || 'Scrape failed. Please try again later.', { id: scrapeToast });
        } finally {
            setIsScrapingJob(false);
        }
    };

    const progressPercentage = ((step - 1) / totalSteps) * 100;
    const handleNext = () => setStep((s) => Math.min(s + 1, totalSteps));
    const handlePrev = () => setStep((s) => Math.max(s - 1, 1));

    const handleSubmit = async () => {
        setIsGenerating(true);
        const loadingToastId = toast.loading('Initializing Claude 3.5 Sonnet Engine...');

        try {
            const response = await fetch('/api/generate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });

            const result = await response.json();
            if (!response.ok) throw new Error(result.error || 'Failed to generate CV');

            toast.success('CV Generated Successfully!', { id: loadingToastId });
            router.push(`/cv/${result.resumeId}`);
        } catch (err: any) {
            console.error(err);
            toast.error(err.message || 'An error occurred during generation.', { id: loadingToastId });
        } finally {
            setIsGenerating(false);
        }
    }

    return (
        <div className="flex min-h-screen flex-col bg-slate-950 font-sans selection:bg-cyan-500/30 selection:text-cyan-200">
            <header className="border-b border-white/10 bg-slate-950/50 backdrop-blur-xl px-6 py-4 flex items-center justify-between sticky top-0 z-50">
                <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-cyan-400 flex items-center justify-center shadow-lg shadow-cyan-500/20">
                        <Sparkles className="w-4 h-4 text-slate-950" />
                    </div>
                    <h1 className="font-bold text-lg text-white tracking-tight font-display">OmniCV Builder</h1>
                </div>
                <div className="text-sm font-medium text-cyan-400 bg-cyan-400/10 px-3 py-1 rounded-full border border-cyan-400/20">
                    Step {step} of {totalSteps}
                </div>
            </header>

            <Progress value={progressPercentage} className="h-1 w-full rounded-none bg-slate-900 [&>div]:bg-gradient-to-r [&>div]:from-blue-500 [&>div]:to-cyan-400" />

            <main className="flex-1 flex flex-col items-center py-12 px-4 w-full relative overflow-hidden">
                {/* Background glow effects */}
                <div className="absolute top-1/4 -right-64 w-96 h-96 bg-blue-600/10 rounded-full blur-[100px] pointer-events-none" />
                <div className="absolute top-1/2 -left-64 w-96 h-96 bg-cyan-600/10 rounded-full blur-[100px] pointer-events-none" />
                <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-emerald-600/10 rounded-full blur-[100px] pointer-events-none" />

                <div className="w-full max-w-3xl relative z-10">
                    <Card className="w-full bg-white/5 backdrop-blur-2xl border-white/10 shadow-2xl rounded-2xl overflow-hidden">

                        {step === 1 && (
                            <>
                                <CardHeader className="pt-8 pb-4">
                                    <CardTitle className="text-3xl font-display font-light text-white tracking-tight">Set your trajectory</CardTitle>
                                    <CardDescription className="text-white/60 text-base mt-2">
                                        Provide the core context so the AI can begin structuring your narrative.
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-8 px-8 pb-8">
                                    {/* LinkedIn Pro Feature */}
                                    <div className="p-5 bg-blue-950/30 border border-blue-500/30 rounded-xl relative overflow-hidden group transition-all hover:bg-blue-900/40">
                                        <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                                        <div className="relative z-10 pl-2">
                                            <div className="flex items-start gap-4">
                                                <div className="p-2.5 bg-blue-500/20 rounded-lg text-blue-400 shadow-inner border border-blue-400/20">
                                                    <Linkedin className="h-6 w-6" />
                                                </div>
                                                <div className="flex-1">
                                                    <h3 className="font-semibold text-white flex items-center gap-2">
                                                        Auto-fill with LinkedIn
                                                        <span className="text-[10px] bg-cyan-400/20 text-cyan-300 px-2 py-0.5 rounded-full font-bold uppercase tracking-wider flex items-center gap-1 border border-cyan-400/30">
                                                            <Sparkles className="h-3 w-3" /> 1 Credit
                                                        </span>
                                                    </h3>
                                                    <p className="text-sm text-white/60 mt-1 mb-3">Paste your profile link to extract your complete professional timeline instantly.</p>
                                                    <div className="flex flex-col sm:flex-row gap-2">
                                                        <Input
                                                            placeholder="https://linkedin.com/in/username"
                                                            className="bg-black/40 border-white/10 text-white placeholder:text-white/30 focus-visible:ring-blue-500"
                                                            value={linkedinUrl}
                                                            onChange={(e) => setLinkedinUrl(e.target.value)}
                                                            disabled={isImporting}
                                                        />
                                                        <Button
                                                            onClick={handleLinkedinImport}
                                                            disabled={isImporting || !linkedinUrl.trim()}
                                                            className="bg-blue-600 hover:bg-blue-500 text-white border-0 sm:w-32"
                                                        >
                                                            {isImporting ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Run Agent'}
                                                        </Button>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="relative">
                                        <div className="absolute inset-0 flex items-center">
                                            <span className="w-full border-t border-white/10" />
                                        </div>
                                        <div className="relative flex justify-center text-xs uppercase font-medium">
                                            <span className="bg-[#0b1120] px-4 text-white/50 rounded-full">Manual Entry Options</span>
                                        </div>
                                    </div>

                                    <div className="space-y-6">
                                        <div className="space-y-3">
                                            <Label htmlFor="profileType" className="text-white/80">I am a...</Label>
                                            <Select onValueChange={(val) => setFormData({ ...formData, profileType: val })} defaultValue={formData.profileType}>
                                                <SelectTrigger id="profileType" className="bg-black/20 border-white/10 text-white focus:ring-cyan-500 h-11">
                                                    <SelectValue placeholder="Select your current status" />
                                                </SelectTrigger>
                                                <SelectContent className="bg-slate-900 border-white/10 text-white">
                                                    <SelectItem value="student" className="focus:bg-cyan-500/20 focus:text-cyan-100">Student / Fresh Graduate</SelectItem>
                                                    <SelectItem value="experienced" className="focus:bg-cyan-500/20 focus:text-cyan-100">Experienced Professional</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                        <div className="space-y-3">
                                            <Label htmlFor="targetRole" className="text-white/80">Target Job Title</Label>
                                            <Input
                                                id="targetRole"
                                                placeholder="e.g. Senior Frontend Engineer"
                                                value={formData.targetRole}
                                                onChange={(e) => setFormData({ ...formData, targetRole: e.target.value })}
                                                className="bg-black/20 border-white/10 text-white placeholder:text-white/30 focus-visible:ring-cyan-500 h-11"
                                            />
                                        </div>

                                        {/* Tailored CV Feature (replaces purple with Emerald) */}
                                        <div className="mt-6 p-5 bg-emerald-950/30 border border-emerald-500/30 rounded-xl relative overflow-hidden group transition-all hover:bg-emerald-900/40">
                                            <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                                            <div className="relative z-10 pl-2">
                                                <div className="flex items-start gap-4">
                                                    <div className="p-2.5 bg-emerald-500/20 rounded-lg text-emerald-400 shadow-inner border border-emerald-400/20">
                                                        <Bot className="h-6 w-6" />
                                                    </div>
                                                    <div className="flex-1">
                                                        <h3 className="font-semibold text-white flex items-center gap-2">
                                                            Tailored Engine (ATS Bypass)
                                                            <span className="text-[10px] bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded-full font-bold uppercase tracking-wider flex items-center gap-1 border border-emerald-500/30">
                                                                <Briefcase className="h-3 w-3" /> 2 Credits
                                                            </span>
                                                        </h3>
                                                        <p className="text-sm text-white/60 mt-1 mb-3">Feed an Indeed, Glassdoor or LinkedIn Jobs URL. AI will analyze the requirements and align your narrative to guarantee high ATS scores.</p>

                                                        <div className="flex flex-col sm:flex-row gap-2">
                                                            <Input
                                                                placeholder="https://www.indeed.com/viewjob?jk=..."
                                                                className="bg-black/40 border-white/10 text-white placeholder:text-white/30 focus-visible:ring-emerald-500"
                                                                value={jobUrl}
                                                                onChange={(e) => setJobUrl(e.target.value)}
                                                                disabled={isScrapingJob}
                                                            />
                                                            <Button
                                                                onClick={handleJobScrape}
                                                                disabled={isScrapingJob || !jobUrl.trim()}
                                                                className="bg-emerald-600 hover:bg-emerald-500 text-white border-0 sm:w-32"
                                                            >
                                                                {isScrapingJob ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Optimize'}
                                                            </Button>
                                                        </div>
                                                        {formData.jobDescription && (
                                                            <div className="mt-3 flex items-center gap-2 text-xs text-emerald-400 bg-emerald-500/10 p-2 rounded-md border border-emerald-500/20">
                                                                <span className="relative flex h-2 w-2">
                                                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                                                                    <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                                                                </span>
                                                                Job Model Loaded. Systems primed for high-match generation.
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </CardContent>
                            </>
                        )}

                        {step === 2 && (
                            <>
                                <CardHeader className="pt-8 pb-4">
                                    <CardTitle className="text-3xl font-display font-light text-white tracking-tight">Education details</CardTitle>
                                    <CardDescription className="text-white/60 text-base mt-2">Where did you study, and what impact did you leave?</CardDescription>
                                </CardHeader>
                                <CardContent className="px-8 pb-8">
                                    <div className="space-y-3">
                                        <Textarea
                                            id="education"
                                            placeholder="e.g. B.S. in Computer Science at MIT (2020-2024). Active in the Robotics Society..."
                                            className="min-h-[250px] bg-black/20 border-white/10 text-white placeholder:text-white/30 focus-visible:ring-cyan-500 text-base leading-relaxed"
                                            value={formData.education}
                                            onChange={(e) => setFormData({ ...formData, education: e.target.value })}
                                        />
                                        <p className="text-sm text-cyan-400/80">Our AI engine structures plain text automatically.</p>
                                    </div>
                                </CardContent>
                            </>
                        )}

                        {step === 3 && (
                            <>
                                <CardHeader className="pt-8 pb-4">
                                    <CardTitle className="text-3xl font-display font-light text-white tracking-tight">Professional track record</CardTitle>
                                    <CardDescription className="text-white/60 text-base mt-2">Detail your past achievements and roles.</CardDescription>
                                </CardHeader>
                                <CardContent className="px-8 pb-8">
                                    <div className="space-y-3">
                                        <Textarea
                                            id="experience"
                                            placeholder="e.g. Software Engineer at Google (2023-Present). Built internal dashboards that improved latency by 20%..."
                                            className="min-h-[300px] bg-black/20 border-white/10 text-white placeholder:text-white/30 focus-visible:ring-cyan-500 text-base leading-relaxed"
                                            value={formData.experience}
                                            onChange={(e) => setFormData({ ...formData, experience: e.target.value })}
                                        />
                                        <p className="text-sm text-cyan-400/80 flex items-center gap-1"><Sparkles className="w-3 h-3" /> Include clear metrics (%, $, time) to supercharge AI output.</p>
                                    </div>
                                </CardContent>
                            </>
                        )}

                        {step === 4 && (
                            <>
                                <CardHeader className="pt-8 pb-4">
                                    <CardTitle className="text-3xl font-display font-light text-white tracking-tight">Capabilities & Toolkit</CardTitle>
                                    <CardDescription className="text-white/60 text-base mt-2">What sets you apart technically and socially?</CardDescription>
                                </CardHeader>
                                <CardContent className="px-8 pb-8">
                                    <div className="space-y-3">
                                        <Textarea
                                            id="skills"
                                            placeholder="e.g. TypeScript, Python, Strategic Planning, Public Speaking, Figma, Next.js"
                                            className="min-h-[200px] bg-black/20 border-white/10 text-white placeholder:text-white/30 focus-visible:ring-cyan-500 text-base leading-relaxed"
                                            value={formData.skills}
                                            onChange={(e) => setFormData({ ...formData, skills: e.target.value })}
                                        />
                                    </div>
                                </CardContent>
                            </>
                        )}

                        <div className="flex items-center justify-between p-6 border-t border-white/10 bg-black/20 backdrop-blur-md">
                            <Button
                                variant="outline"
                                onClick={handlePrev}
                                disabled={step === 1}
                                className="bg-transparent border-white/20 text-white hover:bg-white/10 hover:text-white transition-all h-11 px-6 rounded-xl"
                            >
                                <ArrowLeft className="w-4 h-4 mr-2" /> Back
                            </Button>

                            {step < totalSteps ? (
                                <Button
                                    onClick={handleNext}
                                    disabled={(step === 1 && !formData.profileType)}
                                    className="bg-white text-slate-950 hover:bg-white/90 font-medium h-11 px-8 rounded-xl transition-all hover:scale-105"
                                >
                                    Continue <ArrowRight className="w-4 h-4 ml-2" />
                                </Button>
                            ) : (
                                <Button
                                    onClick={handleSubmit}
                                    disabled={isGenerating}
                                    className="bg-gradient-to-r from-cyan-400 to-blue-500 hover:from-cyan-300 hover:to-blue-400 text-slate-950 font-bold h-11 px-8 rounded-xl transition-all hover:scale-105 shadow-lg shadow-cyan-500/25 border-0"
                                >
                                    {isGenerating ? (
                                        <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Compiling Data...</>
                                    ) : (
                                        <><Bot className="w-4 h-4 mr-2" /> Init Claude Engine</>
                                    )}
                                </Button>
                            )}
                        </div>
                    </Card>
                </div>
            </main>
        </div>
    );
}
