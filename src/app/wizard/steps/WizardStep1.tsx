import { CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Linkedin, Loader2, Bot } from 'lucide-react';
import { useTranslation } from '@/components/I18nProvider';

interface WizardStep1Props {
    linkedinUrl: string;
    setLinkedinUrl: (val: string) => void;
    isImporting: boolean;
    handleLinkedInImport: () => void;
    formData: any;
    setFormData: (data: any) => void;
    jobUrl: string;
    setJobUrl: (val: string) => void;
    isScrapingJob: boolean;
    handleScraping: () => void;
}

export function WizardStep1({
    linkedinUrl, setLinkedinUrl, isImporting, handleLinkedInImport,
    formData, setFormData, jobUrl, setJobUrl, isScrapingJob, handleScraping
}: WizardStep1Props) {
    const { t } = useTranslation();

    return (
        <>
            <CardHeader className="pt-8 pb-4">
                <CardTitle className="text-3xl font-display font-black tracking-tight text-black dark:text-white">{t('wizard.setTrajectory')}</CardTitle>
                <CardDescription className="text-black/50 dark:text-white/50 text-base mt-2 font-light">
                    {t('wizard.setTrajectoryDesc')}
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-8 px-8 pb-8">
                {/* LinkedIn Pro Feature */}
                <div className="p-6 bg-slate-50 dark:bg-white/5 border border-black/10 dark:border-white/10 transition-all hover:border-black/30 dark:hover:border-white/30">
                    <div className="flex items-start gap-4">
                        <div className="p-2.5 bg-black/5 dark:bg-white/10 rounded-full text-black dark:text-white">
                            <Linkedin className="h-6 w-6" />
                        </div>
                        <div className="flex-1">
                            <h3 className="font-bold text-black dark:text-white flex items-center gap-2">
                                {t('wizard.autofillLinkedin')}
                                <span className="text-[10px] bg-black/5 dark:bg-white/10 text-black dark:text-white px-2 py-0.5 rounded-full font-bold uppercase tracking-wider border border-black/10 dark:border-white/10">
                                    {t('wizard.oneCredit')}
                                </span>
                            </h3>
                            <p className="text-sm text-black/50 dark:text-white/50 mt-1 mb-4 font-light">{t('wizard.autofillLinkedinDesc')}</p>
                            <div className="flex flex-col sm:flex-row gap-2">
                                <Input
                                    placeholder="https://linkedin.com/in/username"
                                    className="bg-transparent border-black/20 dark:border-white/20 text-black dark:text-white placeholder:text-black/30 dark:placeholder:text-white/30 h-11 focus-visible:ring-black dark:focus-visible:ring-white"
                                    value={linkedinUrl}
                                    onChange={(e) => setLinkedinUrl(e.target.value)}
                                    disabled={isImporting}
                                />
                                <Button
                                    onClick={handleLinkedInImport}
                                    disabled={isImporting || !linkedinUrl.trim()}
                                    className="bg-black hover:bg-black/80 dark:bg-white dark:hover:bg-white/90 text-white dark:text-black font-bold h-11 sm:w-32 border-0"
                                >
                                    {isImporting ? <Loader2 className="h-4 w-4 animate-spin" /> : t('wizard.runAgent')}
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                        <span className="w-full border-t border-black/10 dark:border-white/10" />
                    </div>
                    <div className="relative flex justify-center text-xs uppercase font-bold tracking-widest">
                        <span className="bg-white dark:bg-black px-4 text-black/40 dark:text-white/40">{t('wizard.manualEntry')}</span>
                    </div>
                </div>

                <div className="space-y-6">
                    <div className="space-y-3">
                        <Label htmlFor="profileType" className="text-black/80 dark:text-white/80 font-bold">{t('wizard.iAmA')}</Label>
                        <Select onValueChange={(val) => setFormData({ ...formData, profileType: val })} defaultValue={formData.profileType}>
                            <SelectTrigger id="profileType" className="bg-transparent border-black/20 dark:border-white/20 text-black dark:text-white focus:ring-black dark:focus:ring-white h-11">
                                <SelectValue placeholder={t('wizard.selectStatus')} />
                            </SelectTrigger>
                            <SelectContent className="bg-white dark:bg-black border-black/10 dark:border-white/10 text-black dark:text-white">
                                <SelectItem value="student" className="focus:bg-black/5 dark:focus:bg-white/10">{t('wizard.student')}</SelectItem>
                                <SelectItem value="experienced" className="focus:bg-black/5 dark:focus:bg-white/10">{t('wizard.experienced')}</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="space-y-3">
                        <Label htmlFor="targetRole" className="text-black/80 dark:text-white/80 font-bold">{t('wizard.targetRole')}</Label>
                        <Input
                            id="targetRole"
                            placeholder={t('wizard.targetRolePlaceholder')}
                            value={formData.targetRole}
                            onChange={(e) => setFormData({ ...formData, targetRole: e.target.value })}
                            className="bg-transparent border-black/20 dark:border-white/20 text-black dark:text-white placeholder:text-black/30 dark:placeholder:text-white/30 h-11 focus-visible:ring-black dark:focus-visible:ring-white"
                        />
                    </div>

                    {/* Tailored CV Feature */}
                    <div className="mt-8 p-6 bg-slate-50 dark:bg-white/5 border border-black/10 dark:border-white/10 transition-all hover:border-black/30 dark:hover:border-white/30">
                        <div className="flex items-start gap-4">
                            <div className="p-2.5 bg-black/5 dark:bg-white/10 rounded-full text-black dark:text-white">
                                <Bot className="h-6 w-6" />
                            </div>
                            <div className="flex-1">
                                <h3 className="font-bold text-black dark:text-white flex items-center gap-2">
                                    {t('wizard.tailoredEngine')}
                                    <span className="text-[10px] bg-black/5 dark:bg-white/10 text-black dark:text-white px-2 py-0.5 rounded-full font-bold uppercase tracking-wider border border-black/10 dark:border-white/10">
                                        {t('wizard.twoCredits')}
                                    </span>
                                </h3>
                                <p className="text-sm text-black/50 dark:text-white/50 mt-1 mb-4 font-light">{t('wizard.tailoredEngineDesc')}</p>

                                <div className="flex flex-col sm:flex-row gap-2 mb-6">
                                    <Input
                                        placeholder="https://www.indeed.com/viewjob?jk=..."
                                        className="bg-transparent border-black/20 dark:border-white/20 text-black dark:text-white placeholder:text-black/30 dark:placeholder:text-white/30 h-11 focus-visible:ring-black dark:focus-visible:ring-white"
                                        value={jobUrl}
                                        onChange={(e) => setJobUrl(e.target.value)}
                                        disabled={isScrapingJob}
                                    />
                                    <Button
                                        onClick={handleScraping}
                                        disabled={isScrapingJob || !jobUrl.trim()}
                                        className="bg-black hover:bg-black/80 dark:bg-white dark:hover:bg-white/90 text-white dark:text-black font-bold h-11 sm:w-32 border-0"
                                    >
                                        {isScrapingJob ? <Loader2 className="h-4 w-4 animate-spin" /> : t('wizard.optimize')}
                                    </Button>
                                </div>

                                <div className="space-y-3">
                                    <Label className="text-black/80 dark:text-white/80 font-bold text-xs uppercase tracking-wider">{t('wizard.orPasteManual')}</Label>
                                    <Textarea
                                        placeholder={t('wizard.jobDescPlaceholder')}
                                        className="min-h-[150px] bg-transparent border-black/20 dark:border-white/20 text-black dark:text-white placeholder:text-black/30 dark:placeholder:text-white/30 focus-visible:ring-black dark:focus-visible:ring-white text-sm leading-relaxed p-4"
                                        value={formData.jobDescription}
                                        onChange={(e) => setFormData({ ...formData, jobDescription: e.target.value })}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </CardContent>
        </>
    );
}
