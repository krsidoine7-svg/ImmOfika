-- ═══════════════════════════════════════════════════════════════════════════════
-- 📋 INFO_MOCKER — Table de Traçabilité des Injections de Données Mockées
-- ═══════════════════════════════════════════════════════════════════════════════
-- Projet  : Favor Company International
-- Auteur  : IA Antigravity (Session Dev)
-- Date    : 2026-06-04
-- But     : Garder une trace de chaque injection de données mockées en BDD
-- ═══════════════════════════════════════════════════════════════════════════════

-- 1. Création de la table de traçabilité
CREATE TABLE IF NOT EXISTS info_mocker (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nom_injection   TEXT NOT NULL,                          -- Ex: 'seed_initial_v1'
  description     TEXT,                                   -- Ce que contient cette injection
  tables_ciblees  TEXT[] NOT NULL DEFAULT '{}',            -- Liste des tables touchées
  nb_lignes_total INTEGER NOT NULL DEFAULT 0,             -- Nombre total de lignes insérées
  executee_par    TEXT DEFAULT 'dev_local',                -- Qui a lancé le seed
  environnement   TEXT DEFAULT 'development' NOT NULL,    -- 'development', 'staging', 'test'
  statut          TEXT DEFAULT 'succes' NOT NULL,         -- 'succes', 'echec', 'partiel'
  notes           TEXT,                                   -- Notes libres
  executed_at     TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  rollback_sql    TEXT                                    -- SQL pour annuler l'injection
);

-- 2. Index pour retrouver rapidement les injections par date ou environnement
CREATE INDEX IF NOT EXISTS idx_info_mocker_env ON info_mocker(environnement);
CREATE INDEX IF NOT EXISTS idx_info_mocker_date ON info_mocker(executed_at DESC);

-- 3. Commentaire sur la table
COMMENT ON TABLE info_mocker IS 'Table de traçabilité des injections de données mockées — NE PAS UTILISER EN PRODUCTION';
COMMENT ON COLUMN info_mocker.nom_injection IS 'Identifiant unique de cette session d''injection (ex: seed_initial_v1)';
COMMENT ON COLUMN info_mocker.tables_ciblees IS 'Array des noms de tables qui ont reçu des données';
COMMENT ON COLUMN info_mocker.rollback_sql IS 'Requête SQL pour supprimer proprement les données injectées';

-- ═══════════════════════════════════════════════════════════════════════════════
-- ✅ Table info_mocker créée avec succès
-- ═══════════════════════════════════════════════════════════════════════════════
