# Log Brut - 31 Octobre 2026 - Transformation Marketplace Étape 3 : Rôles & Permissions Immobilières Pures

- Validation utilisateur : "ok".
- Réalisations :
  - Migration 0021 appliquée sur PostgreSQL :
    - Purge des 20 permissions e-commerce obsolètes (commande, produit, stock, livraison, retour, remboursement).
    - Insertion des 33 permissions immobilières officielles (annonce, organisation, dossier, signalement, alerte, visite, réservation).
    - Initialisation des permissions par rôle dans role_permissions et default_role_permissions.
  - src/lib/auth/permissions.ts : type StandardPermissionCode et SENSITIVE_PERMISSIONS alignés.
  - tests/unit/rbac-guardrails.test.ts mis à jour (16/16 passants).
  - Vitest : 43/43 tests passants sur 8 fichiers.
  - TypeScript : 0 erreur (npx tsc --noEmit code 0).
  - Module 14 ajouté dans docs/CAHIER-DE-RECETTE.md et validé au linter strict (66 tests, 0 erreurs, 0 avertissements).
  - docs/CAHIER-DE-RECETTE.docx régénéré.
  - docs/GUIDE-UTILISATEUR-ADMIN.md mis à jour (section 2.2).

