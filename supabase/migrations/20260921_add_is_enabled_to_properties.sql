-- Migration: Add is_enabled column to properties
-- Properties are never physically deleted; they are enabled or disabled instead.
-- When is_enabled = false, the property is hidden from the public portal but
-- remains visible in the admin panel for future updates.

ALTER TABLE public.properties
  ADD COLUMN IF NOT EXISTS is_enabled BOOLEAN NOT NULL DEFAULT true;

-- Ensure all existing rows have the default value (safe to run multiple times)
UPDATE public.properties
  SET is_enabled = true
  WHERE is_enabled IS NULL;

COMMENT ON COLUMN public.properties.is_enabled IS
  'When false the property is hidden from the public portal but accessible in the admin panel.';
