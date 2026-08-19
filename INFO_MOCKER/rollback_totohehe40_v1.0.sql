-- ═══════════════════════════════════════════════════════════════════════════════
-- 🧹 ROLLBACK TOTOHEHE40 — Suppression des Données Mockées de totohehe40@gmail.com
-- ═══════════════════════════════════════════════════════════════════════════════
-- Projet  : Favor Company International
-- Auteur  : IA Antigravity (Session Dev)
-- Date    : 2026-06-05
-- Version : v1.0
-- But     : Nettoyer proprement la BDD de toutes les absences, calendriers et visites de test de totohehe40
-- ═══════════════════════════════════════════════════════════════════════════════

BEGIN;

-- 1. Suppression des visites mockées pour cet agent (UUIDs commençant par ca1d9999)
DELETE FROM visites 
WHERE id::text LIKE 'ca1d9999%';

-- 2. Suppression des indisponibilités locales mockées (UUIDs commençant par ca1d9999)
DELETE FROM agent_indisponibilites 
WHERE id::text LIKE 'ca1d9999%';

-- 3. Suppression du calendrier mocké (UUIDs commençant par ca1d9999)
DELETE FROM agent_calendriers 
WHERE id::text LIKE 'ca1d9999%';

-- 4. Suppression de la trace d'injection associée dans info_mocker
DELETE FROM info_mocker 
WHERE nom_injection = 'seed_totohehe40_v1.0';

COMMIT;
