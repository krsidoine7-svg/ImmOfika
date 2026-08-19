# Addendum — Suppression du Système d'Historique de Versions (26 Juillet 2026)

## 📌 Modification Effectuée à la Demande Expresse de l'Utilisateur
- **Demande** : Supprimer l'affichage de l'historique des versions (`PDF Version 1`, `PDF Version 2`...).
- **Action** :
  1. Suppression du type `ContratVersion` et des états `versions` / `selectedVersionId` dans `EditerContratModal.tsx`.
  2. Rétablissement d'une modale épurée et directe avec l'unique bouton **`[👁️ Aperçu PDF du Contrat]`** et **`[✉️ Envoyer le contrat au client]`**.
