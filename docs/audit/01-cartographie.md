# 01 — Cartographie Technique de l'Existant

> **Projet** : ImmOfika  
> **Type d'audit** : Phase 1 — Audit en lecture seule pour transformation en Marketplace Immobilière (Abidjan)  
> **Date** : 31 Octobre 2026  
> **Source de vérité** : Arborescence réelle du dépôt, `package.json`, `src/` et `supabase/migrations/`  

---

## 1. Détection des Versions & Écosystème Technique

Les versions exactes extraites de `package.json` sont :

| Paquet / Framework | Version Réelle (`package.json`) | Pratique Actuelle / Statut | Source |
| :--- | :--- | :--- | :--- |
| **Next.js** | `16.2.6` | App Router actif. Convention `src/proxy.ts` utilisée à la place du `middleware.ts` déprécié en v16. | `package.json:47` |
| **React** | `19.2.4` / `react-dom: 19.2.4` | React 19 natif (Server Components, Server Actions, Transitions). | `package.json:50,52` |
| **Supabase SSR** | `@supabase/ssr: ^0.10.3` | Client SSR basé sur les cookies (`cookies.getAll`, `cookies.setAll`). | `package.json:27` |
| **Supabase JS** | `@supabase/supabase-js: ^2.105.4` | Client JavaScript officiel Supabase. | `package.json:28` |
| **Tailwind CSS** | `^4` (`@tailwindcss/postcss: ^4`) | Tailwind v4 basé sur feuille CSS native (`src/app/globals.css`). | `package.json:66,81` |
| **shadcn/ui** | `^4.7.0` | Composants UI atomiques dans `src/components/ui/`. | `package.json:56` |
| **Lucide Icons** | `lucide-react: ^1.16.0` | Bibliothèque officielle d'icônes vectorielles. | `package.json:45` |
| **Validation** | `zod: ^4.4.3` | Schémas de validation serveur et formulaires. | `package.json:61` |
| **ORM / BDD** | `drizzle-orm: ^0.45.2`, `postgres: ^3.4.9` | Client direct PostgreSQL et ORM Drizzle cohabitant avec le client Supabase JS. | `package.json:39,49` |
| **Stockage Fichiers** | `@aws-sdk/client-s3: ^3.1053.0` | Stockage sur **Cloudflare R2** (S3 compatible) et non Supabase Storage. | `package.json:18` |
| **Paiements** | Paystack (via SDK HTTP interne) | Mobile Money (Wave, Orange, MTN) et Cartes bancaires en XOF. | `src/lib/paystack/client.ts:1-50` |

---

## 2. Arborescence & Architecture du Code

```text
src/
├── app/                        # App Router Next.js 16
│   ├── (admin)/admin/          # Back-Office de gestion et d'administration
│   ├── (client)/client/        # Espace locataire / acquéreur
│   ├── (public)/               # Pages publiques (biens, auth, vitrine, mentions)
│   ├── actions/                # Server Actions ('use server')
│   ├── api/                    # Route Handlers API REST, Webhooks & Cron
│   ├── dashboard/              # Routes orphelines / doublons (bailleur, client)
│   ├── f/[slug]/               # Formulaires dynamiques publics (style Tally)
│   ├── proxy.ts                # Proxy réseau Next.js 16 (sécurité d'accès)
│   └── layout.tsx, page.tsx    # Racine et page d'accueil
├── components/                 # Composants React
│   ├── admin/                  # Écrans et modules back-office
│   ├── biens/                  # Cartes, filtres, recherche catalogue
│   ├── client/                 # Interface espace client
│   ├── public/                 # Hero, Partenaires, Footer
│   ├── shared/                 # Navbar, Logo, Modales partagées
│   └── ui/                     # Primitives shadcn/ui
├── config/                     # Configuration globale (site.ts)
├── lib/                        # Services et logique métier
│   ├── audit/                  # Journalisation immuable des événements de sécurité
│   ├── auth/                   # Moteur RBAC (permissions.ts, passwordPolicy.ts)
│   ├── calendar/               # Génération et parsing iCal / agendas
│   ├── crm/                    # Scoring des prospects et attribution
│   ├── db/                     # Drizzle ORM (schema.ts, index.ts)
│   ├── fne/                    # Facture Normalisée Électronique (DGI Côte d'Ivoire)
│   ├── paystack/               # Intégration passerelle Paystack
│   ├── r2/                     # Client S3 Cloudflare R2 (documents et photos)
│   └── supabase/               # Instances du client Supabase
└── types/                      # Types TypeScript (marketplace.ts, crm.ts, formulaire.ts)
```

---

## 3. Cartographie des Routes (App Router)

### 3.1 Pages Publiques (`(public)` & racine)
| Route URL | Fichier Source | Rôle / Accès | Statut Marketplace |
| :--- | :--- | :--- | :---: |
| `/` | `src/app/page.tsx:1-240` | Public / Visiteur | ⚠️ Partiellement adapté (sections promoteur mono-client à généraliser) |
| `/biens` | `src/app/(public)/biens/page.tsx:1-532` | Public / Visiteur | ⚠️ Existe mais ne filtre pas le statut de modération (`/api/biens`) |
| `/biens/[slug]` | `src/app/(public)/biens/[slug]/page.tsx:1-118` | Public / Visiteur | ⚠️ Textes en dur au nom du promoteur mono-client (`page.tsx:33`) |
| `/contact` | `src/app/(public)/contact/page.tsx` | Public | ✅ Fonctionne |
| `/legal` | `src/app/(public)/legal/page.tsx` | Public | ⚠️ Mentions légales au nom exclusif du client unique |
| `/cookies` | `src/app/(public)/cookies/page.tsx` | Public | ✅ Fonctionne |
| `/confidentiality` | `src/app/(public)/confidentiality/page.tsx` | Public | ✅ Conforme loi ivoirienne n° 2013-450 |
| `/auth/login` | `src/app/(public)/auth/login/page.tsx:1-220` | Public | ✅ Fonctionne (email + password + OTP) |
| `/auth/register` | `src/app/(public)/auth/register/page.tsx:1-339` | Public | 🔀 Crée uniquement un rôle `client`, aucun choix de profil ni onboarding |
| `/auth/forgot-password` | `src/app/(public)/auth/forgot-password/page.tsx` | Public | ✅ Fonctionne avec rate-limiting IP/email |
| `/auth/reset-password` | `src/app/(public)/auth/reset-password/page.tsx` | Public | ✅ Fonctionne |
| `/auth/verify-otp` | `src/app/(public)/auth/verify-otp/page.tsx` | Public | ✅ Fonctionne avec protection anti-force-brute |
| `/f/[slug]` | `src/app/f/[slug]/page.tsx` | Public | 🔀 Formulaire style Tally (outil interne client unique) |
| `/suspended` | `src/app/suspended/page.tsx` | Utilisateur banni | ✅ Écran d'éviction conforme |
| `/unauthorized` | `src/app/unauthorized/page.tsx` | 403 Forbidden | ✅ Écran d'interdiction conforme |
| `/login` | `src/app/login/page.tsx` | Public | 🔀 Route doublon obsolète de `/auth/login` |
| `/test-supabase` | `src/app/test-supabase/page.tsx` | Public | ❌ Route de test technique exposée en clair |

### 3.2 Espace Client (`(client)`)
| Route URL | Fichier Source | Rôle Exigé | Statut Marketplace |
| :--- | :--- | :--- | :---: |
| `/client/dashboard` | `src/app/(client)/client/dashboard/page.tsx` | `client` | ⚠️ KPI et réservations propres au client |
| `/client/reservations` | `src/app/(client)/client/reservations/page.tsx` | `client` | ⚠️ Suivi acompte et contrats promoteur mono-client |
| `/client/favoris` | `src/app/(client)/client/favoris/page.tsx` | `client` | ✅ Sauvegarde et consultation de coups de cœur |
| `/client/profil` | `src/app/(client)/client/profil/page.tsx` | `client` | ⚠️ Édition nom et téléphone, pas de critères de recherche |
| `/client/kyc` | `src/app/(client)/client/kyc/page.tsx` | `client` | ⚠️ Téléversement CNI/Passeport (manque justificatifs revenus) |
| `/dashboard/client` | `src/app/dashboard/client/page.tsx` | `client` | 🔀 Doublon orphelin de `/client/dashboard` |

### 3.3 Espace Propriétaire / Bailleur (`/dashboard/bailleur`)
| Route URL | Fichier Source | Rôle Exigé | Statut Marketplace |
| :--- | :--- | :--- | :---: |
| `/dashboard/bailleur` | `src/app/dashboard/bailleur/page.tsx:1-350` | `proprietaire`, `agence` | ⚠️ Interface basique de publication de biens propres |

### 3.4 Espace Administration & Back-Office (`/admin`)
| Route URL | Fichier Source | Périmètre | Statut Marketplace |
| :--- | :--- | :--- | :---: |
| `/admin` | `src/app/(admin)/admin/page.tsx` | `admin`, `super_admin` | ⚠️ Dashboard orienté promoteur unique |
| `/admin/biens` | `src/app/(admin)/admin/biens/page.tsx` | Staff | ⚠️ Gestion de parc interne |
| `/admin/biens/new` | `src/app/(admin)/admin/biens/new/page.tsx` | Staff | ⚠️ Création avec publication directe sans modération |
| `/admin/moderation` | `src/app/(admin)/admin/moderation/page.tsx` | `moderateur`, `admin` | ✅ Interface d'approbation et rejet motivé |
| `/admin/roles` | `src/app/(admin)/admin/roles/page.tsx` | `super_admin` | ⚠️ Matrice RBAC existante polluée de codes e-commerce |
| `/admin/visites` | `src/app/(admin)/admin/visites/page.tsx` | `agent`, `admin` | ⚠️ Planning de visites terrain |
| `/admin/agenda` | `src/app/(admin)/admin/agenda/page.tsx` | `agent`, `admin` | ⚠️ Synchro iCal agents internes |
| `/admin/leads` | `src/app/(admin)/admin/leads/page.tsx` | `commercial`, `admin` | 🔀 CRM mono-client (prospects d'un seul promoteur) |
| `/admin/dossiers` | `src/app/(admin)/admin/dossiers/page.tsx` | Staff | 🔀 Kanban interne de suivi des dossiers de construction/ACD |
| `/admin/kyc` | `src/app/(admin)/admin/kyc/page.tsx` | `admin` | ⚠️ Validation manuelle CNI |
| `/admin/paiements` | `src/app/(admin)/admin/paiements/page.tsx` | `compta`, `admin` | ⚠️ Suivi acomptes et factures FNE du client unique |
| `/admin/database` | `src/app/(admin)/admin/database/page.tsx` | `admin` | 🔀 Vue Airtable interne avec édition en direct sans validation |
| `/admin/formulaires` | `src/app/(admin)/admin/formulaires/page.tsx` | `admin` | 🔀 Formulaires Tally internes |
| `/admin/configuration` | `src/app/(admin)/admin/configuration/page.tsx` | `super_admin` | ✅ Kill-Switch et personnalisation homepage |
| `/admin/vitrine` | `src/app/(admin)/admin/vitrine/page.tsx` | `agent`, `promoteur` | ✅ Paramétrage WhatsApp/Appel direct |

### 3.5 Route Handlers API (`src/app/api/`)
| Endpoint | Source | Méthode | Rôle & Sécurité |
| :--- | :--- | :---: | :--- |
| `/api/biens` | `src/app/api/biens/route.ts:5-59` | `GET` | Public. ⚠️ Ne filtre pas `statut_moderation = 'valide'` |
| `/api/favoris` | `src/app/api/favoris/route.ts` | `GET, POST, DELETE` | Connecté. Filtre par `auth.uid() = client_id` |
| `/api/kyc/[userId]/document` | `src/app/api/kyc/[userId]/document/route.ts:9-114` | `GET` | Connecté. Vérifie `isOwner` ou `isStaff` |
| `/api/webhooks/paystack` | `src/app/api/webhooks/paystack/route.ts` | `POST` | Signature HMAC SHA-512 Paystack vérifiée |
| `/api/agenda/[id]/export.ics` | `src/app/api/agenda/[id]/export.ics/route.ts` | `GET` | Protégé par token HMAC signé dans l'URL |
| `/api/me/permissions` | `src/app/api/me/permissions/route.ts` | `GET` | Retourne le contexte et les droits de l'utilisateur connecté |
| `/api/health/supabase` | `src/app/api/health/supabase/route.ts` | `GET` | Sonde de disponibilité de la BDD |
| `/api/cron/relances` | `src/app/api/cron/relances/route.ts` | `GET` | Relances automatiques des réservations impayées |
| `/api/cron/keepalive` | `src/app/api/cron/keepalive/route.ts` | `GET` | Maintien actif de l'instance Supabase |

---

## 4. Schéma de Base de Données

Le modèle de données défini dans `src/lib/db/schema.ts` comprend 24 tables relationnelles :

1. **Utilisateurs & RBAC** :
   - `profiles` (`src/lib/db/schema.ts:39-54`) : Profils utilisateurs (`email`, `role`, `kyc_doc_url`, `kyc_status`, `phone`, etc.).
   - `roles` (`src/lib/db/schema.ts:66-74`) : Définition des 13 rôles système avec `hierarchy_level` et `is_locked`.
   - `permissions` (`src/lib/db/schema.ts:76-85`) : 34 permissions avec `code`, `resource`, `action`, `scope`, `is_sensitive`.
   - `role_permissions` (`src/lib/db/schema.ts:87-94`) : Table de jonction rôle x permission.
   - `default_role_permissions` (`src/lib/db/schema.ts:96-103`) : Rétablissement des permissions d'origine.
   - `user_roles` (`src/lib/db/schema.ts:105-114`) : Multi-rôles par utilisateur avec `expires_at`.

2. **Catalogue & Immobilier** :
   - `biens` (`src/lib/db/schema.ts:117-161`) : Annonces (`titre`, `prix`, `type`, `transaction`, `statut`, `statut_moderation`, `owner_id`, `agent_id`, GPS).
   - `bien_images` (`src/lib/db/schema.ts:164-171`) : Galerie de photos secondaires d'un bien.
   - `favoris` (`src/lib/db/schema.ts:174-179`) : Coups de cœur enregistrés par les clients.
   - `reservations` (`src/lib/db/schema.ts:182-206`) : Blocage avec acompte et suivi de contrat notarié/ACD.
   - `reservation_relances` (`src/lib/db/schema.ts:244-250`) : Historique des relances d'acompte.

3. **Finances & Facturation Légale** :
   - `paiements` (`src/lib/db/schema.ts:209-241`) : Transactions Paystack, acomptes, reçus et mentions FNE.
   - `fne_sequences` (`src/lib/db/schema.ts:545-551`) : Compteur séquentiel ininterrompu DGI Côte d'Ivoire.

4. **Visites & Calendriers** :
   - `visites` (`src/lib/db/schema.ts:326-339`) : Rendez-vous terrain avec statut et plage horaire.
   - `visite_avis` (`src/lib/db/schema.ts:342-351`) : Évaluation 1 à 5 étoiles et commentaire public.
   - `agent_calendriers` (`src/lib/db/schema.ts:365-373`) : Flux iCal synchronisés.
   - `agent_indisponibilites` (`src/lib/db/schema.ts:375-384`) : Plages d'indisponibilité des agents.

5. **Modules Internes / Mono-Client (Hors Marketplace)** :
   - `leads` (`src/lib/db/schema.ts:261-280`) : Pipeline CRM mono-entreprise.
   - `lead_interactions` (`src/lib/db/schema.ts:282-291`) : Notes d'appels et WhatsApp internes.
   - `dossiers` & `taches` (`src/lib/db/schema.ts:295-324`) : Gestion de projet interne (Kanban).
   - `formulaires` & `formulaire_reponses` (`src/lib/db/schema.ts:467-492`) : Constructeur de formulaires Tally interne.
   - `contract_templates` (`src/lib/db/schema.ts:494-506`) : Modèles de promesses de vente mono-promoteur.
   - `bien_confies` (`src/lib/db/schema.ts:451-463`) : Mandats d'aménagement foncier confiés au promoteur.
   - `suggestions` (`src/lib/db/schema.ts:441-449`) : Boîte à idées interne.
   - `todos` (`src/lib/db/schema.ts:56-61`) : Table vestige de todo-list.

6. **Sécurité, CMS & Traçabilité** :
   - `audit_logs` (`src/lib/db/schema.ts:509-525`) : Registre immuable d'audit de sécurité.
   - `homepage_configs` (`src/lib/db/schema.ts:386-393`) : Configuration dynamique de la page d'accueil.
   - `notifications` & `push_subscriptions` (`src/lib/db/schema.ts:353-363, 401-416`) : Alertes Web Push.
   - `cookie_consents` & `analytics_events` (`src/lib/db/schema.ts:395-439`) : Consentement et télémétrie.

---

## 5. Variables d'Environnement Utilisées

*Aucune valeur secrète n'est reproduite ici, conformément aux règles de sécurité.*

- `NEXT_PUBLIC_SUPABASE_URL` : URL de l'instance Supabase.
- `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` : Clé publique anonyme Supabase.
- `DATABASE_URL` : Chaîne de connexion PostgreSQL directe (utilisée par Drizzle et migrations).
- `NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY` : Clé publique du widget de paiement Paystack.
- `PAYSTACK_SECRET_KEY` : Clé serveur d'initialisation et remboursement Paystack.
- `PAYSTACK_WEBHOOK_SECRET` : Signature secrète de validation du webhook Paystack.
- `NEXT_PUBLIC_APP_URL` : URL canonique de l'application (redirections Auth).
- `RESEND_API_KEY` : Clé API du service d'expédition d'emails Resend.
- `R2_ACCOUNT_ID`, `R2_ACCESS_KEY_ID`, `R2_SECRET_ACCESS_KEY`, `R2_BUCKET_NAME`, `R2_PUBLIC_URL` : Identifiants Cloudflare R2 (stockage S3).
- `NEXT_PUBLIC_VAPID_PUBLIC_KEY`, `VAPID_PRIVATE_KEY` : Clés Web Push PWA.
- `FNE_COMPANY_NCC`, `FNE_API_URL`, `FNE_API_KEY`, `FNE_MODE` : Paramètres de facturation normalisée DGI.

---

## 6. Analyse des Dépendances & Redondances

- **Doublon d'accès Supabase** :
  - `src/lib/supabase/client.ts` et `src/lib/supabase/server.ts`
  - `src/utils/supabase/client.ts`, `src/utils/supabase/server.ts`, `src/utils/supabase/middleware.ts`
  *Constat* : Deux répertoires parallèles instancient Supabase avec des conventions légèrement différentes (`@/lib/supabase` vs `@/utils/supabase`).
- **Dépendances à rationaliser** :
  - `docx` (`^9.7.0`) et `mammoth` (`^1.12.0`) : Utilisés uniquement pour la génération de documents Word de recette ou contrats internes.
  - `exceljs` (`^4.4.0`) : Utilisé pour les exports de paiements comptables.
  - `date-fns` (`^4.1.0`) : Présent, bon état.
  - `@iconify-react/...` (`hugeicons`, `iconoir`, `uiw`) : Trois paquets Iconify présents alors que `lucide-react` est la convention unique du projet.

