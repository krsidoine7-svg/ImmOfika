-- ═══════════════════════════════════════════════════════════════════════════════
-- 🌱 SEED TOTOHEHE40 — Données Mockées d'Agenda & Visites pour totohehe40@gmail.com
-- ═══════════════════════════════════════════════════════════════════════════════
-- Projet  : Favor Company International
-- Auteur  : IA Antigravity (Session Dev)
-- Date    : 2026-06-05
-- Version : v1.0
-- But     : Simuler un profil agent, ses calendriers, absences et visites de test
-- ═══════════════════════════════════════════════════════════════════════════════

BEGIN;

-- Récupération dynamique de l'ID du profil existant pour l'email totohehe40@gmail.com
DO $$
DECLARE
    v_agent_id UUID;
BEGIN
    SELECT id INTO v_agent_id FROM profiles WHERE email = 'totohehe40@gmail.com' LIMIT 1;
    
    IF v_agent_id IS NOT NULL THEN
        -- 2. Insertion du calendrier iCal Google simulé
        INSERT INTO agent_calendriers (id, agent_id, ical_url, last_synced_at, created_at, updated_at)
        VALUES (
          'ca1d9999-9999-4999-b999-ca1d99990001',
          v_agent_id,
          'https://calendar.google.com/calendar/ical/totohehe40%40gmail.com/public/basic.ics',
          NOW(),
          NOW(),
          NOW()
        )
        ON CONFLICT (id) DO NOTHING;

        -- 3. Insertion des indisponibilités locales de test
        INSERT INTO agent_indisponibilites (id, agent_id, titre, date_debut, date_fin, created_at, updated_at)
        VALUES 
          -- Absence 1 : Réunion d'agence interne (demain de 10:00 à 12:00)
          ('ca1d9999-9999-4999-b999-ca1d99990002', 
           v_agent_id, 
           'Réunion interne agence (Test)', 
           date_trunc('day', NOW() + INTERVAL '1 day') + INTERVAL '10 hours', 
           date_trunc('day', NOW() + INTERVAL '1 day') + INTERVAL '12 hours', 
           NOW(), 
           NOW()),
          
          -- Absence 2 : Congé personnel d'une journée (dans 4 jours)
          ('ca1d9999-9999-4999-b999-ca1d99990003', 
           v_agent_id, 
           'Repos hebdomadaire (Test)', 
           date_trunc('day', NOW() + INTERVAL '4 days') + INTERVAL '8 hours', 
           date_trunc('day', NOW() + INTERVAL '4 days') + INTERVAL '18 hours', 
           NOW(), 
           NOW()),

          -- Absence 3 : Rendez-vous médical (dans 2 jours de 14:00 à 16:00)
          ('ca1d9999-9999-4999-b999-ca1d99990005', 
           v_agent_id, 
           'Rendez-vous médical (Test)', 
           date_trunc('day', NOW() + INTERVAL '2 days') + INTERVAL '14 hours', 
           date_trunc('day', NOW() + INTERVAL '2 days') + INTERVAL '16 hours', 
           NOW(), 
           NOW()),

          -- Absence 4 : Déplacement client extérieur (dans 5 jours de 09:00 à 12:00)
          ('ca1d9999-9999-4999-b999-ca1d99990006', 
           v_agent_id, 
           'Déplacement client extérieur (Test)', 
           date_trunc('day', NOW() + INTERVAL '5 days') + INTERVAL '9 hours', 
           date_trunc('day', NOW() + INTERVAL '5 days') + INTERVAL '12 hours', 
           NOW(), 
           NOW()),

          -- Absence 5 : Congé exceptionnel (dans 8 jours de 08:00 à 18:00)
          ('ca1d9999-9999-4999-b999-ca1d99990007', 
           v_agent_id, 
           'Congé exceptionnel (Test)', 
           date_trunc('day', NOW() + INTERVAL '8 days') + INTERVAL '8 hours', 
           date_trunc('day', NOW() + INTERVAL '8 days') + INTERVAL '18 hours', 
           NOW(), 
           NOW())
        ON CONFLICT (id) DO NOTHING;

        -- 4. Insertion d'une visite de test sur le bien "Villa Prestige Cocody Riviera" (dans 3 jours à 14h00)
        INSERT INTO visites (id, bien_id, agent_id, client_id, date_visite, statut, commentaires, created_at, updated_at)
        VALUES (
          'ca1d9999-9999-4999-b999-ca1d99990004',
          'aaaaaaaa-1111-aaaa-1111-aaaaaaaaaaaa', -- Villa Prestige Cocody Riviera
          v_agent_id,
          '55555555-eeee-5555-eeee-555555555555', -- Client Bamba Moussa
          date_trunc('day', NOW() + INTERVAL '3 days') + INTERVAL '14 hours',
          'planifiee',
          'Visite de démonstration pour le compte de totohehe40@gmail.com.',
          NOW(),
          NOW()
        ),
        
        -- Visite 2 : Appartement Standing Plateau (dans 1 jour à 15h00)
        (
          'ca1d9999-9999-4999-b999-ca1d99990008',
          'bbbbbbbb-1111-bbbb-1111-bbbbbbbbbbbb', -- Appartement standing Plateau
          v_agent_id,
          '66666666-ffff-6666-ffff-666666666666', -- Client Coulibaly Awa
          date_trunc('day', NOW() + INTERVAL '1 day') + INTERVAL '15 hours',
          'confirmee',
          'Visite confirmée Plateau. Rendez-vous au hall d''entrée.',
          NOW(),
          NOW()
        ),

        -- Visite 3 : Terrain Viabilisé Bingerville (dans 6 jours à 10h00)
        (
          'ca1d9999-9999-4999-b999-ca1d99990009',
          'cccccccc-1111-cccc-1111-cccccccccccc', -- Terrain Bingerville
          v_agent_id,
          '77777777-aaaa-7777-aaaa-777777777777', -- Client Ouattara Seydou
          date_trunc('day', NOW() + INTERVAL '6 days') + INTERVAL '10 hours',
          'planifiee',
          'Visite de repérage des limites géométriques du terrain.',
          NOW(),
          NOW()
        )
        ON CONFLICT (id) DO NOTHING;

    END IF;
END $$;

-- 5. Trace d'historique de traçabilité dans info_mocker
INSERT INTO info_mocker (nom_injection, description, tables_ciblees, nb_lignes_total, executee_par, environnement, statut, notes, rollback_sql)
VALUES (
  'seed_totohehe40_v1.0',
  'Données d''agenda et visites simulées pour l''agent existant totohehe40@gmail.com.',
  ARRAY['agent_calendriers', 'agent_indisponibilites', 'visites'],
  9,
  'dev_antigravity',
  'development',
  'succes',
  'Version 1.0 — 1 calendrier, 5 indisponibilités, 3 visites pour l''agent existant.',
  'DELETE FROM visites WHERE id::text LIKE ''ca1d9999%''; DELETE FROM agent_indisponibilites WHERE id::text LIKE ''ca1d9999%''; DELETE FROM agent_calendriers WHERE id::text LIKE ''ca1d9999%''; DELETE FROM info_mocker WHERE nom_injection = ''seed_totohehe40_v1.0'';'
)
ON CONFLICT (id) DO NOTHING;

COMMIT;
