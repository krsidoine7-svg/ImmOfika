# Log Session — Mise en place Sitemap & Robots.txt SEO
Date : 01/11/2026
Contexte : Demande utilisateur relative à la présence et mise en place de sitemap.txt / sitemap.xml.

## Actions Réalisées
1. Création de `src/app/sitemap.ts` : génération automatique du standard XML `/sitemap.xml` avec revalidation horaire, incluant pages publiques et annonces immobilières dynamiques `/biens/[slug]`.
2. Création de `src/app/robots.ts` : génération de `/robots.txt` orientant Googlebot vers le sitemap et bloquant l'indexation des espaces privés (`/admin/`, `/client/`, `/api/`).
3. Création de `public/sitemap.txt` pour compatibilité legacy.
4. Validation par tests unitaires Vitest : 67/67 au vert.

