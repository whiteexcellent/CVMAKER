import { CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { useTranslation } from '@/components/I18nProvider';

interface WizardStep3Props {
  formData: any;
  setFormData: (data: any) => void;
}

export function WizardStep3({ formData, setFormData }: WizardStep3Props) {
  const { t } = useTranslation();

  return (
    <>
      <CardHeader className="pt-8 pb-4">
        <CardTitle className="font-display text-3xl font-black tracking-tight text-zinc-950 dark:text-white">
          {t('wizard.trackRecord')}
        </CardTitle>
        <CardDescription className="mt-2 text-base font-light text-zinc-600 dark:text-white/55">
          {t('wizard.trackRecordDesc')}
        </CardDescription>
      </CardHeader>
      <CardContent className="px-8 pb-8">
        <div className="space-y-3">
          <Textarea
            id="experience"
            placeholder={t('wizard.experiencePlaceholder')}
            className="min-h-[300px] rounded-[1.75rem] border-black/10 bg-white/82 p-5 text-base leading-relaxed text-zinc-950 transition-all duration-300 placeholder:text-zinc-400 focus-visible:border-black/20 focus-visible:ring-black/6 dark:border-white/10 dark:bg-black/35 dark:text-white dark:placeholder:text-white/28 dark:focus-visible:border-white/20 dark:focus-visible:ring-white/10"
            value={formData.experience}
            onChange={(e) => setFormData({ ...formData, experience: e.target.value })}
          />
          <p className="flex items-center gap-1 text-sm font-bold text-zinc-500 dark:text-white/45">
            {t('wizard.metrics')}
          </p>
        </div>
      </CardContent>
    </>
  );
}
