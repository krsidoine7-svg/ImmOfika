-- ==============================================================================
-- IMMOFIKA - Migration 0021 : Matrice RBAC Immobilière Pure & Moindre Privilège
-- Élimination définitive de tous les codes e-commerce obsolètes
-- ==============================================================================

-- 1. Purger les permissions e-commerce obsolètes de role_permissions et default_role_permissions
DELETE FROM "public"."role_permissions"
WHERE "permission_code" IN (
  'commande:creer:own', 'commande:voir:own', 'commande:annuler:own',
  'commande:voir:all', 'commande:statut_modifier', 'commande:note_ajouter',
  'produit:voir', 'produit:creer/modifier', 'produit:archiver', 'produit:supprimer_definitif',
  'stock:modifier', 'livraison:gerer', 'retour:demander:own', 'retour:traiter',
  'remboursement:demander', 'remboursement:approuver', 'adresse:gerer:own'
);

DELETE FROM "public"."default_role_permissions"
WHERE "permission_code" IN (
  'commande:creer:own', 'commande:voir:own', 'commande:annuler:own',
  'commande:voir:all', 'commande:statut_modifier', 'commande:note_ajouter',
  'produit:voir', 'produit:creer/modifier', 'produit:archiver', 'produit:supprimer_definitif',
  'stock:modifier', 'livraison:gerer', 'retour:demander:own', 'retour:traiter',
  'remboursement:demander', 'remboursement:approuver', 'adresse:gerer:own'
);

DELETE FROM "public"."permissions"
WHERE "code" IN (
  'commande:creer:own', 'commande:voir:own', 'commande:annuler:own',
  'commande:voir:all', 'commande:statut_modifier', 'commande:note_ajouter',
  'produit:voir', 'produit:creer/modifier', 'produit:archiver', 'produit:supprimer_definitif',
  'stock:modifier', 'livraison:gerer', 'retour:demander:own', 'retour:traiter',
  'remboursement:demander', 'remboursement:approuver', 'adresse:gerer:own'
);

-- 2. Insérer le catalogue officiel des permissions immobilières de la Marketplace
INSERT INTO "public"."permissions" ("code", "label", "resource", "action", "scope", "is_sensitive", "description")
VALUES
  -- Annonces & Catalogue
  ('annonce:voir_publiques',           'Consulter le catalogue public',          'annonce',       'voir_publiques',     'all',  FALSE, 'Consulter les annonces validées'),
  ('annonce:creer:own',                'Déposer une annonce',                    'annonce',       'creer',              'own',  FALSE, 'Publier un bien soumis à modération'),
  ('annonce:modifier:own',             'Modifier ses propres annonces',          'annonce',       'modifier',           'own',  FALSE, 'Éditer les détails de ses biens'),
  ('annonce:supprimer:own',            'Archiver ou supprimer ses annonces',     'annonce',       'supprimer',          'own',  FALSE, 'Retirer ses biens du catalogue'),
  ('annonce:voir_toutes',              'Voir toutes les annonces (modération)',  'annonce',       'voir_toutes',        'all',  FALSE, 'Accès au catalogue global et brouillons'),
  ('annonce:moderer',                  'Modérer les annonces (approuver/rejeter)','annonce',      'moderer',            'all',  FALSE, 'Vérifier titres fonciers et valider'),
  ('annonce:supprimer:all',            'Suppression administrative d annonce',   'annonce',       'supprimer',          'all',  FALSE, 'Suppression définitive d annonce'),
  ('annonce:mettre_en_avant',          'Mettre en avant / sponsoring',           'annonce',       'mettre_en_avant',    'all',  FALSE, 'Attribuer des badges vedettes'),

  -- Profil, Candidature & Alertes
  ('profil:voir_modifier:own',         'Gérer son propre profil',                'profil',        'voir_modifier',      'own',  FALSE, 'Consulter et modifier ses informations'),
  ('favori:gerer:own',                 'Gérer ses biens favoris',                'favori',        'gerer',              'own',  FALSE, 'Ajouter et supprimer des coups de cœur'),
  ('recherche_alerte:gerer:own',       'Gérer ses alertes de recherche',         'alerte',        'gerer',              'own',  FALSE, 'Configurer des alertes critères Abidjan'),
  ('dossier:deposer:own',              'Constituer son dossier candidat',        'dossier',       'deposer',            'own',  FALSE, 'Téléverser ses justificatifs de revenus'),
  ('dossier:consulter:mandataire',     'Consulter les dossiers de candidature',  'dossier',       'consulter',          'own',  FALSE, 'Examen des dossiers reçus sur ses biens'),

  -- Organisations (Agences & Promoteurs)
  ('organisation:gerer_profil:own',    'Gérer la fiche de son agence/société',   'organisation',  'gerer_profil',       'own',  FALSE, 'Éditer RCCM, agrément, logo, contacts'),
  ('organisation:inviter_membres:own', 'Gérer les collaborateurs de l agence',   'organisation',  'inviter_membres',    'own',  FALSE, 'Rattacher des agents négociateurs'),

  -- Visites & Réservations
  ('visite:demander:own',              'Demander un rendez-vous de visite',      'visite',        'demander',           'own',  FALSE, 'Prendre rendez-vous sur une annonce'),
  ('visite:gerer:own',                 'Gérer le planning de ses visites',       'visite',        'gerer',              'own',  FALSE, 'Confirmer, effectuer ou reporter les visites'),
  ('reservation:creer:own',            'Réserver un bien avec acompte',          'reservation',   'creer',              'own',  FALSE, 'Initier une réservation formelle'),
  ('reservation:gerer:all',            'Gestion administrative des réservations','reservation',   'gerer',              'all',  FALSE, 'Suivi financier et légal'),

  -- Signalements & Avis
  ('signalement:creer',                'Signaler une annonce douteuse',          'signalement',   'creer',              'all',  FALSE, 'Dénoncer une arnaque ou faux prix'),
  ('signalement:traiter',              'Traiter les signalements d abus',        'signalement',   'traiter',            'all',  FALSE, 'Prendre des mesures sur les alertes'),
  ('avis:creer:own',                   'Laisser un avis vérifié',                'avis',          'creer',              'own',  FALSE, 'Évaluer une visite effectuée'),
  ('avis:moderer',                     'Modérer les avis utilisateurs',          'avis',          'moderer',            'all',  FALSE, 'Approuver ou censurer les avis'),

  -- Administration & Système (🔒 Sensibles)
  ('utilisateur:voir',                 'Consulter l annuaire des utilisateurs',  'utilisateur',   'voir',               'all',  FALSE, 'Accès à la liste des profils'),
  ('utilisateur:desactiver',           'Suspendre ou bannir un utilisateur',     'utilisateur',   'desactiver',         'all',  FALSE, 'Désactiver temporairement un compte'),
  ('role:attribuer',                   'Attribuer des rôles utilisateurs',       'role',          'attribuer',          'all',  FALSE, 'Assigner un rôle à un utilisateur'),
  ('role:permissions_gerer',           'Gérer la matrice des permissions',       'role',          'permissions_gerer',  'all',  FALSE, 'Modifier les attributions de droits'),
  ('journal:voir',                     'Consulter le journal d audit sécurité',  'journal',       'voir',               'all',  FALSE, 'Traçabilité des actions sensibles'),
  ('facture:voir/exporter',            'Consulter et exporter les factures FNE', 'facture',       'voir/exporter',      'all',  FALSE, 'Reçus et déclarations fiscales'),
  ('rapport:stats_voir',               'Consulter les rapports et statistiques', 'rapport',       'stats_voir',         'all',  FALSE, 'Métriques d audience et conversion'),
  ('paiement:configurer',              'Configurer les comptes Paystack 🔒',     'paiement',      'configurer',         'all',  TRUE,  'Clés API et taux de commission 🔒'),
  ('reglages:systeme',                 'Modifier les paramètres système 🔒',     'reglages',      'systeme',            'all',  TRUE,  'Variables globales de la marketplace 🔒'),
  ('sauvegarde:gerer',                 'Gérer les sauvegardes de la base 🔒',    'sauvegarde',    'gerer',              'all',  TRUE,  'Dumps et restauration BDD 🔒')
ON CONFLICT ("code") DO UPDATE SET
  "label" = EXCLUDED."label",
  "resource" = EXCLUDED."resource",
  "action" = EXCLUDED."action",
  "scope" = EXCLUDED."scope",
  "is_sensitive" = EXCLUDED."is_sensitive",
  "description" = EXCLUDED."description";

-- 3. Réinitialiser et configurer les permissions par défaut par profil
DELETE FROM "public"."default_role_permissions";
DELETE FROM "public"."role_permissions";

-- Helper d'insertion
CREATE OR REPLACE FUNCTION temp_grant_perm(target_role TEXT, perm_code TEXT) RETURNS VOID AS $$
BEGIN
  INSERT INTO "public"."default_role_permissions" ("role_name", "permission_code")
  VALUES (target_role, perm_code)
  ON CONFLICT DO NOTHING;

  INSERT INTO "public"."role_permissions" ("role_name", "permission_code")
  VALUES (target_role, perm_code)
  ON CONFLICT DO NOTHING;
END;
$$ LANGUAGE plpgsql;

-- VISITEUR
SELECT temp_grant_perm('visiteur', 'annonce:voir_publiques');

-- CLIENT (Acheteur / Locataire)
SELECT temp_grant_perm('client', 'annonce:voir_publiques');
SELECT temp_grant_perm('client', 'profil:voir_modifier:own');
SELECT temp_grant_perm('client', 'favori:gerer:own');
SELECT temp_grant_perm('client', 'recherche_alerte:gerer:own');
SELECT temp_grant_perm('client', 'dossier:deposer:own');
SELECT temp_grant_perm('client', 'visite:demander:own');
SELECT temp_grant_perm('client', 'reservation:creer:own');
SELECT temp_grant_perm('client', 'avis:creer:own');
SELECT temp_grant_perm('client', 'signalement:creer');

-- PROPRIÉTAIRE (Particulier)
SELECT temp_grant_perm('proprietaire', 'annonce:voir_publiques');
SELECT temp_grant_perm('proprietaire', 'profil:voir_modifier:own');
SELECT temp_grant_perm('proprietaire', 'annonce:creer:own');
SELECT temp_grant_perm('proprietaire', 'annonce:modifier:own');
SELECT temp_grant_perm('proprietaire', 'annonce:supprimer:own');
SELECT temp_grant_perm('proprietaire', 'visite:gerer:own');
SELECT temp_grant_perm('proprietaire', 'dossier:consulter:mandataire');
SELECT temp_grant_perm('proprietaire', 'signalement:creer');

-- AGENT
SELECT temp_grant_perm('agent', 'annonce:voir_publiques');
SELECT temp_grant_perm('agent', 'profil:voir_modifier:own');
SELECT temp_grant_perm('agent', 'annonce:creer:own');
SELECT temp_grant_perm('agent', 'annonce:modifier:own');
SELECT temp_grant_perm('agent', 'annonce:supprimer:own');
SELECT temp_grant_perm('agent', 'visite:gerer:own');
SELECT temp_grant_perm('agent', 'dossier:consulter:mandataire');
SELECT temp_grant_perm('agent', 'signalement:creer');

-- AGENCE & PROMOTEUR
SELECT temp_grant_perm('agence', 'annonce:voir_publiques');
SELECT temp_grant_perm('agence', 'profil:voir_modifier:own');
SELECT temp_grant_perm('agence', 'annonce:creer:own');
SELECT temp_grant_perm('agence', 'annonce:modifier:own');
SELECT temp_grant_perm('agence', 'annonce:supprimer:own');
SELECT temp_grant_perm('agence', 'visite:gerer:own');
SELECT temp_grant_perm('agence', 'dossier:consulter:mandataire');
SELECT temp_grant_perm('agence', 'organisation:gerer_profil:own');
SELECT temp_grant_perm('agence', 'organisation:inviter_membres:own');
SELECT temp_grant_perm('agence', 'signalement:creer');

SELECT temp_grant_perm('promoteur', 'annonce:voir_publiques');
SELECT temp_grant_perm('promoteur', 'profil:voir_modifier:own');
SELECT temp_grant_perm('promoteur', 'annonce:creer:own');
SELECT temp_grant_perm('promoteur', 'annonce:modifier:own');
SELECT temp_grant_perm('promoteur', 'annonce:supprimer:own');
SELECT temp_grant_perm('promoteur', 'visite:gerer:own');
SELECT temp_grant_perm('promoteur', 'dossier:consulter:mandataire');
SELECT temp_grant_perm('promoteur', 'organisation:gerer_profil:own');
SELECT temp_grant_perm('promoteur', 'organisation:inviter_membres:own');
SELECT temp_grant_perm('promoteur', 'signalement:creer');

-- MODÉRATEUR
SELECT temp_grant_perm('moderateur', 'annonce:voir_publiques');
SELECT temp_grant_perm('moderateur', 'profil:voir_modifier:own');
SELECT temp_grant_perm('moderateur', 'annonce:voir_toutes');
SELECT temp_grant_perm('moderateur', 'annonce:moderer');
SELECT temp_grant_perm('moderateur', 'signalement:traiter');
SELECT temp_grant_perm('moderateur', 'avis:moderer');

-- ADMIN
SELECT temp_grant_perm('admin', 'annonce:voir_publiques');
SELECT temp_grant_perm('admin', 'profil:voir_modifier:own');
SELECT temp_grant_perm('admin', 'annonce:voir_toutes');
SELECT temp_grant_perm('admin', 'annonce:moderer');
SELECT temp_grant_perm('admin', 'annonce:supprimer:all');
SELECT temp_grant_perm('admin', 'annonce:mettre_en_avant');
SELECT temp_grant_perm('admin', 'signalement:traiter');
SELECT temp_grant_perm('admin', 'avis:moderer');
SELECT temp_grant_perm('admin', 'utilisateur:voir');
SELECT temp_grant_perm('admin', 'utilisateur:desactiver');
SELECT temp_grant_perm('admin', 'role:attribuer');
SELECT temp_grant_perm('admin', 'journal:voir');
SELECT temp_grant_perm('admin', 'facture:voir/exporter');
SELECT temp_grant_perm('admin', 'rapport:stats_voir');
SELECT temp_grant_perm('admin', 'reservation:gerer:all');

-- SUPER_ADMIN & TECH_SUPER_ADMIN (100% des permissions)
INSERT INTO "public"."default_role_permissions" ("role_name", "permission_code")
SELECT 'super_admin', "code" FROM "public"."permissions";

INSERT INTO "public"."default_role_permissions" ("role_name", "permission_code")
SELECT 'tech_super_admin', "code" FROM "public"."permissions";

INSERT INTO "public"."role_permissions" ("role_name", "permission_code")
SELECT "role_name", "permission_code" FROM "public"."default_role_permissions"
ON CONFLICT DO NOTHING;

DROP FUNCTION temp_grant_perm(TEXT, TEXT);

