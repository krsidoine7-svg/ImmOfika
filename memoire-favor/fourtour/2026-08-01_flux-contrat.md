# Journal Brut - 01 Août 2026 (Refonte Flux Contrat)

## Actions
- Analyse d'impact du changement de flux de contrat (passage de l'automatique vers le manuel avec signature physique).
- Modification du schéma de DB `reservations` : ajout de `contrat_scanne_url` et migration Drizzle effectuée.
- Suppression massive du code de génération automatique obsolète :
  - `ContratPDF.tsx`, `genererContratDocx.ts`
  - Routes d'export web API correspondantes
  - Route client de signature DocuSign-like (`src/app/signature/`)
- Réécriture de la Server Action `contrat.ts` -> `uploaderContratScanneAction` avec restrictions RBAC (seul l'agent assigné ou les admins (admin, super_admin, tech_super_admin) peuvent uploader).
- Création de `UploadContratModal.tsx` remplaçant l'ancien `EditerContratModal.tsx`.
- Nettoyage de l'UI de modération de signature dans `AdminReservationsClient.tsx` (le processus de modération par l'agent est supprimé puisque l'agent uploade directement le bon fichier signé).
- Mise à jour du tableau de bord Client (`client/dashboard/page.tsx`) pour lui permettre de télécharger la facture (générée automatiquement) et le contrat (seulement quand il a été uploadé).

## Erreurs résolues
- Résolution d'erreurs TypeScript suite à la suppression des anciennes Server Actions : nettoyage des imports dans `AdminReservationsClient.tsx` et corrections syntaxiques.
- Omission initiale du rôle `tech_super_admin` dans le plan d'implémentation corrigée à la demande.

## Décisions & Architecture
- Nous avons abandonné la signature 100% électronique intégrée pour un processus physique (scannage du PDF) car plus pertinent légalement (Promoteur Agréé).
- Conservation intacte du flux de facturation (reçus générés automatiquement).
