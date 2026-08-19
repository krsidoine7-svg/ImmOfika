# Addendum — Verrouillage au Format PDF Uniquement & Suppression Trame Word (26 Juillet 2026)

## 📌 Modifications Conformes aux Exigences Strictes Utilisateur
1. **Verrouillage au Format PDF Uniquement (`.pdf`)** :
   - Le champ d'importation de contrat révisé accepte **exclusivement des fichiers au format PDF** (`accept="application/pdf,.pdf"`).
   - Validation stricte côté client (`handleFileChange`) et côté serveur (`genererEtEnvoyerContratAction`) avec message d'erreur si un fichier non-PDF est sélectionné.
2. **Suppression Totale des Boutons & Références Word (.docx)** :
   - Suppression du bouton `[Trame Word (.docx)]` dans la modale `EditerContratModal.tsx`.
   - La seule option de téléchargement à l'Étape 1 est le **Reçu d'Acompte Officiel Client (PDF)**.
