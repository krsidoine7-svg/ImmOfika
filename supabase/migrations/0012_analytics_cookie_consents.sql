-- Migration: 0012_analytics_cookie_consents.sql
-- Create table for storing anonymous cookie consents (accepted / declined)

CREATE TABLE IF NOT EXISTS "cookie_consents" (
  "id"          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "consent"     TEXT NOT NULL, -- 'accepted' or 'declined'
  "created_at"  TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Enable Row Level Security (RLS) on cookie_consents
ALTER TABLE "cookie_consents" ENABLE ROW LEVEL SECURITY;

-- Allow anyone (public/anonymous/authenticated) to insert their consent status
CREATE POLICY "Allow public insert" ON "cookie_consents"
  FOR INSERT WITH CHECK (consent IN ('accepted', 'declined'));

-- Allow only administrators to select/read consent statistics
CREATE POLICY "Allow admin read" ON "cookie_consents"
  FOR SELECT USING (public.is_admin());
