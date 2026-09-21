-- 1. Create properties storage bucket if not exists
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'properties',
  'properties',
  true,
  5242880, -- 5MB limit
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif']
)
ON CONFLICT (id) DO UPDATE SET public = true;

-- 2. Storage RLS policies for the 'properties' bucket
DO $$
BEGIN
  -- Public can read/download images from properties bucket
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'storage' AND tablename = 'objects' AND policyname = 'Public Access for Properties Bucket'
  ) THEN
    CREATE POLICY "Public Access for Properties Bucket"
    ON storage.objects FOR SELECT
    USING (bucket_id = 'properties');
  END IF;

  -- Authenticated users can upload images to properties bucket
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'storage' AND tablename = 'objects' AND policyname = 'Authenticated Upload to Properties Bucket'
  ) THEN
    CREATE POLICY "Authenticated Upload to Properties Bucket"
    ON storage.objects FOR INSERT
    TO authenticated
    WITH CHECK (bucket_id = 'properties');
  END IF;

  -- Authenticated users can update images in properties bucket
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'storage' AND tablename = 'objects' AND policyname = 'Authenticated Update in Properties Bucket'
  ) THEN
    CREATE POLICY "Authenticated Update in Properties Bucket"
    ON storage.objects FOR UPDATE
    TO authenticated
    USING (bucket_id = 'properties')
    WITH CHECK (bucket_id = 'properties');
  END IF;

  -- Authenticated users can delete images in properties bucket
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'storage' AND tablename = 'objects' AND policyname = 'Authenticated Delete in Properties Bucket'
  ) THEN
    CREATE POLICY "Authenticated Delete in Properties Bucket"
    ON storage.objects FOR DELETE
    TO authenticated
    USING (bucket_id = 'properties');
  END IF;
END $$;

-- 3. Function to check if user is admin or agent with SECURITY DEFINER
CREATE OR REPLACE FUNCTION public.is_admin_or_agent()
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = auth.uid() AND role IN ('admin', 'agent')
  );
END;
$$;

-- 4. Properties table RLS policies:
-- Anyone (anon and authenticated) can select/read properties
DROP POLICY IF EXISTS "Allow public read access" ON public.properties;
CREATE POLICY "Allow public read access"
ON public.properties FOR SELECT
TO public
USING (true);

-- Admins and agents can insert, update and delete properties
DROP POLICY IF EXISTS "Allow admin and agent insert properties" ON public.properties;
CREATE POLICY "Allow admin and agent insert properties"
ON public.properties FOR INSERT
TO authenticated
WITH CHECK (public.is_admin_or_agent());

DROP POLICY IF EXISTS "Allow admin and agent update properties" ON public.properties;
CREATE POLICY "Allow admin and agent update properties"
ON public.properties FOR UPDATE
TO authenticated
USING (public.is_admin_or_agent())
WITH CHECK (public.is_admin_or_agent());

DROP POLICY IF EXISTS "Allow admin and agent delete properties" ON public.properties;
CREATE POLICY "Allow admin and agent delete properties"
ON public.properties FOR DELETE
TO authenticated
USING (public.is_admin_or_agent());
