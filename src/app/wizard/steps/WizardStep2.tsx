import { Textarea } from '@/components/ui/textarea';
import { useTranslation } from '@/components/I18nProvider';

interface WizardStep2Props {
  formData: any;
  setFormData: (data: any) => void;
}

export function WizardStep2({ formData, setFormData }: WizardStep2Props) {      
  const { t } = useTranslation();

  return (
    <div className="space-y-12">
      <div className="pt-8 pb-4">
        <h2 className="font-display text-4xl font-semibold tracking-tight text-zinc-950 sm:text-5xl dark:text-white">
          {t('wizard.education')}
        </h2>
        <p className="mt-4 text-lg font-light text-zinc-600 dark:text-zinc-400">
          {t('wizard.educationDesc')}
        </p>
      </div>
      <div className="space-y-8">
        <div className="space-y-3">
          <Textarea
            id="education"
            placeholder={t('wizard.educationPlaceholder')}
            className="min-h-[250px] rounded-2xl border-black/5 bg-white/50 p-5 text-zinc-900 placeholder:text-zinc-400 hover:bg-white/80 focus-visible:ring-1 focus-visible:ring-zinc-400 dark:border-white/5 dark:bg-zinc-900/30 dark:text-zinc-100 dark:hover:bg-zinc-900/50 dark:focus-visible:ring-zinc-600"
            value={formData.education}
            onChange={(e) => setFormData({ ...formData, education: e.target.value })}
          />
          <p className="text-sm text-zinc-500 dark:text-zinc-400">    
            {t('wizard.aiStructures')}
          </p>
        </div>
      </div>
    </div>
  );
}
