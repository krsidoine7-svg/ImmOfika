# Journal de session — Refonte Visuelle & Rebranding Immo Pro

Date : 18 Août 2026

## Actions Réalisées :
1. **Rebranding Global de la Marque** :
   - Transition de "Favor Company International" vers **Immo Pro**.
   - Création du module central `src/config/site.ts` pour gérer le nom, le slogan, les emails et les mentions légales de façon 100% réplicable et modulaire pour le modèle SaaS multi-agences / multi-promoteurs.

2. **Nouvelle Charte Graphique Vert Émeraude Menthe & Blanc** :
   - Refonte complète des jetons CSS de `src/app/globals.css` : `--primary: #10B981`, `--accent: #ECFDF5`, fond crisp white `#FFFFFF`, texte dark slate `#0F172A`.
   - Création du composant Logo vectoriel `src/components/shared/Logo.tsx`.

3. **Page d'Accueil Épurée & Minimaliste** :
   - `Navbar.tsx` : Intégration du logo Immo Pro, boutons émeraude et navigation épurée.
   - `HeroSection.tsx` : Titres épurés, visuel moderne, points forts et recherche rapide intégrée.
   - `FloatingSearchBar.tsx` : Filtres aux couleurs Vert Émeraude et Blanc.
   - `BiensSection.tsx` : Cartes de biens épurées avec badges émeraude et prix lisibles.
   - `ServicesSection.tsx` : 3 modules réplicables (Vente, Location, Promotion Immobilière).
   - `CtaSection.tsx` & `Footer.tsx` : Bannières de capture de leads et pied de page réplicable basé sur `siteConfig`.

4. **Documents & Notifications** :
   - Actualisation des métadonnées SEO dans `src/app/layout.tsx`.
   - Remplacement de la raison sociale dans `genererRecuPdf.tsx`, `FacturePDF.tsx`, `FactureEmail.tsx`, `ContratEmail.tsx` et `service.ts`.
   - Mise à jour des directives IA dans `AGENTS.md`.
