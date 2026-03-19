import { NextResponse } from 'next/server';
import { z } from 'zod';

import { stripe } from '@/lib/stripe';
import { createClient } from '@/lib/supabase/server';
import { getSiteUrl } from '@/lib/env';
import { parseJsonBody, RequestGuardError } from '@/lib/request-guards';

export const dynamic = 'force-dynamic';

const schema = z.object({
    packageId: z.literal('pro_yearly'),
}).strict();

export async function POST(req: Request) {
    try {
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { packageId } = await parseJsonBody(req, schema, { maxBytes: 512 });

        if (!process.env.STRIPE_PRICE_ID_PRO_YEARLY) {
            return NextResponse.json({ error: 'Stripe pricing is not configured on the server.' }, { status: 500 });
        }

        const { data: profile } = await supabase
            .from('profiles')
            .select('stripe_customer_id')
            .eq('id', user.id)
            .single();

        let customerId = profile?.stripe_customer_id || null;
        if (!customerId) {
            const customer = await stripe.customers.create({
                email: user.email || undefined,
                metadata: {
                    supabaseUserId: user.id,
                }
            });
            customerId = customer.id;

            await supabase
                .from('profiles')
                .update({ stripe_customer_id: customerId })
                .eq('id', user.id);
        }

        const siteUrl = getSiteUrl();
        const session = await stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            billing_address_collection: 'required',
            customer: customerId,
            line_items: [
                {
                    price: process.env.STRIPE_PRICE_ID_PRO_YEARLY,
                    quantity: 1,
                },
            ],
            mode: 'subscription',
            success_url: `${siteUrl}/success`,
            cancel_url: `${siteUrl}/pricing?canceled=true`,
            client_reference_id: user.id,
            metadata: {
                packageId,
                userId: user.id,
            }
        });

        return NextResponse.json({ sessionId: session.id, url: session.url });
    } catch (err: any) {
        if (err instanceof RequestGuardError) {
            return NextResponse.json(err.payload, { status: err.status });
        }

        console.error('Stripe Checkout Error:', err);
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}
