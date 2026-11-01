-- ==============================================================================
-- IMMOFIKA - Migration 0024 : Suppression Définitive CRM Leads et Formulaires Tally
-- ==============================================================================

-- 1. Découpler la table visites de leads
ALTER TABLE IF EXISTS "visites" DROP COLUMN IF EXISTS "lead_id";

-- 2. Supprimer les tables de formulaires Tally
DROP TABLE IF EXISTS "formulaire_reponses" CASCADE;
DROP TABLE IF EXISTS "formulaires" CASCADE;

-- 3. Supprimer les tables de CRM leads
DROP TABLE IF EXISTS "lead_interactions" CASCADE;
DROP TABLE IF EXISTS "leads" CASCADE;

