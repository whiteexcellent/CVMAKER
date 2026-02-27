import { NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';
import { supabaseAdmin } from '@/lib/supabase/admin';

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
    if (!process.env.STRIPE_WEBHOOK_SECRET) {
        console.error('Missing STRIPE_WEBHOOK_SECRET');
        return NextResponse.json({ error: 'STRIPE_WEBHOOK_SECRET missing' }, { status: 500 });
    }

    let event;

    try {
        const body = await req.text();
        const signature = req.headers.get('stripe-signature') as string;

        // Verify Stripe signature
        event = stripe.webhooks.constructEvent(
            body,
            signature,
            process.env.STRIPE_WEBHOOK_SECRET!
        );
    } catch (err: any) {
        console.error(`Webhook signature verification failed.`, err.message);
        return NextResponse.json({ error: err.message }, { status: 400 });
    }

    // Handle the event
    switch (event.type) {
        case 'checkout.session.completed':
            const session = event.data.object as any;
            const userId = session.client_reference_id;
            const packageId = session.metadata?.packageId;

            if (!userId || !packageId) {
                console.error('Missing userId or packageId in Stripe session metadata');
                break;
            }

            if (packageId === 'pro_yearly') {
                const { data: existingTx } = await supabaseAdmin
                    .from('credit_transactions')
                    .select('id')
                    .eq('stripe_session_id', session.id)
                    .single();

                if (existingTx) {
                    console.log(`Order for session ${session.id} was already fulfilled. Ignoring.`);
                    break;
                }

                // Upgrade to Pro
                const { error: updateErr } = await supabaseAdmin
                    .from('profiles')
                    .update({ subscription_tier: 'pro', total_credits: 9999 })
                    .eq('id', userId);

                if (updateErr) {
                    console.error("Failed to upgrade user to Pro", updateErr);
                    break;
                }

                await supabaseAdmin.from('credit_transactions').insert({
                    user_id: userId,
                    amount: 0,
                    type: 'subscription',
                    stripe_session_id: session.id
                });

                console.log(`Successfully fulfilled order for user ${userId}. Upgraded to Pro Yearly.`);
            } else {
                console.warn(`Unhandled packageId: ${packageId} for user ${userId}`);
            }
            break;

        default:
            console.log(`Unhandled event type ${event.type}`);
    }

    // Return a 200 response to acknowledge receipt of the event
    return NextResponse.json({ received: true });
}
