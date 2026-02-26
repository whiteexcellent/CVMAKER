-- ============================================================
-- OMNICV — CONSOLIDATED SCHEMA MIGRATION
-- Run this ONCE in the Supabase SQL Editor (Dashboard → SQL Editor → New Query → Paste → Run)
-- Safe to re-run: All statements use IF NOT EXISTS / CREATE OR REPLACE
-- ============================================================

-- ============================
-- 0. UTILITY: handle_updated_at trigger function (if not exists)
-- ============================
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = TIMEZONE('utc', NOW());
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;


-- ============================
-- 1. PROFILES TABLE — Add credit & subscription columns
-- ============================
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS total_credits INTEGER DEFAULT 2,
ADD COLUMN IF NOT EXISTS daily_credits INTEGER DEFAULT 1,
ADD COLUMN IF NOT EXISTS last_credit_reset TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS subscription_tier TEXT DEFAULT 'free',
ADD COLUMN IF NOT EXISTS full_name TEXT;


-- ============================
-- 2. RESUMES TABLE — Add share & analytics columns
-- ============================
ALTER TABLE public.resumes
ADD COLUMN IF NOT EXISTS share_enabled BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS share_id TEXT UNIQUE,
ADD COLUMN IF NOT EXISTS share_expires_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS views INTEGER DEFAULT 0;


-- ============================
-- 3. COVER LETTERS TABLE
-- ============================
CREATE TABLE IF NOT EXISTS public.cover_letters (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  resume_id UUID REFERENCES public.resumes(id) ON DELETE SET NULL,
  title TEXT DEFAULT 'My Cover Letter' NOT NULL,
  content JSONB NOT NULL DEFAULT '{}'::jsonb,
  job_description TEXT,
  target_role TEXT,
  company_name TEXT,
  status TEXT DEFAULT 'draft' NOT NULL,
  share_id TEXT UNIQUE,
  share_enabled BOOLEAN DEFAULT FALSE,
  share_expires_at TIMESTAMP WITH TIME ZONE,
  views INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()) NOT NULL
);

ALTER TABLE public.cover_letters ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can view own cover_letters') THEN
    CREATE POLICY "Users can view own cover_letters" ON public.cover_letters FOR SELECT USING (auth.uid() = user_id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can insert own cover_letters') THEN
    CREATE POLICY "Users can insert own cover_letters" ON public.cover_letters FOR INSERT WITH CHECK (auth.uid() = user_id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can update own cover_letters') THEN
    CREATE POLICY "Users can update own cover_letters" ON public.cover_letters FOR UPDATE USING (auth.uid() = user_id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can delete own cover_letters') THEN
    CREATE POLICY "Users can delete own cover_letters" ON public.cover_letters FOR DELETE USING (auth.uid() = user_id);
  END IF;
END $$;

DROP TRIGGER IF EXISTS set_cover_letters_updated_at ON public.cover_letters;
CREATE TRIGGER set_cover_letters_updated_at
BEFORE UPDATE ON public.cover_letters
FOR EACH ROW EXECUTE PROCEDURE public.handle_updated_at();


-- ============================
-- 4. PRESENTATIONS TABLE
-- ============================
CREATE TABLE IF NOT EXISTS public.presentations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  resume_id UUID REFERENCES public.resumes(id) ON DELETE SET NULL,
  target_company TEXT NOT NULL,
  content JSONB NOT NULL DEFAULT '{}'::jsonb,
  status TEXT DEFAULT 'generated' NOT NULL,
  share_id TEXT UNIQUE,
  share_enabled BOOLEAN DEFAULT FALSE,
  share_expires_at TIMESTAMP WITH TIME ZONE,
  presenton_id TEXT,
  pptx_path TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()) NOT NULL
);

ALTER TABLE public.presentations ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can view own presentations') THEN
    CREATE POLICY "Users can view own presentations" ON public.presentations FOR SELECT USING (auth.uid() = user_id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can insert own presentations') THEN
    CREATE POLICY "Users can insert own presentations" ON public.presentations FOR INSERT WITH CHECK (auth.uid() = user_id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can update own presentations') THEN
    CREATE POLICY "Users can update own presentations" ON public.presentations FOR UPDATE USING (auth.uid() = user_id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can delete own presentations') THEN
    CREATE POLICY "Users can delete own presentations" ON public.presentations FOR DELETE USING (auth.uid() = user_id);
  END IF;
END $$;

DROP TRIGGER IF EXISTS set_presentations_updated_at ON public.presentations;
CREATE TRIGGER set_presentations_updated_at
BEFORE UPDATE ON public.presentations
FOR EACH ROW EXECUTE PROCEDURE public.handle_updated_at();


-- ============================
-- 5. CREDIT TRANSACTIONS TABLE
-- ============================
CREATE TABLE IF NOT EXISTS public.credit_transactions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  amount INTEGER NOT NULL DEFAULT 0,
  type TEXT NOT NULL DEFAULT 'purchase',
  stripe_session_id TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()) NOT NULL
);

ALTER TABLE public.credit_transactions ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can view own credit transactions') THEN
    CREATE POLICY "Users can view own credit transactions" ON public.credit_transactions FOR SELECT USING (auth.uid() = user_id);
  END IF;
END $$;


-- ============================
-- 6. RPC: deduct_credit (handles Pro unlimited + daily reset + permanent credits)
-- ============================
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

    SELECT * INTO v_profile FROM public.profiles WHERE id = user_id_param FOR UPDATE;

    IF NOT FOUND THEN
        RETURN jsonb_build_object('success', false, 'reason', 'Profile not found.');
    END IF;

    -- Pro Users = Unlimited
    IF v_profile.subscription_tier = 'pro' THEN
        RETURN jsonb_build_object(
            'success', true, 
            'is_unlimited', true, 
            'remaining_daily', v_profile.daily_credits, 
            'remaining_permanent', v_profile.total_credits
        );
    END IF;

    -- Daily Reset Check
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
                'reason', 'Insufficient credits. Upgrade to Pro for unlimited access.',
                'remaining_daily', v_new_daily,
                'remaining_permanent', v_new_permanent
            );
        END IF;
    END IF;

    UPDATE public.profiles
    SET daily_credits = v_new_daily, total_credits = v_new_permanent,
        last_credit_reset = v_now, updated_at = v_now
    WHERE id = user_id_param;

    RETURN jsonb_build_object(
        'success', true, 'is_unlimited', false,
        'remaining_daily', v_new_daily, 'remaining_permanent', v_new_permanent,
        'deducted', cost_param
    );
END;
$$;


-- ============================
-- 7. RPC: add_credits (for Stripe webhook)
-- ============================
CREATE OR REPLACE FUNCTION add_credits(user_id_param UUID, amount_param INTEGER)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    UPDATE public.profiles
    SET total_credits = COALESCE(total_credits, 0) + amount_param,
        updated_at = TIMEZONE('utc', NOW())
    WHERE id = user_id_param;
END;
$$;


-- ============================
-- 8. RPC: refund_credit (for failed AI generations)
-- ============================
CREATE OR REPLACE FUNCTION refund_credit(user_id_param UUID, amount_param INTEGER)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    IF amount_param <= 0 THEN RETURN; END IF;
    UPDATE public.profiles
    SET total_credits = COALESCE(total_credits, 0) + amount_param,
        updated_at = TIMEZONE('utc', NOW())
    WHERE id = user_id_param;
END;
$$;


-- ============================================================
-- DONE! All tables, columns, RPC functions, RLS policies, and triggers are set up.
-- ============================================================
