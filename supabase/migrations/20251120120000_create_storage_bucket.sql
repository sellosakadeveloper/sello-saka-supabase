-- Create the storage bucket for competition proofs
INSERT INTO storage.buckets (id, name, public)
VALUES ('competition-proofs', 'competition-proofs', true)
ON CONFLICT (id) DO NOTHING;

-- Policy to allow public uploads (anyone can upload a proof of payment)
CREATE POLICY "Allow public uploads"
ON storage.objects FOR INSERT
TO public
WITH CHECK (bucket_id = 'competition-proofs');

-- Policy to allow public read access (so admins can view them, and potentially users if needed)
CREATE POLICY "Allow public read access"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'competition-proofs');

-- Policy to allow admins to delete (optional, but good for cleanup)
CREATE POLICY "Allow admin delete"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'competition-proofs' AND (auth.role() = 'service_role' OR public.has_role(auth.uid(), 'admin')));
