-- ═══════════════════════════════════════════════════════════════════════════════
-- 🌱 SEED NOTIFICATIONS — Données Mockées pour la Gestion des Notifications (F15)
-- ═══════════════════════════════════════════════════════════════════════════════
-- Projet  : Favor Company International
-- Auteur  : IA Antigravity (Session Dev)
-- Date    : 2026-06-04
-- Version : v1.0
-- But     : Simuler des notifications in-app avec différents types et statuts
-- Cible   : Admin, Agents (Koné Amadou, Touré Mariam), et Clients (Bamba Moussa)
-- ═══════════════════════════════════════════════════════════════════════════════

BEGIN;

-- Insertion de 8 notifications de test (UUIDs préfixés par d071 pour rollback facile)
INSERT INTO notifications (id, user_id, title, message, type, link, lu, created_at) VALUES

  -- 1. Notification de Réservation pour l'Admin (Directeur Général)
  ('d0710000-0001-4001-a001-d07100000001',
   '11111111-aaaa-1111-aaaa-111111111111',
   'Nouvelle réservation client',
   'Le client Bamba Moussa a réservé le bien Villa Prestige Cocody Riviera.',
   'reservation',
   '/admin/reservations',
   FALSE,
   NOW() - INTERVAL '15 minutes'),

  -- 2. Notification de Paiement pour l'Admin (Directeur Général)
  ('d0710000-0002-4001-a001-d07100000002',
   '11111111-aaaa-1111-aaaa-111111111111',
   'Paiement reçu (Réservation)',
   'Paiement de 35 000 000 FCFA validé pour Villa Prestige Cocody Riviera.',
   'paiement',
   '/admin/paiements',
   TRUE, -- Déjà lue
   NOW() - INTERVAL '2 hours'),

  -- 3. Notification de Lead pour l'Agent Koné Amadou
  ('d0710000-0003-4002-a002-d07100000003',
   '22222222-bbbb-2222-bbbb-222222222222',
   'Nouveau prospect attribué',
   'Le prospect Karim Meité vous a été attribué pour suivi.',
   'lead',
   '/admin/leads',
   FALSE,
   NOW() - INTERVAL '5 minutes'),

  -- 4. Notification de Visite pour l'Agent Koné Amadou
  ('d0710000-0004-4002-a002-d07100000004',
   '22222222-bbbb-2222-bbbb-222222222222',
   'Nouvelle visite planifiée',
   'Vous êtes affecté pour accompagner la visite de Karim Meité pour Appartement Standing Le Plateau.',
   'visite',
   '/admin/visites',
   FALSE,
   NOW() - INTERVAL '30 minutes'),

  -- 5. Notification Système pour l'Agent Touré Mariam
  ('d0710000-0005-4003-a003-d07100000005',
   '33333333-cccc-3333-cccc-333333333333',
   'Mise à jour système',
   'L''espace d''administration a été mis à jour avec le module de Gestion des Visites (F14).',
   'system',
   '/admin',
   TRUE, -- Déjà lue
   NOW() - INTERVAL '1 day'),

  -- 6. Notification de Visite Clôturée pour l''Admin (Directeur Général)
  ('d0710000-0006-4001-a001-d07100000006',
   '11111111-aaaa-1111-aaaa-111111111111',
   'Visite clôturée (EFFECTUÉE)',
   'La visite de Christiane Aka pour Villa Duplex Marcory a été marquée comme : EFFECTUÉE.',
   'visite',
   '/admin/visites',
   FALSE,
   NOW() - INTERVAL '1 hour'),

  -- 7. Notification de Paiement Confirmé pour le Client Bamba Moussa
  ('d0710000-0007-4005-a005-d07100000007',
   '55555555-eeee-5555-eeee-555555555555',
   'Paiement confirmé !',
   'Votre paiement de 35 000 000 FCFA pour Villa Prestige Cocody Riviera a été validé.',
   'paiement',
   '/client/paiements',
   FALSE,
   NOW() - INTERVAL '10 minutes'),

  -- 8. Notification de Réservation Confirmée pour le Client Bamba Moussa
  ('d0710000-0008-4005-a005-d07100000008',
   '55555555-eeee-5555-eeee-555555555555',
   'Réservation enregistrée',
   'Votre réservation pour Villa Prestige Cocody Riviera est en cours de traitement.',
   'reservation',
   '/client/dashboard',
   TRUE, -- Déjà lue
   NOW() - INTERVAL '3 hours')

ON CONFLICT (id) DO NOTHING;

-- Ajout d'une trace de traçabilité dans info_mocker
INSERT INTO info_mocker (nom_injection, description, tables_ciblees, nb_lignes_total, executee_par, environnement, statut, notes, rollback_sql)
VALUES (
  'seed_notifications_v1.0',
  'Données mockées pour la gestion des notifications (F15) temps réel et in-app.',
  ARRAY['notifications'],
  8,
  'dev_antigravity',
  'development',
  'succes',
  'Simule 8 alertes de tests pour admins, agents et clients.',
  'DELETE FROM notifications WHERE id LIKE ''d071%''; DELETE FROM info_mocker WHERE nom_injection = ''seed_notifications_v1.0'';'
);

COMMIT;
