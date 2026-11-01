# Journal d'intervention : Correction du positionnement et scroll de la Navbar Espace Client

- **Date** : 31/10/2026
- **Auteur** : Antigravity Tech Lead
- **Composants ciblés** :
  - `src/app/(client)/client/layout.tsx`
  - `src/components/client/ClientHeader.tsx`
  - `src/components/client/ClientSidebar.tsx`

## 1. Contexte & Problème Détecté
- **Symptôme** : L'utilisateur a signalé que dans l'espace client (`/client/dashboard`), la barre de navigation supérieure ("navbar") défilait avec le contenu au lieu de rester fixe / statique en haut de l'écran lors du défilement des cartes et données de la page.
- **Causes racines identifiées** :
  1. `src/app/(client)/client/layout.tsx` appliquait `overflow-x-hidden` sur le conteneur flex parent de `<ClientHeader>`. En CSS standard, `overflow-x: hidden` sur un ancêtre annule le comportement `position: sticky; top: 0` par rapport au viewport global (`window`), provoquant l'échappement de la navbar vers le haut lors du scroll.
  2. Structure applicative non isolée : Le scroll s'effectuait sur toute la page sans conteneur de défilement dédié (`overflow-y-auto`), contrairement à l'Espace Administration qui isole le header (`shrink-0`) et défile dans un conteneur principal dédié.
  3. Redondance mobile : Sur écran mobile, `<ClientSidebar>` affichait une barre fixe en `top-0` (logo + bouton burger) tandis que `<ClientHeader>` s'affichait en dessous (cloche + profil), créant deux en-têtes superposés occupant ~140px d'écran vertical avec des chevauchements désagréables.

## 2. Solutions Appliquées
1. **Layout client unifié (`src/app/(client)/client/layout.tsx`)** :
   - Structure flex en pleine hauteur `h-screen overflow-hidden` au niveau racine.
   - Sidebar gauche desktop fixe (`shrink-0 w-72 h-screen`).
   - Colonne principale `flex-1 flex flex-col min-w-0 h-screen overflow-hidden`.
   - `<ClientHeader>` placé au sommet de la colonne principale avec `shrink-0` : la navbar est désormais physiquement isolée du conteneur de défilement et reste **100% immobile et fixée en haut** sans aucun risque de décalage.
   - Conteneur de contenu `{children}` enveloppé dans `<div className="flex-1 overflow-y-auto min-w-0">` : seul le contenu intérieur défile de manière fluide sous la navbar.
2. **Harmonisation Desktop & Mobile (`src/components/client/ClientHeader.tsx`)** :
   - Sur Desktop : Barre de recherche intégrée, cloche de notifications et dropdown profil avec statut "Client Privé".
   - Sur Mobile : Intégration directe du bouton Menu (qui ouvre la `Sheet` latérale avec les liens du client) et du logo ImmOfika dans une **unique navbar responsive** de 64px (`h-16`).
   - Suppression du décalage artificiel `pt-16 lg:pt-0` et fin de la double barre mobile superposée.
3. **Nettoyage de `ClientSidebar.tsx`** :
   - Exportation propre de `SidebarContent` et `menuItems`.
   - L'aside est dédié au mode desktop (`hidden lg:block`), évitant tout conflit avec le header mobile.

## 3. Validation & Tests
- **Compilation TypeScript (`npx tsc --noEmit`)** : 0 erreur (Code sortie 0).
- **Tests unitaires RBAC & Server Actions** : 22/22 validés avec succès (`vitest`).
- **Comportement visuel** : Navbar fixée en continu au sommet de l'écran, aucun défilement de l'en-tête, scroll fluide et indépendant du contenu principal.

