'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import { Linkedin, Loader2, Sparkles, Briefcase } from 'lucide-react';

export default function WizardPage() {
    const router = useRouter();
    const [step, setStep] = useState(1);
    const [isGenerating, setIsGenerating] = useState(false);
    const totalSteps = 4; // 1: Profile, 2: Education, 3: Experience, 4: Skills

    // Basic state to hold form entries. In a production setting with complex 
    // validation, `react-hook-form` + `zod` is heavily preferred here.
    const [formData, setFormData] = useState({
        profileType: '',
        targetRole: '',
        education: '',
        experience: '',
        skills: '',
        jobDescription: '' // Added for Tailored CV Feature
    });

    // LinkedIn Import State
    const [linkedinUrl, setLinkedinUrl] = useState('');
    const [isImporting, setIsImporting] = useState(false);

    // Job Posting Scraper State
    const [jobUrl, setJobUrl] = useState('');
    const [isScrapingJob, setIsScrapingJob] = useState(false);

    const handleLinkedinImport = async () => {
        if (!linkedinUrl || !linkedinUrl.includes('linkedin.com/in/')) {
            toast.error('Please enter a valid LinkedIn profile URL');
            return;
        }

        setIsImporting(true);
        const importToast = toast.loading('Initializing Apify Scraper... This may take up to 20 seconds.', {
            duration: 30000 // Give it ample time to stay visible
        });

        try {
            const res = await fetch('/api/cv/import-linkedin', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ linkedinUrl })
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.error || 'Failed to import LinkedIn profile');
            }

            // Populate form with scraped data
            setFormData(prev => ({
                ...prev,
                experience: data.experience || prev.experience,
                education: data.education || prev.education,
                skills: data.skills || prev.skills,
                targetRole: data.targetRole || prev.targetRole,
                // We default profileType to 'experienced' as they have a LinkedIn
                profileType: prev.profileType || 'experienced'
            }));

            toast.success('Successfully imported! (1 Credit used)', { id: importToast });
            setLinkedinUrl(''); // Clear input

            // Optionally auto-advance to step 2 to show them the populated data
            setStep(2);

        } catch (error: any) {
            console.error('Import process failed:', error);
            toast.error(error.message || 'Apify import failed. Please try again later.', { id: importToast });
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

            if (!res.ok) {
                throw new Error(data.error || 'Failed to scrape job details');
            }

            // Populate form with scraped job details
            setFormData(prev => ({
                ...prev,
                targetRole: data.jobTitle || prev.targetRole,
                jobDescription: data.jobDescription // Save the description implicitly to send to Gemini
            }));

            // Only show toast if successful, meaning 2 credits were deducted
            toast.success(`Job imported: ${data.jobTitle} at ${data.companyName} (2 Credits used)`, { id: scrapeToast });
            setJobUrl(''); // Clear input

        } catch (error: any) {
            console.error('Job scrape process failed:', error);
            toast.error(error.message || 'Apify import failed. Please try again later.', { id: scrapeToast });
        } finally {
            setIsScrapingJob(false);
        }
    };

    const progressPercentage = ((step - 1) / totalSteps) * 100;

    const handleNext = () => setStep((s) => Math.min(s + 1, totalSteps));
    const handlePrev = () => setStep((s) => Math.max(s - 1, 1));

    const handleSubmit = async () => {
        setIsGenerating(true);
        const loadingToastId = toast.loading('Initializing Gemini 3.1 Pro Engine...');

        try {
            const response = await fetch('/api/generate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });

            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.error || 'Failed to generate CV');
            }

            toast.success('CV Generated Successfully!', { id: loadingToastId });

            // Redirect the user to the editor/viewer to see the result
            router.push(`/cv/${result.resumeId}`);

        } catch (err: any) {
            console.error(err);
            toast.error(err.message || 'An error occurred during generation.', { id: loadingToastId });
        } finally {
            setIsGenerating(false);
        }
    }

    return (
        <div className="flex min-h-screen flex-col bg-muted/20">
            <header className="border-b bg-background px-6 py-4 flex items-center justify-between sticky top-0 z-10">
                <h1 className="font-bold text-lg">CV Maker Omni</h1>
                <div className="text-sm text-muted-foreground">Step {step} of {totalSteps}</div>
            </header>

            {/* Progress Bar */}
            <Progress value={progressPercentage} className="h-1 w-full rounded-none" />

            <main className="flex-1 flex items-center justify-center p-6 w-full max-w-3xl mx-auto">

                <Card className="w-full shadow-lg border-primary/10 animate-in fade-in slide-in-from-bottom-4 duration-500">

                    {step === 1 && (
                        <>
                            <CardHeader>
                                <CardTitle className="text-2xl">Let's set the stage</CardTitle>
                                <CardDescription>Are you a student looking for their first break, or an experienced professional climbing the ladder?</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-8">

                                {/* Apify LinkedIn Import Feature */}
                                <div className="p-4 bg-blue-50/50 dark:bg-blue-950/20 border border-blue-100 dark:border-blue-900 rounded-xl space-y-4">
                                    <div className="flex items-start gap-3">
                                        <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg text-blue-600 dark:text-blue-400">
                                            <Linkedin className="h-5 w-5" />
                                        </div>
                                        <div>
                                            <h3 className="font-semibold text-sm flex items-center gap-2">
                                                Auto-fill with LinkedIn
                                                <span className="text-[10px] bg-primary/10 text-primary px-1.5 py-0.5 rounded-full font-bold uppercase tracking-wider flex items-center gap-1">
                                                    <Sparkles className="h-3 w-3" /> Pro Feature
                                                </span>
                                            </h3>
                                            <p className="text-xs text-muted-foreground mt-1">Paste your profile link. We'll extract your timeline, education, and skills. (Costs 1 Credit)</p>
                                        </div>
                                    </div>

                                    <div className="flex gap-2">
                                        <Input
                                            placeholder="https://www.linkedin.com/in/username/"
                                            className="bg-background"
                                            value={linkedinUrl}
                                            onChange={(e) => setLinkedinUrl(e.target.value)}
                                            disabled={isImporting}
                                        />
                                        <Button
                                            onClick={handleLinkedinImport}
                                            disabled={isImporting || !linkedinUrl.trim()}
                                            className="min-w-[100px]"
                                        >
                                            {isImporting ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Import'}
                                        </Button>
                                    </div>
                                </div>

                                <div className="relative">
                                    <div className="absolute inset-0 flex items-center">
                                        <span className="w-full border-t" />
                                    </div>
                                    <div className="relative flex justify-center text-xs uppercase">
                                        <span className="bg-background px-2 text-muted-foreground">Or fill manually</span>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="profileType">I am a...</Label>
                                    <Select onValueChange={(val) => setFormData({ ...formData, profileType: val })} defaultValue={formData.profileType}>
                                        <SelectTrigger id="profileType">
                                            <SelectValue placeholder="Select your current status" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="student">Student / Fresh Graduate</SelectItem>
                                            <SelectItem value="experienced">Experienced Professional</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="targetRole">Target Job Title</Label>
                                        <Input
                                            id="targetRole"
                                            placeholder="e.g. Frontend Engineer, Marketing Manager"
                                            value={formData.targetRole}
                                            onChange={(e) => setFormData({ ...formData, targetRole: e.target.value })}
                                        />
                                    </div>

                                    {/* Apify Tailored CV Feature */}
                                    <div className="p-4 bg-purple-50/50 dark:bg-purple-950/20 border border-purple-100 dark:border-purple-900 rounded-xl space-y-4">
                                        <div className="flex items-start gap-3">
                                            <div className="p-2 bg-purple-100 dark:bg-purple-900 rounded-lg text-purple-600 dark:text-purple-400">
                                                <Briefcase className="h-5 w-5" />
                                            </div>
                                            <div>
                                                <h3 className="font-semibold text-sm flex items-center gap-2">
                                                    Tailored CV (ATS Optimized)
                                                    <span className="text-[10px] bg-primary/10 text-primary px-1.5 py-0.5 rounded-full font-bold uppercase tracking-wider flex items-center gap-1">
                                                        <Sparkles className="h-3 w-3" /> Ultra Pro
                                                    </span>
                                                </h3>
                                                <p className="text-xs text-muted-foreground mt-1">Paste an Indeed, Glassdoor or LinkedIn Jobs link. AI will optimize your CV format to match the exact requirements. (Costs 2 Credits)</p>
                                            </div>
                                        </div>

                                        <div className="flex gap-2">
                                            <Input
                                                placeholder="https://www.indeed.com/viewjob?jk=..."
                                                className="bg-background"
                                                value={jobUrl}
                                                onChange={(e) => setJobUrl(e.target.value)}
                                                disabled={isScrapingJob}
                                            />
                                            <Button
                                                onClick={handleJobScrape}
                                                disabled={isScrapingJob || !jobUrl.trim()}
                                                className="min-w-[100px] bg-purple-600 hover:bg-purple-700 text-white"
                                            >
                                                {isScrapingJob ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Optimize'}
                                            </Button>
                                        </div>
                                        {formData.jobDescription && (
                                            <p className="text-xs text-green-600 dark:text-green-400 font-medium">✓ Job Requirements Successfully Loaded. Your CV will be highly tailored.</p>
                                        )}
                                    </div>
                                </div>
                            </CardContent>
                        </>
                    )}

                    {step === 2 && (
                        <>
                            <CardHeader>
                                <CardTitle className="text-2xl">Education & Formative Experiences</CardTitle>
                                <CardDescription>Tell us about your studies, clubs, or important coursework.</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                <div className="space-y-2">
                                    <Label htmlFor="education">Educational Background</Label>
                                    <Textarea
                                        id="education"
                                        placeholder="e.g. B.S. in Computer Science at MIT (2020-2024). Active in the Robotics Society..."
                                        className="min-h-[150px]"
                                        value={formData.education}
                                        onChange={(e) => setFormData({ ...formData, education: e.target.value })}
                                    />
                                    <p className="text-sm text-muted-foreground mt-2">Don't worry about formatting. Just brain dump your achievements.</p>
                                </div>
                            </CardContent>
                        </>
                    )}

                    {step === 3 && (
                        <>
                            <CardHeader>
                                <CardTitle className="text-2xl">Work Experience & Projects</CardTitle>
                                <CardDescription>List your past jobs, internships, or major personal projects.</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                <div className="space-y-2">
                                    <Label htmlFor="experience">Experience Dump</Label>
                                    <Textarea
                                        id="experience"
                                        placeholder="e.g. Software Intern at Google (Summer 2023). Built a dashboard using React that improved load times by 20%..."
                                        className="min-h-[200px]"
                                        value={formData.experience}
                                        onChange={(e) => setFormData({ ...formData, experience: e.target.value })}
                                    />
                                    <p className="text-sm text-muted-foreground mt-2">The more details and metrics (numbers/percentages) you provide, the better the AI can optimize it.</p>
                                </div>
                            </CardContent>
                        </>
                    )}

                    {step === 4 && (
                        <>
                            <CardHeader>
                                <CardTitle className="text-2xl">Hard & Soft Skills</CardTitle>
                                <CardDescription>What tools do you use? What are you exceptionally good at?</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                <div className="space-y-2">
                                    <Label htmlFor="skills">Skills & Tools</Label>
                                    <Textarea
                                        id="skills"
                                        placeholder="e.g. TypeScript, React, Node.js, Public Speaking, Leadership, Figma"
                                        className="min-h-[120px]"
                                        value={formData.skills}
                                        onChange={(e) => setFormData({ ...formData, skills: e.target.value })}
                                    />
                                </div>
                            </CardContent>
                        </>
                    )}

                    {/* Footer Navigation */}
                    <div className="flex items-center justify-between p-6 border-t bg-muted/10 rounded-b-xl">
                        <Button variant="outline" onClick={handlePrev} disabled={step === 1}>
                            Back
                        </Button>

                        {step < totalSteps ? (
                            <Button onClick={handleNext} disabled={(step === 1 && !formData.profileType)}>
                                Continue
                            </Button>
                        ) : (
                            <Button
                                onClick={handleSubmit}
                                disabled={isGenerating}
                                className="bg-gradient-to-r from-primary to-primary/80 hover:scale-105 transition-transform"
                            >
                                {isGenerating ? 'Generating...' : 'Generate My CV'}
                            </Button>
                        )}
                    </div>
                </Card>
            </main>
        </div>
    );
}
