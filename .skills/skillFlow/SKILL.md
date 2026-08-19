---
name: skill-flow
description: >
  Skill d'ingénierie et de cartographie de flux utilisateurs (Flow Cartography & Procedure Engineering)
  pour Favor Company International. Utilise ce skill lorsque l'utilisateur demande de créer, documenter,
  analyser ou mettre à jour un flux utilisateur, un onboarding, une procédure de paiement, une modération
  KYC, une soumission de bien, une attribution de lead ou un processus métier complet. Ce skill analyse le
  codebase (UI, Server Actions, tables DB Supabase/Drizzle, notifications), applique les directives Karpathy,
  orchestre l'intégralité des 30 compétences du projet selon la méthode des 5 W (Who, What, When, Where, Why),
  génère les fiches de procédures en Markdown (.md) avec diagrammes Mermaid interactifs dans 'FavorCompany_Flux/',
  et convertit chaque procédure en document Word (.docx) certifié pour investisseurs et clients.
---

# skill-flow — Ingénierie & Cartographie des Flux Utilisateurs
## Favor Company International — Promoteur Immobilier Agréé

> [!IMPORTANT]
> **Positionnement Officiel : Promoteur Immobilier Agréé**
> Favor Company International est un **Promoteur Immobilier AGRÉÉ** par l'État pour l'aménagement foncier et la construction d'exception. Tous les flux documentés et toutes les procédures générées doivent obligatoirement refléter cette conformité légale et ce niveau d'excellence de classe mondiale.

---

## 1. Principes Fondateurs & Règles de Conception

Le skill `skill-flow` a été conçu en s'appuyant sur 4 piliers méthodologiques stricts :

1. **Le Skill Maître `chefs-favor`** : Respect de la gouvernance CTO, du positionnement d'Élite (Promoteur Immobilier Agréé) et de la séparation stricte des rôles RBAC (`client`, `agent`, `admin`, `super_admin`).
2. **Le Méta-Skill `skill-creator`** : Structuration canonique du dossier (`SKILL.md`, `scripts/md_to_docx.py`, `resources/template_procedure.md`).
3. **Les Directives `karpathy-guidelines`** :
   - *Think Before Coding* : Expliciter toutes les hypothèses, conditions d'échec et rôles RBAC avant de fixer un flux.
   - *Simplicity First* : Diagrammes et procédures lisibles immédiatement en 30 secondes par un investisseur ou un client.
   - *Surgical Changes* : Impact ciblé sur les composants UI, Server Actions et tables DB sans effets secondaires.
   - *Goal-Driven Execution* : Critères de succès vérifiables étape par étape.
4. **La Méthodologie des 5 W (Who, What, When, Where, Why & How)** :
   Chaque sous-skill du projet est activé selon une règle de déclenchement précise (Qui, Quoi, Quand, Où, Pourquoi et Comment).

---

## 2. Matrice d'Activation des 30 Skills du Projet (Méthode des 5 W)

Lors de l'analyse, de la création ou de la mise à jour d'un flux, `skill-flow` orchestre **l'intégralité des 30 compétences du projet** selon la matrice ci-dessous :

| Skill du Projet | WHO (Qui l'active) | WHAT (Quoi / Action) | WHEN (Quand) | WHERE (Où dans le flux) | WHY (Pourquoi) | HOW (Comment l'invoquer) |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **`chefs-favor`** | `skill-flow` | Arbitrage CTO | Début du flux | Cadrage global | Garantir la gouvernance & le statut Promoteur Agréé | Consultation des directives de la roadmap |
| **`supabase`** | `skill-flow` | Audit Schema DB | Étape 1 & 2 | Server Actions & Mutations | Valider les tables, RLS et triggers | Inspection de `src/lib/db/schema.ts` |
| **`supabase-postgres-best-practices`** | `skill-flow` | Optimisation SQL | Post-analyse | Index & Requêtes SQL | Éviter les goulots d'étranglement DB | Audit des requêtes Drizzle & index |
| **`skill-mermaid-h`** | `skill-flow` | Génération Diagramme | Étape 2 | Section 3 (.md) | Visualiser les arbres de décision (if/else) | Construction du code `graph TD` |
| **`immo-ci`** | `skill-flow` | Conformité Légale | Étape 1 & 3 | Contrats & Lots | Garantir la conformité OHADA, ACD, TVA 18% | Vérification des termes fonciers ivoiriens |
| **`securite-favor`** | `skill-flow` | Audit Sécurité RBAC | Étape 1 | Accès API & Actions | Sécuriser la confidentialité & norme ARTCI | Vérification des contrôles de rôles (`user.role`) |
| **`react-email`** | `skill-flow` | Traçabilité Emails | Étape 4 | Confirmations / Rejets | Tracer l'envoi des notifications Resend | Inspection des composants `emails/` |
| **`run-automated-tests`** | `skill-flow` | Scénario E2E | Post-rédaction | Validation du flux | Valider que le parcours client est 100% fonctionnel | Génération de test Playwright/Vitest |
| **`run-load-test`** | `skill-flow` | Stress-Test Locust | Flux critiques | Réservation / Paiement | Simuler 2 000 accès simultanés sur le lancement | Execution des scripts Locust |
| **`seo-audit`** | `skill-flow` | Audit SEO/Speed | Flux publics | Pages `/biens`, Formulaires | Maximiser la conversion et l'indexation | Verification lighthouse & meta tags |
| **`copywriting`** | `skill-flow` | Qualité Rédactionnelle | Rédaction .md | Synthèse exécutive | Rendre la procédure attrayante pour investisseurs | Ajustement du ton et vocabulaire de luxe |
| **`memoire-favor`** | `skill-flow` | Persistance mémoire | Fin de session | `memoire-favor/fourtour/` | Conserver l'historique des évolutions métier | Journalisation automatique du résumé |
| **`docx`** | `skill-flow` | Export Word | Étape 3 | `FavorCompany_Flux/` | Générer le document `.docx` officiel pour impression | `python .skills/skillFlow/scripts/md_to_docx.py` |
| **`pdf`** | `skill-flow` | Certification PDF | Flux paiement | Reçus & Factures | Produire les factures d'acompte certifiées | Audit/Génération des modèles PDF |
| **`pptx`** | `skill-flow` | Présentation Board | Demande client | Comités / Investisseurs | Convertir la procédure en slides PowerPoint | Structuration du script PPTX |
| **`xlsx`** | `skill-flow` | Matrice Excel | Flux financier | Reporting | Exporter le tableau des étapes et métriques DB | Structuration de tableaux Excel `.xlsx` |
| **`frontend-design`** | `skill-flow` | UX/UI Formulaires | Étape 1 | Composants React | Offrir une interface utilisateur moderne et réactive | Inspection et refonte des composants UI |
| **`brand-guidelines`** | `skill-flow` | Respect Charte | Tout le flux | Visuels & Docs | Imposer le Bleu Nuit `#1A2A4A` & Doré `#C9A84C` | Application des tokens de couleur officiels |
| **`theme-factory`** | `skill-flow` | Adaptation Thème | Graphiques | Diagrammes & UI | Harmoniser le rendu Light/Dark mode | Configuration des palettes CSS |
| **`web-artifacts-builder`**| `skill-flow` | Prototypes UI | Pré-analyse | Démonstrateurs | Maquetter un nouvel écran d'onboarding | Génération d'artefacts Web interactifs |
| **`webapp-testing`** | `skill-flow` | Test Navigateur | Étape 1 & 2 | Formulaires UI | Vérifier les interactions dans le navigateur | Exécution des vérifications UI |
| **`doc-coauthoring`** | `skill-flow` | Co-rédaction | Étape 2 | Fiches .md | Valider les étapes avec l'équipe juridique | Structuration collaborative du document |
| **`internal-comms`** | `skill-flow` | Mémos Managers | Post-création | Agences régionales | Informer les managers du lancement d'un flux | Rédaction de la note d'information interne |
| **`karpathy-guidelines`** | `skill-flow` | Rigueur de pensée | Tout le flux | Conception globale | Éviter les erreurs LLM et la sur-complexité | Application des 4 règles de rigueur |
| **`skill-creator`** | `skill-flow` | Évolution Skill | Maintenance | `.skills/skillFlow/` | Mettre à jour et améliorer les compétences | Révision des prompts et scripts |
| **`canvas-design`** | `skill-flow` | Schémas Visuels | Présentations | Infographies | Produire des visuels de flux grand format | Export d'infographies de procédures |
| **`algorithmic-art`** | `skill-flow` | Cartes & Badges | UI Prestige | Bannières | Générer des motifs visuels géométriques dorés | Création d'éléments visuels décoratifs |
| **`slack-gif-creator`** | `skill-flow` | Démonstrations GIF | Documentation | Tutoriels | Illustrer une étape par un GIF animé | Capture/Génération de démos d'écran |
| **`mcp-builder`** | `skill-flow` | Intégration MCP | Flux externes | API Partenaires | Interconnecter les flux avec des outils externes | Création/Configuration de serveurs MCP |
| **`claude-api`** | `skill-flow` | Automatisations AI | Flux intelligents | Modération IA | Intégrer des analyses IA automatiques sur le KYC | Invocations des API d'analyse de texte/image |

---

## 3. Organisation des Fichiers par Familles dans `FavorCompany_Flux/`

Chaque procédure générée est classée dans l'arborescence officielle :

```text
FavorCompany_Flux/
├── 01_Onboarding_Auth/          # Inscription, Connexion OTP, Mot de passe
├── 02_KYC_Verification/         # Téléversement CNI, Modération Admin, Rejets
├── 03_Reservations_Paiements/   # Choix du bien, Acompte Paystack, Factures PDF
├── 04_Gestion_Biens_Offres/     # Formulaire "Confier un Bien", Attribution Agent
├── 05_Notifications_Relances/   # Alertes sonores, Push, Cron relances
└── 06_Support_Litiges/          # Suggestions, Reclamations, Retours Clients
```

---

## 4. Commande de Conversion Automatisée (.md -> .docx)

Pour chaque procédure générée en Markdown (`.md`), le skill exécute automatiquement la conversion Word :

```powershell
python .skills/skillFlow/scripts/md_to_docx.py "FavorCompany_Flux/[Famille]/[Fichier].md" "FavorCompany_Flux/[Famille]/[Fichier].docx"
```
