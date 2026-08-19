# Manifeste des Compétences IA — Favor Company International

Ce manifeste répertorie toutes les compétences (skills) spécialisées configurées dans ce projet. Ces skills étendent les capacités de l'intelligence artificielle pour concevoir, développer, auditer et optimiser l'écosystème Favor Company.

---

## 🗺️ Index des Compétences

Le skill maître **`chefs-favor`** supervise et orchestre l'ensemble des compétences ci-dessous en fonction des besoins du cycle de développement :

| Nom du Skill | Dossier source | Type | Usage principal |
|---|---|---|---|
| **`chefs-favor`** | `.skills/chefsFavor` | **Maître / Orchestrateur** | Chef de projet senior, pilotage de la stack, des agents et de la roadmap. |
| **`memoire-favor`** | `memoire-favor/` | **Mémoire / Persistance** | Journal brut (fourtour/) + wiki structuré entre sessions. Masquage automatique des données sensibles. |
| **`immo-ci`** | `.skills/immo-ci` | **Métier / Réglementaire** | Documents et contrats immobiliers en Côte d'Ivoire (OHADA, TVA 18%, FCFA). |
| **`copywriting`** | `.skills/copywriting` | **Marketing / Contenu** | Rédaction publicitaire, structuration de pages et optimisation de la conversion. |
| **`react-email`** | `.skills/react-email` | **Technique / Communication** | Conception de gabarits d'emails HTML en React (Resend, contraintes clients). |
| **`seo-audit`** | `.skills/seo-audit` | **Technique / Marketing** | Audit et diagnostics techniques et on-page pour le référencement naturel. |
| **`supabase`** | `.skills/supabase` | **Technique / Sécurité** | Gestion de la base de données, RLS, Auth, Storage, CLI et migrations. |
| **`supabase-postgres-best-practices`** | `.skills/supabase-postgres-best-practices` | **Technique / Performance** | Optimisation des requêtes SQL et indexation avancée Postgres. |
| **`securite-favor`** | `.skills/securite-favor` | **Technique / Sécurité** | Audits de sécurité, modélisation de menaces, protocoles PoC, revues CVE récentes (<2 semaines), conformité RGPD & ARTCI (Vie Privée). |
| **`skill-mermaid-h`** | `.skills/skill-mermaid-h` | **Technique / Visualisation** | Conception, validation, stylisation et export de diagrammes techniques Mermaid (20+ types). |
| **`run-load-test`** | `.skills/run-load-test` | **Technique / Performance** | Tests de charge, de performance, de stress et d'endurance avec Locust. |
| **`run-automated-tests`** | `tests/` + configs racine | **Technique / QA** | Tests unitaires (Vitest), E2E (Playwright), accessibilité (Axe-core). |
| **`skill-flow`** | `.skills/skillFlow` | **Ingénierie / Flux** | Cartographie de flux utilisateurs (Markdown + Mermaid + Word .docx), procédures d'onboarding, investisseurs & clients. |
| **`skill-markitdown-master`** | `.skills/skill-markitdown-master` | **Technique / Structuration** | Conversion universelle de fichiers (Word, PDF, Excel) en Markdown pur, OCR Gemini, balisage sémantique et génération de quiz/datasets. |
| **`skill-creator`** | `.skills/skills-main/skills/skill-creator` | **Méta-Skill** | Création, test, benchmarking et packaging des skills. |
| **`skills-main (Library)`** | `.skills/skills-main` | **Bibliothèque Utilitaires** | Pack complet de compétences de génération de fichiers (Word, Excel, PDF, PowerPoint), tests, configuration MCP, et design. |

---

## 🔍 Profils Détaillés des Compétences

### 1. chefs-favor (Chef de Projet Maître)
*   **Localisation** : [chefsFavor](./chefsFavor)
*   **Gabarit d'exécution** : [chefsFavor.skill](./chefsFavor.skill)
*   **Déclencheurs** : Features, roadmap, priorités, questions d'architecture, revues de code, "que faire ensuite ?".
*   **Description** : Transforme l'IA en un Directeur Technique / Chef de Projet Senior. Il détient la connaissance de la stack (Next.js 15, Supabase, Drizzle, Paystack), du système RBAC, et distribue les briefs aux agents spécialisés (`architecte`, `dev-backend`, `dev-frontend`, `securite`, `qa`, etc.).

---

### 1.b. memoire-favor (Mémoire Externe Persistante)
*   **Localisation** : [memoire-favor](../memoire-favor)
*   **Déclencheurs** : Début/fin de session, "enregistre", "mémorise", "note ça", "résume la session", "qu'est-ce qu'on a fait ?", "reprends où on en était".
*   **Description** : Gère la mémoire persistante du projet entre les sessions. Deux dossiers :
    *   `fourtour/` → Journal brut immuable et chronologique (TOUT y est enregistré, avec horodatage).
    *   `wiki/` → Mémoire organisée et navigable (décisions, erreurs, bonnes pratiques, roadmap, stack).
*   **Règle critique** : Toutes les données sensibles (noms, téléphones, clés API, tokens, mots de passe, CNI) sont **automatiquement masquées** avec des placeholders `{{...}}` avant tout enregistrement.

---

### 2. immo-ci (Documents Immobiliers Côte d'Ivoire)
*   **Localisation** : [immo-ci](./immo-ci)
*   **Gabarit d'exécution** : [immo-ci.skill](./immo-ci.skill)
*   **Déclencheurs** : Contrats de location, promesses de vente, reçus d'acompte, quittances de loyer, factures immobilières, mentions Abidjan, Côte d'Ivoire, FCFA, droit OHADA.
*   **Description** : Assure la conformité légale et fiscale de tous les documents émis par Favor Company pour le marché ivoirien. Il applique automatiquement la TVA CI (18%), le formatage de devise FCFA (XOF), la numérotation séquentielle stricte et les clauses d'arbitrage locales.

---

### 3. copywriting (Conversion Marketing)
*   **Localisation** : [copywriting](./copywriting)
*   **Déclencheurs** : Headlines marketing, Hero section, CTAs de formulaires, textes de pages de vente, propositions de valeur, storytelling de fondateur.
*   **Description** : Rédige des textes conçus pour la clarté et la conversion (Landing Pages, Pricing, Tarifs). Il évite le jargon d'entreprise ("streamline", "optimize"), met l'accent sur les bénéfices concrets plutôt que sur les fonctionnalités, et structure des objections d'achat structurées.

---

### 4. react-email (Intégration d'Emails Transactionnels)
*   **Localisation** : [react-email](./react-email)
*   **Déclencheurs** : Emails de bienvenue, réinitialisation de mot de passe, reçus de paiements, notifications de réservations.
*   **Description** : Fournit le cadre et les composants React pour concevoir des e-mails HTML robustes et compatibles avec tous les clients de messagerie (Outlook, Gmail, Apple Mail). Enforce l'absence de flexbox/grid, l'utilisation de `box-border` pour les boutons, de tables pour la structure, et d'images hébergées sur CDN avec des liens absolus.

---

### 5. seo-audit (Référencement Naturel & Audit Technique)
*   **Localisation** : [seo-audit](./seo-audit)
*   **Déclencheurs** : Audit SEO, meta tags, robots.txt, sitemaps XML, structures de titres, canonisation, Core Web Vitals, temps de chargement.
*   **Description** : Diagnostique la santé SEO du site. Établit des plans d'action ordonnés de la crawlabilité à la qualité sémantique. Contient des alertes de détection pour les structures JSON-LD injectées en JS qui peuvent être ignorées par des outils de fetch statique.

---

### 6. supabase (Administration de Base de Données & RLS)
*   **Localisation** : [supabase](./supabase)
*   **Déclencheurs** : Tables, triggers, politiques de sécurité RLS, Auth JWT, stockage de fichiers (Storage), CLI Supabase, scripts de migration Drizzle.
*   **Description** : Pilote la couche de données et d'infrastructure Supabase. Il assure que les politiques RLS protègent chaque ligne, interdit l'utilisation de `user_metadata` éditable par le client pour l'auth, et fournit les syntaxes CLI nécessaires.

---

### 7. supabase-postgres-best-practices (Performance SQL)
*   **Localisation** : [supabase-postgres-best-practices](./supabase-postgres-best-practices)
*   **Déclencheurs** : Optimisation de requêtes, explain plans, indexes partiels, verrous, jointures SQL lentes.
*   **Description** : Recueil de règles de performance avancées pour PostgreSQL maintenu par Supabase. Il guide la conception d'indexes optimisés et l'écriture de SQL rapide pour éviter les goulots d'étranglement de production.

---

### 7.b. securite-favor (Audit de Sécurité & Validation PoC & Revue CVE / RGPD)
*   **Localisation** : [securite-favor](./securite-favor)
*   **Déclencheurs** : Failles de sécurité, audits de code, injections XSS, isolation RBAC, permissions et rôles, scripts de tests et PoC de sécurité, bases de vulnérabilités mondiales, conformité RGPD / ARTCI (Vie Privée), revue des CVE de moins de 2 semaines, scripts d'audits automatiques.
*   **Description** : Ce skill centralise les meilleures pratiques de développement sécurisé (échappement HTML contre XSS, validation Zod des inputs, double garde RBAC serveur/client) et de respect de la vie privée (soft-delete, anonymisation, data masking `{{...}}`). Il fournit des protocoles précis de validation par Proof of Concept (PoC) et intègre la méthodologie d'audit hebdomadaire des CVE de moins de 14 jours affectant le projet, avec une cartographie complète des portails d'organismes internationaux et nationaux (ISO, NIST, OWASP, GDPR Info, CNIL, ARTCI Côte d'Ivoire, CEDEAO Act).

---

### 7.c. skill-mermaid-h (Visualisation Mermaid & Conception Graphique)
*   **Localisation** : [skill-mermaid-h](./skill-mermaid-h)
*   **Gabarit d'exécution** : [skill-mermaid-h.skill](./skill-mermaid-h.skill)
*   **Déclencheurs** : Diagrammes, schémas, architecture, flux, modélisation, ERD, séquence, C4, mermaid, visualiser un système, documenter une API, export SVG/ASCII.
*   **Description** : Skill ultime Mermaid pour concevoir, valider, styliser et exporter des diagrammes techniques (flowchart, séquence, ERD, C4, états, Gantt, 20+ types). Fusionne les meilleures méthodes pour garantir des diagrammes conformes et esthétiques, intégrés à l'orchestration des agents.

---

### 7.d. run-load-test (Tests de Charge & Performance Locust)
*   **Localisation** : [run-load-test](./run-load-test)
*   **Déclencheurs** : Tests de charge, tests de performance, tests de stress, tests d'endurance, tests de pic, Locust, point de rupture, RPS, latence.
*   **Description** : Fournit les scénarios types et la méthodologie pour réaliser des campagnes de tests de performance automatisées et robustes sur les pages web et les APIs du projet. Permet de générer des dashboards et d'analyser le comportement de la base de données et des endpoints.

---

### 7.e. run-automated-tests (Tests Unitaires, E2E & Accessibilité)
*   **Localisation** : `tests/` (scénarios), `vitest.config.ts` et `playwright.config.ts` (configurations)
*   **Déclencheurs** : Tests unitaires, tests d'intégration, tests E2E, tests end-to-end, accessibilité, WCAG, a11y, Vitest, Playwright, Axe-core, couverture de code.
*   **Description** : Fournit l'infrastructure complète de tests automatisés du projet :
    *   **Vitest** (`npm run test`) : Tests unitaires et d'intégration des Server Actions (newsletter, disponibilités/iCal). Mock de la couche DB Drizzle.
    *   **Playwright** (`npm run test:e2e`) : Tests de bout en bout sur le catalogue de biens, l'authentification et la navigation.
    *   **Axe-core** : Audits d'accessibilité WCAG 2.0 AA automatisés sur les pages publiques critiques.

---

### 7.f. skill-markitdown-master (Expert MarkItDown & Structuration de Données LLM)
*   **Localisation** : [skill-markitdown-master](./skill-markitdown-master)
*   **Déclencheurs** : Conversion universelle de documents (Word, PDF, Excel, PowerPoint), extraction OCR de textes/images via Gemini, balisage sémantique (`[IMPORTANT: Concept Clé]`, `[SCÉNARIO]`, `[EXEMPLE]`), injection de métadonnées YAML Frontmatter, préparation de datasets d'entraînement IA et de quiz.
*   **Description** : Transforme n'importe quel fichier source (Word, PDF, Excel) en Markdown pur prêt pour les LLMs. Permet l'ingestion massive, la qualification sémantique et la conversion vers les skills métiers (`immo-ci`, `copywriting`, `securite-favor`).

---

### 8. skill-creator (Méta-outils de gestion)
*   **Localisation** : [skill-creator](./skills-main/skills/skill-creator)
*   **Déclencheurs** : "Créer un skill", "modifier un skill", "compiler", "packager".
*   **Description** : Méta-skill permettant de faire évoluer le système de compétences lui-même. Il contient les scripts de validation (`quick_validate.py`) et d'empaquetage (`package_skill.py`) pour générer les fichiers compilés `.skill`.

---

### 9. Bibliothèque de Skills Utilitaires (skills-main)
*   **Localisation** : [skills-main](./skills-main)
*   **Déclencheurs** : Génération ou formatage de fichiers Word/Excel/PDF/PPTX, configuration de serveurs MCP, design frontend, tests d'app web.
*   **Description** : Regroupe un large éventail d'utilitaires pour supporter le développement technique :
    *   **docx** : Génération et manipulation de documents Microsoft Word `.docx`.
    *   **xlsx** : Création et édition de feuilles de calcul Excel `.xlsx` professionnelles.
    *   **pptx** : Création de présentations PowerPoint `.pptx` avec un design premium.
    *   **pdf** : Exportation et génération uniforme de documents au format PDF.
    *   **mcp-builder** : Conception et configuration de serveurs Model Context Protocol.
    *   **webapp-testing** : Tests d'intégration et de bout en bout de l'application.
    *   **frontend-design** / **theme-factory** : Sélection de palettes de couleurs, de polices de caractères et esthétique.
    *   **web-artifacts-builder** / **canvas-design** : Maquettage, design interactif visuel et prototypage d'artéfacts.
    *   **Autres** : Co-rédaction, GIFs animés pour Slack, art algorithmique, et manipulation avancée des agents avec l'API Claude (`claude-api`).

---idation (`quick_validate.py`) et d'empaquetage (`package_skill.py`) pour générer les fichiers compilés `.skill`.

---

## 🔄 Flux d'Intégration d'un Skill

Pour créer ou modifier une compétence dans ce manifeste :

```
             ┌──────────────────────────────┐
             │ 1. Écrire / Éditer SKILL.md  │
             └──────────────┬───────────────┘
                            │
                            ▼
             ┌──────────────────────────────┐
             │  2. Valider le kebab-case    │
             └──────────────┬───────────────┘
                            │
                            ▼
 ┌──────────────────────────────────────────────────────┐
 │ 3. Compiler la compétence avec :                      │
 │ python -m scripts.package_skill <dossier> <output>   │
 └──────────────────────────┬───────────────────────────┘
                            │
                            ▼
             ┌──────────────────────────────┐
             │  4. Enregistrer l'artifact   │
             │   dans le fichier MANIFESTE  │
             └──────────────────────────────┘
```

Ce manifeste doit être mis à jour à chaque fois qu'une nouvelle compétence est ajoutée ou modifiée dans le projet.
