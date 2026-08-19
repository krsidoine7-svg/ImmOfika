-- ═══════════════════════════════════════════════════════════════════════════════
-- 🧹 ROLLBACK HOMEPAGE CONFIGS — Annulation des Données par Défaut de l'Accueil
-- ═══════════════════════════════════════════════════════════════════════════════
-- Projet  : Favor Company International
-- Auteur  : IA Antigravity (Session Dev)
-- Date    : 2026-06-10
-- Version : v1.0
-- But     : Nettoyer la table homepage_configs
-- ═══════════════════════════════════════════════════════════════════════════════

BEGIN;

DELETE FROM homepage_configs WHERE section IN ('hero', 'about', 'expertise', 'team', 'testimonials', 'faq', 'cta', 'footer');

COMMIT;
