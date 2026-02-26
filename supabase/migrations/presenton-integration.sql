-- OMNICV: Add Presenton PPTX metadata columns to presentations table
ALTER TABLE public.presentations
ADD COLUMN IF NOT EXISTS presenton_id TEXT,
ADD COLUMN IF NOT EXISTS pptx_path TEXT;
