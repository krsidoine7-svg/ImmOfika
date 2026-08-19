-- Migration: 0002_add_push_subscriptions.sql
-- Create table for storing PWA web-push subscriptions with preferences

CREATE TABLE IF NOT EXISTS "public"."push_subscriptions" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "profile_id" uuid NOT NULL REFERENCES "public"."profiles"("id") ON DELETE CASCADE,
  "subscription" jsonb NOT NULL,
  "preferences" jsonb DEFAULT '{"systemUpdates": true, "newProperties": true, "announcements": true, "transactional": true}'::jsonb NOT NULL,
  "created_at" timestamp DEFAULT NOW() NOT NULL,
  "updated_at" timestamp DEFAULT NOW() NOT NULL,
  "deleted_at" timestamp
);

-- Index pour accélérer la recherche par profil
CREATE INDEX IF NOT EXISTS "idx_push_subscriptions_profile_id" ON "public"."push_subscriptions" ("profile_id");

-- RLS (Row Level Security)
ALTER TABLE "public"."push_subscriptions" ENABLE ROW LEVEL SECURITY;

-- Politiques RLS : seuls les utilisateurs propriétaires peuvent lire/écrire/mettre à jour/supprimer leurs propres abonnements
CREATE POLICY "Les utilisateurs peuvent lire leurs abonnements push"
  ON "public"."push_subscriptions"
  FOR SELECT
  USING (auth.uid() = profile_id);

CREATE POLICY "Les utilisateurs peuvent inserer leurs abonnements push"
  ON "public"."push_subscriptions"
  FOR INSERT
  WITH CHECK (auth.uid() = profile_id);

CREATE POLICY "Les utilisateurs peuvent modifier leurs abonnements push"
  ON "public"."push_subscriptions"
  FOR UPDATE
  USING (auth.uid() = profile_id)
  WITH CHECK (auth.uid() = profile_id);

CREATE POLICY "Les utilisateurs peuvent supprimer leurs abonnements push"
  ON "public"."push_subscriptions"
  FOR DELETE
  USING (auth.uid() = profile_id);