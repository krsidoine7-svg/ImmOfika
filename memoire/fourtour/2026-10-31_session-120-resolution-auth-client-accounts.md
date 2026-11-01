# Journal d'intervention : Résolution de l'authentification des comptes Clients & Managers Supabase

- **Date** : 31/10/2026
- **Auteur** : Antigravity Tech Lead
- **Composants ciblés** :
  - `auth.users` & `auth.identities` (Supabase GoTrue)
  - `public.profiles` & `public.user_roles`
  - `COMPTES_ACCES_IMMOFIKA.md`

## 1. Contexte & Problème Détecté
- **Symptôme** : L'utilisateur a signalé l'impossibilité de se connecter avec les comptes clients officiels répertoriés dans `COMPTES_ACCES_IMMOFIKA.md` :
  - `client.investisseur@gmail.com`
  - `client.particulier@yahoo.fr`
  - `client.societe@afrique-invest.com`
  Les mots de passe étaient rejetés avec une erreur d'authentification.
- **Diagnostic approfondi** :
  1. Les comptes étaient présents dans la table applicative `public.profiles` et dans `public.user_roles`, mais **aucun de ces comptes n'existait dans la table d'authentification interne de Supabase (`auth.users`)**. Seuls deux comptes administrateurs y figuraient initialement.
  2. Lors de la première tentative d'insertion brute SQL, les champs `raw_app_meta_data`, `raw_user_meta_data` et `identity_data` ont été injectés comme chaînes scalaires plutôt que comme objets JSONB natifs, empêchant la colonne générée `email` de `auth.identities` d'extraire l'adresse e-mail (`lower(identity_data->>'email')` devenait `null`), ce qui déclenchait l'erreur interne Supabase GoTrue `Database error querying schema`.

## 2. Corrections Réalisées
1. **Création et synchronisation complète de tous les comptes dans `auth.users` et `auth.identities`** :
   - Hachage cryptographique sécurisé compatible Supabase via `extensions.crypt(password, extensions.gen_salt('bf'))`.
   - Utilisation d'objets JSONB natifs (`sql.json(...)`) pour `raw_app_meta_data`, `raw_user_meta_data` et `identity_data`.
   - Initialisation de toutes les colonnes de confirmation (`email_confirmed_at = now()`, tokens vides `''` et statut 0).
   - Synchronisation complète des 3 comptes clients ET des 5 managers régionaux pour éviter tout blocage futur.

## 3. Résultats des Tests de Connexion Réels (Supabase SDK)
Le script de test officiel `scripts/test_all_auth_accounts.cjs` valide avec succès **10/10 comptes** :
- ✅ `admin.general@immofika.ci` (tech_super_admin)
- ✅ `admin.juridique@immofika.ci` (admin)
- ✅ `manager.cocody@immofika.ci` (agent)
- ✅ `manager.zone4@immofika.ci` (agent)
- ✅ `manager.assinie@immofika.ci` (agent)
- ✅ `manager.bingerville@immofika.ci` (agent)
- ✅ `manager.yamoussoukro@immofika.ci` (agent)
- ✅ `client.investisseur@gmail.com` (client)
- ✅ `client.particulier@yahoo.fr` (client)
- ✅ `client.societe@afrique-invest.com` (client)

