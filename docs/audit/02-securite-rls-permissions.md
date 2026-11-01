# 02 — Sécurité, RLS et Modèle de Permissions

> **Projet** : ImmOfika  
> **Type d'audit** : Phase 1 — Audit en lecture seule pour transformation en Marketplace Immobilière (Abidjan)  
> **Date** : 31 Octobre 2026  
> **Sources examinées** : `supabase/migrations/enable_rls.sql`, `supabase/migrations/0015_complete_rbac_system.sql`, `src/lib/auth/permissions.ts`, `src/proxy.ts`, `src/lib/r2/client.ts`, et catalogue système PostgreSQL (`pg_class`, `pg_policies`).

---

## 1. État Actuel du Row Level Security (RLS) par Table

Sur les **33 tables** recensées dans le schéma `public` de la base de données :
- **31 tables** ont `rls_enabled = true`.
- **2 tables critiques** ont `rls_enabled = false` :
  - `user_roles` (attribution multi-rôles) : ❌ **RLS DÉSACTIVÉE**.
  - `default_role_permissions` (référence des permissions par défaut) : ❌ **RLS DÉSACTIVÉE**.

### Tableau Récapitulatif RLS & Politiques

| Table | RLS Active | Nombre de Politiques | Risque Identifié | Source |
| :--- | :---: | :---: | :--- | :--- |
| `user_roles` | ❌ **Non** | 0 | 🚨 **Critique** : Table sans RLS exposée à l'API PostgREST Supabase. | `pg_class.relrowsecurity = false` |
| `default_role_permissions` | ❌ **Non** | 0 | ⚠️ **Majeur** : Lecture/écriture directe non contrôlée par RLS. | `pg_class.relrowsecurity = false` |
| `profiles` | ✅ Oui | 4 | 🚨 **Critique** : Politique `User_Own_Profile_Update` autorise la mise à jour de sa propre ligne sans clause `CHECK` interdisant la colonne `role`. | `enable_rls.sql:73`, `pg_policies` |
| `biens` | ✅ Oui | 2 | ⚠️ **Majeur** : `Public_Read_biens` applique `USING (true)` sans filtrer `deleted_at IS NULL` ni `statut_moderation = 'valide'`. | `enable_rls.sql:65` |
| `bien_images` | ✅ Oui | 2 | ⚠️ **Majeur** : `Public_Read_bien_images` applique `USING (true)` pour tous. | `enable_rls.sql:68` |
| `roles` | ✅ Oui | 2 | ⚠️ **Majeur** : `Public_Read_roles` et `Staff_Full_Access_roles`. | `enable_rls.sql:46`, `pg_policies` |
| `permissions` | ✅ Oui | 2 | ⚠️ **Majeur** : `Public_Read_permissions` et `Staff_Full_Access_permissions`. | `enable_rls.sql:49`, `pg_policies` |
| `role_permissions` | ✅ Oui | 2 | ⚠️ **Majeur** : `Public_Read_role_permissions` et `Staff_Full_Access`. | `enable_rls.sql:57`, `pg_policies` |
| `reservations` | ✅ Oui | 4 | ⚠️ **Majeur** : Filtrage par `client_id = auth.uid()` ou `is_staff()`. Pas de gestion multi-bailleurs (le propriétaire de l'annonce ne peut pas voir les réservations de son bien via RLS directe). | `enable_rls.sql:76` |
| `paiements` | ✅ Oui | 4 | ⚠️ **Majeur** : Même restriction. Seul le client payeur ou le staff global voit les paiements. Pas d'isolation par agence ou promoteur. | `enable_rls.sql:77` |
| `visites` | ✅ Oui | 4 | ⚠️ **Majeur** : RLS staff global vs client. L'agent assigné ou le propriétaire externe n'a pas de policy dédiée. | `pg_policies:68-71` |
| `visite_avis` | ✅ Oui | 4 | ✅ Fonctionne (création propre, lecture staff). | `pg_policies:64-67` |
| `leads` | ✅ Oui | 2 | 🔀 **Mono-client** : Tous les leads sont visibles par tout le staff via `is_staff()`. Aucune étanchéité entre agences concurrentes. | `pg_policies:21-22` |
| `dossiers` / `taches` | ✅ Oui | 2 | 🔀 **Mono-client** : Accès staff global. Inadapté à une marketplace où chaque agence a ses dossiers confidentiels. | `pg_policies:14-15` |
| `audit_logs` | ✅ Oui | 1 | ✅ `audit_logs_admin_read` restreint aux administrateurs. | `pg_policies:4` |
| `homepage_configs` | ✅ Oui | 2 | ✅ Lecture publique, écriture staff. | `pg_policies:19-20` |

---

## 2. Classification des Failles de Sécurité

### 🔴 Failles Critiques

#### 1. Faille d'Élévation de Privilège par Auto-Modification du Profil
- **Emplacement** : `supabase/migrations/enable_rls.sql:73`
- **Mécanisme** :
  ```sql
  CREATE POLICY "User_Own_Profile_Update" ON "public"."profiles" 
  FOR UPDATE USING (auth.uid() = id) WITH CHECK (auth.uid() = id);
  ```
- **Impact** : Tout utilisateur connecté peut envoyer une requête REST `PATCH /rest/v1/profiles?id=eq.<uid>` avec le corps `{ "role": "admin" }` ou `{ "role": "tech_super_admin" }`. La policy PostgreSQL l'autorise car `auth.uid() = id`.
- **Conséquence** : L'attaquant devient instantanément administrateur, ce qui débloque les fonctions `public.is_admin()` et `public.is_staff()`, lui accordant l'accès total en lecture et écriture sur toutes les tables de la base de données.
- **Remédiation requise** :
  - Soit retirer la colonne `role` de la table `profiles` pour la gérer exclusivement dans une table `user_roles` sécurisée ou dans les `app_metadata` Supabase non modifiables par l'utilisateur.
  - Soit ajouter un trigger `BEFORE UPDATE` qui rejette toute modification du champ `role` si l'exécutant n'est pas `super_admin`.

#### 2. Absence de RLS sur la Table `user_roles`
- **Emplacement** : `pg_class` (table `user_roles`, `relrowsecurity = false`)
- **Impact** : La table qui stocke les attributions des rôles n'est pas protégée par RLS. Si PostgREST accorde les privilèges par défaut au rôle `authenticated`, un utilisateur peut s'insérer lui-même dans `user_roles` avec le rôle `super_admin`.
- **Remédiation requise** : `ALTER TABLE "public"."user_roles" ENABLE ROW LEVEL SECURITY;` avec policy `SELECT/INSERT/UPDATE/DELETE` restreinte au rôle de service ou aux administrateurs vérifiés.

---

### 🟠 Failles Majeures

#### 1. Fuite des Annonces Non Validées ou Rejetées dans l'API Publique
- **Emplacement** : `src/app/api/biens/route.ts:23-45`
- **Mécanisme** : La requête publique filtre uniquement `is('deleted_at', null)`. Elle omet de filtrer `statut_moderation = 'valide'`.
- **Impact** : Tout internaute ou script externe interrogeant `/api/biens` reçoit les biens en attente de modération, ainsi que les annonces refusées ou frauduleuses contenant des coordonnées non vérifiées.

#### 2. Stockage et Vérification du Rôle en Base vs Session (Time-of-Check to Time-of-Use)
- **Emplacement** : `src/proxy.ts:76-80, 89-93`
- **Mécanisme** : Le proxy effectue à chaque requête réseau un appel direct à Supabase `.from('profiles').select('role').single()`. Si la base de données est lente ou temporairement indisponible, le fallback par défaut est `role = 'client'`.
- **Impact** : Risque de latence à chaque transition de page (requête DB dans le proxy edge) et risque d'incohérence si le profil est mis en cache ou révoqué.
- **Bonne pratique recommandée** : Synchroniser le rôle validé dans les Custom Claims JWT ou `app_metadata` de Supabase Auth, scellés cryptographiquement.

#### 3. Protection Insuffisante de la Route de Mise à Jour Inline
- **Emplacement** : `src/app/actions/airtableDatabase.ts:32-60`
- **Mécanisme** : La fonction `updateInlineCellAction(tableName, rowId, field, value)` accepte dynamiquement n'importe quel nom de colonne (`field`) et n'importe quelle valeur (`value`) sans validation par un schéma Zod.
- **Impact** : Risque d'injection d'états incohérents ou de modification de colonnes protégées (ex: forcer `statut_moderation = 'valide'` ou altérer `owner_id`).

---

### 🟡 Failles Mineures & Risques Opérationnels

#### 1. Route de Test Supabase Exposée Publiquement
- **Emplacement** : `src/app/test-supabase/page.tsx`
- **Impact** : Page accessible sans authentification affichant des diagnostics de connectivité à la base de données. Doit être supprimée en environnement de production.

#### 2. Documents Confidentiels R2 : Absence d'URLs Signées Temporaires
- **Emplacement** : `src/lib/r2/client.ts:89-96`, `src/app/api/kyc/[userId]/document/route.ts:90-100`
- **Mécanisme** : Le document confidentiel KYC (CNI, passeport) est téléchargé dans la mémoire vive du serveur Next.js via le SDK S3 puis streamé vers le navigateur.
- **Impact** : Consommation de bande passante et charge mémoire inutile sur le serveur Next.js.
- **Bonne pratique** : Utiliser la méthode native S3 `getSignedUrl(r2Client, command, { expiresIn: 300 })` pour générer un lien temporaire direct de 5 minutes avec téléchargement direct sécurisé depuis Cloudflare R2 vers le client.

---

## 3. Matrice des Droits Actuelle vs Cible (Moindre Privilège)

### 3.1 État Actuel (Constat Réel dans le Code)
Dans `src/lib/auth/permissions.ts:28-83` et `supabase/migrations/0017_seed_rbac_matrix.sql`, la matrice a été peuplée avec des codes issus d'un modèle **e-commerce** (`commande:creer:own`, `stock:modifier`, `produit:voir`) qui cohabitent avec des alias immobiliers (`bien:create`, `bien:moderate`, `visite:create`).

| Rôle Existant | Droits Actuels Réels | Écarts avec la Marketplace |
| :--- | :--- | :--- |
| **`visiteur`** | Lecture catalogue (`biens:read`) | ✅ Conforme |
| **`client`** | Lecture catalogue, favoris, réservation acompte, upload CNI KYC basique | ⚠️ Pas de profil acheteur/locataire (budget, critères, dossier de location) |
| **`proprietaire`** | Publication directe de biens, consultation de son parc | ⚠️ Pas de vérification du titre foncier, pas d'isolation des visites |
| **`agent`** | Accès agenda iCal, visites de tous les biens, création de biens | 🔀 Travaille comme un agent interne de l'agence unique, pas comme un agent indépendant multi-mandants |
| **`agence`** | Même périmètre que le propriétaire | ❌ Aucune gestion d'équipe (agents rattachés), aucun abonnement professionnel |
| **`promoteur`** | Identique à propriétaire | ❌ Aucune gestion de programmes neufs (VEFA), plans de masse, lots ou tranches |
| **`moderateur`** | Valide ou rejette les biens dans `/admin/moderation` | ⚠️ N'a pas de vision sur les signalements de doublons ou la vérification des pièces de propriété |
| **`admin`** | Accès universel back-office | 🔀 Rôle fourre-tout mélangeant modération, comptabilité, CRM commercial et paramétrage |
| **`super_admin`** | Contrôle total, kill-switch, matrice des rôles | ✅ Conforme au principe de souveraineté |

---

### 3.2 Matrice Cible pour la Marketplace Immobilière (Abidjan)

| Ressource & Action | Visiteur | Acheteur / Locataire | Propriétaire Particulier | Agent Indépendant | Agence Immobilière | Promoteur Agréé | Modérateur | Commercial Support | Super Admin |
| :--- | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: |
| **Consulter annonces validées** | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| **Recherches sauvegardées & alertes** | ❌ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| **Favoris & Coups de cœur** | ❌ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| **Demander une visite** | ❌ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| **Déposer un dossier de location/achat** | ❌ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| **Publier une annonce (particulier)** | ❌ | ❌ | ✅ (own, modéré) | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| **Publier des annonces (pro)** | ❌ | ❌ | ❌ | ✅ (own, quota) | ✅ (équipe, abonnement) | ✅ (programmes/lots) | ❌ | ❌ | ❌ |
| **Gérer ses collaborateurs / agents** | ❌ | ❌ | ❌ | ❌ | ✅ (own) | ✅ (own) | ❌ | ❌ | ❌ |
| **Gérer les programmes neufs & lots** | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ (own) | ❌ | ❌ | ❌ |
| **Modérer les annonces & pièces** | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ | ❌ | ✅ |
| **Traiter les signalements d'abus** | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ | ❌ | ✅ |
| **Gérer les litiges & support** | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ | ✅ |
| **Gérer les abonnements agences** | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ | ✅ |
| **Configuration système & Kill-Switch** | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ |
| **Matrice RBAC & Comptes Admins** | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ |

