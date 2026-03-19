import Stripe from 'stripe';
import { NextResponse } from 'next/server';

import { stripe } from '@/lib/stripe';
import { getSupabaseAdminClient } from '@/lib/supabase/admin';

export const dynamic = 'force-dynamic';

const ACTIVE_SUBSCRIPTION_STATUSES = new Set(['active', 'trialing']);

function resolveSubscriptionTier(status: string) {
    return ACTIVE_SUBSCRIPTION_STATUSES.has(status) ? 'pro' : 'free';
}

async function syncSubscriptionState({
    userId,
    customerId,
    subscriptionId,
    subscriptionStatus,
}: {
    userId?: string | null;
    customerId?: string | null;
    subscriptionId?: string | null;
    subscriptionStatus: string;
}) {
    const supabaseAdmin = getSupabaseAdminClient();
    const subscriptionTier = resolveSubscriptionTier(subscriptionStatus);

    let query = supabaseAdmin.from('profiles').select('id, total_credits');
    if (userId) {
        query = query.eq('id', userId);
    } else if (customerId) {
        query = query.eq('stripe_customer_id', customerId);
    }

    const { data: profile } = await query.single();
    if (!profile) {
        return;
    }

    const nextCredits = subscriptionTier === 'pro'
        ? 9999
        : Math.min(profile.total_credits || 2, 2);

    await supabaseAdmin
        .from('profiles')
        .update({
            subscription_tier: subscriptionTier,
            total_credits: nextCredits,
            stripe_customer_id: customerId || null,
            stripe_subscription_id: subscriptionId || null,
            stripe_subscription_status: subscriptionStatus,
        })
        .eq('id', profile.id);
}

async function logStripeEvent(userId: string, sessionId: string, type: string, metadata?: Record<string, unknown>) {
    const supabaseAdmin = getSupabaseAdminClient();
    await supabaseAdmin.from('credit_transactions').insert({
        user_id: userId,
        amount: 0,
        type,
        stripe_session_id: sessionId,
        metadata: metadata || null,
    });
}

export async function POST(req: Request) {
    if (!process.env.STRIPE_WEBHOOK_SECRET) {
        console.error('Missing STRIPE_WEBHOOK_SECRET');
        return NextResponse.json({ error: 'STRIPE_WEBHOOK_SECRET missing' }, { status: 500 });
    }

    let event: Stripe.Event;

    try {
        const body = await req.text();
        const signature = req.headers.get('stripe-signature') as string;

        event = stripe.webhooks.constructEvent(
            body,
            signature,
            process.env.STRIPE_WEBHOOK_SECRET
        );
    } catch (err: any) {
        console.error('Webhook signature verification failed.', err.message);
        return NextResponse.json({ error: err.message }, { status: 400 });
    }

    try {
        switch (event.type) {
            case 'checkout.session.completed': {
                const session = event.data.object as Stripe.Checkout.Session;
                const userId = session.client_reference_id || session.metadata?.userId;
                const packageId = session.metadata?.packageId;

                if (!userId || packageId !== 'pro_yearly') {
                    break;
                }

                const supabaseAdmin = getSupabaseAdminClient();
                const { data: existingTx } = await supabaseAdmin
                    .from('credit_transactions')
                    .select('id')
                    .eq('stripe_session_id', session.id)
                    .single();

                if (existingTx) {
                    break;
                }

                await syncSubscriptionState({
                    userId,
                    customerId: typeof session.customer === 'string' ? session.customer : session.customer?.id || null,
                    subscriptionId: typeof session.subscription === 'string' ? session.subscription : session.subscription?.id || null,
                    subscriptionStatus: 'active',
                });

                await logStripeEvent(userId, session.id, 'subscription_checkout_completed', {
                    packageId,
                });
                break;
            }

            case 'customer.subscription.updated':
            case 'customer.subscription.deleted': {
                const subscription = event.data.object as Stripe.Subscription;
                await syncSubscriptionState({
                    customerId: typeof subscription.customer === 'string' ? subscription.customer : subscription.customer.id,
                    subscriptionId: subscription.id,
                    subscriptionStatus: subscription.status,
                });
                break;
            }

            case 'invoice.payment_failed': {
                const invoice = event.data.object as Stripe.Invoice;
                const subscriptionId =
                    (invoice as any).subscription ||
                    (invoice as any).parent?.subscription_details?.subscription ||
                    null;

                await syncSubscriptionState({
                    customerId: typeof invoice.customer === 'string' ? invoice.customer : invoice.customer?.id || null,
                    subscriptionId: typeof subscriptionId === 'string' ? subscriptionId : subscriptionId?.id || null,
                    subscriptionStatus: 'past_due',
                });
                break;
            }

            default:
                break;
        }
    } catch (error) {
        console.error('Stripe webhook handler failed:', error);
        return NextResponse.json({ error: 'Webhook handler failed' }, { status: 500 });
    }

    return NextResponse.json({ received: true });
}
