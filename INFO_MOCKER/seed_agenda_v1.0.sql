-- ═══════════════════════════════════════════════════════════════════════════════
-- 🌱 SEED AGENDA — Données Mockées pour la Gestion d'Agenda & Synchronisation
-- ═══════════════════════════════════════════════════════════════════════════════
-- Projet  : Favor Company International
-- Auteur  : IA Antigravity (Session Dev)
-- Date    : 2026-06-05
-- Version : v1.0
-- But     : Simuler des calendriers iCal et des indisponibilités locales d'agents
-- ═══════════════════════════════════════════════════════════════════════════════

BEGIN;

-- 1. Insertion des calendriers Google iCal simulés
INSERT INTO agent_calendriers (id, agent_id, ical_url, last_synced_at, created_at, updated_at) VALUES
  -- Calendrier Google pour Touré Mariam
  ('ca1d0001-0001-4001-a001-ca1d00000001',
   '33333333-cccc-3333-cccc-333333333333',
   'https://calendar.google.com/calendar/ical/toure.agent%40gmail.com/public/basic.ics',
   NOW() - INTERVAL '10 minutes',
   NOW() - INTERVAL '5 days',
   NOW()),

  -- Calendrier Google pour Diallo Ibrahim
  ('ca1d0002-0002-4002-a002-ca1d00000002',
   '44444444-dddd-4444-dddd-444444444444',
   'https://calendar.google.com/calendar/ical/diallo.agent%40gmail.com/public/basic.ics',
   NOW() - INTERVAL '1 hour',
   NOW() - INTERVAL '4 days',
   NOW())
ON CONFLICT (id) DO NOTHING;

-- 2. Insertion des indisponibilités locales déclarées par les agents
INSERT INTO agent_indisponibilites (id, agent_id, titre, date_debut, date_fin, created_at, updated_at, deleted_at) VALUES
  -- Indisponibilité 1 : Amadou Koné absent pour rendez-vous médical (durée 3h dans 2 jours)
  ('ca1d0003-0003-4003-a003-ca1d00000003',
   '22222222-bbbb-2222-bbbb-222222222222',
   'Rendez-vous médical (Dentiste)',
   date_trunc('day', NOW() + INTERVAL '2 days') + INTERVAL '9 hours', -- Commence à 09:00 dans 2 jours
   date_trunc('day', NOW() + INTERVAL '2 days') + INTERVAL '12 hours', -- Finit à 12:00
   NOW() - INTERVAL '1 day',
   NOW(),
   NULL),

  -- Indisponibilité 2 : Amadou Koné en séminaire de formation (2 jours entiers dans 5 jours)
  ('ca1d0004-0004-4004-a004-ca1d00000004',
   '22222222-bbbb-2222-bbbb-222222222222',
   'Séminaire de formation immobilière',
   date_trunc('day', NOW() + INTERVAL '5 days') + INTERVAL '8 hours', -- Commence à 08:00
   date_trunc('day', NOW() + INTERVAL '6 days') + INTERVAL '18 hours', -- Finit à 18:00 le lendemain
   NOW() - INTERVAL '2 days',
   NOW(),
   NULL),

  -- Indisponibilité 3 : Touré Mariam en déplacement client à Bassam (durée 4h demain)
  ('ca1d0005-0005-4005-a005-ca1d00000005',
   '33333333-cccc-3333-cccc-333333333333',
   'Déplacement client extérieur (Grand-Bassam)',
   date_trunc('day', NOW() + INTERVAL '1 day') + INTERVAL '13 hours', -- Commence à 13:00 demain
   date_trunc('day', NOW() + INTERVAL '1 day') + INTERVAL '17 hours', -- Finit à 17:00
   NOW(),
   NOW(),
   NULL)
ON CONFLICT (id) DO NOTHING;

-- 3. Trace d'historique de traçabilité dans info_mocker
INSERT INTO info_mocker (nom_injection, description, tables_ciblees, nb_lignes_total, executee_par, environnement, statut, notes, rollback_sql)
VALUES (
  'seed_agenda_v1.0',
  'Données d''agenda simulées : calendriers Google iCal et indisponibilités locales d''agents.',
  ARRAY['agent_calendriers', 'agent_indisponibilites'],
  5,
  'dev_antigravity',
  'development',
  'succes',
  'Version 1.0 — 2 calendriers iCal, 3 absences manuelles.',
  'DELETE FROM agent_calendriers WHERE id::text LIKE ''ca1d%''; DELETE FROM agent_indisponibilites WHERE id::text LIKE ''ca1d%''; DELETE FROM info_mocker WHERE nom_injection = ''seed_agenda_v1.0'';'
)
ON CONFLICT (id) DO NOTHING;

COMMIT;
