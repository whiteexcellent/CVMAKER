-- 1. ADD MISSING SHARE COLUMNS
ALTER TABLE public.resumes 
ADD COLUMN IF NOT EXISTS share_enabled BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS share_id TEXT UNIQUE,
ADD COLUMN IF NOT EXISTS share_expires_at TIMESTAMP WITH TIME ZONE;


-- 2. FIX CREDIT DEDUCTION SQL BUG
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
    
    v_new_daily INTEGER;
    v_new_permanent INTEGER;
BEGIN
    v_now := TIMEZONE('utc', NOW());

    -- Lock row
    SELECT * INTO v_profile 
    FROM public.profiles 
    WHERE id = user_id_param 
    FOR UPDATE;

    IF NOT FOUND THEN
        RETURN jsonb_build_object('success', false, 'reason', 'Profile not found.');
    END IF;

    IF v_profile.subscription_tier = 'pro' THEN
        RETURN jsonb_build_object(
            'success', true, 
            'is_unlimited', true, 
            'remaining_daily', v_profile.daily_credits, 
            'remaining_permanent', v_profile.total_credits
        );
    END IF;

    -- SAFELY Calculate Daily Reset Window (Strictly UTC) using DATE casting
    -- This fixes the bug where NULL last_credit_reset caused FALSE evaluation
    IF v_profile.last_credit_reset IS NULL OR DATE(v_now) > DATE(v_profile.last_credit_reset) THEN
        v_is_new_day := TRUE;
    ELSE
        v_is_new_day := FALSE;
    END IF;

    IF v_is_new_day THEN
        v_available_daily := 1;
    ELSE
        v_available_daily := COALESCE(v_profile.daily_credits, 0);
    END IF;

    v_available_permanent := COALESCE(v_profile.total_credits, 0);
    
    v_new_daily := v_available_daily;
    v_new_permanent := v_available_permanent;
    v_remaining_cost := cost_param;

    -- Drain daily first
    IF v_new_daily >= v_remaining_cost THEN
        v_new_daily := v_new_daily - v_remaining_cost;
        v_remaining_cost := 0;
    ELSIF v_new_daily > 0 THEN
        v_remaining_cost := v_remaining_cost - v_new_daily;
        v_new_daily := 0;
    END IF;

    -- Drain permanent second
    IF v_remaining_cost > 0 THEN
        IF v_new_permanent >= v_remaining_cost THEN
            v_new_permanent := v_new_permanent - v_remaining_cost;
            v_remaining_cost := 0;
        ELSE
            RETURN jsonb_build_object(
                'success', false, 
                'reason', 'Insufficient credits. Wait until tomorrow or upgrade to Pro to continue.',
                'remaining_daily', v_new_daily,
                'remaining_permanent', v_new_permanent
            );
        END IF;
    END IF;

    UPDATE public.profiles
    SET 
        daily_credits = v_new_daily,
        total_credits = v_new_permanent,
        last_credit_reset = v_now,
        updated_at = v_now
    WHERE id = user_id_param;

    RETURN jsonb_build_object(
        'success', true, 
        'is_unlimited', false,
        'remaining_daily', v_new_daily, 
        'remaining_permanent', v_new_permanent,
        'deducted', cost_param
    );
END;
$$;
