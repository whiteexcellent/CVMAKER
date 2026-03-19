import { NextResponse } from 'next/server';

import { stripe } from '@/lib/stripe';
import { createClient } from '@/lib/supabase/server';
import { getSiteUrl } from '@/lib/env';

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
    try {
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { data: profile } = await supabase
            .from('profiles')
            .select('stripe_customer_id')
            .eq('id', user.id)
            .single();

        if (!profile?.stripe_customer_id) {
            return NextResponse.json({ url: null, redirect: '/pricing' });
        }

        const portalSession = await stripe.billingPortal.sessions.create({
            customer: profile.stripe_customer_id,
            return_url: `${getSiteUrl()}/settings`,
        });

        return NextResponse.json({ url: portalSession.url });
    } catch (err: any) {
        console.error('Stripe Portal Error:', err);
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}
