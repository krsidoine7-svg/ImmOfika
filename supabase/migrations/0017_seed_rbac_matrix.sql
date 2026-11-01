-- ==============================================================================
-- IMMOFIKA - Migration 0017 : Seed Idempotent RBAC Hybride (Moindre Privilège Strict)
-- ==============================================================================

-- 1. Insertion / Mise à jour des 7 Rôles Principaux
INSERT INTO "roles" ("name", "label", "hierarchy_level", "is_system", "is_locked", "description")
VALUES
  ('CLIENT',       'Client / Acheteur / Locataire', 1, TRUE, FALSE, 'Utilisateur standard, consultation et commandes personnelles'),
  ('SUPPORT',      'Support & Relation Client',     2, TRUE, FALSE, 'Gestion du service client, tickets, avis et litiges'),
  ('CATALOGUE',    'Gestionnaire Catalogue',        3, TRUE, FALSE, 'Gestion des produits, catégories et stocks'),
  ('LOGISTIQUE',   'Responsable Logistique',        4, TRUE, FALSE, 'Suivi des expéditions, livraisons et statuts de commandes'),
  ('COMPTA',       'Comptabilité & Finances',       5, TRUE, FALSE, 'Gestion des factures, remboursements et rapports de ventes'),
  ('ADMIN',        'Administrateur Opérationnel',   6, TRUE, FALSE, 'Gestion globale des utilisateurs, catalogue et opérations'),
  ('SUPER_ADMIN',  'Super Administrateur',          7, TRUE, TRUE,  'Contrôle absolu du système, sécurité, clés et sauvegardes 🔒'),
  -- Alias minuscules pour compatibilité ascendante
  ('client',       'Client',                        1, TRUE, FALSE, 'Alias client'),
  ('support',      'Support Client',                2, TRUE, FALSE, 'Alias support'),
  ('catalogue',    'Catalogue',                     3, TRUE, FALSE, 'Alias catalogue'),
  ('compta',       'Comptabilité',                  5, TRUE, FALSE, 'Alias compta'),
  ('admin',        'Administrateur',                6, TRUE, FALSE, 'Alias admin'),
  ('super_admin',  'Super Administrateur',          7, TRUE, TRUE,  'Alias super_admin 🔒')
ON CONFLICT ("name") DO UPDATE SET
  "label" = EXCLUDED."label",
  "hierarchy_level" = EXCLUDED."hierarchy_level",
  "is_system" = EXCLUDED."is_system",
  "is_locked" = EXCLUDED."is_locked",
  "description" = EXCLUDED."description";

-- 2. Insertion / Mise à jour des 34 Permissions
INSERT INTO "permissions" ("code", "label", "resource", "action", "scope", "is_sensitive", "description")
VALUES
  -- Profil
  ('profil:voir/modifier:own',          'Voir/Modifier son propre profil', 'profil',        'voir/modifier',     'own', FALSE, 'Accès et modification de son propre profil'),
  ('adresse:gerer:own',                 'Gérer ses adresses',              'adresse',       'gerer',             'own', FALSE, 'Ajouter et modifier ses adresses de livraison'),
  
  -- Commandes & Réservations Client (:own)
  ('commande:creer:own',                'Créer une commande',              'commande',      'creer',             'own', FALSE, 'Passer une commande ou réservation'),
  ('commande:voir:own',                 'Voir ses commandes',              'commande',      'voir',              'own', FALSE, 'Consulter l''historique de ses commandes'),
  ('commande:annuler:own',              'Annuler sa commande',             'commande',      'annuler',           'own', FALSE, 'Annuler sa commande avant expédition'),
  ('avis:creer:own',                    'Déposer un avis',                 'avis',          'creer',             'own', FALSE, 'Publier un avis sur un bien/produit acheté'),
  ('retour:demander:own',               'Demander un retour',              'retour',        'demander',          'own', FALSE, 'Initier une demande de retour ou rétractation'),
  
  -- Commandes Globales (:all)
  ('commande:voir:all',                 'Voir toutes les commandes',       'commande',      'voir',              'all', FALSE, 'Consulter l''ensemble des commandes clients'),
  ('commande:statut_modifier',          'Modifier le statut de commande',  'commande',      'statut_modifier',   'all', FALSE, 'Faire évoluer le statut (expédiée, livrée)'),
  ('commande:note_ajouter',             'Ajouter une note de commande',    'commande',      'note_ajouter',      'all', FALSE, 'Ajouter une note interne sur une commande'),
  
  -- Clients & Support
  ('client:voir_contact',               'Voir les contacts clients',       'client',        'voir_contact',      'all', FALSE, 'Accéder aux emails et téléphones clients'),
  ('ticket:gerer',                      'Gérer les tickets de support',    'ticket',        'gerer',             'all', FALSE, 'Traiter et résoudre les tickets d''assistance'),
  ('retour:traiter',                    'Traiter les retours',             'retour',        'traiter',           'all', FALSE, 'Accepter ou refuser un retour marchandise'),
  ('remboursement:demander',            'Demander un remboursement',       'remboursement', 'demander',          'all', FALSE, 'Soumettre une demande de remboursement'),
  ('remboursement:approuver',           'Approuver un remboursement',      'remboursement', 'approuver',         'all', FALSE, 'Valider et exécuter le remboursement'),
  
  -- Catalogue Produits & Biens
  ('produit:voir',                      'Voir les produits (catalogue)',   'produit',       'voir',              'all', FALSE, 'Consulter la gestion du catalogue'),
  ('produit:creer/modifier',            'Créer/Modifier un produit',       'produit',       'creer/modifier',    'all', FALSE, 'Ajouter et éditer les fiches produits'),
  ('produit:archiver',                  'Archiver un produit',             'produit',       'archiver',          'all', FALSE, 'Désactiver ou archiver temporairement un produit'),
  ('produit:supprimer_definitif',       'Supprimer définitivement 🔒',     'produit',       'supprimer_definitif','all', TRUE,  'Suppression irréversible du catalogue 🔒'),
  ('stock:modifier',                    'Modifier les stocks',             'stock',         'modifier',          'all', FALSE, 'Ajuster les inventaires et disponibilités'),
  ('categorie:gerer',                   'Gérer les catégories',            'categorie',     'gerer',             'all', FALSE, 'Créer et ordonner les catégories de catalogue'),
  ('promotion:gerer',                   'Gérer les promotions',            'promotion',     'gerer',             'all', FALSE, 'Créer et appliquer les codes promo'),
  ('livraison:gerer',                   'Gérer les livraisons',            'livraison',     'gerer',             'all', FALSE, 'Organiser les plannings de transport/visites'),
  ('avis:moderer',                      'Modérer les avis',                'avis',          'moderer',           'all', FALSE, 'Valider ou masquer les avis utilisateurs'),
  
  -- Finances & Comptabilité
  ('facture:voir/exporter',             'Voir et exporter les factures',   'facture',       'voir/exporter',     'all', FALSE, 'Générer et télécharger les reçus et factures'),
  ('rapport:ventes_voir',               'Consulter les rapports de ventes','rapport',       'ventes_voir',       'all', FALSE, 'Accéder aux statistiques de chiffre d''affaires'),
  
  -- Administration & Système
  ('utilisateur:voir',                  'Voir les utilisateurs',           'utilisateur',   'voir',              'all', FALSE, 'Consulter l''annuaire des utilisateurs'),
  ('utilisateur:desactiver',            'Suspendre un utilisateur',        'utilisateur',   'desactiver',        'all', FALSE, 'Désactiver ou réactiver un compte'),
  ('role:attribuer',                    'Attribuer un rôle',               'role',          'attribuer',         'all', FALSE, 'Assigner un rôle hiérarchiquement inférieur'),
  ('role:permissions_gerer',            'Gérer les permissions',           'role',          'permissions_gerer', 'all', FALSE, 'Modifier la matrice des rôles non sensibles'),
  ('paiement:configurer',               'Configurer les paiements 🔒',     'paiement',      'configurer',        'all', TRUE,  'Paramétrer les clés API Paystack / Mobile Money 🔒'),
  ('reglages:systeme',                  'Réglages système 🔒',             'reglages',      'systeme',           'all', TRUE,  'Paramètres fondamentaux de l''application 🔒'),
  ('journal:voir',                      'Consulter le journal d''audit',   'journal',       'voir',              'all', FALSE, 'Accéder à l''historique de sécurité'),
  ('sauvegarde:gerer',                  'Gérer les sauvegardes 🔒',        'sauvegarde',    'gerer',             'all', TRUE,  'Déclencher ou restaurer les sauvegardes DB 🔒')
ON CONFLICT ("code") DO UPDATE SET
  "label" = EXCLUDED."label",
  "resource" = EXCLUDED."resource",
  "action" = EXCLUDED."action",
  "scope" = EXCLUDED."scope",
  "is_sensitive" = EXCLUDED."is_sensitive",
  "description" = EXCLUDED."description";

-- 3. Nettoyage et réinitialisation des permissions par défaut
DELETE FROM "default_role_permissions";
DELETE FROM "role_permissions";

-- Helper temporaire pour associer les permissions
CREATE OR REPLACE FUNCTION temp_grant_perm(target_role TEXT, perm_code TEXT) RETURNS VOID AS $$
BEGIN
  INSERT INTO "default_role_permissions" ("role_name", "permission_code")
  VALUES (target_role, perm_code)
  ON CONFLICT DO NOTHING;

  INSERT INTO "role_permissions" ("role_name", "permission_code")
  VALUES (target_role, perm_code)
  ON CONFLICT DO NOTHING;
END;
$$ LANGUAGE plpgsql;

-- A. Rôle CLIENT
SELECT temp_grant_perm('CLIENT', 'profil:voir/modifier:own');
SELECT temp_grant_perm('CLIENT', 'adresse:gerer:own');
SELECT temp_grant_perm('CLIENT', 'commande:creer:own');
SELECT temp_grant_perm('CLIENT', 'commande:voir:own');
SELECT temp_grant_perm('CLIENT', 'commande:annuler:own');
SELECT temp_grant_perm('CLIENT', 'avis:creer:own');
SELECT temp_grant_perm('CLIENT', 'retour:demander:own');
-- Alias minuscules
SELECT temp_grant_perm('client', 'profil:voir/modifier:own');
SELECT temp_grant_perm('client', 'adresse:gerer:own');
SELECT temp_grant_perm('client', 'commande:creer:own');
SELECT temp_grant_perm('client', 'commande:voir:own');
SELECT temp_grant_perm('client', 'commande:annuler:own');
SELECT temp_grant_perm('client', 'avis:creer:own');
SELECT temp_grant_perm('client', 'retour:demander:own');

-- B. Rôle SUPPORT
SELECT temp_grant_perm('SUPPORT', 'profil:voir/modifier:own');
SELECT temp_grant_perm('SUPPORT', 'commande:voir:all');
SELECT temp_grant_perm('SUPPORT', 'commande:note_ajouter');
SELECT temp_grant_perm('SUPPORT', 'client:voir_contact');
SELECT temp_grant_perm('SUPPORT', 'ticket:gerer');
SELECT temp_grant_perm('SUPPORT', 'retour:traiter');
SELECT temp_grant_perm('SUPPORT', 'remboursement:demander');
SELECT temp_grant_perm('SUPPORT', 'avis:moderer');
-- Alias minuscules
SELECT temp_grant_perm('support', 'profil:voir/modifier:own');
SELECT temp_grant_perm('support', 'commande:voir:all');
SELECT temp_grant_perm('support', 'commande:note_ajouter');
SELECT temp_grant_perm('support', 'client:voir_contact');
SELECT temp_grant_perm('support', 'ticket:gerer');
SELECT temp_grant_perm('support', 'retour:traiter');
SELECT temp_grant_perm('support', 'remboursement:demander');
SELECT temp_grant_perm('support', 'avis:moderer');

-- C. Rôle CATALOGUE
SELECT temp_grant_perm('CATALOGUE', 'profil:voir/modifier:own');
SELECT temp_grant_perm('CATALOGUE', 'produit:voir');
SELECT temp_grant_perm('CATALOGUE', 'produit:creer/modifier');
SELECT temp_grant_perm('CATALOGUE', 'produit:archiver');
SELECT temp_grant_perm('CATALOGUE', 'stock:modifier');
SELECT temp_grant_perm('CATALOGUE', 'categorie:gerer');
-- Alias minuscules
SELECT temp_grant_perm('catalogue', 'profil:voir/modifier:own');
SELECT temp_grant_perm('catalogue', 'produit:voir');
SELECT temp_grant_perm('catalogue', 'produit:creer/modifier');
SELECT temp_grant_perm('catalogue', 'produit:archiver');
SELECT temp_grant_perm('catalogue', 'stock:modifier');
SELECT temp_grant_perm('catalogue', 'categorie:gerer');

-- D. Rôle LOGISTIQUE
SELECT temp_grant_perm('LOGISTIQUE', 'profil:voir/modifier:own');
SELECT temp_grant_perm('LOGISTIQUE', 'commande:voir:all');
SELECT temp_grant_perm('LOGISTIQUE', 'commande:statut_modifier');
SELECT temp_grant_perm('LOGISTIQUE', 'commande:note_ajouter');
SELECT temp_grant_perm('LOGISTIQUE', 'client:voir_contact');
SELECT temp_grant_perm('LOGISTIQUE', 'stock:modifier');
SELECT temp_grant_perm('LOGISTIQUE', 'livraison:gerer');

-- E. Rôle COMPTA
SELECT temp_grant_perm('COMPTA', 'profil:voir/modifier:own');
SELECT temp_grant_perm('COMPTA', 'commande:voir:all');
SELECT temp_grant_perm('COMPTA', 'remboursement:approuver');
SELECT temp_grant_perm('COMPTA', 'facture:voir/exporter');
SELECT temp_grant_perm('COMPTA', 'rapport:ventes_voir');
-- Alias minuscules
SELECT temp_grant_perm('compta', 'profil:voir/modifier:own');
SELECT temp_grant_perm('compta', 'commande:voir:all');
SELECT temp_grant_perm('compta', 'remboursement:approuver');
SELECT temp_grant_perm('compta', 'facture:voir/exporter');
SELECT temp_grant_perm('compta', 'rapport:ventes_voir');

-- F. Rôle ADMIN
SELECT temp_grant_perm('ADMIN', 'profil:voir/modifier:own');
SELECT temp_grant_perm('ADMIN', 'commande:voir:all');
SELECT temp_grant_perm('ADMIN', 'commande:statut_modifier');
SELECT temp_grant_perm('ADMIN', 'commande:note_ajouter');
SELECT temp_grant_perm('ADMIN', 'client:voir_contact');
SELECT temp_grant_perm('ADMIN', 'ticket:gerer');
SELECT temp_grant_perm('ADMIN', 'retour:traiter');
SELECT temp_grant_perm('ADMIN', 'remboursement:demander');
SELECT temp_grant_perm('ADMIN', 'remboursement:approuver');
SELECT temp_grant_perm('ADMIN', 'produit:voir');
SELECT temp_grant_perm('ADMIN', 'produit:creer/modifier');
SELECT temp_grant_perm('ADMIN', 'produit:archiver');
SELECT temp_grant_perm('ADMIN', 'stock:modifier');
SELECT temp_grant_perm('ADMIN', 'categorie:gerer');
SELECT temp_grant_perm('ADMIN', 'promotion:gerer');
SELECT temp_grant_perm('ADMIN', 'livraison:gerer');
SELECT temp_grant_perm('ADMIN', 'avis:moderer');
SELECT temp_grant_perm('ADMIN', 'facture:voir/exporter');
SELECT temp_grant_perm('ADMIN', 'rapport:ventes_voir');
SELECT temp_grant_perm('ADMIN', 'utilisateur:voir');
SELECT temp_grant_perm('ADMIN', 'utilisateur:desactiver');
SELECT temp_grant_perm('ADMIN', 'role:attribuer');
SELECT temp_grant_perm('ADMIN', 'role:permissions_gerer');
SELECT temp_grant_perm('ADMIN', 'journal:voir');
-- Alias minuscules
SELECT temp_grant_perm('admin', 'profil:voir/modifier:own');
SELECT temp_grant_perm('admin', 'commande:voir:all');
SELECT temp_grant_perm('admin', 'commande:statut_modifier');
SELECT temp_grant_perm('admin', 'commande:note_ajouter');
SELECT temp_grant_perm('admin', 'client:voir_contact');
SELECT temp_grant_perm('admin', 'ticket:gerer');
SELECT temp_grant_perm('admin', 'retour:traiter');
SELECT temp_grant_perm('admin', 'remboursement:demander');
SELECT temp_grant_perm('admin', 'remboursement:approuver');
SELECT temp_grant_perm('admin', 'produit:voir');
SELECT temp_grant_perm('admin', 'produit:creer/modifier');
SELECT temp_grant_perm('admin', 'produit:archiver');
SELECT temp_grant_perm('admin', 'stock:modifier');
SELECT temp_grant_perm('admin', 'categorie:gerer');
SELECT temp_grant_perm('admin', 'promotion:gerer');
SELECT temp_grant_perm('admin', 'livraison:gerer');
SELECT temp_grant_perm('admin', 'avis:moderer');
SELECT temp_grant_perm('admin', 'facture:voir/exporter');
SELECT temp_grant_perm('admin', 'rapport:ventes_voir');
SELECT temp_grant_perm('admin', 'utilisateur:voir');
SELECT temp_grant_perm('admin', 'utilisateur:desactiver');
SELECT temp_grant_perm('admin', 'role:attribuer');
SELECT temp_grant_perm('admin', 'role:permissions_gerer');
SELECT temp_grant_perm('admin', 'journal:voir');

-- G. Rôle SUPER_ADMIN (Possède TOUTES les 34 permissions, y compris les 4 sensibles 🔒)
DO $$
DECLARE
  p RECORD;
BEGIN
  FOR p IN SELECT code FROM "permissions" LOOP
    PERFORM temp_grant_perm('SUPER_ADMIN', p.code);
    PERFORM temp_grant_perm('super_admin', p.code);
    PERFORM temp_grant_perm('tech_super_admin', p.code);
  END LOOP;
END $$;

DROP FUNCTION temp_grant_perm(TEXT, TEXT);

