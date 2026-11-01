# Session du 24/10/2026 : Micro-tâche 3 — Système de Permissions Centralisé

## Contexte
Mise en place d'un point d'accès unique pour les droits et habilitations de tous les acteurs de la plateforme ImmOfika, supprimant la dispersion des contrôles de sécurité.

## Actions Réalisées
1. **Refonte et enrichissement de `src/lib/auth/permissions.ts`** :
   - Introduction de l'interface `AuthUserContext` et de la liste typée `PermissionAction`.
   - Création de la fonction pure `can(user, action, resource)` qui arbitre tous les droits :
     * `super_admin` : Accès universel + seul habilité à `users:manage_roles`.
     * `admin` : Pouvoir d'administration opérationnel complet (sauf nommer d'autres super_admins).
     * `agent` : Habilité sur les visites, KYC et son portefeuille.
     * `proprietaire` / `agence` / `promoteur` : Habilités à créer des annonces et à modifier/supprimer **exclusivement** leurs propres biens (`resource.ownerId === user.id`).
     * `client` : Habilité à réserver, payer et voir ses propres réservations (`resource.clientId === user.id`).
     * `suspended` : Aucun droit.
   - Ajout du helper serveur `assertCan(action, resource)` redirigeant vers `/unauthorized` si accès refusé.
   - Mise à niveau des fonctions legacy (`requireAdminAccess`, etc.) pour rediriger proprement vers `/unauthorized` au lieu d'un simple renvoi sur le login.
2. **Vérification** :
   - `npx tsc --noEmit` validé avec succès (code 0).
