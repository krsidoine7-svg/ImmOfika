# Journal Brut - Étape 5 : Suppression Définitive CRM Leads & Formulaires Tally

- **Date** : 31/10/2026
- **Auteur** : {{AGENT_NAME}} (Chef de Projet / Tech Lead Senior)
- **Objectif** : Transformer la plateforme en marketplace neutre et ouverte en éliminant complètement le module CRM mono-agence et les formulaires Tally.

## Actions Réalisées
1. **Migration SQL 0024** (`0024_drop_crm_leads_and_tally.sql`) :
   - Suppression de la colonne `visites.lead_id`.
   - Suppression des tables `lead_interactions`, `leads`, `formulaire_reponses`, `formulaires`.
   - Migration exécutée avec succès sur la base Supabase.
2. **Découplage des Visites** :
   - `src/app/actions/visites.ts` rattaché directement à `clientId` sans pollution de CRM lead.
   - Refonte des vues de visites pour afficher les coordonnées des clients inscrits.
3. **Formulaires de Contact Directs** :
   - Implémentation de `src/app/actions/contactActions.ts` (`envoyerMessageContactAction`) avec honeypot OWASP et rate limiting mémoire par IP.
   - Branchement direct sur `ContactForm.tsx` et `MarketplacePropertyCard.tsx`.
4. **Purge du Code Obsolète** :
   - Suppression physique des dossiers et fichiers : `admin/leads`, `admin/formulaires`, `LeadsManagerClient.tsx`, `KanbanPipeline.tsx`, `TransitionGatingModal.tsx`, `crm.ts`, `lib/crm/`, `queries/formulaires.ts`, etc.
   - Nettoyage des menus dans `app-sidebar.tsx` et des constantes de routes dans `roles.ts`.
5. **Résolution des Erreurs TypeScript** :
   - Correction des requêtes Drizzle dans `utilisateurs/page.tsx`, `visites/page.tsx`, `kpis.ts`, `moderation.ts`, `export.ics/route.ts`, `recu/[paiementId]/route.ts`.
   - `npx tsc --noEmit` : 0 erreur.
6. **Tests & Recette** :
   - Ajout du test unitaire `tests/unit/crm-isolation.test.ts` (3 tests).
   - 48/48 tests Vitest au vert.
   - Module 16 ajouté au cahier de recette (`docs/CAHIER-DE-RECETTE.md`) avec 4 nouveaux scénarios (T-16.1 à T-16.4).
   - `lint_cahier.py` : 0 erreur, 0 avertissement.
   - Régénération de `docs/CAHIER-DE-RECETTE.docx`.
   - Mise à jour de `docs/GUIDE-UTILISATEUR-ADMIN.md` (Section 2.3).

