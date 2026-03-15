'use client';

import { ThemeToggle } from '@/components/ThemeToggle';
import { Button } from '@/components/ui/button';
import { Check, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import { useTranslation } from '@/components/I18nProvider'
import { LanguageToggle } from '@/components/LanguageToggle'

export default function PricingPage() {
    const { t } = useTranslation();
    const router = useRouter();
    const [loadingPlan, setLoadingPlan] = useState<string | null>(null);
    const [isPro, setIsPro] = useState(false);

    useEffect(() => {
        const checkPro = async () => {
            const supabase = createClient();
            const { data: { user } } = await supabase.auth.getUser();
            if (user) {
                const { data } = await supabase.from('profiles').select('subscription_tier').eq('id', user.id).single();
                if (data?.subscription_tier === 'pro') {
                    setIsPro(true);
                }
            }
        };
        checkPro();
    }, []);

    const pricingPlans = [
        {
            packageId: 'free',
            planName: t('pricing.starterName'),
            description: t('pricing.starterDesc'),
            price: t('pricing.starterPrice'),
            features: [t('pricing.starterF1'), t('pricing.starterF2'), t('pricing.starterF3')],
            buttonText: t('pricing.starterBtn'),
            buttonVariant: 'outline'
        },
        {
            packageId: 'pro_yearly',
            planName: t('pricing.eliteName'),
            description: t('pricing.eliteDesc'),
            price: t('pricing.elitePrice'),
            features: [t('pricing.eliteF1'), t('pricing.eliteF2'), t('pricing.eliteF3'), t('pricing.eliteF4')],
            buttonText: t('pricing.eliteBtn'),
            isPopular: true,
            buttonVariant: 'default'
        }
    ];

    const handleCheckout = async (packageId: string) => {
        if (packageId === 'free') {
            window.location.href = '/login';
            return;
        }

        if (isPro && packageId === 'pro_yearly') {
            router.push('/dashboard');
            return;
        }

        setLoadingPlan(packageId);
        try {
            const res = await fetch('/api/stripe/checkout', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ packageId })
            });
            const data = await res.json();
            if (data.url) {
                window.location.href = data.url;
            } else {
                alert(data.error || 'Failed to initialize checkout');
                setLoadingPlan(null);
            }
        } catch (error) {
            console.error(error);
            alert('Payment execution failed');
            setLoadingPlan(null);
        }
    };

    return (
        <div className="min-h-screen bg-white dark:bg-black text-black dark:text-white font-sans selection:bg-black/10 dark:selection:bg-white/20 transition-colors duration-300 flex flex-col">
            <header className="absolute top-0 w-full z-50 px-6 py-6 flex justify-between items-center max-w-7xl mx-auto left-0 right-0">
                <Link href="/" className="text-xl font-black tracking-tighter hover:opacity-80 transition-opacity">
                    OMNICV
                </Link>
                <div className="flex items-center gap-4">
                    <LanguageToggle />
                    <ThemeToggle />
                </div>
            </header>

            <main className="flex-1 flex flex-col items-center pt-32 pb-24 px-6 md:px-12 max-w-6xl mx-auto w-full">
                <div className="text-center max-w-2xl mx-auto mb-16 space-y-6">
                    <h1 className="text-5xl md:text-7xl font-black tracking-tight leading-none bg-clip-text text-black dark:text-white whitespace-pre-line">
                        {t('pricing.title')}
                    </h1>
                    <p className="text-lg md:text-xl text-black/60 dark:text-white/60 font-light max-w-xl mx-auto">
                        {t('pricing.subtitle')}
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full max-w-3xl mx-auto">
                    {pricingPlans.map((plan) => (
                        <div
                            key={plan.planName}
                            className={`relative flex flex-col p-10 rounded-3xl transition-all duration-500 liquid-glass border ${plan.isPopular ? 'border-primary border-2 shadow-xl scale-100 md:scale-[1.02] z-10 hover:-translate-y-1 bg-white/40 dark:bg-black/40' : 'border-black/10 dark:border-white/10 shadow-sm hover:shadow-lg hover:-translate-y-1 bg-white/50 dark:bg-black/40'}`}
                        >
                            {plan.isPopular && (
                                <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 px-4 py-1.5 text-xs font-black uppercase tracking-wider bg-primary text-primary-foreground rounded-full shadow-sm z-20 whitespace-nowrap">
                                    {t('pricing.mostPopular')}
                                </div>
                            )}

                            <div className="mb-6">
                                <h3 className="text-2xl font-black">{plan.planName}</h3>
                                <p className="text-sm text-black/60 dark:text-white/60 mt-2 font-medium min-h-[40px]">{plan.description}</p>
                            </div>

                            <div className="my-6">
                                <span className="text-5xl font-black tracking-tighter">
                                    {plan.price === 'Free' || plan.price === t('pricing.starterPrice') ? plan.price : (
                                        <>
                                            <span className="text-2xl align-top font-bold mr-1">$</span>
                                            {plan.price}
                                        </>
                                    )}
                                </span>
                                {plan.price !== 'Free' && plan.price !== t('pricing.starterPrice') && <span className="text-black/50 dark:text-white/50 font-medium ml-1">/{plan.packageId === 'pro_yearly' ? t('pricing.yr') : t('pricing.mo')}</span>}
                            </div>

                            <ul className="flex-1 space-y-4 mb-8">
                                {plan.features.map((feature, i) => (
                                    <li key={feature} className="flex items-start gap-3">
                                        <Check className="w-5 h-5 opacity-100 shrink-0 mt-0.5" />
                                        <span className="text-sm font-medium">{feature}</span>
                                    </li>
                                ))}
                            </ul>

                            <Button
                                onClick={() => handleCheckout(plan.packageId)}
                                disabled={loadingPlan === plan.packageId || (isPro && plan.packageId === 'pro_yearly')}
                                className={`w-full h-14 font-bold px-8 rounded-xl transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] ${plan.buttonVariant === 'default'
                                    ? 'bg-primary hover:bg-primary/90 text-primary-foreground border-0'
                                    : 'bg-transparent border-2 border-primary/20 hover:border-primary/40 text-foreground hover:bg-accent'
                                    }`}
                            >
                                {isPro && plan.packageId === 'pro_yearly' ? t('common.active') || 'Current Plan' : loadingPlan === plan.packageId ? (
                                    <span className="flex items-center gap-2">
                                        <Loader2 className="w-4 h-4 animate-spin" />
                                        {t('pricing.loading')}
                                    </span>
                                ) : plan.buttonText}
                            </Button>
                        </div>
                    ))}
                </div>
            </main>
        </div>
    );
}
