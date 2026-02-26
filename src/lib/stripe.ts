import Stripe from 'stripe';

if (!process.env.STRIPE_SECRET_KEY) {
    throw new Error('STRIPE_SECRET_KEY is required');
}

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
    // Use the exact literal typed in @types/stripe
    apiVersion: '2026-01-28.clover',
    appInfo: {
        name: 'CV Maker Omni',
        version: '1.0.0',
    }
});
