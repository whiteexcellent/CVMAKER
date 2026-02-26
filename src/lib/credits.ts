import { createClient } from '@/lib/supabase/server'

export async function checkAndDeductCredit(userId: string, cost: number = 1) {
    const supabase = await createClient()

    // 1. Get the user's profile
    const { data: profile, error } = await supabase
        .from('profiles')
        .select('daily_credits, last_credit_reset, subscription_tier')
        .eq('id', userId)
        .single()

    if (error || !profile) {
        console.warn('Profile not found, attempting auto-heal for user:', userId)

        // Auto-heal missing profile
        const { data: authUser, error: authError } = await supabase.auth.getUser()

        if (!authError && authUser?.user?.email) {
            const now = new Date().toISOString()
            const { data: newProfile, error: insertError } = await supabase
                .from('profiles')
                .upsert({
                    id: userId,
                    email: authUser.user.email,
                    full_name: authUser.user.user_metadata?.full_name || 'User',
                    total_credits: 2,
                    daily_credits: 1,
                    last_credit_reset: now,
                    subscription_tier: 'free'
                })
                .select('id')
                .single()

            if (!insertError && newProfile) {
                // Successfully auto-healed, proceed with RPC
                return executeDeductionRpc(supabase, userId, cost)
            } else {
                console.error("Auto-heal upsert failed, but user exists in Auth. Allowing safe fallback:", insertError)
                return { allowed: true, isUnlimited: false, remainingCredits: 1 }
            }
        }

        return { allowed: false, reason: 'Profile not found and auto-heal failed. Please log out and back in.' }
    }

    return executeDeductionRpc(supabase, userId, cost)
}

async function executeDeductionRpc(supabase: any, userId: string, cost: number) {
    // 1. Execute the Atomic SQL Deduction
    const { data: result, error: rpcError } = await supabase.rpc('deduct_credit', {
        user_id_param: userId,
        cost_param: cost
    });

    if (rpcError) {
        console.error("Critical: Failed to execute credit deduction RPC:", rpcError);
        return { allowed: false, reason: "Payment system error. Please try again later." };
    }

    // 2. Process Result from PostgreSQL
    if (!result.success) {
        return { allowed: false, reason: result.reason || 'Insufficient Credits.' };
    }

    // 3. (Optional) You can still log transactions here if needed, but since it's usage, 
    // keeping it inside Javascript is fine for the ledger, as the balance deduction is already safely processed.
    // The previous implementation did not mandate transaction logs for every single usage strictly, so we just return.

    return {
        allowed: true,
        isUnlimited: result.is_unlimited,
        remainingCredits: result.remaining_daily + result.remaining_permanent
    };
}

import { createClient as createAdminClient } from '@supabase/supabase-js';

export async function refundCredit(userId: string, amount: number = 1) {
    if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
        console.error("Refund failed: Missing SUPABASE_SERVICE_ROLE_KEY");
        return;
    }

    try {
        const adminAuthClient = createAdminClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.SUPABASE_SERVICE_ROLE_KEY!
        );

        // Use atomic RPC to add credits back — prevents race conditions
        const { error } = await adminAuthClient.rpc('add_credits', {
            user_id_param: userId,
            amount_param: amount
        });

        if (error) {
            console.error(`Refund RPC failed for user ${userId}:`, error);
            return;
        }

        console.info(`Refunded ${amount} credit(s) atomically to user ${userId}`);
    } catch (e) {
        console.error("Critical error attempting to refund credit:", e);
    }
}
