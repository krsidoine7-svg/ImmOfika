-- ═══════════════════════════════════════════════════════════════════════════════
-- 🌱 SEED VISITES — Données Mockées pour la Gestion des Visites (F14)
-- ═══════════════════════════════════════════════════════════════════════════════
-- Projet  : Favor Company International
-- Auteur  : IA Antigravity (Session Dev)
-- Date    : 2026-06-04
-- Version : v1.0
-- But     : Simuler 7 visites physiques de biens avec différents statuts
-- ═══════════════════════════════════════════════════════════════════════════════

BEGIN;

-- Insertion des 7 visites de test (UUIDs préfixés par c1a5 pour rollback facile)
INSERT INTO visites (id, lead_id, client_id, bien_id, agent_id, date_visite, statut, commentaires, created_at, updated_at) VALUES

  -- 1. Visite Planifiée pour Mamadou Diabaté (Villa Cocody Riviera)
  ('c1a50001-0001-4001-a001-c1a500000001',
   '1ead0006-cccc-4006-a006-1ead00000006',
   NULL,
   'aaaaaaaa-1111-aaaa-1111-aaaaaaaaaaaa',
   '33333333-cccc-3333-cccc-333333333333',
   NOW() + INTERVAL '2 days', 'planifiee',
   'Le client souhaite visiter en fin d''après-midi pour évaluer l''exposition au soleil du jardin.',
   NOW() - INTERVAL '1 day', NOW()),

  -- 2. Visite Confirmée pour Éric N''Guessan (Appartement standing Plateau)
  ('c1a50002-0002-4002-a002-c1a500000002',
   '1ead0007-cccc-4007-a007-1ead00000007',
   NULL,
   'bbbbbbbb-1111-bbbb-1111-bbbbbbbbbbbb',
   '33333333-cccc-3333-cccc-333333333333',
   NOW() + INTERVAL '1 day', 'confirmee',
   'Visite validée par le concierge de l''immeuble. Accès autorisé à l''appartement témoin.',
   NOW() - INTERVAL '3 days', NOW()),

  -- 3. Visite Effectuée pour Christiane Aka (Duplex Marcory)
  ('c1a50003-0003-4003-a003-c1a500000003',
   '1ead0008-dddd-4008-a008-1ead00000008',
   NULL,
   'aaaaaaaa-3333-aaaa-3333-aaaaaaaaaaaa',
   '22222222-bbbb-2222-bbbb-222222222222',
   NOW() - INTERVAL '3 days', 'effectuee',
   'Rapport : Le duplex correspond parfaitement aux attentes de la cliente. Elle apprécie la proximité des écoles internationales mais demande un délai de réflexion de 48h concernant les charges de copropriété.',
   NOW() - INTERVAL '5 days', NOW() - INTERVAL '3 days'),

  -- 4. Visite Effectuée pour Oumar Dembélé (Villa Cocody Riviera)
  ('c1a50004-0004-4004-a004-c1a500000004',
   '1ead0009-eeee-4009-a009-1ead00000009',
   NULL,
   'aaaaaaaa-2222-aaaa-2222-aaaaaaaaaaaa',
   '22222222-bbbb-2222-bbbb-222222222222',
   NOW() - INTERVAL '10 days', 'effectuee',
   'Rapport : La structure de la maison est saine. Le client est très intéressé mais souhaite entamer une négociation sur le prix en raison de quelques travaux de peinture à prévoir.',
   NOW() - INTERVAL '12 days', NOW() - INTERVAL '10 days'),

  -- 5. Visite Annulée pour Aminata Koné
  ('c1a50005-0005-4005-a005-c1a500000005',
   '1ead0004-bbbb-4004-a004-1ead00000004',
   NULL,
   'aaaaaaaa-2222-aaaa-2222-aaaaaaaaaaaa',
   '22222222-bbbb-2222-bbbb-222222222222',
   NOW() - INTERVAL '4 days', 'annulee',
   'Motif : Annulée par le client pour cause de déplacement professionnel imprévu.',
   NOW() - INTERVAL '6 days', NOW() - INTERVAL '4 days'),

  -- 6. Visite Absente pour Soro Lacina
  ('c1a50006-0006-4006-a006-c1a500000006',
   '1ead0005-bbbb-4005-a005-1ead00000005',
   NULL,
   'cccccccc-1111-cccc-1111-cccccccccccc',
   '22222222-bbbb-2222-bbbb-222222222222',
   NOW() - INTERVAL '2 days', 'client_absent',
   'Note : L''agent a attendu 30 minutes sur place. Le client n''a pas répondu aux appels. Relance téléphonique effectuée.',
   NOW() - INTERVAL '4 days', NOW() - INTERVAL '2 days'),

  -- 7. Visite directe pour un client sans Lead (M. Bamba Moussa)
  ('c1a50007-0007-4007-a007-c1a500000007',
   NULL,
   '55555555-eeee-5555-eeee-555555555555',
   'aaaaaaaa-1111-aaaa-1111-aaaaaaaaaaaa',
   '22222222-bbbb-2222-bbbb-222222222222',
   NOW() + INTERVAL '5 days', 'planifiee',
   'Visite de courtoisie et de ré-évaluation de la villa Riviera suite à sa réservation en cours.',
   NOW(), NOW())

ON CONFLICT (id) DO NOTHING;

-- Trace de traçabilité d'injection de données de test dans info_mocker
INSERT INTO info_mocker (nom_injection, description, tables_ciblees, nb_lignes_total, executee_par, environnement, statut, notes, rollback_sql)
VALUES (
  'seed_visites_v1.0',
  'Données mockées de visites physiques (F14) de biens immobiliers à Abidjan.',
  ARRAY['visites'],
  7,
  'dev_antigravity',
  'development',
  'succes',
  'Version 1.0 — 7 visites de test.',
  'DELETE FROM visites WHERE id LIKE ''c1a5%''; DELETE FROM info_mocker WHERE nom_injection = ''seed_visites_v1.0'';'
);

COMMIT;
