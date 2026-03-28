import { CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
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
  linkedinUrl,
  setLinkedinUrl,
  isImporting,
  handleLinkedInImport,
  formData,
  setFormData,
  jobUrl,
  setJobUrl,
  isScrapingJob,
  handleScraping,
}: WizardStep1Props) {
  const { t } = useTranslation();

  return (
    <>
      <CardHeader className="pt-8 pb-4">
        <CardTitle className="font-display text-3xl font-black tracking-tight text-zinc-950 dark:text-white">
          {t('wizard.setTrajectory')}
        </CardTitle>
        <CardDescription className="mt-2 text-base font-light text-zinc-600 dark:text-white/55">
          {t('wizard.setTrajectoryDesc')}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-8 px-8 pb-8">
        {/* LinkedIn Pro Feature */}
        <div className="liquid-glass relative rounded-[1.75rem] border border-black/8 bg-black/[0.02] p-6 transition-all duration-300 hover:-translate-y-1 hover:border-black/12 hover:bg-black/[0.04] hover:shadow-[0_24px_60px_rgba(15,23,42,0.08)] dark:border-white/10 dark:bg-white/[0.04] dark:hover:border-white/20 dark:hover:bg-white/[0.07] dark:hover:shadow-[0_24px_60px_rgba(0,0,0,0.36)]">
          <div className="flex items-start gap-4">
            <div className="rounded-full border border-black/8 bg-white/72 p-2.5 text-zinc-950 dark:border-white/10 dark:bg-white/10 dark:text-white">
              <Linkedin className="h-6 w-6" />
            </div>
            <div className="flex-1">
              <h3 className="flex items-center gap-2 font-bold text-zinc-950 dark:text-white">
                {t('wizard.autofillLinkedin')}
                <span className="rounded-full border border-black/8 bg-black/[0.04] px-2 py-0.5 text-[10px] font-bold tracking-wider text-zinc-700 uppercase dark:border-white/10 dark:bg-white/[0.08] dark:text-white/85">
                  {t('wizard.oneCredit')}
                </span>
              </h3>
              <p className="mt-1 mb-4 text-sm font-light text-zinc-600 dark:text-white/55">
                {t('wizard.autofillLinkedinDesc')}
              </p>
              <div className="flex flex-col gap-2 sm:flex-row">
                <Input
                  placeholder="https://linkedin.com/in/username"
                  className="h-12 rounded-2xl border-black/10 bg-white/82 text-zinc-950 transition-all duration-300 placeholder:text-zinc-400 focus-visible:border-black/20 focus-visible:ring-black/6 dark:border-white/10 dark:bg-black/35 dark:text-white dark:placeholder:text-white/28 dark:focus-visible:border-white/20 dark:focus-visible:ring-white/10"
                  value={linkedinUrl}
                  onChange={(e) => setLinkedinUrl(e.target.value)}
                  disabled={isImporting}
                />
                <Button
                  onClick={handleLinkedInImport}
                  disabled={isImporting || !linkedinUrl.trim()}
                  className="h-12 rounded-full border-0 bg-zinc-950 font-bold text-white transition-all duration-300 hover:scale-[1.02] hover:bg-black/90 active:scale-[0.98] sm:w-32 dark:bg-white dark:text-black dark:hover:bg-white/90"
                >
                  {isImporting ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    t('wizard.runAgent')
                  )}
                </Button>
              </div>
            </div>
          </div>
        </div>

        <div className="relative">
          <Separator className="bg-black/8 dark:bg-white/10" />
          <div className="relative -mt-3 flex justify-center text-xs font-bold tracking-[0.24em] uppercase">
            <span className="rounded-full border border-black/8 bg-white/88 px-4 py-1 text-zinc-500 dark:border-white/10 dark:bg-[#050505] dark:text-white/45">
              {t('wizard.manualEntry')}
            </span>
          </div>
        </div>

        <div className="space-y-6">
          <div className="space-y-3">
            <Label htmlFor="profileType" className="font-bold text-zinc-700 dark:text-white/80">
              {t('wizard.iAmA')}
            </Label>
            <Select
              onValueChange={(val) => setFormData({ ...formData, profileType: val })}
              defaultValue={formData.profileType}
            >
              <SelectTrigger
                id="profileType"
                className="h-12 rounded-2xl border-black/10 bg-white/82 text-zinc-950 transition-all duration-300 focus:ring-black/6 dark:border-white/10 dark:bg-black/35 dark:text-white dark:focus:ring-white/10"
              >
                <SelectValue placeholder={t('wizard.selectStatus')} />
              </SelectTrigger>
              <SelectContent className="border-black/8 bg-white/94 text-zinc-950 dark:border-white/10 dark:bg-black/80 dark:text-white">
                <SelectItem
                  value="student"
                  className="focus:bg-black/[0.04] dark:focus:bg-white/10"
                >
                  {t('wizard.student')}
                </SelectItem>
                <SelectItem
                  value="experienced"
                  className="focus:bg-black/[0.04] dark:focus:bg-white/10"
                >
                  {t('wizard.experienced')}
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-3">
            <Label htmlFor="targetRole" className="font-bold text-zinc-700 dark:text-white/80">
              {t('wizard.targetRole')}
            </Label>
            <Input
              id="targetRole"
              placeholder={t('wizard.targetRolePlaceholder')}
              value={formData.targetRole}
              onChange={(e) => setFormData({ ...formData, targetRole: e.target.value })}
              className="h-12 rounded-2xl border-black/10 bg-white/82 text-zinc-950 transition-all duration-300 placeholder:text-zinc-400 focus-visible:border-black/20 focus-visible:ring-black/6 dark:border-white/10 dark:bg-black/35 dark:text-white dark:placeholder:text-white/28 dark:focus-visible:border-white/20 dark:focus-visible:ring-white/10"
            />
          </div>

          {/* Tailored CV Feature */}
          <div className="liquid-glass relative mt-8 rounded-[1.75rem] border border-black/8 bg-black/[0.02] p-6 transition-all duration-300 hover:-translate-y-1 hover:border-black/12 hover:bg-black/[0.04] hover:shadow-[0_24px_60px_rgba(15,23,42,0.08)] dark:border-white/10 dark:bg-white/[0.04] dark:hover:border-white/20 dark:hover:bg-white/[0.07] dark:hover:shadow-[0_24px_60px_rgba(0,0,0,0.36)]">
            <div className="flex items-start gap-4">
              <div className="rounded-full border border-black/8 bg-white/72 p-2.5 text-zinc-950 dark:border-white/10 dark:bg-white/10 dark:text-white">
                <Bot className="h-6 w-6" />
              </div>
              <div className="flex-1">
                <h3 className="flex items-center gap-2 font-bold text-zinc-950 dark:text-white">
                  {t('wizard.tailoredEngine')}
                  <span className="rounded-full border border-black/8 bg-black/[0.04] px-2 py-0.5 text-[10px] font-bold tracking-wider text-zinc-700 uppercase dark:border-white/10 dark:bg-white/[0.08] dark:text-white/85">
                    {t('wizard.twoCredits')}
                  </span>
                </h3>
                <p className="mt-1 mb-4 text-sm font-light text-zinc-600 dark:text-white/55">
                  {t('wizard.tailoredEngineDesc')}
                </p>

                <div className="mb-6 flex flex-col gap-2 sm:flex-row">
                  <Input
                    placeholder="https://www.indeed.com/viewjob?jk=..."
                    className="h-12 rounded-2xl border-black/10 bg-white/82 text-zinc-950 transition-all duration-300 placeholder:text-zinc-400 focus-visible:border-black/20 focus-visible:ring-black/6 dark:border-white/10 dark:bg-black/35 dark:text-white dark:placeholder:text-white/28 dark:focus-visible:border-white/20 dark:focus-visible:ring-white/10"
                    value={jobUrl}
                    onChange={(e) => setJobUrl(e.target.value)}
                    disabled={isScrapingJob}
                  />
                  <Button
                    onClick={handleScraping}
                    disabled={isScrapingJob || !jobUrl.trim()}
                    className="h-12 rounded-full border-0 bg-zinc-950 font-bold text-white transition-all duration-300 hover:scale-[1.02] hover:bg-black/90 active:scale-[0.98] sm:w-32 dark:bg-white dark:text-black dark:hover:bg-white/90"
                  >
                    {isScrapingJob ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      t('wizard.optimize')
                    )}
                  </Button>
                </div>

                <div className="space-y-3">
                  <Label className="text-xs font-bold tracking-wider text-zinc-700 uppercase dark:text-white/80">
                    {t('wizard.orPasteManual')}
                  </Label>
                  <Textarea
                    placeholder={t('wizard.jobDescPlaceholder')}
                    className="min-h-[150px] rounded-[1.5rem] border-black/10 bg-white/82 p-4 text-sm leading-relaxed text-zinc-950 transition-all duration-300 placeholder:text-zinc-400 focus-visible:border-black/20 focus-visible:ring-black/6 dark:border-white/10 dark:bg-black/35 dark:text-white dark:placeholder:text-white/28 dark:focus-visible:border-white/20 dark:focus-visible:ring-white/10"
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
