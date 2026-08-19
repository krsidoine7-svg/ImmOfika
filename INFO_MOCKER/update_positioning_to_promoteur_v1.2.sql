-- ═══════════════════════════════════════════════════════════════════════════════
-- 🌱 UPDATE POSITIONING TO PROMOTEUR — Correction du Positionnement de Marque
-- ═══════════════════════════════════════════════════════════════════════════════
-- Projet  : Favor Company International
-- Auteur  : IA Antigravity (Session Dev)
-- Date    : 2026-06-11
-- Version : v1.2
-- But     : Corriger le positionnement dans la table homepage_configs (Supabase)
--           d'agence immobilière à promoteur immobilier agréé.
-- Note    : Copier-coller et exécuter ce code dans le SQL Editor de Supabase.
-- ═══════════════════════════════════════════════════════════════════════════════

BEGIN;

-- 1. Mise à jour de la section "À propos" (about)
-- Modification du titre de présentation
UPDATE homepage_configs 
SET content = jsonb_set(
  content, 
  '{title}', 
  '"Plus qu''un promoteur immobilier agréé, un partenaire de vie."'::jsonb
)
WHERE section = 'about';

-- 2. Mise à jour de la section "FAQ" (faq)
-- Remplacement de la première question (frais d'agence -> frais de promotion et d'accompagnement)
UPDATE homepage_configs
SET content = jsonb_set(
  content,
  '{faqs,0}',
  '{
    "question": "Quels sont les frais de promotion chez Favor Company ?",
    "answer": "En tant que promoteur immobilier agréé, nos frais de promotion et d''accompagnement sont transparents et compétitifs. Ils sont intégrés à la valeur des lots et incluent l''aménagement foncier, la viabilisation et la sécurisation juridique complète de vos parcelles."
  }'::jsonb
)
WHERE section = 'faq';

COMMIT;
