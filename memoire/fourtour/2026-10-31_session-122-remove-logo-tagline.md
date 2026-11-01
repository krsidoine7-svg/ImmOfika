# Journal d'intervention : Retrait du sous-titre "Immobilier & Promotion" du Logo

- **Date** : 31/10/2026
- **Auteur** : Antigravity Tech Lead
- **Composants ciblés** :
  - `src/components/shared/Logo.tsx`
  - `src/components/app-sidebar.tsx`

## 1. Contexte & Demande
- L'utilisateur a demandé le retrait du libellé textuel secondaire "Immobilier & Promotion" situé sous le nom de marque `ImmOfika` dans le header/logo.

## 2. Modifications Appliquées
1. **`src/components/shared/Logo.tsx`** :
   - Suppression du `<span className="text-[9.5px] uppercase font-bold tracking-widest mt-0.5 ...">Immobilier & Promotion</span>`.
   - Le logo ne conserve désormais que le pictogramme officiel vectoriel (`logo-immo.svg`) et le titre textuel net `ImmOfika` (avec `fika` mis en valeur en vert émeraude).
   - Rendu épuré, minimaliste et sans encombrement visuel sur toutes les résolutions.
2. **`src/components/app-sidebar.tsx`** :
   - Mise à jour du sous-titre dans le header de l'espace administration vers "Console Admin" pour plus de sobriété.

## 3. Validation
- `npx tsc --noEmit` : 0 erreur (Code 0).
- `vitest` : 22/22 tests réussis.

