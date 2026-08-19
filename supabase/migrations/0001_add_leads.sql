-- Custom SQL migration file, put your code below! --

CREATE TABLE IF NOT EXISTS "public"."leads" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "nom" text,
  "prenom" text,
  "email" text,
  "telephone" text NOT NULL,
  "source" text DEFAULT 'site_web' NOT NULL,
  "statut" text DEFAULT 'nouveau' NOT NULL,
  "score" integer DEFAULT 0 NOT NULL,
  "bien_interesse" uuid REFERENCES "public"."biens"("id") ON DELETE SET NULL,
  "agent_id" uuid REFERENCES "public"."profiles"("id") ON DELETE SET NULL,
  "message" text,
  "created_at" timestamp DEFAULT now() NOT NULL,
  "updated_at" timestamp DEFAULT now() NOT NULL,
  "deleted_at" timestamp
);

-- Index physiques pour optimiser les requêtes
CREATE INDEX IF NOT EXISTS "leads_telephone_idx" ON "public"."leads" ("telephone");
CREATE INDEX IF NOT EXISTS "leads_email_idx" ON "public"."leads" ("email");
CREATE INDEX IF NOT EXISTS "leads_statut_idx" ON "public"."leads" ("statut");
CREATE INDEX IF NOT EXISTS "leads_agent_id_idx" ON "public"."leads" ("agent_id");

-- RLS (Row Level Security)
ALTER TABLE "public"."leads" ENABLE ROW LEVEL SECURITY;

-- Insertion des Permissions granulaires
INSERT INTO "public"."permissions" (code, description) VALUES
  ('view:leads', 'Voir la liste des leads dans l''espace admin'),
  ('manage:leads', 'Gérer les leads (attribution, statut, suppression)')
ON CONFLICT (code) DO NOTHING;

-- Attribution des permissions à l'administrateur
INSERT INTO "public"."role_permissions" (role_name, permission_code)
SELECT 'admin', code FROM "public"."permissions" WHERE code IN ('view:leads', 'manage:leads')
ON CONFLICT DO NOTHING;

-- Attribution des permissions à l'agent
INSERT INTO "public"."role_permissions" (role_name, permission_code) VALUES
  ('agent', 'view:leads'),
  ('agent', 'manage:leads')
ON CONFLICT DO NOTHING;

-- Politiques RLS pour la table leads
-- 1. Permettre l'insertion publique/anonyme (depuis le site web)
DROP POLICY IF EXISTS "Allow anonymous lead insertion" ON "public"."leads";
CREATE POLICY "Allow anonymous lead insertion" ON "public"."leads"
  FOR INSERT WITH CHECK (telephone IS NOT NULL AND telephone <> '');

-- 2. Accès total pour les administrateurs
DROP POLICY IF EXISTS "Admin full access - leads" ON "public"."leads";
CREATE POLICY "Admin full access - leads" ON "public"."leads"
  FOR ALL USING (public.is_admin());

-- 3. Accès aux leads assignés pour les agents
DROP POLICY IF EXISTS "Agent access - leads" ON "public"."leads";
CREATE POLICY "Agent access - leads" ON "public"."leads"
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid()
      AND role = 'agent'
    ) AND agent_id = auth.uid()
  );