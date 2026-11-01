# Journal Brut - Étape 8 : Tableaux de Bord Annonceurs (Particuliers, Agences & Promoteurs Agréés)

- **Date** : 01/11/2026
- **Auteur** : {{AGENT_NAME}} (Chef de Projet / Tech Lead Senior)
- **Objectif** : Adapter les dashboards annonceurs selon les 3 profils marketplace (Particulier Propriétaire, Agence Immobilière, Promoteur Agréé MCLU) avec gestion de portefeuille, candidatures et équipe.

## Actions Réalisées
1. **Server Actions Annonceur** (`src/app/actions/advertiserActions.ts`) :
   - `getAdvertiserDashboardDataAction` : agrégation des données selon l'affiliation d'organisation (`organization_id`), calcul des KPIs (total biens, validés, en modération, rejetés, audience cumulée, réservations actives) et récupération des candidatures/réservations avec solvabilité des clients.
   - `inviterMembreOrganisationAction` : rattachement sécurisé d'un compte utilisateur en tant que négociateur ou assistant au sein de la structure morale.
2. **Composant Client Richesse & Ergonomie** (`src/components/dashboard/AdvertiserDashboardClient.tsx`) :
   - Bannière personnalisée avec badge officiel (`Promoteur Agréé MCLU` avec n° d'agrément, `Agence Immobilière`, `Propriétaire Particulier`).
   - 4 compteurs de performance avec indicateurs de statut.
   - Système d'onglets réactifs :
     - **Mon Parc Immobilier** : liste des annonces avec photos, badges fonciers ACD/CMP, motifs de rejet en cas de refus et lien direct vers la fiche publique.
     - **Candidatures & Réservations Reçues** : tableau des dossiers de solvabilité soumis par les clients (profession, employeur, revenus en FCFA) avec boutons WhatsApp directs.
     - **Organisation & Équipe** : fiche de l'entreprise (RCCM, NCC, agrément ministériel) et registre des négociateurs avec modal de rattachement.
3. **Mise à Jour de la Page Dashboard** (`src/app/dashboard/bailleur/page.tsx`) :
   - Raccordement direct à l'action serveur et transmission typée des données.
4. **Tests & Recette** :
   - Test unitaire `tests/unit/advertiser-dashboard.test.ts` (3/3 passants).
   - Vitest global : **59/59 tests au vert** (12 suites de tests).
   - TypeScript : **0 erreur** (`npx tsc --noEmit`).
   - Cahier de recette : **Module 19** ajouté dans `docs/CAHIER-DE-RECETTE.md` (**86 tests**, 0 erreur linter).
   - `docs/CAHIER-DE-RECETTE.docx` régénéré avec succès.
   - `docs/GUIDE-UTILISATEUR-ADMIN.md` mis à jour (Section 5.1).

