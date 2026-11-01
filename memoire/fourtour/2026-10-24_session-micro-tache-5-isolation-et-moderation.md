# Session du 24/10/2026 : Micro-tâche 5 — Isolation des Données & Flux de Modération

## Contexte
Mise en place de l'isolation stricte des annonces immobilières par propriétaire et filtrage de la vitrine publique par modération.

## Actions Réalisées
1. **Nettoyage du badge demandé (`src/app/(public)/biens/publier/page.tsx`)** :
   - Suppression du badge "Espace Bailleurs, Propriétaires & Agences" conformément à la consigne de l'utilisateur.
2. **Isolation des Server Actions de gestion des biens (`src/app/actions/adminBiens.ts`)** :
   - `createBienAction` : vérifie `assertCan('bien:create')`, assigne `ownerId = user.id`. Si administrateur : `statutModeration = 'valide'`, si tiers : `statutModeration = 'en_attente'` et redirection vers son `/dashboard/bailleur`.
   - `updateBienAction` : vérifie `assertCan('bien:edit', { ownerId: existingBien.ownerId })`. Un tiers ne peut ni modifier ni détourner les biens d'autrui.
   - `deleteBienAction` : vérifie `assertCan('bien:delete', { ownerId: existingBien.ownerId })`.
   - `modererBienAction` : action réservée à l'administration (`assertCan('bien:moderate')`) pour approuver ou rejeter une annonce avec motif.
3. **Sécurisation du catalogue public et de la recherche géolocalisée** :
   - `src/app/actions/publicBiens.ts` : condition `eq(biens.statutModeration, 'valide')`.
   - `src/app/actions/nearbyBiens.ts` : condition `eq(biens.statutModeration, 'valide')`.
   - Les annonces en attente ou rejetées ne sont jamais exposées sur la vitrine publique.
4. **Vérification** :
   - `npx tsc --noEmit` validé avec succès (code 0).
