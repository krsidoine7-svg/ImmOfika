-- ═══════════════════════════════════════════════════════════════════════════════
-- 🧹 ROLLBACK AGENDA — Suppression des Données Mockées d'Agenda
-- ═══════════════════════════════════════════════════════════════════════════════
-- Projet  : Favor Company International
-- Auteur  : IA Antigravity (Session Dev)
-- Date    : 2026-06-05
-- Version : v1.0
-- But     : Nettoyer proprement la BDD de toutes les absences et calendriers de test
-- ═══════════════════════════════════════════════════════════════════════════════

BEGIN;

-- 1. Suppression des indisponibilités locales mockées (UUIDs commençant par ca1d)
DELETE FROM agent_indisponibilites 
WHERE id::text LIKE 'ca1d%';

-- 2. Suppression des calendriers mockés (UUIDs commençant par ca1d)
DELETE FROM agent_calendriers 
WHERE id::text LIKE 'ca1d%';

-- 3. Suppression de la trace d'injection associée dans info_mocker
DELETE FROM info_mocker 
WHERE nom_injection = 'seed_agenda_v1.0';

COMMIT;
