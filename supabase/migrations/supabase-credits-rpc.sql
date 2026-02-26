-- OmniCV: Secure Credit Deduction Architecture (PostgreSQL RPC)
-- This function completely eliminates Javascript race conditions by establishing the database as the pure source of truth for all credit top-ups, daily resets, and deductions.

CREATE OR REPLACE FUNCTION deduct_credit(user_id_param UUID, cost_param INTEGER)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_profile RECORD;
    v_is_new_day BOOLEAN;
    v_available_daily INTEGER;
    v_available_permanent INTEGER;
    v_remaining_cost INTEGER;
    v_now TIMESTAMP WITH TIME ZONE;
    
    -- Variables to hold the new state before committing
    v_new_daily INTEGER;
    v_new_permanent INTEGER;
BEGIN
    v_now := TIMEZONE('utc', NOW());

    -- 1. Lock the row for this specific user to completely prevent concurrent race conditions (Double Clicks)
    SELECT * INTO v_profile 
    FROM public.profiles 
    WHERE id = user_id_param 
    FOR UPDATE;

    -- If profile doesn't exist, fail gracefully so the backend can attempt auto-heal.
    IF NOT FOUND THEN
        RETURN jsonb_build_object('success', false, 'reason', 'Profile not found.');
    END IF;

    -- 2. Pro Users / Unlimited Tier Check
    IF v_profile.subscription_tier = 'pro' THEN
        RETURN jsonb_build_object(
            'success', true, 
            'is_unlimited', true, 
            'remaining_daily', v_profile.daily_credits, 
            'remaining_permanent', v_profile.total_credits
        );
    END IF;

    -- 3. Calculate Daily Reset Window (Strictly UTC)
    -- Compare the Year, Month, and Day of the last reset to NOW.
    IF (EXTRACT(YEAR FROM v_now) > EXTRACT(YEAR FROM v_profile.last_credit_reset)) OR
       (EXTRACT(MONTH FROM v_now) > EXTRACT(MONTH FROM v_profile.last_credit_reset)) OR
       (EXTRACT(DAY FROM v_now) > EXTRACT(DAY FROM v_profile.last_credit_reset)) THEN
        v_is_new_day := TRUE;
    ELSE
        v_is_new_day := FALSE;
    END IF;

    -- 4. Load Available Balances
    -- If it's a new day, they get exactly 1 daily credit instantly before the calculation starts.
    IF v_is_new_day THEN
        v_available_daily := 1;
    ELSE
        v_available_daily := COALESCE(v_profile.daily_credits, 0);
    END IF;

    v_available_permanent := COALESCE(v_profile.total_credits, 0);
    
    -- 5. Deduction Logic Execution (Waterfall: Try Daily first, then Permanent)
    v_new_daily := v_available_daily;
    v_new_permanent := v_available_permanent;
    v_remaining_cost := cost_param;

    -- Try to drain the daily credit pool first
    IF v_new_daily >= v_remaining_cost THEN
        v_new_daily := v_new_daily - v_remaining_cost;
        v_remaining_cost := 0;
    ELSIF v_new_daily > 0 THEN
        v_remaining_cost := v_remaining_cost - v_new_daily;
        v_new_daily := 0;
    END IF;

    -- Try to drain the permanent/purchased credit pool for the remainder
    IF v_remaining_cost > 0 THEN
        IF v_new_permanent >= v_remaining_cost THEN
            v_new_permanent := v_new_permanent - v_remaining_cost;
            v_remaining_cost := 0;
        ELSE
            -- FATAL: INSUFFICIENT FUNDS. Rollback transaction automatically.
            RETURN jsonb_build_object(
                'success', false, 
                'reason', 'Insufficient credits. Wait until tomorrow or upgrade to Pro to continue.',
                'remaining_daily', v_new_daily,
                'remaining_permanent', v_new_permanent
            );
        END IF;
    END IF;

    -- 6. Commit Successful Modification to Database Layer
    UPDATE public.profiles
    SET 
        daily_credits = v_new_daily,
        total_credits = v_new_permanent,
        last_credit_reset = v_now,           -- We successfully consumed a credit, so we stamp the current time.
        updated_at = v_now
    WHERE id = user_id_param;

    -- 7. Return the successful payload back to Next.js API
    RETURN jsonb_build_object(
        'success', true, 
        'is_unlimited', false,
        'remaining_daily', v_new_daily, 
        'remaining_permanent', v_new_permanent,
        'deducted', cost_param
    );
END;
$$;
