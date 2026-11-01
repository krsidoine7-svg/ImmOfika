-- Migration 0014 : Ajout de l'isolation multi-acteurs sur les biens et de la table d'audit de sécurité

-- 1. Ajout des colonnes de propriété et de modération sur la table biens
ALTER TABLE "biens" 
ADD COLUMN IF NOT EXISTS "owner_id" UUID REFERENCES "profiles"("id") ON DELETE SET NULL,
ADD COLUMN IF NOT EXISTS "statut_moderation" TEXT NOT NULL DEFAULT 'valide',
ADD COLUMN IF NOT EXISTS "motif_rejet" TEXT;

-- Index pour optimiser les requêtes par propriétaire et par statut de modération
CREATE INDEX IF NOT EXISTS "idx_biens_owner_id" ON "biens"("owner_id");
CREATE INDEX IF NOT EXISTS "idx_biens_statut_moderation" ON "biens"("statut_moderation");

-- 2. Création de la table audit_logs
DROP TABLE IF EXISTS "audit_logs";
CREATE TABLE "audit_logs" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "user_id" UUID REFERENCES "profiles"("id") ON DELETE SET NULL,
  "user_email" TEXT,
  "user_role" TEXT,
  "action" TEXT NOT NULL,
  "entity" TEXT,
  "entity_id" TEXT,
  "details" JSONB,
  "ip_address" TEXT,
  "user_agent" TEXT,
  "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Index pour les recherches et audits de sécurité
CREATE INDEX IF NOT EXISTS "idx_audit_logs_user_id" ON "audit_logs"("user_id");
CREATE INDEX IF NOT EXISTS "idx_audit_logs_action" ON "audit_logs"("action");
CREATE INDEX IF NOT EXISTS "idx_audit_logs_created_at" ON "audit_logs"("created_at");

-- Activation du RLS sur audit_logs (seul le service role / admin peut lire)
ALTER TABLE "audit_logs" ENABLE ROW LEVEL SECURITY;

CREATE POLICY "audit_logs_admin_read" ON "audit_logs"
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM "profiles"
      WHERE "profiles"."id" = auth.uid()
      AND "profiles"."role" IN ('admin', 'super_admin')
    )
  );
