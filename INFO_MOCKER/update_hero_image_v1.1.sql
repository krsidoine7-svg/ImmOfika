-- ═══════════════════════════════════════════════════════════════════════════════
-- 🌱 UPDATE HERO IMAGE — Mise à jour des images du Hero
-- ═══════════════════════════════════════════════════════════════════════════════
-- Projet  : Favor Company International
-- Auteur  : IA Antigravity (Session Dev)
-- Date    : 2026-06-11
-- Version : v1.1
-- But     : Configurer heros-img.png comme image de fond et image principale du Hero
-- ═══════════════════════════════════════════════════════════════════════════════

BEGIN;

UPDATE homepage_configs 
SET content = content || jsonb_build_object(
  'main_image', '/heros-img.png',
  'video_fallback_image', '/heros-img.png',
  'background_image', '/heros-img.png'
)
WHERE section = 'hero';

COMMIT;
