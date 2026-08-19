-- ═══════════════════════════════════════════════════════════════════════════════
-- 🧹 ROLLBACK NOTIFICATIONS — Suppression des Données Mockées (F15)
-- ═══════════════════════════════════════════════════════════════════════════════
-- Projet  : Favor Company International
-- Auteur  : IA Antigravity (Session Dev)
-- Date    : 2026-06-04
-- Version : v1.0
-- But     : Nettoyer proprement la BDD de toutes les notifications de test injectées
-- ═══════════════════════════════════════════════════════════════════════════════

BEGIN;

-- 1. Suppression des notifications mockées (UUIDs commençant par d071)
DELETE FROM notifications 
WHERE id LIKE 'd071%';

-- 2. Suppression de la trace d'injection associée dans info_mocker
DELETE FROM info_mocker 
WHERE nom_injection = 'seed_notifications_v1.0';

COMMIT;
