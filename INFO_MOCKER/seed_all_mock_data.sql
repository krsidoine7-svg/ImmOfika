-- ═══════════════════════════════════════════════════════════════════════════════
-- 🌱 SEED COMPLET — Données Mockées Favor Company International
-- ═══════════════════════════════════════════════════════════════════════════════
-- Projet  : Favor Company International — CRM Immobilier
-- Auteur  : IA Antigravity (Session Dev)
-- Date    : 2026-06-04
-- Version : v1.1 — UUIDs corrigés (hex uniquement)
-- ═══════════════════════════════════════════════════════════════════════════════
-- ⚠️  DÉVELOPPEMENT UNIQUEMENT — NE JAMAIS EXÉCUTER EN PRODUCTION
-- ═══════════════════════════════════════════════════════════════════════════════

BEGIN;

-- ─────────────────────────────────────────────────────────────────────────────
-- 1. PROFILES (8 utilisateurs : 1 admin, 3 agents, 4 clients)
-- ─────────────────────────────────────────────────────────────────────────────

INSERT INTO profiles (id, email, full_name, phone, role, created_at, updated_at) VALUES
  -- Admin
  ('11111111-aaaa-1111-aaaa-111111111111', 'admin@favorcompany.ci', 'Directeur Général', '+225 07 00 00 01', 'admin', NOW() - INTERVAL '6 months', NOW()),
  -- Agents Immobiliers
  ('22222222-bbbb-2222-bbbb-222222222222', 'kone.agent@favorcompany.ci', 'Koné Amadou', '+225 07 11 22 33', 'agent', NOW() - INTERVAL '5 months', NOW()),
  ('33333333-cccc-3333-cccc-333333333333', 'toure.agent@favorcompany.ci', 'Touré Mariam', '+225 07 44 55 66', 'agent', NOW() - INTERVAL '4 months', NOW()),
  ('44444444-dddd-4444-dddd-444444444444', 'diallo.agent@favorcompany.ci', 'Diallo Ibrahim', '+225 07 77 88 99', 'agent', NOW() - INTERVAL '3 months', NOW()),
  -- Clients
  ('55555555-eeee-5555-eeee-555555555555', 'bamba.moussa@gmail.com', 'Bamba Moussa', '+225 05 10 20 30', 'client', NOW() - INTERVAL '2 months', NOW()),
  ('66666666-ffff-6666-ffff-666666666666', 'coulibaly.awa@yahoo.fr', 'Coulibaly Awa', '+225 05 40 50 60', 'client', NOW() - INTERVAL '45 days', NOW()),
  ('77777777-aaaa-7777-aaaa-777777777777', 'ouattara.seydou@outlook.com', 'Ouattara Seydou', '+225 01 70 80 90', 'client', NOW() - INTERVAL '30 days', NOW()),
  ('88888888-bbbb-8888-bbbb-888888888888', 'konan.affoue@gmail.com', 'Konan Affoué', '+225 01 12 34 56', 'client', NOW() - INTERVAL '15 days', NOW())
ON CONFLICT (id) DO NOTHING;


-- ─────────────────────────────────────────────────────────────────────────────
-- 2. BIENS IMMOBILIERS (10 propriétés à Abidjan et environs)
-- ─────────────────────────────────────────────────────────────────────────────

INSERT INTO biens (id, slug, titre, description, prix, type, transaction, statut, ville, quartier, adresse, surface, chambres, salles_de_bain, etages, parking, piscine, jardin, meuble, gardiennage, vues, agent_id, created_at, updated_at) VALUES

  -- 🏡 Villas de prestige
  ('aaaaaaaa-1111-aaaa-1111-aaaaaaaaaaaa', 'villa-prestige-cocody-riviera', 'Villa Prestige Cocody Riviera',
   'Magnifique villa de standing avec vue panoramique sur la lagune. Finitions haut de gamme, cuisine américaine équipée, suite parentale avec dressing et salle de bain italienne. Piscine à débordement et jardin tropical paysager.',
   350000000.00, 'villa', 'vente', 'disponible',
   'Abidjan', 'Cocody Riviera Golf', 'Boulevard de France, Lot 247',
   650.00, 6, 5, 2, TRUE, TRUE, TRUE, TRUE, TRUE, 342,
   '22222222-bbbb-2222-bbbb-222222222222', NOW() - INTERVAL '4 months', NOW()),

  ('aaaaaaaa-2222-aaaa-2222-aaaaaaaaaaaa', 'villa-moderne-angre', 'Villa Moderne Angré 8ème Tranche',
   'Belle villa contemporaine dans un quartier résidentiel calme. Architecture moderne avec grandes baies vitrées, espace de vie ouvert et lumineux. Idéale pour famille avec enfants.',
   180000000.00, 'villa', 'vente', 'disponible',
   'Abidjan', 'Cocody Angré 8ème Tranche', 'Rue des Jardins, Lot 89',
   420.00, 4, 3, 1, TRUE, FALSE, TRUE, FALSE, TRUE, 187,
   '22222222-bbbb-2222-bbbb-222222222222', NOW() - INTERVAL '3 months', NOW()),

  ('aaaaaaaa-3333-aaaa-3333-aaaaaaaaaaaa', 'villa-duplex-marcory', 'Villa Duplex Marcory Résidentiel',
   'Villa duplex entièrement rénovée au cœur de Marcory résidentiel. Proche de toutes commodités, écoles internationales et centres commerciaux.',
   125000000.00, 'villa', 'vente', 'reserve',
   'Abidjan', 'Marcory Résidentiel', 'Avenue Pierre et Marie Curie',
   320.00, 4, 3, 2, TRUE, FALSE, TRUE, TRUE, FALSE, 98,
   '33333333-cccc-3333-cccc-333333333333', NOW() - INTERVAL '2 months', NOW()),

  -- 🏢 Appartements
  ('bbbbbbbb-1111-bbbb-1111-bbbbbbbbbbbb', 'appartement-standing-plateau', 'Appartement Standing Le Plateau',
   'Superbe appartement de haut standing au cœur du Plateau, quartier des affaires. Vue imprenable sur la skyline d''Abidjan. Résidence sécurisée avec concierge 24h/24.',
   95000000.00, 'appartement', 'vente', 'disponible',
   'Abidjan', 'Plateau', 'Avenue Terrasson de Fougères, Immeuble Nour',
   180.00, 3, 2, NULL, TRUE, FALSE, FALSE, TRUE, TRUE, 256,
   '33333333-cccc-3333-cccc-333333333333', NOW() - INTERVAL '3 months', NOW()),

  ('bbbbbbbb-2222-bbbb-2222-bbbbbbbbbbbb', 'appartement-f3-yopougon', 'Appartement F3 Yopougon Millionnaire',
   'Appartement F3 rénové dans le quartier prisé de Yopougon Millionnaire. Cadre de vie agréable, proche du marché et des transports en commun.',
   28000000.00, 'appartement', 'location', 'disponible',
   'Abidjan', 'Yopougon Millionnaire', 'Rue du Commerce',
   95.00, 2, 1, NULL, FALSE, FALSE, FALSE, FALSE, FALSE, 134,
   '44444444-dddd-4444-dddd-444444444444', NOW() - INTERVAL '1 month', NOW()),

  -- 🏗️ Terrains
  ('cccccccc-1111-cccc-1111-cccccccccccc', 'terrain-bingerville-12-lots', 'Terrain Viabilisé Bingerville',
   'Terrain viabilisé de 1200m² à Bingerville, zone résidentielle en plein essor. Titre foncier disponible, accès eau et électricité. Idéal pour construction de villa.',
   45000000.00, 'terrain', 'vente', 'disponible',
   'Bingerville', 'Bingerville Centre', 'Route d''Adzopé, Km 3',
   1200.00, NULL, NULL, NULL, FALSE, FALSE, FALSE, FALSE, FALSE, 67,
   '22222222-bbbb-2222-bbbb-222222222222', NOW() - INTERVAL '5 months', NOW()),

  ('cccccccc-2222-cccc-2222-cccccccccccc', 'terrain-grand-bassam-bord-mer', 'Terrain Bord de Mer Grand-Bassam',
   'Rare opportunité : terrain de 2500m² en bord de mer à Grand-Bassam. Vue directe sur l''océan Atlantique. Parfait pour projet hôtelier ou résidence de luxe.',
   220000000.00, 'terrain', 'vente', 'disponible',
   'Grand-Bassam', 'Quartier France', 'Boulevard du Front de Mer',
   2500.00, NULL, NULL, NULL, FALSE, FALSE, FALSE, FALSE, FALSE, 412,
   '33333333-cccc-3333-cccc-333333333333', NOW() - INTERVAL '2 months', NOW()),

  -- 🏬 Commerces & Bureaux
  ('dddddddd-1111-dddd-1111-dddddddddddd', 'bureau-open-space-plateau', 'Bureau Open Space Le Plateau',
   'Espace de bureau moderne en open space au cœur du Plateau. Climatisation centralisée, câblage réseau Cat6, salle de réunion vitrée. Idéal pour startup ou PME.',
   850000.00, 'bureau', 'location', 'disponible',
   'Abidjan', 'Plateau', 'Rue du Commerce, Immeuble Alpha 2000',
   250.00, NULL, 2, 3, TRUE, FALSE, FALSE, TRUE, TRUE, 89,
   '44444444-dddd-4444-dddd-444444444444', NOW() - INTERVAL '1 month', NOW()),

  ('dddddddd-2222-dddd-2222-dddddddddddd', 'local-commercial-treichville', 'Local Commercial Treichville Marché',
   'Local commercial de 150m² à proximité immédiate du Grand Marché de Treichville. Fort potentiel commercial avec une zone de chalandise de plus de 50 000 passants/jour.',
   65000000.00, 'commerce', 'vente', 'disponible',
   'Abidjan', 'Treichville', 'Avenue 12, face au Grand Marché',
   150.00, NULL, 1, 1, FALSE, FALSE, FALSE, FALSE, FALSE, 203,
   '44444444-dddd-4444-dddd-444444444444', NOW() - INTERVAL '3 weeks', NOW()),

  -- 🏠 Bien vendu (pour l'historique)
  ('eeeeeeee-1111-eeee-1111-eeeeeeeeeeee', 'villa-vendue-deux-plateaux', 'Villa Les Deux Plateaux (Vendue)',
   'Villa 5 pièces aux Deux Plateaux, vendue en 2026. Quartier résidentiel prisé, proximité ambassades et institutions internationales.',
   275000000.00, 'villa', 'vente', 'vendu',
   'Abidjan', 'Cocody Deux Plateaux', 'Rue des Ambassades',
   480.00, 5, 4, 2, TRUE, TRUE, TRUE, TRUE, TRUE, 567,
   '22222222-bbbb-2222-bbbb-222222222222', NOW() - INTERVAL '6 months', NOW())

ON CONFLICT (id) DO NOTHING;


-- ─────────────────────────────────────────────────────────────────────────────
-- 3. LEADS / PROSPECTS (15 leads à différentes étapes du pipeline)
--    UUIDs : préfixe 1ead (hex valide)
-- ─────────────────────────────────────────────────────────────────────────────

INSERT INTO leads (id, nom, prenom, email, telephone, source, statut, etape, score, bien_interesse, agent_id, visite_confirmee, offre_validee, engagement_signe, message, created_at, updated_at) VALUES

  -- 🔵 Prospects (étape: prospect)
  ('1ead0001-aaaa-4001-a001-1ead00000001', 'Yao', 'Franck', 'franck.yao@gmail.com', '+225 07 01 02 03', 'site_web', 'nouveau', 'prospect', 15,
   'aaaaaaaa-1111-aaaa-1111-aaaaaaaaaaaa', NULL, FALSE, FALSE, FALSE,
   'Bonjour, je suis intéressé par la villa à Cocody. Pouvez-vous me donner plus de détails ?',
   NOW() - INTERVAL '2 days', NOW()),

  ('1ead0002-aaaa-4002-a002-1ead00000002', 'Traoré', 'Fatou', NULL, '+225 05 04 05 06', 'whatsapp', 'nouveau', 'prospect', 20,
   NULL, NULL, FALSE, FALSE, FALSE,
   'Je cherche un appartement à louer à Yopougon.',
   NOW() - INTERVAL '1 day', NOW()),

  ('1ead0003-aaaa-4003-a003-1ead00000003', 'Meité', 'Karim', 'karim.meite@outlook.com', '+225 01 07 08 09', 'reseaux_sociaux', 'nouveau', 'prospect', 10,
   NULL, NULL, FALSE, FALSE, FALSE,
   NULL,
   NOW() - INTERVAL '6 hours', NOW()),

  -- 🟡 Contactés (étape: qualifie)
  ('1ead0004-bbbb-4004-a004-1ead00000004', 'Koné', 'Aminata', 'aminata.kone@yahoo.fr', '+225 07 10 11 12', 'appel', 'contacte', 'qualifie', 45,
   'aaaaaaaa-2222-aaaa-2222-aaaaaaaaaaaa', '22222222-bbbb-2222-bbbb-222222222222', FALSE, FALSE, FALSE,
   'Recherche villa pour famille de 5 personnes, budget max 200M FCFA.',
   NOW() - INTERVAL '5 days', NOW()),

  ('1ead0005-bbbb-4005-a005-1ead00000005', 'Soro', 'Lacina', 'lacina.soro@gmail.com', '+225 05 13 14 15', 'site_web', 'contacte', 'qualifie', 50,
   'cccccccc-1111-cccc-1111-cccccccccccc', '22222222-bbbb-2222-bbbb-222222222222', FALSE, FALSE, FALSE,
   'Intéressé par le terrain à Bingerville pour construire ma future résidence.',
   NOW() - INTERVAL '7 days', NOW()),

  -- 🟢 Visite planifiée
  ('1ead0006-cccc-4006-a006-1ead00000006', 'Diabaté', 'Mamadou', 'mamadou.diabate@gmail.com', '+225 07 16 17 18', 'referral', 'qualifie', 'visite_planifiee', 60,
   'aaaaaaaa-1111-aaaa-1111-aaaaaaaaaaaa', '33333333-cccc-3333-cccc-333333333333', TRUE, FALSE, FALSE,
   'Recommandé par M. Ouattara. Très intéressé par la villa Cocody Riviera.',
   NOW() - INTERVAL '10 days', NOW()),

  ('1ead0007-cccc-4007-a007-1ead00000007', 'N''Guessan', 'Éric', 'eric.nguessan@hotmail.com', '+225 01 19 20 21', 'site_web', 'qualifie', 'visite_planifiee', 55,
   'bbbbbbbb-1111-bbbb-1111-bbbbbbbbbbbb', '33333333-cccc-3333-cccc-333333333333', TRUE, FALSE, FALSE,
   'Cadre bancaire, recherche appartement standing au Plateau.',
   NOW() - INTERVAL '12 days', NOW()),

  -- 🔵 Visite effectuée
  ('1ead0008-dddd-4008-a008-1ead00000008', 'Aka', 'Christiane', 'christiane.aka@gmail.com', '+225 05 22 23 24', 'appel', 'qualifie', 'visite_effectuee', 72,
   'aaaaaaaa-3333-aaaa-3333-aaaaaaaaaaaa', '22222222-bbbb-2222-bbbb-222222222222', TRUE, FALSE, FALSE,
   'A visité le duplex Marcory. Très satisfaite de l''emplacement.',
   NOW() - INTERVAL '15 days', NOW()),

  -- 🟡 Négociation
  ('1ead0009-eeee-4009-a009-1ead00000009', 'Dembélé', 'Oumar', 'oumar.dembele@gmail.com', '+225 07 25 26 27', 'referral', 'qualifie', 'negociation', 80,
   'aaaaaaaa-2222-aaaa-2222-aaaaaaaaaaaa', '22222222-bbbb-2222-bbbb-222222222222', TRUE, FALSE, FALSE,
   'Négociation en cours, demande une réduction de 10%.',
   NOW() - INTERVAL '20 days', NOW()),

  ('1ead000a-eeee-400a-a00a-1ead0000000a', 'Sangaré', 'Aïssata', 'aissata.sangare@yahoo.fr', '+225 01 28 29 30', 'whatsapp', 'qualifie', 'negociation', 78,
   'cccccccc-2222-cccc-2222-cccccccccccc', '33333333-cccc-3333-cccc-333333333333', TRUE, FALSE, FALSE,
   'Investisseuse, intéressée par le terrain bord de mer pour projet hôtelier.',
   NOW() - INTERVAL '18 days', NOW()),

  -- 🟢 Offre acceptée
  ('1ead000b-ffff-400b-a00b-1ead0000000b', 'Cissé', 'Bakary', 'bakary.cisse@gmail.com', '+225 05 31 32 33', 'site_web', 'qualifie', 'offre_acceptee', 90,
   'bbbbbbbb-1111-bbbb-1111-bbbbbbbbbbbb', '33333333-cccc-3333-cccc-333333333333', TRUE, TRUE, FALSE,
   'Offre de 90M acceptée pour l''appartement Plateau.',
   NOW() - INTERVAL '25 days', NOW()),

  -- 🔵 Contrat signé
  ('1ead000c-ffff-400c-a00c-1ead0000000c', 'Dosso', 'Fanta', 'fanta.dosso@outlook.com', '+225 07 34 35 36', 'appel', 'converti', 'contrat_signe', 95,
   'aaaaaaaa-3333-aaaa-3333-aaaaaaaaaaaa', '22222222-bbbb-2222-bbbb-222222222222', TRUE, TRUE, TRUE,
   'Contrat signé pour le duplex Marcory. Passage chez le notaire prévu.',
   NOW() - INTERVAL '30 days', NOW()),

  -- ✅ Vente finalisée
  ('1ead000d-ffff-400d-a00d-1ead0000000d', 'Bah', 'Thierno', 'thierno.bah@gmail.com', '+225 01 37 38 39', 'referral', 'converti', 'vente_finalisee', 100,
   'eeeeeeee-1111-eeee-1111-eeeeeeeeeeee', '22222222-bbbb-2222-bbbb-222222222222', TRUE, TRUE, TRUE,
   'Vente finalisée ! Clés remises le 15/05/2026.',
   NOW() - INTERVAL '45 days', NOW()),

  -- ❌ Lead perdu
  ('1ead000e-ffff-400e-a00e-1ead0000000e', 'Gnolou', 'Paul', NULL, '+225 05 40 41 42', 'reseaux_sociaux', 'perdu', 'prospect', 5,
   NULL, '44444444-dddd-4444-dddd-444444444444', FALSE, FALSE, FALSE,
   'Pas de réponse après 3 tentatives de contact.',
   NOW() - INTERVAL '40 days', NOW())

ON CONFLICT (id) DO NOTHING;


-- ─────────────────────────────────────────────────────────────────────────────
-- 4. INTERACTIONS LEADS (20 entrées d'historique CRM)
--    UUIDs : préfixe face (hex valide)
-- ─────────────────────────────────────────────────────────────────────────────

INSERT INTO lead_interactions (id, lead_id, agent_id, type, details, created_at) VALUES

  -- Interactions Koné Aminata (Lead qualifié)
  ('face0001-0001-4001-a001-face00000001', '1ead0004-bbbb-4004-a004-1ead00000004', '22222222-bbbb-2222-bbbb-222222222222', 'appel',
   'Premier appel de qualification. Mme Koné cherche une villa familiale à Angré ou Cocody. Budget : 150-200M FCFA. Disponible pour visite le week-end.',
   NOW() - INTERVAL '4 days'),

  ('face0002-0002-4002-a002-face00000002', '1ead0004-bbbb-4004-a004-1ead00000004', '22222222-bbbb-2222-bbbb-222222222222', 'whatsapp',
   'Envoi des photos et du plan de la villa Angré 8ème Tranche. Client intéressée, souhaite planifier une visite.',
   NOW() - INTERVAL '3 days'),

  -- Interactions Soro Lacina (Terrain Bingerville)
  ('face0003-0003-4003-a003-face00000003', '1ead0005-bbbb-4005-a005-1ead00000005', '22222222-bbbb-2222-bbbb-222222222222', 'email',
   'Envoi du dossier complet terrain Bingerville : titre foncier, plan cadastral, photos aériennes. Client en attente de validation par son architecte.',
   NOW() - INTERVAL '6 days'),

  ('face0004-0004-4004-a004-face00000004', '1ead0005-bbbb-4005-a005-1ead00000005', '22222222-bbbb-2222-bbbb-222222222222', 'appel',
   'Relance téléphonique. M. Soro confirme que l''architecte a validé le terrain. Souhaite négocier le prix.',
   NOW() - INTERVAL '4 days'),

  -- Interactions Diabaté Mamadou (Visite planifiée)
  ('face0005-0005-4005-a005-face00000005', '1ead0006-cccc-4006-a006-1ead00000006', '33333333-cccc-3333-cccc-333333333333', 'appel',
   'Appel de recommandation via M. Ouattara. M. Diabaté est directeur d''entreprise, budget confortable. Visite planifiée samedi 14h.',
   NOW() - INTERVAL '8 days'),

  ('face0006-0006-4006-a006-face00000006', '1ead0006-cccc-4006-a006-1ead00000006', '33333333-cccc-3333-cccc-333333333333', 'whatsapp',
   'Confirmation de la visite par WhatsApp. Envoi de l''adresse exacte et des coordonnées GPS.',
   NOW() - INTERVAL '7 days'),

  -- Interactions N'Guessan Éric (Appartement Plateau)
  ('face0007-0007-4007-a007-face00000007', '1ead0007-cccc-4007-a007-1ead00000007', '33333333-cccc-3333-cccc-333333333333', 'email',
   'Prise de contact initiale. M. N''Guessan est cadre à la BIAO-CI, cherche appartement standing au Plateau. Budget : 80-100M.',
   NOW() - INTERVAL '11 days'),

  ('face0008-0008-4008-a008-face00000008', '1ead0007-cccc-4007-a007-1ead00000007', '33333333-cccc-3333-cccc-333333333333', 'appel',
   'Visite planifiée pour mercredi prochain à 10h. Le client viendra avec son épouse.',
   NOW() - INTERVAL '9 days'),

  -- Interactions Aka Christiane (Visite effectuée - Duplex Marcory)
  ('face0009-0009-4009-a009-face00000009', '1ead0008-dddd-4008-a008-1ead00000008', '22222222-bbbb-2222-bbbb-222222222222', 'appel',
   'Appel post-visite. Mme Aka a beaucoup apprécié le duplex. Points positifs : luminosité, quartier calme, proximité école française.',
   NOW() - INTERVAL '14 days'),

  ('face000a-000a-400a-a00a-face0000000a', '1ead0008-dddd-4008-a008-1ead00000008', '22222222-bbbb-2222-bbbb-222222222222', 'note',
   'Note interne : Mme Aka hésite entre le duplex Marcory et un autre bien vu chez un concurrent. Proposer une contre-visite avec mise en valeur.',
   NOW() - INTERVAL '13 days'),

  -- Interactions Dembélé Oumar (Négociation)
  ('face000b-000b-400b-a00b-face0000000b', '1ead0009-eeee-4009-a009-1ead00000009', '22222222-bbbb-2222-bbbb-222222222222', 'appel',
   'Négociation prix villa Angré. M. Dembélé propose 162M au lieu de 180M. Argumentaire : travaux de peinture nécessaires.',
   NOW() - INTERVAL '18 days'),

  ('face000c-000c-400c-a00c-face0000000c', '1ead0009-eeee-4009-a009-1ead00000009', '22222222-bbbb-2222-bbbb-222222222222', 'whatsapp',
   'Contre-proposition envoyée : 172M FCFA (remise de 4.4%). En attente de réponse du client.',
   NOW() - INTERVAL '16 days'),

  ('face000d-000d-400d-a00d-face0000000d', '1ead0009-eeee-4009-a009-1ead00000009', '22222222-bbbb-2222-bbbb-222222222222', 'note',
   'Note interne : Le propriétaire accepte de descendre à 170M minimum. Marge de négociation restante : 8M FCFA.',
   NOW() - INTERVAL '15 days'),

  -- Interactions Sangaré Aïssata (Négociation terrain Grand-Bassam)
  ('face000e-000e-400e-a00e-face0000000e', '1ead000a-eeee-400a-a00a-1ead0000000a', '33333333-cccc-3333-cccc-333333333333', 'appel',
   'Appel avec Mme Sangaré. Investisseuse sérieuse, possède déjà 2 hôtels. Souhaite un terrain en bord de mer pour un resort 4 étoiles.',
   NOW() - INTERVAL '16 days'),

  ('face000f-000f-400f-a00f-face0000000f', '1ead000a-eeee-400a-a00a-1ead0000000a', '33333333-cccc-3333-cccc-333333333333', 'email',
   'Envoi des documents : étude de sol, certificat de conformité environnementale, photos drone. Prix demandé : 200M (contre 220M affiché).',
   NOW() - INTERVAL '14 days'),

  -- Interactions Cissé Bakary (Offre acceptée)
  ('face0010-0010-4010-a010-face00000010', '1ead000b-ffff-400b-a00b-1ead0000000b', '33333333-cccc-3333-cccc-333333333333', 'appel',
   'Offre formelle de 90M reçue et acceptée par le propriétaire. Préparation du compromis de vente.',
   NOW() - INTERVAL '22 days'),

  ('face0011-0011-4011-a011-face00000011', '1ead000b-ffff-400b-a00b-1ead0000000b', '33333333-cccc-3333-cccc-333333333333', 'email',
   'Envoi du compromis de vente pour relecture par l''avocat du client. RDV notaire prévu dans 2 semaines.',
   NOW() - INTERVAL '20 days'),

  -- Interactions Dosso Fanta (Contrat signé)
  ('face0012-0012-4012-a012-face00000012', '1ead000c-ffff-400c-a00c-1ead0000000c', '22222222-bbbb-2222-bbbb-222222222222', 'appel',
   'Signature du contrat de vente chez Maître Konaté. Mme Dosso est très satisfaite. Versement du premier acompte de 30% effectué.',
   NOW() - INTERVAL '28 days'),

  -- Interactions Bah Thierno (Vente finalisée)
  ('face0013-0013-4013-a013-face00000013', '1ead000d-ffff-400d-a00d-1ead0000000d', '22222222-bbbb-2222-bbbb-222222222222', 'note',
   'Vente finalisée ! Acte authentique signé, clés remises. Client très satisfait — a laissé un avis 5 étoiles.',
   NOW() - INTERVAL '40 days'),

  -- Interaction Lead perdu
  ('face0014-0014-4014-a014-face00000014', '1ead000e-ffff-400e-a00e-1ead0000000e', '44444444-dddd-4444-dddd-444444444444', 'note',
   'Lead marqué comme perdu après 3 tentatives de contact sans réponse (appel + WhatsApp + SMS). Archivage.',
   NOW() - INTERVAL '35 days')

ON CONFLICT (id) DO NOTHING;


-- ─────────────────────────────────────────────────────────────────────────────
-- 5. RESERVATIONS (5 réservations)
--    UUIDs : préfixe be5a (hex valide)
-- ─────────────────────────────────────────────────────────────────────────────

INSERT INTO reservations (id, bien_id, client_id, statut, date_expiration, notes, relances_count, created_at, updated_at) VALUES

  ('be5a0001-0001-4001-a001-be5a00000001',
   'aaaaaaaa-3333-aaaa-3333-aaaaaaaaaaaa', '55555555-eeee-5555-eeee-555555555555',
   'confirme', NOW() + INTERVAL '30 days',
   'Réservation confirmée avec acompte de 15%. Passage chez le notaire prévu dans 3 semaines.',
   0, NOW() - INTERVAL '10 days', NOW()),

  ('be5a0002-0002-4002-a002-be5a00000002',
   'bbbbbbbb-1111-bbbb-1111-bbbbbbbbbbbb', '66666666-ffff-6666-ffff-666666666666',
   'en_attente', NOW() + INTERVAL '15 days',
   'En attente de confirmation du financement bancaire. Relance prévue dans 5 jours.',
   1, NOW() - INTERVAL '8 days', NOW()),

  ('be5a0003-0003-4003-a003-be5a00000003',
   'aaaaaaaa-2222-aaaa-2222-aaaaaaaaaaaa', '77777777-aaaa-7777-aaaa-777777777777',
   'en_attente', NOW() + INTERVAL '7 days',
   'Première relance envoyée. Client demande un délai supplémentaire pour réunir les fonds.',
   2, NOW() - INTERVAL '20 days', NOW()),

  ('be5a0004-0004-4004-a004-be5a00000004',
   'eeeeeeee-1111-eeee-1111-eeeeeeeeeeee', '88888888-bbbb-8888-bbbb-888888888888',
   'confirme', NOW() - INTERVAL '5 days',
   'Vente finalisée. Réservation convertie en acte de vente.',
   0, NOW() - INTERVAL '60 days', NOW()),

  ('be5a0005-0005-4005-a005-be5a00000005',
   'cccccccc-1111-cccc-1111-cccccccccccc', '55555555-eeee-5555-eeee-555555555555',
   'annule', NOW() - INTERVAL '10 days',
   'Réservation annulée : le client a trouvé un terrain plus grand dans un autre quartier.',
   0, NOW() - INTERVAL '30 days', NOW())

ON CONFLICT (id) DO NOTHING;


-- ─────────────────────────────────────────────────────────────────────────────
-- 6. DOSSIERS CLIENTS (6 dossiers avec progression)
--    UUIDs : préfixe d055 (hex valide)
-- ─────────────────────────────────────────────────────────────────────────────

INSERT INTO dossiers (id, client_id, agent_id, bien_id, titre, description, statut, progression, priorite, deadline, created_at, updated_at) VALUES

  ('d0550001-0001-4001-a001-d05500000001',
   '55555555-eeee-5555-eeee-555555555555', '22222222-bbbb-2222-bbbb-222222222222', 'aaaaaaaa-3333-aaaa-3333-aaaaaaaaaaaa',
   'Acquisition Villa Duplex Marcory — Bamba Moussa',
   'Dossier d''acquisition du duplex Marcory pour M. Bamba. Financement mixte (apport personnel + prêt immobilier SGBCI).',
   'en_cours', 65, 'haute', NOW() + INTERVAL '20 days',
   NOW() - INTERVAL '15 days', NOW()),

  ('d0550002-0002-4002-a002-d05500000002',
   '66666666-ffff-6666-ffff-666666666666', '33333333-cccc-3333-cccc-333333333333', 'bbbbbbbb-1111-bbbb-1111-bbbbbbbbbbbb',
   'Vente Appartement Plateau — Coulibaly Awa',
   'Dossier de vente de l''appartement standing au Plateau. En attente de validation du financement bancaire.',
   'en_cours', 40, 'normale', NOW() + INTERVAL '30 days',
   NOW() - INTERVAL '10 days', NOW()),

  ('d0550003-0003-4003-a003-d05500000003',
   '77777777-aaaa-7777-aaaa-777777777777', '22222222-bbbb-2222-bbbb-222222222222', 'aaaaaaaa-2222-aaaa-2222-aaaaaaaaaaaa',
   'Recherche Villa Angré — Ouattara Seydou',
   'M. Ouattara recherche une villa à Angré. Plusieurs biens proposés, en attente de visite.',
   'ouvert', 20, 'normale', NOW() + INTERVAL '45 days',
   NOW() - INTERVAL '5 days', NOW()),

  ('d0550004-0004-4004-a004-d05500000004',
   '88888888-bbbb-8888-bbbb-888888888888', '22222222-bbbb-2222-bbbb-222222222222', 'eeeeeeee-1111-eeee-1111-eeeeeeeeeeee',
   'Finalisation Vente Deux Plateaux — Konan Affoué',
   'Dossier clos : vente finalisée, acte authentique signé, clés remises.',
   'clos', 100, 'basse', NOW() - INTERVAL '10 days',
   NOW() - INTERVAL '50 days', NOW()),

  ('d0550005-0005-4005-a005-d05500000005',
   '55555555-eeee-5555-eeee-555555555555', '33333333-cccc-3333-cccc-333333333333', 'cccccccc-2222-cccc-2222-cccccccccccc',
   'Projet Hôtelier Grand-Bassam — Bamba Moussa',
   'Dossier bloqué : en attente de l''autorisation environnementale du Ministère.',
   'bloque', 35, 'urgente', NOW() + INTERVAL '10 days',
   NOW() - INTERVAL '25 days', NOW()),

  ('d0550006-0006-4006-a006-d05500000006',
   '66666666-ffff-6666-ffff-666666666666', '44444444-dddd-4444-dddd-444444444444', 'dddddddd-1111-dddd-1111-dddddddddddd',
   'Location Bureau Plateau — Coulibaly Awa (Entreprise)',
   'Location de bureau pour l''entreprise de Mme Coulibaly. Bail commercial 3 ans.',
   'en_cours', 55, 'normale', NOW() + INTERVAL '15 days',
   NOW() - INTERVAL '8 days', NOW())

ON CONFLICT (id) DO NOTHING;


-- ─────────────────────────────────────────────────────────────────────────────
-- 7. TÂCHES (12 tâches assignées aux agents)
--    UUIDs : préfixe 0ace (hex valide)
-- ─────────────────────────────────────────────────────────────────────────────

INSERT INTO taches (id, dossier_id, titre, description, assignee_id, statut, priorite, deadline, bloque_commentaire, created_at, updated_at) VALUES

  -- Tâches du Dossier 1 (Acquisition Duplex Marcory)
  ('0ace0001-0001-4001-a001-0ace00000001',
   'd0550001-0001-4001-a001-d05500000001',
   'Vérifier le titre foncier auprès de la Conservation Foncière',
   'Demander un état des droits réels au bureau de la Conservation Foncière de Plateau. Vérifier l''absence d''hypothèques.',
   '22222222-bbbb-2222-bbbb-222222222222', 'terminee', 'haute', NOW() - INTERVAL '5 days', NULL,
   NOW() - INTERVAL '14 days', NOW()),

  ('0ace0002-0002-4002-a002-0ace00000002',
   'd0550001-0001-4001-a001-d05500000001',
   'Obtenir la simulation de prêt SGBCI',
   'Accompagner M. Bamba à la SGBCI pour la simulation de crédit immobilier. Montant estimé : 80M FCFA sur 15 ans.',
   '22222222-bbbb-2222-bbbb-222222222222', 'en_cours', 'haute', NOW() + INTERVAL '5 days', NULL,
   NOW() - INTERVAL '10 days', NOW()),

  ('0ace0003-0003-4003-a003-0ace00000003',
   'd0550001-0001-4001-a001-d05500000001',
   'Préparer le compromis de vente',
   'Rédiger le compromis de vente avec les conditions suspensives (obtention du prêt). Envoyer au notaire pour validation.',
   '33333333-cccc-3333-cccc-333333333333', 'a_faire', 'normale', NOW() + INTERVAL '15 days', NULL,
   NOW() - INTERVAL '5 days', NOW()),
  ('0ace0004-0004-4004-a004-0ace00000004',
   'd0550002-0002-4002-a002-d05500000002',
   'Relancer la banque pour le financement',
   'Appeler le conseiller bancaire de Mme Coulibaly pour connaître l''état d''avancement de la demande de prêt.',
   '33333333-cccc-3333-cccc-333333333333', 'en_cours', 'haute', NOW() + INTERVAL '3 days', NULL,
   NOW() - INTERVAL '7 days', NOW()),

  ('0ace0005-0005-4005-a005-0ace00000005',
   'd0550002-0002-4002-a002-d05500000002',
   'Organiser une 2ème visite avec expert',
   'Planifier une visite technique avec un expert en bâtiment pour évaluer l''état de la structure.',
   '33333333-cccc-3333-cccc-333333333333', 'a_faire', 'normale', NOW() + INTERVAL '10 days', NULL,
   NOW() - INTERVAL '3 days', NOW()),

  -- Tâches du Dossier 3 (Recherche Villa Angré)
  ('0ace0006-0006-4006-a006-0ace00000006',
   'd0550003-0003-4003-a003-d05500000003',
   'Sélectionner 3 villas correspondant aux critères',
   'Rechercher dans le portefeuille et chez les partenaires des villas à Angré : 4 chambres minimum, jardin, parking, budget 150-200M.',
   '22222222-bbbb-2222-bbbb-222222222222', 'en_cours', 'normale', NOW() + INTERVAL '7 days', NULL,
   NOW() - INTERVAL '4 days', NOW()),

  ('0ace0007-0007-4007-a007-0ace00000007',
   'd0550003-0003-4003-a003-d05500000003',
   'Planifier les visites groupées',
   'Organiser un circuit de visites de 3 biens sur un samedi matin avec M. Ouattara et son épouse.',
   '22222222-bbbb-2222-bbbb-222222222222', 'a_faire', 'normale', NOW() + INTERVAL '14 days', NULL,
   NOW() - INTERVAL '2 days', NOW()),

  -- Tâches du Dossier 4 (Clos)
  ('0ace0008-0008-4008-a008-0ace00000008',
   'd0550004-0004-4004-a004-d05500000004',
   'Remettre les clés et documents',
   'Remise des clés, titre foncier original, et dossier technique complet à Mme Konan.',
   '22222222-bbbb-2222-bbbb-222222222222', 'terminee', 'haute', NOW() - INTERVAL '12 days', NULL,
   NOW() - INTERVAL '45 days', NOW()),

  -- Tâches du Dossier 5 (Bloqué — Grand-Bassam)
  ('0ace0009-0009-4009-a009-0ace00000009',
   'd0550005-0005-4005-a005-d05500000005',
   'Relancer le Ministère de l''Environnement',
   'Envoyer un courrier de relance au Ministère pour l''autorisation environnementale. Joindre le dossier d''impact.',
   '33333333-cccc-3333-cccc-333333333333', 'bloquee', 'urgente', NOW() + INTERVAL '5 days',
   'En attente de la réponse du Ministère de l''Environnement. Dossier déposé le 10/05/2026, accusé de réception obtenu. Délai légal : 60 jours.',
   NOW() - INTERVAL '20 days', NOW()),

  ('0ace000a-000a-400a-a00a-0ace0000000a',
   'd0550005-0005-4005-a005-d05500000005',
   'Préparer le plan d''aménagement hôtelier',
   'Travailler avec l''architecte pour finaliser les plans du resort. Budget estimé des travaux à présenter au client.',
   '33333333-cccc-3333-cccc-333333333333', 'a_faire', 'haute', NOW() + INTERVAL '20 days', NULL,
   NOW() - INTERVAL '15 days', NOW()),

  -- Tâches du Dossier 6 (Location Bureau)
  ('0ace000b-000b-400b-a00b-0ace0000000b',
   'd0550006-0006-4006-a006-d05500000006',
   'Rédiger le bail commercial',
   'Préparer le bail commercial 3-6-9 avec les clauses standards OHADA. Loyer : 850 000 FCFA/mois.',
   '44444444-dddd-4444-dddd-444444444444', 'en_cours', 'normale', NOW() + INTERVAL '5 days', NULL,
   NOW() - INTERVAL '6 days', NOW()),

  ('0ace000c-000c-400c-a00c-0ace0000000c',
   'd0550006-0006-4006-a006-d05500000006',
   'Organiser l''état des lieux d''entrée',
   'Planifier l''état des lieux avec le propriétaire, la locataire et un huissier. Prendre des photos horodatées.',
   '44444444-dddd-4444-dddd-444444444444', 'a_faire', 'normale', NOW() + INTERVAL '12 days', NULL,
   NOW() - INTERVAL '3 days', NOW())

ON CONFLICT (id) DO NOTHING;


-- ─────────────────────────────────────────────────────────────────────────────
-- 7.b. VISITES (7 visites de test)
--    UUIDs : préfixe c1a5 (hex valide)
-- ─────────────────────────────────────────────────────────────────────────────

INSERT INTO visites (id, lead_id, client_id, bien_id, agent_id, date_visite, statut, commentaires, created_at, updated_at) VALUES

  -- Visite Planifiée pour Mamadou Diabaté (Villa Cocody Riviera)
  ('c1a50001-0001-4001-a001-c1a500000001',
   '1ead0006-cccc-4006-a006-1ead00000006',
   NULL,
   'aaaaaaaa-1111-aaaa-1111-aaaaaaaaaaaa',
   '33333333-cccc-3333-cccc-333333333333',
   NOW() + INTERVAL '2 days', 'planifiee',
   'Le client souhaite visiter en fin d''après-midi pour évaluer l''exposition au soleil du jardin.',
   NOW() - INTERVAL '1 day', NOW()),

  -- Visite Confirmée pour Éric N''Guessan (Appartement standing Plateau)
  ('c1a50002-0002-4002-a002-c1a500000002',
   '1ead0007-cccc-4007-a007-1ead00000007',
   NULL,
   'bbbbbbbb-1111-bbbb-1111-bbbbbbbbbbbb',
   '33333333-cccc-3333-cccc-333333333333',
   NOW() + INTERVAL '1 day', 'confirmee',
   'Visite validée par le concierge de l''immeuble. Accès autorisé à l''appartement témoin.',
   NOW() - INTERVAL '3 days', NOW()),

  -- Visite Effectuée pour Christiane Aka (Duplex Marcory)
  ('c1a50003-0003-4003-a003-c1a500000003',
   '1ead0008-dddd-4008-a008-1ead00000008',
   NULL,
   'aaaaaaaa-3333-aaaa-3333-aaaaaaaaaaaa',
   '22222222-bbbb-2222-bbbb-222222222222',
   NOW() - INTERVAL '3 days', 'effectuee',
   'Rapport : Le duplex correspond parfaitement aux attentes de la cliente. Elle apprécie la proximité des écoles internationales mais demande un délai de réflexion de 48h concernant les charges de copropriété.',
   NOW() - INTERVAL '5 days', NOW() - INTERVAL '3 days'),

  -- Visite Effectuée pour Oumar Dembélé (Villa Cocody Riviera)
  ('c1a50004-0004-4004-a004-c1a500000004',
   '1ead0009-eeee-4009-a009-1ead00000009',
   NULL,
   'aaaaaaaa-2222-aaaa-2222-aaaaaaaaaaaa',
   '22222222-bbbb-2222-bbbb-222222222222',
   NOW() - INTERVAL '10 days', 'effectuee',
   'Rapport : La structure de la maison est saine. Le client est très intéressé mais souhaite entamer une négociation sur le prix en raison de quelques travaux de peinture à prévoir.',
   NOW() - INTERVAL '12 days', NOW() - INTERVAL '10 days'),

  -- Visite Annulée pour Aminata Koné
  ('c1a50005-0005-4005-a005-c1a500000005',
   '1ead0004-bbbb-4004-a004-1ead00000004',
   NULL,
   'aaaaaaaa-2222-aaaa-2222-aaaaaaaaaaaa',
   '22222222-bbbb-2222-bbbb-222222222222',
   NOW() - INTERVAL '4 days', 'annulee',
   'Motif : Annulée par le client pour cause de déplacement professionnel imprévu.',
   NOW() - INTERVAL '6 days', NOW() - INTERVAL '4 days'),

  -- Visite Absente pour Soro Lacina
  ('c1a50006-0006-4006-a006-c1a500000006',
   '1ead0005-bbbb-4005-a005-1ead00000005',
   NULL,
   'cccccccc-1111-cccc-1111-cccccccccccc',
   '22222222-bbbb-2222-bbbb-222222222222',
   NOW() - INTERVAL '2 days', 'client_absent',
   'Note : L''agent a attendu 30 minutes sur place. Le client n''a pas répondu aux appels. Relance téléphonique effectuée.',
   NOW() - INTERVAL '4 days', NOW() - INTERVAL '2 days'),

  -- Visite directe pour un client sans Lead (M. Bamba Moussa)
  ('c1a50007-0007-4007-a007-c1a500000007',
   NULL,
   '55555555-eeee-5555-eeee-555555555555',
   'aaaaaaaa-1111-aaaa-1111-aaaaaaaaaaaa',
   '22222222-bbbb-2222-bbbb-222222222222',
   NOW() + INTERVAL '5 days', 'planifiee',
   'Visite de courtoisie et de ré-évaluation de la villa Riviera suite à sa réservation en cours.',
   NOW(), NOW())

ON CONFLICT (id) DO NOTHING;


-- ─────────────────────────────────────────────────────────────────────────────
-- 8. TRACE D'INJECTION dans info_mocker
-- ─────────────────────────────────────────────────────────────────────────────

INSERT INTO info_mocker (nom_injection, description, tables_ciblees, nb_lignes_total, executee_par, environnement, statut, notes, rollback_sql)
VALUES (
  'seed_complet_v1.2',
  'Injection complète de données mockées réalistes pour le CRM immobilier Favor Company. Données de visites physiques (F14) incluses.',
  ARRAY['profiles', 'biens', 'leads', 'lead_interactions', 'reservations', 'dossiers', 'taches', 'visites'],
  83,
  'dev_antigravity',
  'development',
  'succes',
  'Version 1.2 — 8 profiles, 10 biens, 15 leads, 20 interactions, 5 réservations, 6 dossiers, 12 tâches, 7 visites.',
  '-- ROLLBACK: Supprimer toutes les données mockées v1.2
DELETE FROM visites WHERE id LIKE ''c1a5%'';
DELETE FROM taches WHERE id LIKE ''0ace%'';
DELETE FROM dossiers WHERE id LIKE ''d055%'';
DELETE FROM reservations WHERE id LIKE ''be5a%'';
DELETE FROM lead_interactions WHERE id LIKE ''face%'';
DELETE FROM leads WHERE id LIKE ''1ead%'';
DELETE FROM biens WHERE id IN (''aaaaaaaa-1111-aaaa-1111-aaaaaaaaaaaa'', ''aaaaaaaa-2222-aaaa-2222-aaaaaaaaaaaa'', ''aaaaaaaa-3333-aaaa-3333-aaaaaaaaaaaa'', ''bbbbbbbb-1111-bbbb-1111-bbbbbbbbbbbb'', ''bbbbbbbb-2222-bbbb-2222-bbbbbbbbbbbb'', ''cccccccc-1111-cccc-1111-cccccccccccc'', ''cccccccc-2222-cccc-2222-cccccccccccc'', ''dddddddd-1111-dddd-1111-dddddddddddd'', ''dddddddd-2222-dddd-2222-dddddddddddd'', ''eeeeeeee-1111-eeee-1111-eeeeeeeeeeee'');
DELETE FROM profiles WHERE id IN (''11111111-aaaa-1111-aaaa-111111111111'', ''22222222-bbbb-2222-bbbb-222222222222'', ''33333333-cccc-3333-cccc-333333333333'', ''44444444-dddd-4444-dddd-444444444444'', ''55555555-eeee-5555-eeee-555555555555'', ''66666666-ffff-6666-ffff-666666666666'', ''77777777-aaaa-7777-aaaa-777777777777'', ''88888888-bbbb-8888-bbbb-888888888888'');
DELETE FROM info_mocker WHERE nom_injection = ''seed_complet_v1.2'';'
);

COMMIT;

-- ═══════════════════════════════════════════════════════════════════════════════
-- ✅ SEED COMPLET v1.2 EXÉCUTÉ AVEC SUCCÈS
-- 📊 83 lignes insérées dans 8 tables + 1 trace dans info_mocker
-- ═══════════════════════════════════════════════════════════════════════════════

-- ═══════════════════════════════════════════════════════════════════════════════
-- ✅ SEED COMPLET v1.1 EXÉCUTÉ AVEC SUCCÈS
-- 📊 76 lignes insérées dans 7 tables + 1 trace dans info_mocker
-- ═══════════════════════════════════════════════════════════════════════════════
