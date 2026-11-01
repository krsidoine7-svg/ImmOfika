# Session 117 — Durcissement OWASP, Middleware Global & Sécurité Applicative

**Date :** 30 Octobre 2026  
**Auteur :** Antigravity Tech Lead Senior  
**Statut :** Validé — Conforme OWASP Top 10

---

## 1. Contexte & Demande
Audit complet de cybersécurité applicative selon les standards OWASP Top 10 sur la plateforme ImmOfika, suivi de l'application immédiate par micro-tâches ordonnées avec validation pas-à-pas.

---

## 2. Actions & Réalisations Techniques

### A. Middleware de Sécurité Global (`src/middleware.ts`)
* Création du fichier officiel `src/middleware.ts` branché sur Next.js avec filtrage universel via matcher regex.
* Renforcement de `src/utils/supabase/middleware.ts` pour intercepter les accès non authentifiés sur `/admin`, `/client`, et `/dashboard`.
* Mémorisation sécurisée de l'URL cible via paramètre `callbackUrl`.

### B. Rate Limiting Serveur & Traçabilité des Connexions
* Création de la Server Action `loginWithPasswordAction` dans `src/app/actions/authActions.ts` :
  * Détection de l'IP cliente (`headers()`).
  * Rate limiting anti-force brute (5 échecs par tranche de 15 minutes par IP et email).
  * Message d'erreur neutre (« Adresse e-mail ou mot de passe incorrect. ») contre l'énumération de comptes.
  * Journalisation systématique des succès (`auth.login_success`), échecs (`auth.login_failed`) et blocages (`security.login_brute_force_blocked`).
* Refonte du formulaire de connexion `src/app/(public)/auth/login/page.tsx` pour déléguer l'authentification au serveur.

### C. Sécurisation du Téléversement des Avatars
* Mise à niveau de `updateProfileAction` dans `src/app/actions/client.ts` :
  * Validation Zod des entrées textuelles.
  * Quota strict de 2 Mo maximum.
  * Liste blanche MIME (`image/jpeg`, `image/png`, `image/webp`).
  * Analyse des signatures binaires (*magic bytes*) : JPEG (`0xFFD8FF`), PNG (`0x89504E47`), WebP (`RIFF....WEBP`).

### D. Centralisation des Rôles & Sécurité des Redirections
* Création de `src/lib/roles.ts` centralisant la typologie des rôles (`PlatformRole`), les tableaux de bord par défaut et la matrice des préfixes autorisés.
* Fonction `getSafeRedirectUrl` neutralisant les attaques par Open Redirect (`//`, `http://`, etc.) et bloquant l'accès vers les sections interdites au rôle.
* Ajout de l'alias `/compte` redirigeant vers `/client/dashboard`.

### E. Politique Renforcée des Mots de Passe à l'Inscription
* Création du schéma Zod `PasswordPolicySchema` et de la Server Action `registerUserAction` dans `src/app/actions/authActions.ts` :
  * Au moins 10 caractères, 1 majuscule, 1 minuscule, 1 chiffre, 1 caractère spécial.
  * Rate limiting anti-création de compte (max 5 créations / heure par IP).
* Refonte de `src/app/(public)/auth/register/page.tsx` avec indicateur interactif en temps réel (cases vertes dynamiques).

### F. Isolation du Cache & Traçabilité des Accès Refusés
* Ajout des en-têtes HTTP `Cache-Control: no-store, no-cache, must-revalidate` sur les routes privées dans `next.config.ts`.
* Déclaration `export const dynamic = 'force-dynamic'` sur les layouts et pages d'espaces privés.
* Traçabilité automatique des tentatives d'accès non autorisées (`access.denied`) dans `src/lib/auth/permissions.ts`.

---

## 3. Données & Identifiants Protégés (Sécurité)
Tous les comptes officiels et accès d'exploitation ont été vérifiés sans exposer de secrets :
* Comptes staff : `{{ADMIN_GENERAL_EMAIL}}`, `{{ADMIN_JURIDIQUE_EMAIL}}`
* Clés d'API et secrets d'environnement protégés : `{{SUPABASE_SERVICE_ROLE_KEY}}`, `{{PAYSTACK_SECRET_KEY}}`, `{{PAYSTACK_WEBHOOK_SECRET}}`, `{{R2_SECRET_ACCESS_KEY}}`, `{{RESEND_API_KEY}}`

---

## 4. Documentation & Recette
* `docs/GUIDE-UTILISATEUR-ADMIN.md` mis à jour (section 6.4 Sécurisation Avancée OWASP).
* `docs/CAHIER-DE-RECETTE.md` mis à jour (tests T-27 à T-31 ajoutés, total porté à 31 tests, couverture 100%).

