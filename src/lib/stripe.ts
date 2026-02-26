import Stripe from 'stripe';

// Avoid throwing top-level errors for missing env variables so Next.js static builds on Vercel do not crash.
export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || 'sk_test_mock_key_for_build', {
    // Use the exact literal typed in @types/stripe
    apiVersion: '2026-01-28.clover',
    appInfo: {
        name: 'CV Maker Omni',
        version: '1.0.0',
    }
});
