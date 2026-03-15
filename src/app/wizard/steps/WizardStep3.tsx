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
                <CardTitle className="text-3xl font-display font-black tracking-tight text-black dark:text-white">{t('wizard.trackRecord')}</CardTitle>
                <CardDescription className="text-black/50 dark:text-white/50 text-base mt-2 font-light">{t('wizard.trackRecordDesc')}</CardDescription>
            </CardHeader>
            <CardContent className="px-8 pb-8">
                <div className="space-y-3">
                    <Textarea
                        id="experience"
                        placeholder={t('wizard.experiencePlaceholder')}
                        className="min-h-[300px] bg-transparent border-black/20 dark:border-white/20 text-black dark:text-white placeholder:text-black/30 dark:placeholder:text-white/30 rounded-xl focus-visible:ring-[3px] focus-visible:ring-black/20 dark:focus-visible:ring-white/20 transition-all duration-300 focus:shadow-md text-base leading-relaxed p-4"
                        value={formData.experience}
                        onChange={(e) => setFormData({ ...formData, experience: e.target.value })}
                    />
                    <p className="text-sm text-black/50 dark:text-white/50 font-bold flex items-center gap-1">{t('wizard.metrics')}</p>
                </div>
            </CardContent>
        </>
    );
}
