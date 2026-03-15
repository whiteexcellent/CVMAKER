import { CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { useTranslation } from '@/components/I18nProvider';

interface WizardStep4Props {
    formData: any;
    setFormData: (data: any) => void;
}

export function WizardStep4({ formData, setFormData }: WizardStep4Props) {
    const { t } = useTranslation();

    return (
        <>
            <CardHeader className="pt-8 pb-4">
                <CardTitle className="text-3xl font-display font-black tracking-tight text-black dark:text-white">{t('wizard.capabilities')}</CardTitle>
                <CardDescription className="text-black/50 dark:text-white/50 text-base mt-2 font-light">{t('wizard.capabilitiesDesc')}</CardDescription>
            </CardHeader>
            <CardContent className="px-8 pb-8">
                <div className="space-y-3">
                    <Textarea
                        id="skills"
                        placeholder={t('wizard.skillsPlaceholder')}
                        className="min-h-[200px] bg-transparent border-black/20 dark:border-white/20 text-black dark:text-white placeholder:text-black/30 dark:placeholder:text-white/30 rounded-xl focus-visible:ring-[3px] focus-visible:ring-black/20 dark:focus-visible:ring-white/20 transition-all duration-300 focus:shadow-md text-base leading-relaxed p-4"
                        value={formData.skills}
                        onChange={(e) => setFormData({ ...formData, skills: e.target.value })}
                    />
                </div>
            </CardContent>
        </>
    );
}
