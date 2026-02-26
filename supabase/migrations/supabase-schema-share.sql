-- SQL Script to upgrade existing schema with Sharing & Analytics features

-- 1. Add share columns to `resumes`
ALTER TABLE public.resumes
ADD COLUMN IF NOT EXISTS share_id TEXT UNIQUE,
ADD COLUMN IF NOT EXISTS share_enabled BOOLEAN DEFAULT FALSE NOT NULL,
ADD COLUMN IF NOT EXISTS views INTEGER DEFAULT 0 NOT NULL,
ADD COLUMN IF NOT EXISTS share_expires_at TIMESTAMP WITH TIME ZONE;

-- 2. Create new `cover_letters` table
CREATE TABLE IF NOT EXISTS public.cover_letters (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  resume_id UUID REFERENCES public.resumes(id) ON DELETE SET NULL, -- optional link to base CV
  title TEXT DEFAULT 'My Cover Letter' NOT NULL,
  content HTML NOT NULL DEFAULT '', -- HTML structured string
  target_role TEXT,
  company_name TEXT,
  share_id TEXT UNIQUE,
  share_enabled BOOLEAN DEFAULT FALSE NOT NULL,
  views INTEGER DEFAULT 0 NOT NULL,
  share_expires_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()) NOT NULL
);

-- ENABLE ROW LEVEL SECURITY (RLS)
ALTER TABLE public.cover_letters ENABLE ROW LEVEL SECURITY;

-- CREATE RLS POLICIES FOR COVER LETTERS

-- Note: The logic for shared views will bypass RLS via a Service Role backend check,
-- so RLS here is strictly for the owner's dashboard/CRUD operations.

CREATE POLICY "Users can view own cover_letters" 
ON public.cover_letters FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own cover_letters" 
ON public.cover_letters FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own cover_letters" 
ON public.cover_letters FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own cover_letters" 
ON public.cover_letters FOR DELETE 
USING (auth.uid() = user_id);

-- TRIGGER FOR UPDATED_AT TIMESTAMPS
CREATE TRIGGER set_cover_letters_updated_at
BEFORE UPDATE ON public.cover_letters
FOR EACH ROW EXECUTE PROCEDURE public.handle_updated_at();
