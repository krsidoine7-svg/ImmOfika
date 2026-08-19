-- ============================================================
-- Migration — Table d'Abonnement Newsletter
-- Favor Company International
-- À exécuter dans le SQL Editor de Supabase
-- ============================================================

CREATE TABLE IF NOT EXISTS "newsletter_subscribers" (
  "id"              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "email"           TEXT NOT NULL UNIQUE,
  "created_at"      TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  "unsubscribed_at" TIMESTAMPTZ
);

-- Index de performance
CREATE INDEX IF NOT EXISTS "idx_newsletter_subscribers_email" ON "newsletter_subscribers"("email");

-- RLS (Row Level Security)
ALTER TABLE "newsletter_subscribers" ENABLE ROW LEVEL SECURITY;

-- Seuls les administrateurs ont un accès complet
CREATE POLICY "Admin full access - newsletter" ON "newsletter_subscribers"
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() 
      AND role IN ('admin', 'super_admin')
    )
  );

-- Tout le monde peut s'abonner (insertion anonyme libre)
CREATE POLICY "Public insert - newsletter" ON "newsletter_subscribers"
  FOR INSERT WITH CHECK (email IS NOT NULL AND email <> '');
