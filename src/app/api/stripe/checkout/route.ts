import { NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';
import { createClient } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
    try {
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await req.json();
        const { packageId } = body; // e.g., '10_credits'

        // Define pricing. Ideally, these Price IDs are stored in the DB, but hardcoding for simplicity here as per Omni strategy
        const prices: Record<string, string> = {
            '10_credits': process.env.STRIPE_PRICE_ID_10_CREDITS || 'price_10_credits_placeholder',
            '25_credits': process.env.STRIPE_PRICE_ID_25_CREDITS || 'price_25_credits_placeholder',
        };

        const priceId = prices[packageId];
        if (!priceId) {
            return NextResponse.json({ error: 'Invalid package selected' }, { status: 400 });
        }

        // Create a Stripe Checkout session
        const session = await stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            billing_address_collection: 'required',
            customer_email: user.email,
            line_items: [
                {
                    price: priceId,
                    quantity: 1,
                },
            ],
            mode: 'payment',
            success_url: `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/dashboard?success=true`,
            cancel_url: `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/dashboard?canceled=true`,
            client_reference_id: user.id, // Extremely important: Links the Stripe purchase back to the Supabase User ID in the webhook
            metadata: {
                packageId: packageId
            }
        });

        return NextResponse.json({ sessionId: session.id, url: session.url });
    } catch (err: any) {
        console.error('Stripe Checkout Error:', err);
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}
