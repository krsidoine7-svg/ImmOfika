# Log Brut - 31 Octobre 2026 - Transformation Marketplace Étape 1 : Sécurité & Fondations

- Décision utilisateur :
  - Maintien du modèle avec réservation et paiement d'acompte légal garanti.
  - Suppression définitive programmée du CRM leads mono-client.
  - Validation du lancement de l'Étape 1 du plan de transformation.
- Réalisations :
  - Migration 0019 appliquée à la BDD PostgreSQL avec RLS sur user_roles et default_role_permissions.
  - Trigger PostgreSQL protect_profile_role_update bloquant toute auto-promotion.
  - Sécurisation de l'API /api/biens avec filtre statut_moderation = valide.
  - Suppression de la route résiduelle /test-supabase.
  - 39/39 tests unitaires passants (tests/unit/security-foundations.test.ts).
  - TypeScript code 0.
  - Module 12 ajouté dans docs/CAHIER-DE-RECETTE.md et validé au linter (58 tests, 0 erreurs).
  - docs/CAHIER-DE-RECETTE.docx régénéré.
  - Section 3.4 ajoutée dans docs/GUIDE-UTILISATEUR-ADMIN.md.

