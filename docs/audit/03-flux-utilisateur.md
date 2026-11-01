# 03 — Analyse des Flux Utilisateur Existants

> **Projet** : ImmOfika  
> **Type d'audit** : Phase 1 — Audit en lecture seule pour transformation en Marketplace Immobilière (Abidjan)  
> **Date** : 31 Octobre 2026  
> **Méthode** : Suivi écran par écran dans le code source de l'App Router (`src/app`), Server Actions (`src/app/actions`) et composants UI.

---

## 1. Flux Inscription & Premier Accès

### 1.1 Parcours Réel dans le Code
1. **Écran d'inscription** : `src/app/(public)/auth/register/page.tsx:1-339`
   - Formulaire demandant : Email, Mot de passe, Confirmation, Case à cocher CGU.
   - Bouton d'inscription Google OAuth (`handleGoogleLogin`, `page.tsx:81-89`).
2. **Soumission serveur** : `src/app/actions/authActions.ts:287-366` (`registerUserAction`)
   - Validation Zod (`RegisterInputSchema`) : email valide, politique mot de passe (10 car., majuscule, minuscule, chiffre, symbole), CGU acceptées.
   - Appel `supabase.auth.signUp({ email, password, options: { emailRedirectTo: ... } })`.
   - Journalisation de l'audit (`auth.register_success`).
3. **Écran intermédiaire** : Affichage d'un bloc de succès invitant l'utilisateur à vérifier son e-mail (`page.tsx:91-140`).
4. **Validation de l'email** : Lien de callback vers `/auth/callback?code=...` (`src/app/(public)/auth/callback/route.ts:1-48`).
   - Échange du code contre une session Supabase active.
   - Récupération du rôle dans la table `profiles` via `supabase.from('profiles').select('role').single()`.
   - Redirection via `getSafeRedirectUrl(callbackUrl, role)`.

### 1.2 Problèmes & Écarts Marketplace Identifiés
- 🔀 **Aucun choix de profil à l'inscription** : L'utilisateur ne peut pas indiquer s'il est acheteur, locataire, propriétaire bailleur, agent immobilier ou promoteur.
- 🔀 **Rôle par défaut unique** : Tout compte créé est automatiquement estampillé `role = 'client'`.
- ❌ **Absence totale d'Onboarding** : Dès la validation du lien par email, l'utilisateur est catapulté sur `/client/dashboard`. Aucun écran ne lui demande son nom complet, sa commune de recherche à Abidjan, son budget, ou son statut professionnel.
- ⚠️ **Impasse pour les professionnels** : Une agence ou un propriétaire ne peut pas se qualifier en tant que tel. Il doit contacter manuellement un administrateur pour que celui-ci modifie son rôle dans `/admin/utilisateurs`.

---

## 2. Flux Connexion, Mot de Passe Oublié & Redirection

### 2.1 Parcours Réel dans le Code
1. **Écran de connexion** : `src/app/(public)/auth/login/page.tsx:1-220`
   - Formulaire classique Email + Mot de passe.
   - Onglet secondaire « Connexion par Téléphone OTP » : saisie du numéro (ex: `+225...`).
   - Bouton de connexion sociale Google OAuth.
2. **Soumission de connexion** : `src/app/actions/authActions.ts:175-272` (`loginWithPasswordAction`)
   - Rate-limiting anti-brute-force : 5 échecs par tranche de 15 minutes par IP/email.
   - `supabase.auth.signInWithPassword({ email, password })`.
   - Si le compte est marqué `role = 'suspended'` ou `deleted_at IS NOT NULL`, redirection immédiate vers `/suspended`.
   - Redirection intelligente selon le rôle via `getDefaultDashboardForRole` (`src/lib/roles.ts:45-61`) :
     - `admin` / `super_admin` / `tech_super_admin` → `/admin`
     - `agent` → `/admin/visites`
     - `proprietaire` / `agence` / `promoteur` → `/dashboard/bailleur`
     - `client` → `/client/dashboard`
3. **Mot de passe oublié** : `src/app/(public)/auth/forgot-password/page.tsx` et `requestPasswordResetAction` (`authActions.ts:16-89`)
   - Protection stricte anti-saturation : 3 demandes / 15 min par IP, 2 demandes / 15 min par email.
   - Envoi du lien vers `/auth/reset-password`.
4. **Réinitialisation du mot de passe** : `src/app/(public)/auth/reset-password/page.tsx`
   - Formulaire demandant le nouveau mot de passe avec validation de politique stricte.

### 2.2 Problèmes & Écarts Marketplace Identifiés
- ✅ **Sécurité et protection anti-abus excellentes** : Le rate-limiting, la validation Zod et la traçabilité dans `audit_logs` sont en place.
- 🔀 **Redirection déroutante pour les agences et promoteurs** : `src/lib/roles.ts:52,54` redirige `agence` et `promoteur` vers `/dashboard/bailleur`. Cet écran est conçu pour un particulier qui publie un studio ou une villa, et ne propose aucun outil pour gérer un programme neuf ou une équipe commerciale.
- 🔀 **Doublon d'URL** : Il existe `src/app/login/page.tsx` (ancienne version) qui fait doublon avec `src/app/(public)/auth/login/page.tsx`.

---

## 3. Flux Création, Édition et Publication d'un Bien

### 3.1 Parcours Réel dans le Code
1. **Accès au formulaire** :
   - Côté Administration : `/admin/biens/new` (`src/app/(admin)/admin/biens/new/page.tsx`).
   - Côté Bailleur : `/dashboard/bailleur` avec bouton de dépôt d'annonce.
2. **Soumission du formulaire** : `src/app/actions/adminBiens.ts:90-207` (`createBienAction`)
   - Vérification de permission `assertCan('bien:create')` (`adminBiens.ts:92`). Les clients simples sont bloqués.
   - Validation Zod des caractéristiques : Titre, description, prix, type, transaction, commune/quartier, surface, chambres, salles de bain.
   - Téléversement obligatoire de la photo principale vers Cloudflare R2 (`uploadToR2`).
   - **Règle de modération** :
     - Si `user.role === 'admin' || user.role === 'super_admin'` : `statutModeration = 'valide'` (mise en ligne immédiate).
     - Si utilisateur tiers (bailleur/propriétaire) : `statutModeration = 'en_attente'`.
   - Création de la ligne dans la table `biens` avec `ownerId = user.id`.
3. **Modération de l'annonce** : `src/app/(admin)/admin/moderation/page.tsx`
   - L'administrateur ou modérateur consulte les annonces `en_attente`.
   - Bouton « Approuver » : bascule `statutModeration = 'valide'` (`src/app/actions/moderation.ts`).
   - Bouton « Rejeter » : exige la saisie d'un `motifRejet` obligatoire.

### 3.2 Problèmes & Écarts Marketplace Identifiés
- ⚠️ **Fuite dans le catalogue public** : Comme mis en évidence dans l'audit RLS, l'API `/api/biens/route.ts` ne filtre pas `statut_moderation = 'valide'`, ce qui annule en pratique l'utilité de la modération pour les requêtes catalogue standard.
- ❌ **Absence de téléchargement des preuves de propriété** : Un particulier ou une agence peut créer une annonce sans fournir le moindre titre de propriété (ACD, CMP, extrait cadastral, mandat écrit). Rien n'empêche un démarcheur de publier le bien d'autrui.
- ❌ **Gestion des photos secondaires limitée** : Le formulaire initial ne traite qu'une seule image principale (`adminBiens.ts:125`). L'ajout de photos supplémentaires dans `bien_images` requiert des allers-retours complexes après création.
- ❌ **Pas de distinction Particulier vs Programme Neuf (VEFA)** : Impossible de publier un ensemble immobilier avec plusieurs typologies d'appartements (2 pièces, 3 pièces, 4 pièces) et échéancier de paiement.

---

## 4. Flux Recherche, Consultation, Favoris et Prise de Contact

### 4.1 Parcours Réel dans le Code
1. **Recherche & Catalogue** : `src/app/(public)/biens/page.tsx:1-532`
   - Filtres disponibles : Type de bien, Type de transaction (vente/location), Ville, Quartier, Fourchette de prix (min/max), Surface min.
   - Composant `BiensSearchBar` avec autocomplétion.
   - Carte interactive Leaflet (chargée dynamiquement côté client).
   - Pagination par tranches de 12 annonces.
2. **Fiche descriptive du bien** : `src/app/(public)/biens/[slug]/page.tsx:1-118` et `BienDetailClient.tsx`
   - Galerie photos, fiche technique, géolocalisation, simulateur d'acompte légal de 10%.
   - Bouton de mise en favoris (déclenche `/api/favoris`).
   - Bouton de contact WhatsApp et bouton d'appel téléphonique.
   - Bouton de demande de visite avec sélection de date et créneau horaire.
3. **Prise de Rendez-vous / Visite** : `src/app/actions/visites.ts`
   - Enregistrement de la visite dans la table `visites`.
   - Attribution à un agent commercial interne ou rattachement au bien.
4. **Réservation & Acompte** : `src/app/actions/reservation.ts` et `src/lib/paystack/client.ts`
   - Création de la réservation avec calcul de l'acompte légal.
   - Déclenchement du paiement Paystack en Mobile Money (Wave, Orange, MTN) ou Carte.

### 4.2 Problèmes & Écarts Marketplace Identifiés
- 🔀 **Système d'acompte centralisé vers un compte unique** : Aujourd'hui, l'acompte Paystack est crédité sur le compte bancaire de la société cliente unique. Sur une marketplace, une réservation avec acompte nécessite soit un modèle de séquestre (escrow), soit une simple mise en relation avec dépôt de dossier préalable, car la plateforme ne peut pas légalement encaisser les acomptes des mandants sans carte de gestion immobilière réglementée (G).
- ❌ **Absence de messagerie interne intégrée** : Il n'existe pas de chat ou messagerie privée entre l'acheteur/locataire et l'agence/propriétaire. Tout bascule immédiatement sur WhatsApp ou téléphone en clair.
- ❌ **Absence de recherches sauvegardées et d'alertes e-mail/push** : Si un bien correspondant aux critères de l'acheteur n'est pas disponible aujourd'hui, il ne peut pas enregistrer sa recherche (« Villa 4 pièces à Bingerville < 60M FCFA ») pour être notifié des nouveaux dépôts.
- ❌ **Dossier locataire non transmissible** : L'espace client permet d'uploader une CNI (`/client/kyc`), mais il n'existe pas de « Dossier Candidat » (bulletins de salaire, attestation d'emploi, quittance de loyer précédente) transmissible à l'agence d'un simple clic pour candidater sur un logement.

