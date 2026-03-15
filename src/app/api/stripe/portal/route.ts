import { NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';
import { createClient } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
    try {
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user || !user.email) {
            return NextResponse.json({ error: 'Unauthorized or missing email' }, { status: 401 });
        }

        // Search for the Stripe customer by email
        const customers = await stripe.customers.list({
            email: user.email,
            limit: 1
        });

        if (customers.data.length === 0) {
            // No customer found, they probably haven't subscribed yet
            return NextResponse.json({ url: null, redirect: '/pricing' });
        }

        const { origin } = new URL(req.url);
        const customerId = customers.data[0].id;
        const returnUrl = `${origin}/settings`;

        // Create Stripe Customer Portal session
        const portalSession = await stripe.billingPortal.sessions.create({
            customer: customerId,
            return_url: returnUrl,
        });

        return NextResponse.json({ url: portalSession.url });

    } catch (err: any) {
        console.error('Stripe Portal Error:', err);
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}
