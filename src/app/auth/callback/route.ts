import { NextResponse } from 'next/server'
// The client you created from the Server-Side Auth instructions
import { createClient, createAdminClient } from '@/lib/supabase/server'
import { getSiteUrl, sanitizeNextPath } from '@/lib/env'

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url)
    const code = searchParams.get('code')
    const next = sanitizeNextPath(searchParams.get('next'), '/dashboard')
    const siteUrl = getSiteUrl()

    if (code) {
        const supabase = await createClient()
        const { data: authData, error: authError } = await supabase.auth.exchangeCodeForSession(code)

        if (!authError && authData?.user) {
            const user = authData.user;

            // FAILSAFE: Ensure a profile exists in case the database trigger failed
            const { data: profile } = await supabase
                .from('profiles')
                .select('id')
                .eq('id', user.id)
                .single();

            if (!profile) {
                console.log(`Failsafe: Creating missing profile for user ${user.id}`);
                try {
                    const adminClient = await createAdminClient();

                    // Create profile
                    const { error: profileError } = await adminClient.from('profiles').insert({
                        id: user.id,
                        email: user.email!,
                        full_name: user.user_metadata?.full_name || '',
                        total_credits: 2, // Signup bonus
                        daily_credits: 1,
                        last_credit_reset: new Date().toISOString()
                    });

                    if (profileError) {
                        console.error("Failsafe profile insert error:", profileError);
                    } else {
                        console.log("Failsafe: Successfully recreated missing profile.");
                    }

                    // Record transaction
                    const { error: txError } = await adminClient.from('credit_transactions').insert({
                        user_id: user.id,
                        amount: 2,
                        type: 'signup_bonus'
                    });

                    if (txError) {
                        console.error("Failsafe tx insert error:", txError);
                    }
                } catch (adminError) {
                    console.error("Failed to initialize admin client or insert profile failsafe:", adminError);
                }
            }

            return NextResponse.redirect(new URL(next, siteUrl))
        }
    }

    // return the user to an error page with instructions
    return NextResponse.redirect(new URL('/auth/auth-code-error', siteUrl))
}
