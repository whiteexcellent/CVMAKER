"use client";

import { ModernPricingPage, PricingCardProps } from "@/components/ui/animated-glassy-pricing";

const pricingPlans: PricingCardProps[] = [
    {
        planName: 'Starter',
        description: 'Perfect for creating a simple, AI-optimized resume occasionally.',
        price: 'Free',
        features: ['2 Initial Free Credits', 'Standard AI Optimization', 'Export to PDF'],
        buttonText: 'Get Started Free',
        buttonVariant: 'secondary'
    },
    {
        planName: 'Pro',
        description: 'Best for active job seekers needing tailored applications.',
        price: '19',
        features: ['50 Credits / month', 'ATS Keyword Injection', 'Apify LinkedIn Import', 'Priority Claude 3.5 Processing'],
        buttonText: 'Upgrade to Pro',
        isPopular: true,
        buttonVariant: 'primary'
    },
    {
        planName: 'Elite',
        description: 'For career shifters and aggressive applications.',
        price: '49',
        features: ['200 Credits / month', 'Unlimited Scrape & Tailor (Indeed/Glassdoor)', 'Cover Letter Generation', 'Dedicated Support'],
        buttonText: 'Get Elite',
        buttonVariant: 'primary'
    },
];

export default function PricingPage() {
    return (
        <ModernPricingPage
            title={<>Invest in Your <span className="text-cyan-400">Future Career</span></>}
            subtitle="Start for free, then upgrade to unlock premium AI tailoring and Apify scrapers. Bypass the algorithms."
            plans={pricingPlans}
            showAnimatedBackground={true}
        />
    );
}
