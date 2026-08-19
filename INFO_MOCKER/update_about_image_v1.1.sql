-- ═══════════════════════════════════════════════════════════════════════════════
-- 🌱 UPDATE ABOUT IMAGE — Mise à jour des images de la section À Propos
-- ═══════════════════════════════════════════════════════════════════════════════
-- Projet  : Favor Company International
-- Auteur  : IA Antigravity (Session Dev)
-- Date    : 2026-06-11
-- Version : v1.1
-- But     : Configurer heros-img.png comme image de fond de la section À Propos
-- ═══════════════════════════════════════════════════════════════════════════════

BEGIN;

UPDATE homepage_configs 
SET content = content || jsonb_build_object(
  'background_image', '/heros-img.png'
)
WHERE section = 'about';

COMMIT;
