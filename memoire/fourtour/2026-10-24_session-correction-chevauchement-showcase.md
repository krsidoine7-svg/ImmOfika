# Session du 24/10/2026 : Élimination définitive de la superposition de badges dans MarketplaceShowcaseSection

## Contexte
La section vitrine principale de la page d'accueil (`MarketplaceShowcaseSection.tsx`) affichait elle aussi un conteneur absolu en dur (`top-3 left-3 z-20`) pour les biens géolocalisés de l'onglet "Près de vous", causant la superposition visible sur les cartes ("Abobo PK", "Cocody Deux-Plateaux", "Résidentielle Daloa").

## Actions Réalisées
1. **Suppression de la superposition dans `src/components/public/MarketplaceShowcaseSection.tsx`** :
   - Suppression du bloc `div className="absolute top-3 left-3 z-20"`.
   - Transmission directe du texte de localisation via la prop `locationBadge` du composant `MarketplacePropertyCard`.
   - Les badges `[À Vendre / À Louer]` et `[📍 Commune / Distance]` sont désormais alignés proprement côte à côte à l'intérieur de la carte.
2. **Vérification** :
   - `npx tsc --noEmit` validé avec succès (code 0).
