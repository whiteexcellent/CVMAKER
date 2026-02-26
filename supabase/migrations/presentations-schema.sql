-- OMNICV PRESENTATIONS SCHEMA

CREATE TABLE IF NOT EXISTS public.presentations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  resume_id UUID REFERENCES public.resumes(id) ON DELETE SET NULL,
  target_company TEXT NOT NULL,
  content JSONB NOT NULL DEFAULT '{}'::jsonb,
  status TEXT DEFAULT 'generated' NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()) NOT NULL
);

-- Secure the Presentations Table
ALTER TABLE public.presentations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own presentations" 
ON public.presentations FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own presentations" 
ON public.presentations FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own presentations" 
ON public.presentations FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own presentations" 
ON public.presentations FOR DELETE USING (auth.uid() = user_id);

CREATE TRIGGER set_presentations_updated_at
BEFORE UPDATE ON public.presentations
FOR EACH ROW EXECUTE PROCEDURE public.handle_updated_at();

-- Provide missing sharing columns in case they are needed for presentations later
ALTER TABLE public.presentations
ADD COLUMN IF NOT EXISTS share_enabled BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS share_id TEXT UNIQUE,
ADD COLUMN IF NOT EXISTS share_expires_at TIMESTAMP WITH TIME ZONE;
