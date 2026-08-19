-- Custom SQL migration file, put your code below! --
CREATE TABLE IF NOT EXISTS "public"."dossiers" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "client_id" uuid NOT NULL REFERENCES "public"."profiles"("id") ON DELETE CASCADE,
  "agent_id" uuid REFERENCES "public"."profiles"("id") ON DELETE SET NULL,
  "bien_id" uuid REFERENCES "public"."biens"("id") ON DELETE SET NULL,
  "titre" text NOT NULL,
  "description" text,
  "statut" text DEFAULT 'ouvert' NOT NULL,
  "progression" integer DEFAULT 0 NOT NULL,
  "priorite" text DEFAULT 'normale' NOT NULL,
  "deadline" timestamp,
  "created_at" timestamp DEFAULT NOW() NOT NULL,
  "updated_at" timestamp DEFAULT NOW() NOT NULL,
  "deleted_at" timestamp
);

CREATE TABLE IF NOT EXISTS "public"."taches" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "dossier_id" uuid NOT NULL REFERENCES "public"."dossiers"("id") ON DELETE CASCADE,
  "titre" text NOT NULL,
  "description" text,
  "assignee_id" uuid REFERENCES "public"."profiles"("id") ON DELETE SET NULL,
  "statut" text DEFAULT 'a_faire' NOT NULL,
  "priorite" text DEFAULT 'normale' NOT NULL,
  "deadline" timestamp,
  "bloque_commentaire" text,
  "created_at" timestamp DEFAULT NOW() NOT NULL,
  "updated_at" timestamp DEFAULT NOW() NOT NULL,
  "deleted_at" timestamp
);

-- Ajouter les index
CREATE INDEX IF NOT EXISTS "dossiers_client_idx" ON "public"."dossiers" ("client_id");
CREATE INDEX IF NOT EXISTS "dossiers_agent_idx" ON "public"."dossiers" ("agent_id");
CREATE INDEX IF NOT EXISTS "taches_dossier_idx" ON "public"."taches" ("dossier_id");

-- Insertion des Permissions RBAC pour les dossiers
INSERT INTO "public"."permissions" (code, description) VALUES
  ('view:dossiers', 'Voir la liste des dossiers de suivi et leurs tâches'),
  ('manage:dossiers', 'Créer, modifier, affecter et supprimer des dossiers et tâches')
ON CONFLICT (code) DO NOTHING;

-- Assigner les permissions au rôle 'admin'
INSERT INTO "public"."role_permissions" (role_name, permission_code) VALUES
  ('admin', 'view:dossiers'),
  ('admin', 'manage:dossiers')
ON CONFLICT DO NOTHING;

-- Assigner les permissions au rôle 'agent'
INSERT INTO "public"."role_permissions" (role_name, permission_code) VALUES
  ('agent', 'view:dossiers'),
  ('agent', 'manage:dossiers')
ON CONFLICT DO NOTHING;
