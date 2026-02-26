'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { Loader2, Trash2, CreditCard, User, Globe, AlertTriangle } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useTranslation } from '@/components/I18nProvider';

export default function SettingsClient({
    user,
    credits,
    subscriptionTier
}: {
    user: { email: string; id: string };
    credits: { remaining: number; isUnlimited: boolean };
    subscriptionTier: string;
}) {
    const router = useRouter();
    const { t } = useTranslation();
    const [isDeleting, setIsDeleting] = useState(false);
    const [isManagingBilling, setIsManagingBilling] = useState(false);
    // Language logic placeholder - tying into your existing i18n
    const [language, setLanguage] = useState(
        typeof window !== 'undefined' ? localStorage.getItem('language') || 'English' : 'English'
    );

    const handleLanguageChange = (val: string) => {
        setLanguage(val);
        localStorage.setItem('language', val);
        toast.success(t('settings.languageSet').replace('{val}', val));
        setTimeout(() => window.location.reload(), 1000);
    };

    const handleManageBilling = async () => {
        setIsManagingBilling(true);
        try {
            // Check if there is a portal endpoint. If not, fallback to pricing.
            const res = await fetch('/api/stripe/portal', { method: 'POST' });
            if (res.ok) {
                const { url } = await res.json();
                if (url) {
                    window.location.href = url;
                    return;
                }
            }
            // Fallback to pricing page if no portal or user is free
            router.push('/pricing');
        } catch (error) {
            console.error('Billing redirect error:', error);
            router.push('/pricing');
        } finally {
            setIsManagingBilling(false);
        }
    };

    const handleDeleteAccount = async () => {
        if (!confirm(t('settings.deleteAccountConfirm'))) {
            return;
        }

        setIsDeleting(true);
        const deleteToast = toast.loading(t('settings.deletingAccount'));

        try {
            const res = await fetch('/api/user/delete', {
                method: 'DELETE',
            });

            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.error || 'Failed to delete account');
            }

            toast.success(t('settings.accountDeleted'), { id: deleteToast });
            router.push('/login');

        } catch (error: any) {
            console.error('Delete error:', error);
            toast.error(error.message || 'An error occurred while deleting your account.', { id: deleteToast });
            setIsDeleting(false);
        }
    };

    return (
        <div className="space-y-8 font-sans">
            <div className="mb-8 border-b border-black/10 dark:border-white/10 pb-4">
                <h1 className="text-3xl font-black tracking-tight mb-2 uppercase">{t('settings.title')}</h1>
                <p className="text-black/60 dark:text-white/60">
                    {t('settings.subtitle')}
                </p>
            </div>

            {/* Account Information Card */}
            <Card className="border-black/10 dark:border-white/10 shadow-sm rounded-xl">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2"><User className="w-5 h-5" /> {t('settings.accountDetails')}</CardTitle>
                    <CardDescription>{t('settings.accountDesc')}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="space-y-1">
                        <Label className="text-black/60 dark:text-white/60">{t('settings.emailAddress')}</Label>
                        <p className="font-semibold">{user.email}</p>
                    </div>
                    <div className="space-y-1">
                        <Label className="text-black/60 dark:text-white/60">{t('settings.accountId')}</Label>
                        <p className="text-sm font-mono text-black/40 dark:text-white/40">{user.id}</p>
                    </div>
                </CardContent>
            </Card>

            {/* Subscription & Credits Card */}
            <Card className="border-black/10 dark:border-white/10 shadow-sm rounded-xl">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2"><CreditCard className="w-5 h-5" /> {t('settings.subscriptionCredits')}</CardTitle>
                    <CardDescription>{t('settings.subscriptionDesc')}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1">
                            <Label className="text-black/60 dark:text-white/60">{t('settings.currentPlan')}</Label>
                            <p className="font-bold text-lg uppercase tracking-wider">
                                {subscriptionTier === 'pro' ? t('settings.proUnlimited') : t('settings.freeTier')}
                            </p>
                        </div>
                        <div className="space-y-1">
                            <Label className="text-black/60 dark:text-white/60">{t('settings.availableCredits')}</Label>
                            <p className="font-bold text-lg">
                                {credits.isUnlimited ? <span className="text-green-600 dark:text-green-400">{t('settings.unlimited')}</span> : credits.remaining}
                            </p>
                        </div>
                    </div>
                </CardContent>
                <CardFooter className="bg-slate-50 dark:bg-white/5 border-t border-black/10 dark:border-white/10 pt-6 rounded-b-xl">
                    <Button
                        onClick={handleManageBilling}
                        disabled={isManagingBilling}
                        className="bg-black text-white hover:bg-black/80 dark:bg-white dark:text-black dark:hover:bg-white/90 font-bold"
                    >
                        {isManagingBilling ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
                        {t('settings.manageSubscription')}
                    </Button>
                </CardFooter>
            </Card>

            {/* Preferences Card */}
            <Card className="border-black/10 dark:border-white/10 shadow-sm rounded-xl">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2"><Globe className="w-5 h-5" /> {t('settings.preferences')}</CardTitle>
                    <CardDescription>{t('settings.preferencesDesc')}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="space-y-2 max-w-[200px]">
                        <Label className="text-black/60 dark:text-white/60">{t('settings.outputLanguage')}</Label>
                        <Select value={language} onValueChange={handleLanguageChange}>
                            <SelectTrigger>
                                <SelectValue placeholder="Select Language" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="English">English</SelectItem>
                                <SelectItem value="Turkish">Türkçe</SelectItem>
                                <SelectItem value="Spanish">Español</SelectItem>
                                <SelectItem value="French">Français</SelectItem>
                                <SelectItem value="German">Deutsch</SelectItem>
                                <SelectItem value="Italian">Italiano</SelectItem>
                                <SelectItem value="Dutch">Nederlands</SelectItem>
                                <SelectItem value="Russian">Русский</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </CardContent>
            </Card>

            {/* Danger Zone Card */}
            <Card className="border-red-200 bg-red-50 dark:bg-red-950/20 dark:border-red-900/50 shadow-sm rounded-xl">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-red-600 dark:text-red-400"><AlertTriangle className="w-5 h-5" /> {t('settings.dangerZone')}</CardTitle>
                    <CardDescription className="text-red-600/70 dark:text-red-400/70">{t('settings.dangerZoneDesc')}</CardDescription>
                </CardHeader>
                <CardContent>
                    <p className="text-sm text-red-800 dark:text-red-200 mb-4">
                        {t('settings.deleteWarning')}
                    </p>
                    <Button
                        variant="destructive"
                        onClick={handleDeleteAccount}
                        disabled={isDeleting}
                        className="font-bold"
                    >
                        {isDeleting ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Trash2 className="w-4 h-4 mr-2" />}
                        {t('settings.permanentlyDelete')}
                    </Button>
                </CardContent>
            </Card>
        </div>
    );
}
