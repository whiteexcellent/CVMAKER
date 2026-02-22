import Stripe from 'stripe';

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || 'DUMMY_KEY_FOR_BUILD', {
    // Use the exact literal typed in @types/stripe
    apiVersion: '2026-01-28.clover',
    appInfo: {
        name: 'CV Maker Omni',
        version: '1.0.0',
    }
});
