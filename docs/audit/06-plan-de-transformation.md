# 06 — Plan de Transformation en Marketplace Immobilière (Abidjan)

> **Projet** : ImmOfika  
> **Type d'audit** : Phase 1 — Audit en lecture seule pour transformation en Marketplace Immobilière (Abidjan)  
> **Date** : 31 Octobre 2026  
> **Méthodologie** : Découpage en 11 étapes séquentielles, autonomes, testables et réversibles. Chaque étape fait l'objet d'une validation explicite avant tout passage à la suivante.

---

## Vue d'Ensemble des Étapes

| Étape | Intitulé de l'Étape | Périmètre Principal | Effort | Risque |
| :---: | :--- | :--- | :---: | :---: |
| **1** | **Sécurité & Fondations** | Colmatage des failles critiques RLS, neutralisation de l'auto-promotion, RLS sur `user_roles`, purge des routes de test. | **M** | Faible |
| **2** | **Modèle de Données Marketplace** | Création des tables `organizations`, `organization_members`, `annonces_verifications`, `recherches_alertes`, `dossiers_locataires`. | **M** | Moyen |
| **3** | **Rôles & Permissions (Moindre Privilège)** | Éradication des permissions e-commerce, matrice immobilière pure, policies RLS correspondantes, tests de non-régression. | **M** | Faible |
| **4** | **Authentification & Onboarding par Profil** | Inscription avec choix du profil (Particulier, Agence, Promoteur, Acheteur/Locataire), formulaires adaptés, gating. | **L** | Moyen |
| **5** | **Isolation du Back-Office Client Unique** | Découplage du CRM interne (`leads`), Kanban (`dossiers`), Airtable et Tally hors du flux public marketplace. | **S** | Faible |
| **6** | **Fonctionnalités Publiques (Recherche & Carte)** | Moteur de recherche multicritères Abidjan (communes, quartiers, budget, pièces, surface), carte, fiches biens multi-annonceurs, SEO dynamique. | **L** | Faible |
| **7** | **Fonctionnalités Utilisateurs Connectés** | Recherches sauvegardées, alertes automatiques, gestionnaire de coups de cœur, dépôt de dossier candidat chiffré. | **M** | Faible |
| **8** | **Espaces Annonceurs (Particuliers & Pros)** | Tableau de bord bailleur indépendant, tableau de bord agence multi-agents, tableau de bord promoteur VEFA / programmes neufs. | **L** | Moyen |
| **9** | **Console d'Administration & Modération Avancée** | File d'approbation avec contrôle des pièces foncières (ACD, mandats), traitement des signalements, détection des démarcheurs récidivistes. | **M** | Faible |
| **10** | **Paiements, Notifications & Mobile** | Passerelles Mobile Money (Wave, Orange, MTN), notifications WhatsApp/SMS/Email, optimisation responsive mobile first. | **M** | Moyen |
| **11** | **Recette Intégrale & Certification QA** | Exécution des tests pas-à-pas par profil (Visiteur, Locataire, Propriétaire, Agence, Promoteur, Modérateur, Admin). | **M** | Faible |

---

## Détail des Étapes de Réalisation

### Étape 1 : Sécurité & Fondations
- **Objectif** : Éliminer immédiatement les 2 failles critiques identifiées lors de l'audit pour sécuriser la base avant toute évolution fonctionnelle.
- **Actions techniques** :
  1. Activer RLS sur `user_roles` et `default_role_permissions` avec politiques restrictives.
  2. Sécuriser la table `profiles` : verrouiller la colonne `role` contre toute auto-modification par l'utilisateur connecté via un trigger PostgreSQL `BEFORE UPDATE`.
  3. Corriger la fuite de données de l'API catalogue dans `src/app/api/biens/route.ts` en imposant le filtre `statut_moderation = 'valide'`.
  4. Supprimer la page de test technique exposée `src/app/test-supabase/page.tsx` et la route doublon `src/app/login/page.tsx`.
- **Fichiers touchés** : `supabase/migrations/0019_fix_critical_security.sql`, `src/app/api/biens/route.ts`, suppression de `src/app/test-supabase/page.tsx`.
- **Critères d'acceptation** :
  - Une tentative de `PATCH /rest/v1/profiles` modifiant le rôle renvoie une erreur 403 / exception SQL.
  - La table `user_roles` a `rls_enabled = true`.
  - L'API `/api/biens` ne renvoie aucun bien ayant le statut `en_attente` ou `rejete`.
- **Estimation d'effort** : **M** (Moyen — 0.5 jour)

---

### Étape 2 : Modèle de Données Marketplace
- **Objectif** : Structurer la base de données relationnelle pour accueillir les acteurs multi-annonceurs d'Abidjan.
- **Actions techniques** :
  1. Migration SQL créant la table `organizations` :
     - `id`, `name`, `slug`, `type` (`agence` / `promoteur`), `rccm`, `ncc`, `agrement_numero`, `logo_url`, `telephone`, `commune`, `adresse`, `verified_at`, `is_active`.
  2. Table de liaison `organization_members` :
     - `organization_id`, `user_id`, `role_in_org` (`gerant`, `negociateur`, `assistant`), `assigned_at`.
  3. Modification de la table `biens` :
     - Ajout de la clé étrangère `organization_id REFERENCES organizations(id) ON DELETE SET NULL`.
     - Ajout des champs `pieces`, `annee_construction`, `meuble`, `charges_comprises`.
  4. Table `recherches_sauvegardees` & `alertes` :
     - `user_id`, `criteres` (JSONB : commune, quartier, prix_max, pieces, transaction), `frequence` (`immediat`, `quotidien`), `is_active`.
  5. Table `dossiers_candidats` :
     - `user_id`, `statut` (`brouillon`, `soumis`, `valide`), `fichiers_chiffres` (JSONB pointant vers R2 privé).
  6. Table `signalements` :
     - `bien_id`, `auteur_id`, `motif` (`faux_prix`, `demarcheur_arnaque`, `bien_deja_vendu`, `photos_trompeuses`), `statut`, `traite_par`.
- **Fichiers touchés** : `supabase/migrations/0020_marketplace_data_model.sql`, `src/lib/db/schema.ts`, `src/types/marketplace.ts`.
- **Critères d'acceptation** : `drizzle-kit push` ou migration exécutée sans conflit, types TypeScript synchronisés, intégrité référentielle vérifiée.
- **Estimation d'effort** : **M** (Moyen — 1 jour)

---

### Étape 3 : Rôles & Permissions (Moindre Privilège Strict)
- **Objectif** : Nettoyer l'héritage e-commerce et instaurer une matrice d'habilitations 100% immobilière.
- **Actions techniques** :
  1. Purger les 20 permissions obsolètes (`commande:*`, `stock:*`, `produit:*`, `livraison:*`).
  2. Insérer le dictionnaire des permissions immobilières de la marketplace :
     - `annonce:publier:own`, `annonce:modifier:own`, `annonce:supprimer:own`
     - `annonce:voir_toutes`, `annonce:moderer`, `annonce:mettre_en_avant`
     - `organisation:gerer_profil:own`, `organisation:inviter_membres:own`
     - `dossier:deposer:own`, `dossier:consulter:mandataire`
     - `signalement:creer`, `signalement:traiter`
  3. Mettre à jour `src/lib/auth/permissions.ts` et actualiser les 16 tests unitaires de garde-fous Vitest.
- **Fichiers touchés** : `supabase/migrations/0021_real_estate_rbac.sql`, `src/lib/auth/permissions.ts`, `tests/unit/rbac-guardrails.test.ts`.
- **Critères d'acceptation** : La suite Vitest passe à 100% avec les nouveaux codes permissions.
- **Estimation d'effort** : **M** (Moyen — 0.5 jour)

---

### Étape 4 : Authentification & Onboarding par Profil
- **Objectif** : Permettre à chaque nouvel utilisateur de choisir son profil cible et d'accomplir son onboarding obligatoire.
- **Actions techniques** :
  1. Refonte du parcours `/auth/register` :
     - Étape 1 : Identifiants (Email + Mot de passe fort ou Google OAuth).
     - Étape 2 : Sélecteur de profil visuel :
       - *« Je cherche un logement (Acheteur / Locataire) »*
       - *« Je suis Propriétaire particulier »*
       - *« Je représente une Agence Immobilière »*
       - *« Je représente une Société de Promotion Agréée »*
  2. Écrans d'onboarding adaptés :
     - Acheteur/Locataire : Téléphone vérifié par OTP SMS, communes prioritaires à Abidjan, budget type.
     - Propriétaire : Identité complète, téléphone vérifié, justificatif de domicile.
     - Agence / Promoteur : Raison sociale, RCCM, NCC, numéro d'agrément, téléversement des pièces justificatives.
  3. Logique de Gating côté serveur : redirection automatique vers l'écran d'onboarding tant que le palier minimum n'est pas validé.
- **Fichiers touchés** : `src/app/(public)/auth/register/`, `src/app/(public)/auth/onboarding/`, `src/app/actions/authActions.ts`, `src/proxy.ts`.
- **Critères d'acceptation** : Un utilisateur non onboardé est redirigé vers l'onboarding et ne peut pas publier ni candidater.
- **Estimation d'effort** : **L** (Large — 1.5 jour)

---

### Étape 5 : Isolation du Back-Office Client Unique
- **Objectif** : Séparer rigoureusement les modules internes du promoteur initial pour ne pas polluer la marketplace.
- **Actions techniques** :
  1. Retirer la navigation vers `/admin/leads` (CRM mono-société), `/admin/dossiers` (Kanban travaux), `/admin/database` et `/admin/formulaires` du menu standard de l'application.
  2. Neutraliser `airtableDatabase.ts` ou le restreindre exclusivement au rôle `tech_super_admin`.
  3. Nettoyer les mentions de marque statiques de `src/config/site.ts` pour refléter l'entité opératrice de la marketplace.
- **Fichiers touchés** : `src/components/app-sidebar.tsx`, `src/config/site.ts`, `src/app/actions/airtableDatabase.ts`.
- **Critères d'acceptation** : Aucun module privé n'est accessible ni visible pour les utilisateurs externes de la marketplace.
- **Estimation d'effort** : **S** (Small — 0.5 jour)

---

### Étape 6 : Fonctions Publiques (Moteur de Recherche, Filtres & Cartographie)
- **Objectif** : Offrir aux internautes une expérience de recherche d'élite spécifiquement calibrée pour le marché d'Abidjan.
- **Actions techniques** :
  1. Filtres avancés par communes et quartiers abidjanais :
     - *Cocody* (Riviera Golf, Palmeraie, Angré, Mermoz, Ambassades, Danga, Deux-Plateaux, Vallon).
     - *Marcory* (Zone 4, Biétry, Résidentiel).
     - *Yopougon*, *Plateau*, *Bingerville*, *Grand-Bassam*, *Assinie*.
  2. Filtres par critères métiers :
     - Achat / Location / Location meublée courte ou longue durée.
     - Nombre de pièces exact (Studio, 2 pièces, 3 pièces, 4 pièces, 5 pièces et plus).
     - Surface minimum et budget avec curseur FCFA.
  3. Fiche annonce marketplace :
     - Badge de l'annonceur : *« Propriétaire Particulier Vérifié »*, *« Agence Agréée »*, *« Promoteur Agréé »*.
     - Coordonnées de contact direct (WhatsApp, Appel, Demande de visite intégrée).
     - Balisage SEO OpenGraph dynamique avec le nom de l'annonceur réel.
- **Fichiers touchés** : `src/app/(public)/biens/`, `src/components/biens/`, `src/app/api/biens/route.ts`.
- **Critères d'acceptation** : Recherche rapide et précise, aucun bien non modéré dans les résultats, responsive irréprochable sur mobile.
- **Estimation d'effort** : **L** (Large — 1.5 jour)

---

### Étape 7 : Fonctions Connectées (Favoris, Alertes & Dossiers Candidats)
- **Objectif** : Fidéliser les acheteurs et locataires et fluidifier le dépôt de dossier.
- **Actions techniques** :
  1. Enregistrement des alertes de recherche avec déclenchement de notifications (email Resend ou Web Push) dès qu'un bien correspondant est approuvé par la modération.
  2. Espace « Mon Dossier Candidat » (`/client/dossier`) :
     - Dépôt sécurisé des justificatifs (pièce d'identité, justificatifs de revenus).
     - Chiffrement et stockage dans `private/dossiers/{userId}/` sur Cloudflare R2.
     - Bouton « Transmettre mon dossier complet à l'agence » lors de la consultation d'une annonce.
- **Fichiers touchés** : `src/app/(client)/client/`, `src/app/actions/dossierCandidat.ts`, `src/lib/r2/client.ts`.
- **Critères d'acceptation** : L'agence destinataire reçoit un accès temporaire signé pour examiner le dossier sans divulgation publique.
- **Estimation d'effort** : **M** (Moyen — 1 jour)

---

### Étape 8 : Espaces Annonceurs (Particuliers, Agences & Promoteurs)
- **Objectif** : Fournir des espaces de gestion professionnels adaptés à chaque profil d'offre.
- **Actions techniques** :
  1. **Espace Propriétaire Particulier** :
     - Dépôt d'annonce simplifié avec obligation de joindre la preuve de propriété (ACD, CMP).
     - Suivi du statut de modération et des demandes de visite reçues.
  2. **Espace Agence Immobilière** :
     - Tableau de bord de l'agence avec catalogue des biens du cabinet.
     - Gestion des collaborateurs : invitation de négociateurs avec attribution de biens.
     - Statistiques de performance (vues, contacts, visites effectuées).
  3. **Espace Promoteur Immobilier** :
     - Gestion des programmes neufs (nom du programme, date de livraison prévisionnelle, plan de masse).
     - Découpage par lots / tranches avec typologies d'appartements et simulateur de financement.
- **Fichiers touchés** : `src/app/(admin)/admin/agence/`, `src/app/(admin)/admin/promoteur/`, `src/app/dashboard/bailleur/`.
- **Critères d'acceptation** : Écrans dédiés et étanches entre entreprises concurrentes.
- **Estimation d'effort** : **L** (Large — 2 jours)

---

### Étape 9 : Console d'Administration, Modération & Anti-Fraude
- **Objectif** : Doter l'équipe ImmOfika d'un bouclier opérationnel contre les arnaques et démarcheurs non habilités.
- **Actions techniques** :
  1. File de modération enrichie (`/admin/moderation`) :
     - Visualisation côte à côte de l'annonce et du titre de propriété ou mandat fourni.
     - Approbation avec octroi du badge « Annonce Certifiée » ou rejet avec motif précis.
  2. Module de traitement des signalements (`/admin/signalements`) :
     - Traitement des alertes d'utilisateurs (bien déjà loué, fausses photos, surcoût illégal).
     - Possibilité de suspendre immédiatement une annonce ou de bannir le compte émetteur.
  3. Détection des doublons : alerte automatique si un même numéro de téléphone ou des photos identiques sont déposés par deux comptes différents.
- **Fichiers touchés** : `src/app/(admin)/admin/moderation/`, `src/app/actions/moderation.ts`, `src/app/actions/signalements.ts`.
- **Critères d'acceptation** : Audit immuable de chaque décision de modération dans `audit_logs`.
- **Estimation d'effort** : **M** (Moyen — 1 jour)

---

### Étape 10 : Paiements, Notifications & Mobile First
- **Objectif** : Monétiser la plateforme et optimiser la réactivité sur mobile (canal roi à Abidjan).
- **Actions techniques** :
  1. Abonnements B2B & Sponsoring Paystack :
     - Souscription d'abonnements mensuels pour les agences (pack 20 annonces, pack illimité).
     - Achat d'options de mise en avant « En Vedette » avec règlement direct Mobile Money (Wave, Orange, MTN).
  2. Intégration des notifications automatiques (SMS / WhatsApp) pour les confirmations de rendez-vous de visite.
  3. Optimisation mobile irréprochable (temps de chargement < 2s sur réseau mobile 4G, navigation fluide au pouce).
- **Fichiers touchés** : `src/lib/paystack/`, `src/app/actions/abonnements.ts`, `src/components/public/`.
- **Critères d'acceptation** : Encaissement Paystack validé par webhook avec scellement de transaction.
- **Estimation d'effort** : **M** (Moyen — 1 jour)

---

### Étape 11 : Recette Complète & Certification Finale QA
- **Objectif** : Valider rigoureusement le fonctionnement de bout en bout de la marketplace.
- **Actions techniques** :
  1. Mise à jour intégrale de `docs/CAHIER-DE-RECETTE.md` avec les scénarios pas-à-pas pour chacun des profils (Visiteur, Locataire, Propriétaire, Agence, Promoteur, Modérateur, Super Admin).
  2. Exécution des tests au linter strict (`lint_cahier.py` : 0 erreur, 0 avertissement).
  3. Génération des documents Word officiels de recette (`CAHIER-DE-RECETTE.docx`, `BUGS_ET_AMELIORATIONS.docx`).
  4. Mise à jour synchronisée de `docs/GUIDE-UTILISATEUR-ADMIN.md`.
- **Fichiers touchés** : `docs/CAHIER-DE-RECETTE.md`, `docs/GUIDE-UTILISATEUR-ADMIN.md`, `docs/CAHIER-DE-RECETTE.docx`.
- **Critères d'acceptation** : 100% des tests validés, zéro blocage, PV de recette signé.
- **Estimation d'effort** : **M** (Moyen — 0.5 jour)

