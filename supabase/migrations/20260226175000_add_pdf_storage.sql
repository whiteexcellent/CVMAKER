-- Add pdf_url to resumes
ALTER TABLE public.resumes ADD COLUMN pdf_url TEXT;

-- Create Storage bucket for CV PDFs
INSERT INTO storage.buckets (id, name, public) VALUES ('cv_pdfs', 'cv_pdfs', true);

-- Storage RLS Policies
CREATE POLICY "Public CV PDF Access" ON storage.objects FOR SELECT USING (bucket_id = 'cv_pdfs');

CREATE POLICY "Authenticated CV PDF Upload" ON storage.objects FOR INSERT WITH CHECK (
  bucket_id = 'cv_pdfs' AND auth.role() = 'authenticated'
);
