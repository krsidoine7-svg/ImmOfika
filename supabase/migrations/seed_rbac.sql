-- 1. Création des tables (Contournement du bug Drizzle)
CREATE TABLE IF NOT EXISTS "public"."roles" (
  "name" text PRIMARY KEY,
  "description" text
);

CREATE TABLE IF NOT EXISTS "public"."permissions" (
  "code" text PRIMARY KEY,
  "description" text
);

CREATE TABLE IF NOT EXISTS "public"."role_permissions" (
  "role_name" text NOT NULL REFERENCES "public"."roles"("name") ON DELETE CASCADE,
  "permission_code" text NOT NULL REFERENCES "public"."permissions"("code") ON DELETE CASCADE
);

-- 2. Insertion des Rôles de base
INSERT INTO "public"."roles" (name, description) VALUES
  ('admin', 'Administrateur principal avec accès total'),
  ('client', 'Client standard (acheteur/locataire)'),
  ('agent', 'Agent immobilier ou commercial avec accès restreint')
ON CONFLICT (name) DO NOTHING;

-- Insertion des Permissions granulaires
INSERT INTO "public"."permissions" (code, description) VALUES
  ('manage:biens', 'Ajouter, modifier et supprimer des biens immobiliers'),
  ('view:biens', 'Voir la liste des biens dans l''espace admin'),
  
  ('manage:users', 'Gérer les utilisateurs (suspendre, modifier les rôles)'),
  ('view:users', 'Voir la liste des utilisateurs'),
  
  ('manage:reservations', 'Modifier le statut des réservations'),
  ('view:reservations', 'Voir la liste des réservations'),
  
  ('manage:paiements', 'Effectuer des actions sur les paiements (remboursements)'),
  ('view:paiements', 'Voir la liste des paiements et exporter en CSV')
ON CONFLICT (code) DO NOTHING;

-- Attribution des permissions aux Rôles

-- 1. L'ADMIN a accès à tout
INSERT INTO "public"."role_permissions" (role_name, permission_code)
SELECT 'admin', code FROM "public"."permissions"
ON CONFLICT DO NOTHING;

-- 2. L'AGENT a un accès limité (Par exemple : Biens et Réservations uniquement)
INSERT INTO "public"."role_permissions" (role_name, permission_code) VALUES
  ('agent', 'manage:biens'),
  ('agent', 'view:biens'),
  ('agent', 'manage:reservations'),
  ('agent', 'view:reservations')
ON CONFLICT DO NOTHING;

-- Le rôle CLIENT n'a aucune permission d'administration, on ne lui donne rien dans role_permissions.
