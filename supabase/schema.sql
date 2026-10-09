-- ============================================================================
-- Pixelio — Supabase Database Schema
--
-- GENERATED FILE — do not edit by hand.
-- Source of truth: lib/schema.js (the schema, written in JavaScript).
-- Regenerate:      npm run schema:sql
--
-- Apply the schema:
--   1. Automatic: npm run migrate  (applies lib/schema.js through SUPABASE_DB_URL)
--   2. Manual:    paste this file into the Supabase SQL Editor
--
-- Every statement is idempotent — running it more than once is safe.
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.projects (
  id text PRIMARY KEY,
  title text NOT NULL DEFAULT 'Untitled',
  title_ar text NOT NULL DEFAULT '',
  url text NOT NULL,
  host text NOT NULL DEFAULT '',
  description text NOT NULL DEFAULT '',
  description_ar text NOT NULL DEFAULT '',
  image text,
  favicon text,
  category text NOT NULL DEFAULT '',
  tag text NOT NULL DEFAULT '',
  "order" integer NOT NULL DEFAULT 0,
  visible boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS projects_order_created_idx
  ON public.projects ("order" ASC, created_at DESC);

CREATE INDEX IF NOT EXISTS projects_visible_idx
  ON public.projects (visible);

CREATE TABLE IF NOT EXISTS public.site_content (
  scope text NOT NULL,
  path text NOT NULL,
  value text NOT NULL DEFAULT '',
  updated_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (scope, path)
);

ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;

ALTER TABLE public.site_content ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'projects' AND policyname = 'Public can read visible projects'
  ) THEN
    CREATE POLICY "Public can read visible projects"
      ON public.projects FOR SELECT
      USING (visible = true);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'site_content' AND policyname = 'Public can read site content'
  ) THEN
    CREATE POLICY "Public can read site content"
      ON public.site_content FOR SELECT
      USING (true);
  END IF;
END $$;
