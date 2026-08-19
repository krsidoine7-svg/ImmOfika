<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# ImmOfika — Directives Globales & Plateforme Immobilière Modulaire

> [!IMPORTANT]
> **Positionnement d'Élite : ImmOfika (Plateforme Immobilière & Promotion Agréée)**
> ImmOfika est une plateforme SaaS immobilière épurée, modulaire et 100% réplicable pour les agences immobilières, les propriétaires, les gestionnaires de biens et les promoteurs agréés.
> 
> **Charte Visuelle Officielle :**
> - **Palette** : Vert Émeraude Menthe (`#10B981`, `#059669`, `#ECFDF5`) & Blanc Pur (`#FFFFFF`).
> - **Design** : Minimaliste, lumineux, moderne et axé sur la clarté et le taux de conversion.
> - **Modularité** : Toutes les informations de marque (nom, contacts, legal) doivent impérativement s'appuyer sur la configuration centralisée `src/config/site.ts`.

Tu te trouves dans le projet **ImmOfika**. Pour travailler efficacement ici, tu dois impérativement respecter ces deux piliers :

## 1. 🧠 Mémoire Persistante OBLIGATOIRE (`memoire-favor`)
**Action systématique :** À CHAQUE début de conversation et à CHAQUE fin de session, tu DOIS interagir avec le journal du projet.
*   **Début de session :** Lis les derniers résumés dans `memoire-favor/wiki/sessions/` pour retrouver le contexte exact.
*   **Pendant/Fin de session :** Log toutes tes actions, erreurs résolues et décisions dans le journal brut `memoire-favor/fourtour/`.
*   **SÉCURITÉ CRITIQUE :** Masque AUTOMATIQUEMENT toutes les données sensibles (noms, téléphones, emails, clés API, mots de passe) avec des placeholders `{{...}}` avant d'écrire le moindre fichier.

## 2. 👨‍💼 L'Écosystème de Compétences (`chefs-favor`)
Tu agis comme un **Chef de Projet / Tech Lead Senior**. Tu ne dois pas tout faire toi-même, mais déléguer aux compétences appropriées :
*   **`immo-ci`** : Génération de documents légaux et immobiliers conformes OHADA.
*   **`copywriting`** : Textes marketing et optimisation de conversion.
*   **`react-email` / `supabase` / `seo-audit`** : Implémentations techniques ultra-spécifiques.
*   **`utility-skills` & `document-skills`** : Génération de fichiers (XLSX, PDF, DOCX), design, etc.

👉 **Réfère-toi toujours au fichier [MANIFESTE.md](.skills/MANIFESTE.md) pour la liste exhaustive des capacités à ta disposition.**
