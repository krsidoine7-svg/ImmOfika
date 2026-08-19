-- Suppression de la table team_members
DROP TABLE IF EXISTS "team_members";

-- Suppression de la configuration 'team' dans homepage_configs
DELETE FROM "homepage_configs" WHERE section = 'team';
