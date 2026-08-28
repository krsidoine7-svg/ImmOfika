-- ============================================================
-- Migration F18 — Générateur de Formulaires (style Tally)
-- ImmOfika Platform
-- À exécuter dans le SQL Editor de Supabase
-- ============================================================

CREATE TABLE IF NOT EXISTS "formulaires" (
  "id"                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "titre"               TEXT NOT NULL,
  "description"         TEXT,
  "slug"                TEXT NOT NULL UNIQUE,
  "champs"              JSONB NOT NULL DEFAULT '[]'::jsonb,
  "statut"              TEXT NOT NULL DEFAULT 'actif',
  "notifications_email" TEXT,
  "created_by"          UUID REFERENCES public.profiles("id") ON DELETE SET NULL,
  "created_at"          TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  "updated_at"          TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE TABLE IF NOT EXISTS "formulaire_reponses" (
  "id"            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "formulaire_id" UUID NOT NULL REFERENCES "formulaires"("id") ON DELETE CASCADE,
  "reponses"      JSONB NOT NULL DEFAULT '{}'::jsonb,
  "fichiers"      JSONB DEFAULT '{}'::jsonb,
  "ip_address"    TEXT,
  "user_agent"    TEXT,
  "created_at"    TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Index de performance
CREATE INDEX IF NOT EXISTS "idx_formulaires_slug" ON "formulaires"("slug");
CREATE INDEX IF NOT EXISTS "idx_formulaire_reponses_form_id" ON "formulaire_reponses"("formulaire_id");

-- Active RLS
ALTER TABLE "formulaires" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "formulaire_reponses" ENABLE ROW LEVEL SECURITY;

-- Politiques RLS Formulaires
CREATE POLICY "Seuls les admins et agents peuvent gérer les formulaires" ON "formulaires"
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() 
      AND role IN ('admin', 'agent')
    )
  );

CREATE POLICY "Tout le monde peut lire un formulaire actif par slug" ON "formulaires"
  FOR SELECT USING (statut = 'actif');

-- Politiques RLS Réponses
CREATE POLICY "Public insert reponses" ON "formulaire_reponses"
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.formulaires
      WHERE id = formulaire_id AND statut = 'actif'
    )
  );

CREATE POLICY "Admins peuvent voir les réponses" ON "formulaire_reponses"
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid()
      AND role IN ('admin', 'agent')
    )
  );
