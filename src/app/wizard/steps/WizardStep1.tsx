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
    <div className="space-y-12">
      <div className="pt-8 pb-4">
        <h2 className="font-display text-4xl font-semibold tracking-tight text-zinc-950 sm:text-5xl dark:text-white">
          {t('wizard.setTrajectory')}
        </h2>
        <p className="mt-4 text-lg font-light text-zinc-600 dark:text-zinc-400">
          {t('wizard.setTrajectoryDesc')}
        </p>
      </div>
      <div className="space-y-8">
        {/* LinkedIn Pro Feature */}
        <div className="relative rounded-3xl border border-black/5 bg-white/50 p-6 transition-all hover:bg-white/80 dark:border-white/5 dark:bg-zinc-900/30 dark:hover:bg-zinc-900/50">
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
                  className="h-12 rounded-2xl border-black/5 bg-white/50 px-4 text-zinc-900 placeholder:text-zinc-400 hover:bg-white/80 focus-visible:ring-1 focus-visible:ring-zinc-400 dark:border-white/5 dark:bg-zinc-900/30 dark:text-zinc-100 dark:hover:bg-zinc-900/50 dark:focus-visible:ring-zinc-600"
                  value={linkedinUrl}
                  onChange={(e) => setLinkedinUrl(e.target.value)}
                  disabled={isImporting}
                />
                <Button
                  onClick={handleLinkedInImport}
                  disabled={isImporting || !linkedinUrl.trim()}
                  className="h-12 w-full rounded-2xl bg-zinc-900 px-6 font-medium text-white shadow-sm transition-colors hover:bg-zinc-800 disabled:opacity-50 sm:w-auto dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-white"
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
              className="h-12 rounded-2xl border-black/5 bg-white/50 px-4 text-zinc-900 placeholder:text-zinc-400 hover:bg-white/80 focus-visible:ring-1 focus-visible:ring-zinc-400 dark:border-white/5 dark:bg-zinc-900/30 dark:text-zinc-100 dark:hover:bg-zinc-900/50 dark:focus-visible:ring-zinc-600"
            />
          </div>

          {/* Tailored CV Feature */}
          <div className="relative mt-8 rounded-3xl border border-black/5 bg-white/50 p-6 transition-all hover:bg-white/80 dark:border-white/5 dark:bg-zinc-900/30 dark:hover:bg-zinc-900/50">
            <div className="flex items-start gap-4">
              <div className="rounded-2xl border border-black/5 bg-white p-3 text-zinc-900 shadow-sm dark:border-white/10 dark:bg-zinc-800 dark:text-zinc-100">
                <Bot className="h-6 w-6" />
              </div>
              <div className="flex-1">
<h3 className="flex items-center gap-2 text-lg font-medium text-zinc-900 dark:text-zinc-100">
                {t('wizard.tailoredEngine')}
                <span className="rounded-full bg-zinc-100 px-2.5 py-0.5 text-xs font-medium text-zinc-600 dark:bg-zinc-800 dark:text-zinc-300">
                  {t('wizard.twoCredits')}
                </span>
              </h3>
              <p className="mt-1 mb-4 text-sm text-zinc-500 dark:text-zinc-400">
                {t('wizard.tailoredEngineDesc')}
              </p>

              <div className="mb-6 flex flex-col gap-3 sm:flex-row">
                <Input
                  placeholder="https://www.indeed.com/viewjob?jk=..."
                  className="h-12 flex-1 rounded-2xl border-black/5 bg-white px-4 text-zinc-900 placeholder:text-zinc-400 focus-visible:ring-1 focus-visible:ring-zinc-400 dark:border-white/10 dark:bg-zinc-900 dark:text-zinc-100 dark:focus-visible:ring-zinc-600"
                  value={jobUrl}
                  onChange={(e) => setJobUrl(e.target.value)}
                  disabled={isScrapingJob}
                />
                <Button
                  onClick={handleScraping}
                  disabled={isScrapingJob || !jobUrl.trim()}
                  className="h-12 w-full rounded-2xl bg-zinc-900 px-6 font-medium text-white shadow-sm transition-colors hover:bg-zinc-800 disabled:opacity-50 sm:w-auto dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-white"
                >
                  {isScrapingJob ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    t('wizard.optimize')
                  )}
                </Button>
              </div>

              <div className="space-y-3">
                <Label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
                  {t('wizard.orPasteManual')}
                </Label>
                <Textarea
                  placeholder={t('wizard.jobDescPlaceholder')}
                  className="min-h-[150px] rounded-2xl border-black/5 bg-white/50 p-4 text-zinc-900 placeholder:text-zinc-400 hover:bg-white/80 focus-visible:ring-1 focus-visible:ring-zinc-400 dark:border-white/5 dark:bg-zinc-900/30 dark:text-zinc-100 dark:hover:bg-zinc-900/50 dark:focus-visible:ring-zinc-600"
                  value={formData.jobDescription}
                  onChange={(e) => setFormData({ ...formData, jobDescription: e.target.value })}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
);
}




