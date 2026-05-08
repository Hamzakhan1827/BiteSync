-- Run in Supabase SQL Editor
-- Make review-photos bucket publicly readable and allow authenticated uploads

INSERT INTO storage.buckets (id, name, public)
VALUES ('review-photos', 'review-photos', true)
ON CONFLICT (id) DO UPDATE SET public = true;

-- Allow logged-in users to upload their own photos
CREATE POLICY "Authenticated users can upload review photos"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'review-photos');

-- Allow anyone to read/view photos (since bucket is public)
CREATE POLICY "Public read access for review photos"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'review-photos');
