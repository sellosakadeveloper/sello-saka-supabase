-- Create the storage bucket for competition images if it doesn't exist
INSERT INTO storage.buckets (id, name, public)
VALUES ('competitions', 'competitions', true)
ON CONFLICT (id) DO NOTHING;

-- Policy to allow public uploads to competitions bucket
CREATE POLICY "Allow public uploads"
ON storage.objects FOR INSERT
TO public
WITH CHECK (bucket_id = 'competitions');

-- Policy to allow public read access to competitions bucket
CREATE POLICY "Allow public read access"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'competitions');

-- Policy to allow authenticated users (admin) to update/delete
CREATE POLICY "Allow admin update/delete"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'competitions');

CREATE POLICY "Allow admin update"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'competitions');

-- Add image_url column to competitions table if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_name = 'competitions'
        AND column_name = 'image_url'
    ) THEN
        ALTER TABLE competitions ADD COLUMN image_url TEXT;
    END IF;
END $$;
