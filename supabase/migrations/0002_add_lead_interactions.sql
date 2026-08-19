-- Migration to create lead_interactions table and set RLS policies
CREATE TABLE IF NOT EXISTS "public"."lead_interactions" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "lead_id" uuid REFERENCES "public"."leads"("id") ON DELETE CASCADE NOT NULL,
  "agent_id" uuid REFERENCES "public"."profiles"("id") ON DELETE SET NULL,
  "type" text NOT NULL,
  "details" text NOT NULL,
  "created_at" timestamp DEFAULT now() NOT NULL,
  "deleted_at" timestamp
);

-- Index physiques pour optimiser les requêtes
CREATE INDEX IF NOT EXISTS "lead_interactions_lead_id_idx" ON "public"."lead_interactions" ("lead_id");
CREATE INDEX IF NOT EXISTS "lead_interactions_created_at_idx" ON "public"."lead_interactions" ("created_at");

-- Activer la sécurité RLS (Row Level Security)
ALTER TABLE "public"."lead_interactions" ENABLE ROW LEVEL SECURITY;

-- Politiques RLS pour lead_interactions
-- 1. Accès total pour les administrateurs
DROP POLICY IF EXISTS "Admin full access - lead_interactions" ON "public"."lead_interactions";
CREATE POLICY "Admin full access - lead_interactions" ON "public"."lead_interactions"
  FOR ALL USING (public.is_admin());

-- 2. Accès total pour les agents uniquement sur leurs leads assignés
DROP POLICY IF EXISTS "Agent access - lead_interactions" ON "public"."lead_interactions";
CREATE POLICY "Agent access - lead_interactions" ON "public"."lead_interactions"
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.leads l
      WHERE l.id = lead_id
      AND l.agent_id = auth.uid()
    )
  );
