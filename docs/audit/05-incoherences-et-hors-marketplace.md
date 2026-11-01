# 05 — Incohérences, Modules Hors Marketplace & Spécificités Mono-Client

> **Projet** : ImmOfika  
> **Type d'audit** : Phase 1 — Audit en lecture seule pour transformation en Marketplace Immobilière (Abidjan)  
> **Date** : 31 Octobre 2026  
> **Objectif** : Identifier exhaustivement les modules internes de l'ancien client unique qui doivent être isolés ou retirés, les incohérences architecturales et le code mort ou décalé.

---

## 1. Éléments Spécifiques au Promoteur Unique (Hors Périmètre Marketplace)

Le projet a été développé initialement pour gérer les opérations internes d'un promoteur immobilier agréé unique. Plusieurs pans entiers de l'application relèvent d'un ERP/CRM d'entreprise privée et ne doivent en aucun cas être exposés sur une marketplace publique :

### 1.1 Le CRM Interne des Prospects (`leads` & `lead_interactions`)
- **Fichiers sources** : `src/lib/db/schema.ts:261-291`, `src/app/actions/leads.ts`, `src/app/(admin)/admin/leads/`, `src/lib/crm/scoring.ts`, `src/lib/crm/attribution.ts`.
- **Nature du problème** :
  - Il s'agit d'un CRM fermé où les prospects téléphoniques ou WhatsApp sont dispatchés automatiquement entre les agents salariés d'une même société selon une règle de rotation interne (`attribution.ts:1-60`).
  - Sur une marketplace ouverte, la plateforme ne centralise pas les leads pour les distribuer à des salariés : ce sont les **acheteurs qui contactent directement l'agence ou le propriétaire** ayant déposé l'annonce.
- **Action requise** : Isoler ce CRM ou le restreindre aux outils internes de gestion des partenariats de la plateforme, et non pour le flux commercial des biens.

### 1.2 Le Gestionnaire de Tâches & Projets Internes (`dossiers` & `taches`)
- **Fichiers sources** : `src/lib/db/schema.ts:295-324`, `src/app/actions/dossiers.ts`, `src/app/actions/kanban-taches.ts`, `src/app/(admin)/admin/dossiers/`.
- **Nature du problème** :
  - Tableau Kanban interne utilisé par les équipes techniques du promoteur pour suivre les dossiers de lotissement, d'approbation ministérielle et d'obtention de l'Arrêté de Concession Définitive (ACD).
  - Ce workflow n'a aucune utilité pour les visiteurs, acheteurs ou agences tierces de la marketplace.
- **Action requise** : Déconnecter ce module du périmètre public et le réserver à un espace d'administration interne d'opérations si nécessaire.

### 1.3 Le Générateur de Formulaires Dynamiques Style Tally (`formulaires` & `formulaire_reponses`)
- **Fichiers sources** : `src/lib/db/schema.ts:467-493`, `src/app/actions/formulaires.ts`, `src/app/f/[slug]/`, `src/app/(admin)/admin/formulaires/`.
- **Nature du problème** :
  - Module autonome permettant de créer des questionnaires personnalisés avec champs configurables en JSON.
  - Ce module est un outil annexe utilisé pour des sondages ou enquêtes spécifiques du client unique, étranger au cœur d'une marketplace immobilière.
- **Action requise** : Conserver en retrait ou archiver pour ne pas alourdir la maintenance.

### 1.4 La Gestion des Mandats Fonciers Dédiés (`bien_confies` & `suggestions`)
- **Fichiers sources** : `src/lib/db/schema.ts:441-464`.
- **Nature du problème** :
  - Formulaires spécifiques invitant les propriétaires villageois ou particuliers à « Confier leur terrain ou parcelle à ImmOfika » pour aménagement foncier ou lotissement.
  - Sur une marketplace, ce besoin est remplacé par le formulaire standard de dépôt d'annonce (Vente de terrain).

### 1.5 La Vue Tableur Interne sans Validation (`/admin/database`)
- **Fichiers sources** : `src/app/actions/airtableDatabase.ts:1-104`, `src/app/(admin)/admin/database/page.tsx`.
- **Nature du problème** :
  - Écran répliquant l'interface Airtable pour modifier les cellules de base de données à la volée.
  - Faille d'intégrité majeure si accessible sans schéma strict.

---

## 2. Textes, Mentions & Identité Visuelle en Dur

La plateforme contient des ancrages sémantiques forts limitant l'application à un promoteur unique :

1. **Configuration Centralisée de l'Entreprise** :
   - Source : `src/config/site.ts:7-25`
   - Présence de la raison sociale, du statut *« Promoteur Immobilier Agréé »*, du RCCM (`CI-ABJ-2024-B-14285`), du NCC (`2034567A`) et de l'adresse physique du promoteur dans les configurations du site.
   - Sur une marketplace, `siteConfig.company` doit représenter l'**Opérateur de la Plateforme Marketplace**, tandis que les statuts juridiques, RCCM et agréments doivent être portés par chaque annonceur (agence ou promoteur partenaire).
2. **Métadonnées SEO & Textes de Fiches Biens** :
   - Source : `src/app/(public)/biens/[slug]/page.tsx:33`
   - Mention en dur : *« Offre certifiée par ImmOfika, Promoteur Immobilier Agréé pour l'aménagement foncier et la construction. »*
   - Doit être remplacé par le nom dynamique et l'agrément certifié de l'annonceur réel (ex: *« SCPI Riviera »*, *« Agence Cocody Prestige »*, etc.).

---

## 3. Incohérences Architecturales & Code Mort

### 3.1 Pollution du Système de Permissions par des Codes E-Commerce
- **Sources** : `src/lib/auth/permissions.ts:28-66` et `supabase/migrations/0017_seed_rbac_matrix.sql:32-78`.
- **Constat** :
  - La matrice de permissions référence :
    - `commande:creer:own`, `commande:statut_modifier`, `commande:annuler:own`
    - `produit:voir`, `produit:creer/modifier`, `produit:archiver`, `produit:supprimer_definitif`
    - `stock:modifier`, `livraison:gerer`, `retour:demander:own`, `retour:traiter`
  - Ces permissions proviennent d'un modèle de boutique en ligne de vente de biens physiques et n'ont aucun sens dans une transaction immobilière (visites, mandats, baux, réservations, ACD).
- **Conséquence** : Confusion totale dans l'écran `/admin/roles` et complexité inutile.
- **Action requise** : Purger ces 20 permissions e-commerce obsolètes et les remplacer par la taxonomie immobilière marketplace réelle (`annonce:publier`, `visite:demander`, `dossier:transmettre`, `mandat:verifier`, `organisation:gerer_agents`).

### 3.2 Doublons de Routes et Pages Orphelines
| Route Doublon / Orpheline | Route Officielle Correspondante | Problème & Action | Source |
| :--- | :--- | :--- | :--- |
| `/login` | `/auth/login` | Doublon historique utilisant une ancienne implémentation de formulaire. À supprimer ou rediriger vers `/auth/login`. | `src/app/login/page.tsx` |
| `/dashboard/client` | `/client/dashboard` | Doublon orphelin non maintenu. À supprimer ou rediriger. | `src/app/dashboard/client/page.tsx` |
| `/test-supabase` | Aucune | Route de test technique exposée en clair affichant des métadonnées de connexion DB. À supprimer impérativement. | `src/app/test-supabase/page.tsx` |

### 3.3 Doublon d'Instanciation Supabase
- **Constat** :
  - D'un côté : `src/lib/supabase/client.ts` et `src/lib/supabase/server.ts`.
  - De l'autre : `src/utils/supabase/client.ts`, `src/utils/supabase/server.ts`, `src/utils/supabase/middleware.ts`.
- **Conséquence** : Les imports dans le projet sont mélangés (certains fichiers importent depuis `@/lib/supabase`, d'autres depuis `@/utils/supabase`).
- **Action requise** : Unifier l'ensemble du projet sur un chemin unique et standard (`@/lib/supabase/`).

### 3.4 Table Vestige Inutilisée
- Table `todos` (`src/lib/db/schema.ts:56-61`) : Table d'exemple issue d'un template initial, persistée en base sans aucun lien avec l'immobilier. À supprimer proprement via migration.

---

## 4. De l'Architecture Mono-Tenant vers le Multi-Annonceurs

Dans le code existant :
- Une annonce dans `biens` possède un `owner_id` pointant vers `profiles.id` (`src/lib/db/schema.ts:153`).
- Cependant, **le concept d'Organisation (Agence Immobilière ou Société de Promotion) est totalement absent de la base** :
  - Une agence ne peut pas rattacher 3 ou 5 négociateurs/agents commerciaux à son compte.
  - Si un agent quitte l'agence, il n'existe aucun moyen de transférer ses annonces à un autre membre de la société.
  - La réputation, les avis et les coordonnées de l'agence ne peuvent pas être mutualisés.
- **Évolution structurelle indispensable** :
  - Création des tables `organizations` (raison sociale, logo, RCCM, agrément, type : agence / promoteur) et `organization_members` (rôle dans l'organisation : gérant, négociateur, administratif).
  - Rattachement des biens à une `organization_id` (optionnelle pour un particulier, obligatoire pour une agence ou un promoteur).

