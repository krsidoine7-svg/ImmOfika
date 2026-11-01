# Session du 24/10/2026 : Micro-tâche 4 — Page de Connexion Unifiée & Redirection par Rôle

## Contexte
Mise en place d'une expérience de connexion unique, sécurisée contre les attaques de force brute et aiguillant automatiquement chaque acteur vers son tableau de bord spécifique.

## Actions Réalisées
1. **Refonte de la page de connexion (`src/app/(public)/auth/login/page.tsx`)** :
   - Ajout d'une protection anti-force brute (rate limiting client avec verrouillage temporaire de 60 secondes après 5 tentatives infructueuses et compte à rebours interactif).
   - Validation stricte anti-Open Redirect sur `callbackUrl` et `next`.
   - Redirection automatique selon le rôle de l'utilisateur après authentification :
     * `suspended` -> `/suspended`
     * `admin` / `agent` -> `/admin`
     * `proprietaire` / `agence` / `promoteur` -> `/dashboard/bailleur`
     * `client` -> `/client/dashboard` ou URL interne demandée.
   - Enveloppement dans un `<Suspense>` pour garantir la fluidité SSR Next.js.
2. **Création du pont de routage `/login` (`src/app/login/page.tsx`)** :
   - Permet d'accéder directement via `/login` tout en conservant les paramètres de redirection d'origine.
3. **Création du tableau de bord bailleur (`src/app/dashboard/bailleur/page.tsx`)** :
   - Réservé aux propriétaires, agences et promoteurs (`assertCan('bien:create')`).
   - Vue d'ensemble des statistiques : Total biens, Biens validés/en ligne, Biens en modération, Total vues.
   - Liste des biens avec badges de statut (`Valide`, `En modération`, `Rejeté` avec motif d'invalidation affiché).
   - Bouton de dépôt de nouvelle annonce.
4. **Création du pont `/dashboard/client` (`src/app/dashboard/client/page.tsx`)** :
   - Redirige en toute transparence vers `/client/dashboard`.
5. **Vérification** :
   - `npx tsc --noEmit` validé avec succès (code 0).
