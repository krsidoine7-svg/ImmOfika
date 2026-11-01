# Journal Brut - Étape 7 : Espaces Clients Connectés (Alertes & Dossier Candidat)

- **Date** : 01/11/2026
- **Auteur** : {{AGENT_NAME}} (Chef de Projet / Tech Lead Senior)
- **Objectif** : Implémenter les fonctionnalités pour clients connectés (acheteurs / locataires) : alertes immobilières sauvegardées et passeport de solvabilité numérique (Dossier Candidat).

## Actions Réalisées
1. **Server Actions Client Marketplace** (`src/app/actions/clientMarketplaceActions.ts`) :
   - `creerAlerteAction` : validation Zod des critères (commune, type, budget, titre ACD, fréquence) et insertion dans `recherches_alertes`.
   - `getMesAlertesAction` : récupération des alertes de l'utilisateur connecté avec tri chronologique.
   - `toggleAlerteAction` & `supprimerAlerteAction` : mise à jour et suppression protégées contre les attaques IDOR (`user_id = user.id`).
   - `sauvegarderDossierCandidatAction` : upsert dans `dossiers_candidats` avec gestion des justificatifs (CNI, bulletins, attestation, quittance).
   - `calculerCompletudeDossier` : calcul pondéré de solvabilité (0% à 100%).
   - `soumettreDossierCandidatAction` : contrôle d'un seuil minimum de 40% avant passage au statut `soumis`.
2. **Interface Mes Alertes Immo** (`src/app/(client)/client/alertes/page.tsx`) :
   - Tableau de bord des alertes avec interrupteur ON/OFF instantané.
   - Modal de création d'alerte avec sélecteur des communes d'Abidjan, transaction et filtre exclusif ACD Garanti.
   - Lien direct ouvrant le catalogue `/biens` avec les critères injectés en paramètres URL.
3. **Interface Dossier Candidat Numérique** (`src/app/(client)/client/dossier/page.tsx`) :
   - Jauge visuelle de complétude en temps réel.
   - Formulaire de situation professionnelle et financière (FCFA).
   - Zone de justificatifs numériques avec statut de chaque pièce.
   - Bouton de soumission à certification avec vérification des prérequis.
4. **Navigation Client** :
   - Ajout des liens « Mes Alertes Immo » et « Dossier Candidat » dans `src/components/client/ClientSidebar.tsx`.
5. **Tests & Recette** :
   - Test unitaire `tests/unit/client-marketplace-features.test.ts` (3/3 tests passants).
   - Vitest global : **56/56 tests au vert** (11 suites de tests).
   - TypeScript : **0 erreur** (`npx tsc --noEmit`).
   - Cahier de recette : **Module 18** ajouté dans `docs/CAHIER-DE-RECETTE.md` (**82 tests**, 0 erreur linter).
   - `docs/CAHIER-DE-RECETTE.docx` régénéré avec succès.
   - `docs/GUIDE-UTILISATEUR-ADMIN.md` enrichi (Sections 4.2 & 4.3).

