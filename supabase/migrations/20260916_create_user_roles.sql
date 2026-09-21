-- Migration: Create user_roles table, RLS policies and sync triggers
-- Executed on: 2026-09-16

CREATE TABLE IF NOT EXISTS public.user_roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT NOT NULL,
    full_name TEXT,
    avatar_url TEXT,
    role TEXT NOT NULL DEFAULT 'user' CHECK (role IN ('admin', 'agent', 'user')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- Enable RLS
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Helper function to check if current user is admin
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = auth.uid() AND role = 'admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Policies
DROP POLICY IF EXISTS "Allow authenticated read user_roles" ON public.user_roles;
CREATE POLICY "Allow authenticated read user_roles"
ON public.user_roles FOR SELECT
TO authenticated
USING (true);

DROP POLICY IF EXISTS "Allow individual insert own profile" ON public.user_roles;
CREATE POLICY "Allow individual insert own profile"
ON public.user_roles FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Allow update user_roles" ON public.user_roles;
CREATE POLICY "Allow update user_roles"
ON public.user_roles FOR UPDATE
TO authenticated
USING (public.is_admin() OR auth.uid() = user_id)
WITH CHECK (public.is_admin() OR auth.uid() = user_id);

-- Automatic trigger on auth.users creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.user_roles (user_id, email, full_name, avatar_url, role)
  VALUES (
    NEW.id,
    COALESCE(NEW.email, ''),
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', split_part(COALESCE(NEW.email, ''), '@', 1)),
    COALESCE(NEW.raw_user_meta_data->>'avatar_url', NEW.raw_user_meta_data->>'picture', NULL),
    'user'
  )
  ON CONFLICT (user_id) DO UPDATE
  SET
    email = EXCLUDED.email,
    full_name = COALESCE(EXCLUDED.full_name, public.user_roles.full_name),
    avatar_url = COALESCE(EXCLUDED.avatar_url, public.user_roles.avatar_url),
    updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT OR UPDATE ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Backfill existing users from auth.users
INSERT INTO public.user_roles (user_id, email, full_name, avatar_url, role)
SELECT 
  id,
  COALESCE(email, ''),
  COALESCE(raw_user_meta_data->>'full_name', raw_user_meta_data->>'name', split_part(COALESCE(email, ''), '@', 1)),
  COALESCE(raw_user_meta_data->>'avatar_url', raw_user_meta_data->>'picture', NULL),
  'user'
FROM auth.users
ON CONFLICT (user_id) DO UPDATE
SET
  email = EXCLUDED.email,
  full_name = COALESCE(EXCLUDED.full_name, public.user_roles.full_name),
  avatar_url = COALESCE(EXCLUDED.avatar_url, public.user_roles.avatar_url);
