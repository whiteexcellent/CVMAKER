CREATE EXTENSION IF NOT EXISTS pgcrypto;

ALTER TABLE public.resumes
ADD COLUMN IF NOT EXISTS pdf_path TEXT;

ALTER TABLE public.presentations
ADD COLUMN IF NOT EXISTS title TEXT,
ADD COLUMN IF NOT EXISTS views INTEGER DEFAULT 0;

ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS stripe_customer_id TEXT,
ADD COLUMN IF NOT EXISTS stripe_subscription_id TEXT,
ADD COLUMN IF NOT EXISTS stripe_subscription_status TEXT DEFAULT 'inactive';

ALTER TABLE public.credit_transactions
ADD COLUMN IF NOT EXISTS metadata JSONB;

CREATE INDEX IF NOT EXISTS resumes_user_created_idx ON public.resumes (user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS cover_letters_user_created_idx ON public.cover_letters (user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS presentations_user_created_idx ON public.presentations (user_id, created_at DESC);
CREATE UNIQUE INDEX IF NOT EXISTS credit_transactions_stripe_session_id_uidx
ON public.credit_transactions (stripe_session_id)
WHERE stripe_session_id IS NOT NULL;
CREATE UNIQUE INDEX IF NOT EXISTS profiles_stripe_customer_id_uidx
ON public.profiles (stripe_customer_id)
WHERE stripe_customer_id IS NOT NULL;
CREATE UNIQUE INDEX IF NOT EXISTS profiles_stripe_subscription_id_uidx
ON public.profiles (stripe_subscription_id)
WHERE stripe_subscription_id IS NOT NULL;

CREATE TABLE IF NOT EXISTS public.api_rate_limits (
    identifier TEXT NOT NULL,
    route_key TEXT NOT NULL,
    bucket_start TIMESTAMPTZ NOT NULL,
    request_count INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT TIMEZONE('utc', NOW()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT TIMEZONE('utc', NOW()),
    PRIMARY KEY (identifier, route_key, bucket_start)
);

CREATE OR REPLACE FUNCTION public.enforce_api_rate_limit(
    identifier_param TEXT,
    route_key_param TEXT,
    max_requests_param INTEGER,
    window_seconds_param INTEGER
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_bucket_start TIMESTAMPTZ;
    v_entry public.api_rate_limits%ROWTYPE;
BEGIN
    v_bucket_start := to_timestamp(floor(extract(epoch FROM timezone('utc', now())) / window_seconds_param) * window_seconds_param);

    SELECT *
    INTO v_entry
    FROM public.api_rate_limits
    WHERE identifier = identifier_param
      AND route_key = route_key_param
      AND bucket_start = v_bucket_start
    FOR UPDATE;

    IF NOT FOUND THEN
        INSERT INTO public.api_rate_limits (identifier, route_key, bucket_start, request_count)
        VALUES (identifier_param, route_key_param, v_bucket_start, 1);

        RETURN jsonb_build_object(
            'allowed', true,
            'remaining', GREATEST(max_requests_param - 1, 0),
            'bucket_start', v_bucket_start
        );
    END IF;

    IF v_entry.request_count >= max_requests_param THEN
        RETURN jsonb_build_object(
            'allowed', false,
            'remaining', 0,
            'reason', 'Rate limit exceeded. Please try again later.',
            'bucket_start', v_bucket_start
        );
    END IF;

    UPDATE public.api_rate_limits
    SET request_count = request_count + 1,
        updated_at = timezone('utc', now())
    WHERE identifier = identifier_param
      AND route_key = route_key_param
      AND bucket_start = v_bucket_start;

    RETURN jsonb_build_object(
        'allowed', true,
        'remaining', GREATEST(max_requests_param - (v_entry.request_count + 1), 0),
        'bucket_start', v_bucket_start
    );
END;
$$;

CREATE OR REPLACE FUNCTION public.increment_shared_document_view(share_id_param TEXT)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_views INTEGER;
BEGIN
    UPDATE public.resumes
    SET views = COALESCE(views, 0) + 1
    WHERE share_id = share_id_param
      AND share_enabled = TRUE
      AND (share_expires_at IS NULL OR share_expires_at > timezone('utc', now()))
    RETURNING views INTO v_views;

    IF FOUND THEN
        RETURN jsonb_build_object('success', true, 'document_type', 'resume', 'views', v_views);
    END IF;

    UPDATE public.cover_letters
    SET views = COALESCE(views, 0) + 1
    WHERE share_id = share_id_param
      AND share_enabled = TRUE
      AND (share_expires_at IS NULL OR share_expires_at > timezone('utc', now()))
    RETURNING views INTO v_views;

    IF FOUND THEN
        RETURN jsonb_build_object('success', true, 'document_type', 'cover_letter', 'views', v_views);
    END IF;

    UPDATE public.presentations
    SET views = COALESCE(views, 0) + 1
    WHERE share_id = share_id_param
      AND share_enabled = TRUE
      AND (share_expires_at IS NULL OR share_expires_at > timezone('utc', now()))
    RETURNING views INTO v_views;

    IF FOUND THEN
        RETURN jsonb_build_object('success', true, 'document_type', 'presentation', 'views', v_views);
    END IF;

    RETURN jsonb_build_object('success', false, 'reason', 'Shared document not found.');
END;
$$;

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM storage.buckets WHERE id = 'cv_pdfs') THEN
        INSERT INTO storage.buckets (id, name, public)
        VALUES ('cv_pdfs', 'cv_pdfs', FALSE);
    ELSE
        UPDATE storage.buckets
        SET public = FALSE
        WHERE id = 'cv_pdfs';
    END IF;
END;
$$;

DROP POLICY IF EXISTS "Public CV PDF Access" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated CV PDF Upload" ON storage.objects;
DROP POLICY IF EXISTS "Service Role CV PDF Access" ON storage.objects;

CREATE POLICY "Service Role CV PDF Access"
ON storage.objects
FOR ALL
USING (bucket_id = 'cv_pdfs' AND auth.role() = 'service_role')
WITH CHECK (bucket_id = 'cv_pdfs' AND auth.role() = 'service_role');
