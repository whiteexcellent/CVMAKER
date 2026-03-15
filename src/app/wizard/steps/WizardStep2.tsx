import { CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { useTranslation } from '@/components/I18nProvider';

interface WizardStep2Props {
    formData: any;
    setFormData: (data: any) => void;
}

export function WizardStep2({ formData, setFormData }: WizardStep2Props) {
    const { t } = useTranslation();

    return (
        <>
            <CardHeader className="pt-8 pb-4">
                <CardTitle className="text-3xl font-display font-black tracking-tight text-black dark:text-white">{t('wizard.education')}</CardTitle>
                <CardDescription className="text-black/50 dark:text-white/50 text-base mt-2 font-light">{t('wizard.educationDesc')}</CardDescription>
            </CardHeader>
            <CardContent className="px-8 pb-8">
                <div className="space-y-3">
                    <Textarea
                        id="education"
                        placeholder={t('wizard.educationPlaceholder')}
                        className="min-h-[250px] bg-transparent border-black/20 dark:border-white/20 text-black dark:text-white placeholder:text-black/30 dark:placeholder:text-white/30 rounded-xl focus-visible:ring-[3px] focus-visible:ring-black/20 dark:focus-visible:ring-white/20 transition-all duration-300 focus:shadow-md text-base leading-relaxed p-4"
                        value={formData.education}
                        onChange={(e) => setFormData({ ...formData, education: e.target.value })}
                    />
                    <p className="text-sm text-black/50 dark:text-white/50 font-bold">{t('wizard.aiStructures')}</p>
                </div>
            </CardContent>
        </>
    );
}
