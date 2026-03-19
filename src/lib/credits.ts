import { createClient } from '@/lib/supabase/server'
import { getSupabaseAdminClient } from '@/lib/supabase/admin'

async function logCreditTransaction(userId: string, amount: number, type: string, metadata?: Record<string, unknown>) {
    try {
        const supabaseAdmin = getSupabaseAdminClient();
        const { error } = await supabaseAdmin.from('credit_transactions').insert({
            user_id: userId,
            amount,
            type,
            metadata: metadata || null,
        });

        if (error) {
            console.error('Failed to record credit transaction:', error);
        }
    } catch (error) {
        console.error('Failed to initialize admin client for credit transaction logging:', error);
    }
}

export async function checkAndDeductCredit(userId: string, cost = 1, routeKey = 'usage') {
    const supabase = await createClient()

    const { data: profile, error } = await supabase
        .from('profiles')
        .select('daily_credits, last_credit_reset, subscription_tier')
        .eq('id', userId)
        .single()

    if (error || !profile) {
        console.warn('Profile not found, attempting auto-heal for user:', userId)

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
                return executeDeductionRpc(supabase, userId, cost, routeKey)
            }

            console.error('Auto-heal upsert failed. Blocking credit deduction request:', insertError)
        }

        return { allowed: false, reason: 'Profile not found and auto-heal failed. Please log out and back in.' }
    }

    return executeDeductionRpc(supabase, userId, cost, routeKey)
}

async function executeDeductionRpc(supabase: any, userId: string, cost: number, routeKey: string) {
    const { data: result, error: rpcError } = await supabase.rpc('deduct_credit', {
        user_id_param: userId,
        cost_param: cost
    });

    if (rpcError) {
        console.error('Critical: Failed to execute credit deduction RPC:', rpcError);
        return { allowed: false, reason: 'Payment system error. Please try again later.' };
    }

    if (!result.success) {
        return { allowed: false, reason: result.reason || 'Insufficient Credits.' };
    }

    await logCreditTransaction(userId, -cost, routeKey, {
        isUnlimited: result.is_unlimited,
        remainingDaily: result.remaining_daily,
        remainingPermanent: result.remaining_permanent,
    });

    return {
        allowed: true,
        isUnlimited: result.is_unlimited,
        remainingCredits: result.remaining_daily + result.remaining_permanent
    };
}

export async function refundCredit(userId: string, amount = 1, routeKey = 'refund') {
    try {
        const adminAuthClient = getSupabaseAdminClient();

        const { error } = await adminAuthClient.rpc('add_credits', {
            user_id_param: userId,
            amount_param: amount
        });

        if (error) {
            console.error(`Refund RPC failed for user ${userId}:`, error);
            return;
        }

        await logCreditTransaction(userId, amount, routeKey, {
            refunded: true,
        });
        console.info(`Refunded ${amount} credit(s) atomically to user ${userId}`);
    } catch (e) {
        console.error('Critical error attempting to refund credit:', e);
    }
}
