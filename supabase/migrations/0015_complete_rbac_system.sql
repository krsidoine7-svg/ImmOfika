-- ==============================================================================
-- IMMOFIKA - Migration 0015 : Système RBAC Complet, Garde-fous et Multi-rôles
-- ==============================================================================

-- 1. Tables de Rôles et Permissions enrichies
CREATE TABLE IF NOT EXISTS "roles" (
  "name" TEXT PRIMARY KEY,
  "label" TEXT,
  "hierarchy_level" INTEGER NOT NULL DEFAULT 1,
  "is_system" BOOLEAN NOT NULL DEFAULT TRUE,
  "description" TEXT,
  "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Colonnes complémentaires sur roles si la table existait déjà
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'roles' AND column_name = 'label') THEN
    ALTER TABLE "roles" ADD COLUMN "label" TEXT;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'roles' AND column_name = 'hierarchy_level') THEN
    ALTER TABLE "roles" ADD COLUMN "hierarchy_level" INTEGER NOT NULL DEFAULT 1;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'roles' AND column_name = 'is_system') THEN
    ALTER TABLE "roles" ADD COLUMN "is_system" BOOLEAN NOT NULL DEFAULT TRUE;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'roles' AND column_name = 'created_at') THEN
    ALTER TABLE "roles" ADD COLUMN "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW();
  END IF;
END $$;

CREATE TABLE IF NOT EXISTS "permissions" (
  "code" TEXT PRIMARY KEY,
  "label" TEXT,
  "resource" TEXT,
  "action" TEXT,
  "scope" TEXT,
  "is_sensitive" BOOLEAN NOT NULL DEFAULT FALSE,
  "description" TEXT,
  "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Colonnes complémentaires sur permissions si la table existait déjà
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'permissions' AND column_name = 'label') THEN
    ALTER TABLE "permissions" ADD COLUMN "label" TEXT;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'permissions' AND column_name = 'resource') THEN
    ALTER TABLE "permissions" ADD COLUMN "resource" TEXT;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'permissions' AND column_name = 'action') THEN
    ALTER TABLE "permissions" ADD COLUMN "action" TEXT;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'permissions' AND column_name = 'scope') THEN
    ALTER TABLE "permissions" ADD COLUMN "scope" TEXT;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'permissions' AND column_name = 'is_sensitive') THEN
    ALTER TABLE "permissions" ADD COLUMN "is_sensitive" BOOLEAN NOT NULL DEFAULT FALSE;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'permissions' AND column_name = 'created_at') THEN
    ALTER TABLE "permissions" ADD COLUMN "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW();
  END IF;
END $$;

-- 2. Table de liaison active des permissions accordées
CREATE TABLE IF NOT EXISTS "role_permissions" (
  "role_name" TEXT NOT NULL REFERENCES "roles"("name") ON DELETE CASCADE,
  "permission_code" TEXT NOT NULL REFERENCES "permissions"("code") ON DELETE CASCADE,
  "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  PRIMARY KEY ("role_name", "permission_code")
);

-- S'assurer d'une contrainte unique sur role_permissions
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conrelid = 'role_permissions'::regclass AND contype IN ('p', 'u')
  ) THEN
    DELETE FROM "role_permissions" a USING "role_permissions" b
    WHERE a.ctid < b.ctid AND a.role_name = b.role_name AND a.permission_code = b.permission_code;

    ALTER TABLE "role_permissions" ADD CONSTRAINT "uq_role_permissions" UNIQUE ("role_name", "permission_code");
  END IF;
END $$;

-- 3. Table de référence des permissions par défaut (pour Réinitialisation)
CREATE TABLE IF NOT EXISTS "default_role_permissions" (
  "role_name" TEXT NOT NULL REFERENCES "roles"("name") ON DELETE CASCADE,
  "permission_code" TEXT NOT NULL REFERENCES "permissions"("code") ON DELETE CASCADE,
  "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  PRIMARY KEY ("role_name", "permission_code")
);

-- 4. Table d'attribution multi-rôles pour les utilisateurs
CREATE TABLE IF NOT EXISTS "user_roles" (
  "user_id" UUID NOT NULL REFERENCES "profiles"("id") ON DELETE CASCADE,
  "role_name" TEXT NOT NULL REFERENCES "roles"("name") ON DELETE CASCADE,
  "assigned_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  "assigned_by" UUID REFERENCES "profiles"("id") ON DELETE SET NULL,
  PRIMARY KEY ("user_id", "role_name")
);

CREATE INDEX IF NOT EXISTS "idx_user_roles_user" ON "user_roles"("user_id");
CREATE INDEX IF NOT EXISTS "idx_user_roles_role" ON "user_roles"("role_name");
CREATE INDEX IF NOT EXISTS "idx_role_permissions_role" ON "role_permissions"("role_name");
CREATE INDEX IF NOT EXISTS "idx_role_permissions_code" ON "role_permissions"("permission_code");

-- 5. Insertion / Mise à jour des 8 rôles hiérarchiques système
INSERT INTO "roles" ("name", "label", "hierarchy_level", "is_system", "description")
VALUES
  ('visiteur',     'Visiteur public',                  1, TRUE, 'Utilisateur anonyme non connecté'),
  ('client',       'Client / Chercheur de logement',    2, TRUE, 'Particulier connecté cherchant à louer ou acheter'),
  ('proprietaire', 'Annonceur / Propriétaire',         3, TRUE, 'Particulier ou bailleur publiant des biens'),
  ('agence',       'Agence & Entreprise',              4, TRUE, 'Agence immobilière professionnelle ou promoteur'),
  ('moderateur',   'Modérateur de contenu',            5, TRUE, 'Responsable du contrôle des annonces et signalements'),
  ('support',      'Support & Relation Client',        6, TRUE, 'Assistance aux utilisateurs et gestion des tickets'),
  ('admin',        'Administrateur de la plateforme',  7, TRUE, 'Gestion opérationnelle, utilisateurs et catalogue'),
  ('super_admin',  'Super Administrateur',             8, TRUE, 'Accès système absolu, sécurité, sauvegardes et finances'),
  -- Alias de compatibilité
  ('agent',        'Agent Terrain ImmOfika',           4, TRUE, 'Agent commercial gérant les visites et vérifications'),
  ('promoteur',    'Promoteur Agréé',                  4, TRUE, 'Promoteur immobilier agréé'),
  ('tech_super_admin', 'Tech Lead Super Admin',        8, TRUE, 'Administrateur technique racine')
ON CONFLICT ("name") DO UPDATE SET
  "label" = EXCLUDED."label",
  "hierarchy_level" = EXCLUDED."hierarchy_level",
  "is_system" = EXCLUDED."is_system",
  "description" = EXCLUDED."description";

-- 6. Définition des permissions granulaires (ressource:action:portee)
INSERT INTO "permissions" ("code", "label", "resource", "action", "scope", "is_sensitive", "description")
VALUES
  -- Annonces
  ('annonce:voir_publiques',           'Voir les annonces publiques',                 'annonce',      'voir_publiques',     'all',  FALSE, 'Consulter le catalogue public des annonces validées'),
  ('annonce:creer:own',                'Créer une annonce (quota selon plan)',        'annonce',      'creer',              'own',  FALSE, 'Déposer une nouvelle annonce soumise à modération'),
  ('annonce:modifier:own',             'Modifier ses propres annonces',               'annonce',      'modifier',           'own',  FALSE, 'Éditer les détails de ses propres biens'),
  ('annonce:supprimer:own',            'Archiver ou supprimer ses propres annonces',  'annonce',      'supprimer',          'own',  FALSE, 'Retirer ses propres annonces de la publication'),
  ('annonce:voir_toutes',              'Voir toutes les annonces (même en attente)',  'annonce',      'voir_toutes',        'all',  FALSE, 'Accéder au catalogue global et aux brouillons'),
  ('annonce:moderer',                  'Modérer les annonces (valider / refuser)',     'annonce',      'moderer',            'all',  FALSE, 'Approuver ou rejeter les annonces déposées'),
  ('annonce:supprimer:all',            'Supprimer n''importe quelle annonce',         'annonce',      'supprimer',          'all',  FALSE, 'Suppression administrative définitive'),

  -- Profils & Utilisateurs
  ('profil:voir_modifier:own',         'Consulter et modifier son propre profil',     'profil',       'gerer',              'own',  FALSE, 'Mettre à jour ses coordonnées personnelles'),
  ('utilisateur:voir',                 'Voir l''annuaire des utilisateurs',           'utilisateur',  'voir',               'all',  FALSE, 'Consulter les profils utilisateurs dans l''admin'),
  ('utilisateur:voir_contact',         'Voir les coordonnées de contact direct',      'utilisateur',  'voir_contact',       'all',  FALSE, 'Accès aux numéros et emails pour le support'),
  ('utilisateur:desactiver',           'Suspendre ou bannir un utilisateur',          'utilisateur',  'desactiver',         'all',  FALSE, 'Désactiver temporairement un compte fraudeur'),
  ('utilisateur:supprimer_definitif',  'Supprimer définitivement un compte',          'utilisateur',  'supprimer_definitif','all',  TRUE,  '🔒 Droit RGPD ultime de purge d''un utilisateur'),

  -- Interactions, Favoris, Contacts
  ('favori:gerer:own',                 'Gérer ses biens favoris',                     'favori',       'gerer',              'own',  FALSE, 'Ajouter ou retirer des coups de cœur'),
  ('contact:envoyer',                  'Envoyer un message de contact ou lead',       'contact',      'envoyer',            'all',  FALSE, 'Formulaire de demande de contact ou rappel'),
  ('message:voir_demandes:own',        'Consulter les messages reçus sur ses biens',  'message',      'voir_demandes',      'own',  FALSE, 'Boîte de réception des prospects'),
  ('avis:creer:own',                   'Laisser un avis vérifié',                     'avis',         'creer',              'own',  FALSE, 'Noter une visite ou une agence'),
  ('avis:moderer',                     'Modérer les avis utilisateurs',               'avis',         'moderer',            'all',  FALSE, 'Approuver ou censurer un avis'),
  ('signalement:creer',                'Signaler une annonce ou un abus',             'signalement',  'creer',              'all',  FALSE, 'Envoyer un rapport d''anomalie'),
  ('signalement:traiter',              'Traiter et clore les signalements',           'signalement',  'traiter',            'all',  FALSE, 'Prendre des mesures sur les alertes reçues'),
  ('ticket:gerer',                     'Prendre en charge les tickets support',       'ticket',       'gerer',              'all',  FALSE, 'Assurer le service après-vente et assistance'),

  -- Agences & Organisation
  ('residence:gerer:own',              'Gérer ses résidences et ensembles',           'residence',    'gerer',              'own',  FALSE, 'Gestion des immeubles et résidences multi-lots'),
  ('agence:gerer_membres:own',         'Gérer les collaborateurs de son agence',      'agence',       'gerer_membres',      'own',  FALSE, 'Inviter des sous-comptes négociateurs'),

  -- Administration Plateforme & Marketing
  ('categorie:gerer',                  'Gérer les catégories et types de biens',      'categorie',    'gerer',              'all',  FALSE, 'Éditer les taxonomies immobilières'),
  ('mise_en_avant:gerer',              'Gérer les mises en avant et le sponsoring',   'mise_en_avant','gerer',              'all',  FALSE, 'Attribuer des badges sponsorisés'),
  ('journal:voir',                     'Consulter le journal d''audit de sécurité',   'journal',      'voir',               'all',  FALSE, 'Lecture des journaux de traçabilité'),
  ('rapport:stats_voir',               'Consulter les rapports et statistiques',      'rapport',      'stats_voir',         'all',  FALSE, 'Métriques d''audiences et conversion'),
  ('role:attribuer',                   'Attribuer des rôles de niveau inférieur',     'role',         'attribuer',          'all',  FALSE, 'Nommer des modérateurs ou annonceurs'),
  ('role:permissions_gerer',           'Configurer la matrice des permissions',       'role',         'permissions_gerer',  'all',  FALSE, 'Modifier les droits de rôles inférieurs'),

  -- Permissions Verrouillées 🔒 (SUPER_ADMIN Seul)
  ('paiement:configurer',              'Configurer les comptes et passerelles de paie','paiement',     'configurer',         'all',  TRUE,  '🔒 Clés Paystack, reversements, taux de commission'),
  ('reglages:systeme',                 'Modifier les paramètres système & SEO',       'reglages',     'systeme',            'all',  TRUE,  '🔒 Configuration globale et variables système'),
  ('sauvegarde:gerer',                 'Gérer les sauvegardes et exports BDD',        'sauvegarde',   'gerer',              'all',  TRUE,  '🔒 Dumps de base de données et restauration'),
  ('role:creer/supprimer',             'Créer ou supprimer des rôles personnalisés',  'role',         'creer/supprimer',    'all',  TRUE,  '🔒 Mutation structurelle des rôles')
ON CONFLICT ("code") DO UPDATE SET
  "label" = EXCLUDED."label",
  "resource" = EXCLUDED."resource",
  "action" = EXCLUDED."action",
  "scope" = EXCLUDED."scope",
  "is_sensitive" = EXCLUDED."is_sensitive",
  "description" = EXCLUDED."description";

-- 7. Remplissage des permissions par défaut dans default_role_permissions
DELETE FROM "default_role_permissions";

-- VISITEUR
INSERT INTO "default_role_permissions" ("role_name", "permission_code") VALUES
  ('visiteur', 'annonce:voir_publiques');

-- CLIENT
INSERT INTO "default_role_permissions" ("role_name", "permission_code") VALUES
  ('client', 'annonce:voir_publiques'),
  ('client', 'profil:voir_modifier:own'),
  ('client', 'favori:gerer:own'),
  ('client', 'contact:envoyer'),
  ('client', 'avis:creer:own'),
  ('client', 'signalement:creer');

-- PROPRIÉTAIRE (Annonceur)
INSERT INTO "default_role_permissions" ("role_name", "permission_code") VALUES
  ('proprietaire', 'annonce:voir_publiques'),
  ('proprietaire', 'profil:voir_modifier:own'),
  ('proprietaire', 'favori:gerer:own'),
  ('proprietaire', 'contact:envoyer'),
  ('proprietaire', 'avis:creer:own'),
  ('proprietaire', 'signalement:creer'),
  ('proprietaire', 'annonce:creer:own'),
  ('proprietaire', 'annonce:modifier:own'),
  ('proprietaire', 'annonce:supprimer:own'),
  ('proprietaire', 'residence:gerer:own'),
  ('proprietaire', 'message:voir_demandes:own');

-- AGENCE
INSERT INTO "default_role_permissions" ("role_name", "permission_code") VALUES
  ('agence', 'annonce:voir_publiques'),
  ('agence', 'profil:voir_modifier:own'),
  ('agence', 'favori:gerer:own'),
  ('agence', 'contact:envoyer'),
  ('agence', 'avis:creer:own'),
  ('agence', 'signalement:creer'),
  ('agence', 'annonce:creer:own'),
  ('agence', 'annonce:modifier:own'),
  ('agence', 'annonce:supprimer:own'),
  ('agence', 'residence:gerer:own'),
  ('agence', 'message:voir_demandes:own'),
  ('agence', 'agence:gerer_membres:own');

-- MODÉRATEUR
INSERT INTO "default_role_permissions" ("role_name", "permission_code") VALUES
  ('moderateur', 'annonce:voir_publiques'),
  ('moderateur', 'profil:voir_modifier:own'),
  ('moderateur', 'annonce:voir_toutes'),
  ('moderateur', 'annonce:moderer'),
  ('moderateur', 'avis:moderer'),
  ('moderateur', 'signalement:traiter');

-- SUPPORT
INSERT INTO "default_role_permissions" ("role_name", "permission_code") VALUES
  ('support', 'annonce:voir_publiques'),
  ('support', 'profil:voir_modifier:own'),
  ('support', 'annonce:voir_toutes'),
  ('support', 'signalement:traiter'),
  ('support', 'utilisateur:voir_contact'),
  ('support', 'ticket:gerer');

-- ADMIN
INSERT INTO "default_role_permissions" ("role_name", "permission_code") VALUES
  ('admin', 'annonce:voir_publiques'),
  ('admin', 'profil:voir_modifier:own'),
  ('admin', 'annonce:voir_toutes'),
  ('admin', 'annonce:moderer'),
  ('admin', 'avis:moderer'),
  ('admin', 'signalement:traiter'),
  ('admin', 'utilisateur:voir_contact'),
  ('admin', 'ticket:gerer'),
  ('admin', 'annonce:supprimer:all'),
  ('admin', 'categorie:gerer'),
  ('admin', 'mise_en_avant:gerer'),
  ('admin', 'utilisateur:voir'),
  ('admin', 'utilisateur:desactiver'),
  ('admin', 'role:attribuer'),
  ('admin', 'role:permissions_gerer'),
  ('admin', 'journal:voir'),
  ('admin', 'rapport:stats_voir');

-- SUPER_ADMIN (Possède TOUTES les permissions)
INSERT INTO "default_role_permissions" ("role_name", "permission_code")
SELECT 'super_admin', "code" FROM "permissions";

-- Synchroniser role_permissions pour initialiser les permissions actives si absentes
INSERT INTO "role_permissions" ("role_name", "permission_code")
SELECT "role_name", "permission_code" FROM "default_role_permissions"
ON CONFLICT DO NOTHING;

-- 8. Migration de compatibilité des comptes existants depuis profiles.role vers user_roles
INSERT INTO "user_roles" ("user_id", "role_name")
SELECT 
  p.id,
  CASE 
    WHEN p.role = 'admin' THEN 'admin'
    WHEN p.role = 'super_admin' OR p.role = 'tech_super_admin' THEN 'super_admin'
    WHEN p.role = 'proprietaire' THEN 'proprietaire'
    WHEN p.role = 'agence' THEN 'agence'
    WHEN p.role = 'agent' THEN 'agent'
    WHEN p.role = 'promoteur' THEN 'agence'
    ELSE 'client'
  END AS mapped_role
FROM "profiles" p
ON CONFLICT ("user_id", "role_name") DO NOTHING;
