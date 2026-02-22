import { NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';
import { createClient } from '@supabase/supabase-js';

export const dynamic = 'force-dynamic';

// Initialize a Supabase ADMIN client because webhooks run outside of an authenticated user session.
// We MUST use the SERVICE_ROLE_KEY to bypass Row Level Security.
const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://dummy.supabase.co',
    process.env.SUPABASE_SERVICE_ROLE_KEY || 'dummy_key'
);

export async function POST(req: Request) {
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

            // Determine credits to add
            let creditsToAdd = 0;
            if (packageId === '10_credits') creditsToAdd = 10;
            if (packageId === '25_credits') creditsToAdd = 25;

            if (creditsToAdd > 0) {
                // 1. Fetch current profile
                const { data: profile, error: profileErr } = await supabaseAdmin
                    .from('profiles')
                    .select('total_credits')
                    .eq('id', userId)
                    .single();

                if (profileErr || !profile) {
                    console.error("User profile not found for webhook fulfillment", userId);
                    break;
                }

                // 2. Fulfill Order: Add credits
                const { error: updateErr } = await supabaseAdmin
                    .from('profiles')
                    .update({ total_credits: profile.total_credits + creditsToAdd })
                    .eq('id', userId);

                if (updateErr) {
                    console.error("Failed to add credits to user", updateErr);
                    break;
                }

                // 3. Record Transaction Ledger
                await supabaseAdmin.from('credit_transactions').insert({
                    user_id: userId,
                    amount: creditsToAdd,
                    type: 'purchase',
                    stripe_session_id: session.id
                });

                console.log(`Successfully fulfilled order for user ${userId}. Added ${creditsToAdd} credits.`);
            }
            break;

        default:
            console.log(`Unhandled event type ${event.type}`);
    }

    // Return a 200 response to acknowledge receipt of the event
    return NextResponse.json({ received: true });
}
