-- OMNICV COMPREHENSIVE SCHEMA FIX

-- 1. Create Missing Cover Letters Table
CREATE TABLE IF NOT EXISTS public.cover_letters (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  title TEXT DEFAULT 'My Cover Letter' NOT NULL,
  content JSONB NOT NULL DEFAULT '{}'::jsonb,
  job_description TEXT,
  status TEXT DEFAULT 'draft' NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()) NOT NULL
);

-- 1a. Secure the Cover Letters Table
ALTER TABLE public.cover_letters ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own cover_letters" 
ON public.cover_letters FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own cover_letters" 
ON public.cover_letters FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own cover_letters" 
ON public.cover_letters FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own cover_letters" 
ON public.cover_letters FOR DELETE USING (auth.uid() = user_id);

CREATE TRIGGER set_cover_letters_updated_at
BEFORE UPDATE ON public.cover_letters
FOR EACH ROW EXECUTE PROCEDURE public.handle_updated_at();

-- 2. Add Missing Share Columns for Resumes
ALTER TABLE public.resumes 
ADD COLUMN IF NOT EXISTS share_enabled BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS share_id TEXT UNIQUE,
ADD COLUMN IF NOT EXISTS share_expires_at TIMESTAMP WITH TIME ZONE;

-- 3. Add Missing Share Columns for Cover Letters
ALTER TABLE public.cover_letters
ADD COLUMN IF NOT EXISTS share_enabled BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS share_id TEXT UNIQUE,
ADD COLUMN IF NOT EXISTS share_expires_at TIMESTAMP WITH TIME ZONE;


-- 4. Fix Credit Deduction SQL Bug (NULL Date Comparison)
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
