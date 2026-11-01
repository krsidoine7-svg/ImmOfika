-- ==============================================================================
-- IMMOFIKA - Migration 0020 : Modèle de Données Marketplace Immobilière (Abidjan)
-- ==============================================================================

-- 1. Table des Organisations (Agences Immobilières & Promoteurs Agréés)
CREATE TABLE IF NOT EXISTS "public"."organizations" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "name" TEXT NOT NULL,
  "slug" TEXT NOT NULL UNIQUE,
  "type" TEXT NOT NULL DEFAULT 'agence', -- 'agence', 'promoteur'
  "rccm" TEXT,                           -- ex: CI-ABJ-2024-B-...
  "ncc" TEXT,                            -- Compte contribuable DGI
  "agrement_numero" TEXT,                -- Agrément officiel MCLU
  "logo_url" TEXT,
  "description" TEXT,
  "telephone" TEXT,
  "email" TEXT,
  "whatsapp" TEXT,
  "ville" TEXT NOT NULL DEFAULT 'Abidjan',
  "commune" TEXT,                        -- Cocody, Marcory, Plateau...
  "adresse" TEXT,
  "verified_at" TIMESTAMP WITH TIME ZONE,
  "is_active" BOOLEAN NOT NULL DEFAULT TRUE,
  "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS "idx_organizations_slug" ON "public"."organizations"("slug");
CREATE INDEX IF NOT EXISTS "idx_organizations_type" ON "public"."organizations"("type");

-- 2. Membres des Organisations (Collaborateurs, Négociateurs, Gérants)
CREATE TABLE IF NOT EXISTS "public"."organization_members" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "organization_id" UUID NOT NULL REFERENCES "public"."organizations"("id") ON DELETE CASCADE,
  "user_id" UUID NOT NULL REFERENCES "public"."profiles"("id") ON DELETE CASCADE,
  "role_in_org" TEXT NOT NULL DEFAULT 'negociateur', -- 'gerant', 'negociateur', 'assistant'
  "assigned_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  CONSTRAINT "uq_org_member" UNIQUE ("organization_id", "user_id")
);

CREATE INDEX IF NOT EXISTS "idx_org_members_user" ON "public"."organization_members"("user_id");
CREATE INDEX IF NOT EXISTS "idx_org_members_org" ON "public"."organization_members"("organization_id");

-- 3. Recherches Sauvegardées & Alertes Utilisateurs (Acheteurs / Locataires)
CREATE TABLE IF NOT EXISTS "public"."recherches_alertes" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "user_id" UUID NOT NULL REFERENCES "public"."profiles"("id") ON DELETE CASCADE,
  "titre" TEXT NOT NULL,
  "criteres" JSONB NOT NULL DEFAULT '{}'::jsonb, -- { commune, type, prix_max, pieces, transaction... }
  "frequence" TEXT NOT NULL DEFAULT 'quotidien', -- 'immediat', 'quotidien', 'hebdomadaire'
  "is_active" BOOLEAN NOT NULL DEFAULT TRUE,
  "last_notified_at" TIMESTAMP WITH TIME ZONE,
  "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS "idx_recherches_alertes_user" ON "public"."recherches_alertes"("user_id");

-- 4. Dossiers Candidats (Location & Acquisition sécurisée)
CREATE TABLE IF NOT EXISTS "public"."dossiers_candidats" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "user_id" UUID NOT NULL REFERENCES "public"."profiles"("id") ON DELETE CASCADE,
  "statut" TEXT NOT NULL DEFAULT 'brouillon', -- 'brouillon', 'soumis', 'valide', 'rejete'
  "type_projet" TEXT NOT NULL DEFAULT 'location', -- 'location', 'achat'
  "profession" TEXT,
  "employeur" TEXT,
  "revenu_mensuel" NUMERIC(14, 2),
  "fichiers" JSONB NOT NULL DEFAULT '{}'::jsonb, -- { cni_url, bulletins_salaire_urls, attestation_travail_url }
  "notes" TEXT,
  "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS "idx_dossiers_candidats_user" ON "public"."dossiers_candidats"("user_id");

-- 5. Signalements d'Annonces & Anti-Fraude
CREATE TABLE IF NOT EXISTS "public"."signalements" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "bien_id" UUID NOT NULL REFERENCES "public"."biens"("id") ON DELETE CASCADE,
  "auteur_id" UUID REFERENCES "public"."profiles"("id") ON DELETE SET NULL,
  "motif" TEXT NOT NULL, -- 'faux_prix', 'demarcheur_arnaque', 'bien_deja_vendu', 'photos_trompeuses', 'autre'
  "description" TEXT,
  "statut" TEXT NOT NULL DEFAULT 'nouveau', -- 'nouveau', 'en_cours', 'traite', 'rejete'
  "traite_par" UUID REFERENCES "public"."profiles"("id") ON DELETE SET NULL,
  "decision_commentaire" TEXT,
  "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS "idx_signalements_bien" ON "public"."signalements"("bien_id");
CREATE INDEX IF NOT EXISTS "idx_signalements_statut" ON "public"."signalements"("statut");

-- 6. Enrichissement de la table biens
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'biens' AND column_name = 'organization_id') THEN
    ALTER TABLE "public"."biens" ADD COLUMN "organization_id" UUID REFERENCES "public"."organizations"("id") ON DELETE SET NULL;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'biens' AND column_name = 'pieces') THEN
    ALTER TABLE "public"."biens" ADD COLUMN "pieces" INTEGER;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'biens' AND column_name = 'annee_construction') THEN
    ALTER TABLE "public"."biens" ADD COLUMN "annee_construction" INTEGER;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'biens' AND column_name = 'charges_comprises') THEN
    ALTER TABLE "public"."biens" ADD COLUMN "charges_comprises" BOOLEAN DEFAULT FALSE;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'biens' AND column_name = 'preuve_propriete_url') THEN
    ALTER TABLE "public"."biens" ADD COLUMN "preuve_propriete_url" TEXT;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'biens' AND column_name = 'type_titre_propriete') THEN
    ALTER TABLE "public"."biens" ADD COLUMN "type_titre_propriete" TEXT;
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS "idx_biens_organization" ON "public"."biens"("organization_id");

-- 7. Activation de RLS sur toutes les nouvelles tables
ALTER TABLE "public"."organizations" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."organization_members" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."recherches_alertes" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."dossiers_candidats" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."signalements" ENABLE ROW LEVEL SECURITY;

-- 8. Politiques RLS (Moindre Privilège Strict)

-- Organizations : Lecture publique des organisations actives, Gestion réservée aux gérants et admins
DROP POLICY IF EXISTS "organizations_public_read" ON "public"."organizations";
CREATE POLICY "organizations_public_read" ON "public"."organizations"
FOR SELECT USING (is_active = TRUE OR public.is_staff());

DROP POLICY IF EXISTS "organizations_admin_manage" ON "public"."organizations";
CREATE POLICY "organizations_admin_manage" ON "public"."organizations"
FOR ALL USING (public.is_admin()) WITH CHECK (public.is_admin());

-- Organization Members : Lecture par les membres de l'organisation ou admin
DROP POLICY IF EXISTS "organization_members_read" ON "public"."organization_members";
CREATE POLICY "organization_members_read" ON "public"."organization_members"
FOR SELECT USING (
  user_id = auth.uid() OR 
  organization_id IN (SELECT organization_id FROM "public"."organization_members" WHERE user_id = auth.uid()) OR
  public.is_staff()
);

-- Recherches Alertes : Réservé strictement au propriétaire de l'alerte
DROP POLICY IF EXISTS "recherches_alertes_owner_access" ON "public"."recherches_alertes";
CREATE POLICY "recherches_alertes_owner_access" ON "public"."recherches_alertes"
FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Dossiers Candidats : Strictement personnel (ou agence auprès de qui postulé, ou admin)
DROP POLICY IF EXISTS "dossiers_candidats_owner_access" ON "public"."dossiers_candidats";
CREATE POLICY "dossiers_candidats_owner_access" ON "public"."dossiers_candidats"
FOR ALL USING (auth.uid() = user_id OR public.is_staff()) WITH CHECK (auth.uid() = user_id OR public.is_staff());

-- Signalements : Création par tout utilisateur connecté, lecture/traitement par le staff modération
DROP POLICY IF EXISTS "signalements_create_connected" ON "public"."signalements";
CREATE POLICY "signalements_create_connected" ON "public"."signalements"
FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

DROP POLICY IF EXISTS "signalements_staff_manage" ON "public"."signalements";
CREATE POLICY "signalements_staff_manage" ON "public"."signalements"
FOR ALL USING (public.is_staff()) WITH CHECK (public.is_staff());

