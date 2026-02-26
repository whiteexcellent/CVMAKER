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
        const { packageId } = body;

        if (!process.env.STRIPE_PRICE_ID_PRO_YEARLY) {
            return NextResponse.json({ error: 'Stripe pricing is not configured on the server.' }, { status: 500 });
        }

        if (packageId !== 'pro_yearly') {
            return NextResponse.json({ error: 'Invalid package selected' }, { status: 400 });
        }

        const priceId = process.env.STRIPE_PRICE_ID_PRO_YEARLY;
        const mode = 'subscription';

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
            mode: mode as any,
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
