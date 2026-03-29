import { Textarea } from '@/components/ui/textarea';
import { useTranslation } from '@/components/I18nProvider';

interface WizardStep4Props {
  formData: any;
  setFormData: (data: any) => void;
}

export function WizardStep4({ formData, setFormData }: WizardStep4Props) {      
  const { t } = useTranslation();

  return (
    <div className="space-y-12">
      <div className="pt-8 pb-4">
        <h2 className="font-display text-4xl font-semibold tracking-tight text-zinc-950 sm:text-5xl dark:text-white">
          {t('wizard.capabilities')}
        </h2>
        <p className="mt-4 text-lg font-light text-zinc-600 dark:text-zinc-400">
          {t('wizard.capabilitiesDesc')}
        </p>
      </div>
      <div className="space-y-8">
        <div className="space-y-3">
          <Textarea
            id="skills"
            placeholder={t('wizard.skillsPlaceholder')}
            className="min-h-[200px] rounded-2xl border-black/5 bg-white/50 p-5 text-zinc-900 placeholder:text-zinc-400 hover:bg-white/80 focus-visible:ring-1 focus-visible:ring-zinc-400 dark:border-white/5 dark:bg-zinc-900/30 dark:text-zinc-100 dark:hover:bg-zinc-900/50 dark:focus-visible:ring-zinc-600"
            value={formData.skills}
            onChange={(e) => setFormData({ ...formData, skills: e.target.value })}
          />
        </div>
      </div>
    </div>
  );
}
