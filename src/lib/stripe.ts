import Stripe from 'stripe';

// Avoid throwing top-level errors for missing env variables so Next.js static builds on Vercel do not crash.
export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || 'sk_test_mock_key_for_build', {
    // Dashboard üzerinde görünen 2026-02-25.clover versiyonu ile eşleşecek şekilde güncellendi
    // Type checking'e takılmaması için as any eklendi (paket sürümünde type'ı olmayabilir)
    apiVersion: '2026-02-25.clover' as any,
    appInfo: {
        name: 'CV Maker Omni',
        version: '1.0.0',
    }
});
