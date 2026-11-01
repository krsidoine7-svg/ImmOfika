# Addendum — Ouverture Directe dans un Nouvel Onglet sans Téléchargement Forcé (26 Juillet 2026)

## 📌 Modification Effectuée
- **Demande Utilisateur** : Cliquer sur le bouton d'aperçu doit **ouvrir directement le document dans un nouvel onglet de navigateur (`target="_blank"`)** pour consultation visuelle immédiate, sans forcer de boîte de dialogue de téléchargement de fichier sur le disque.
- **Solution Technique** :
  - Remplacement du tag d'attribut `download` par un appel direct à `window.open(fileUrl, '_blank')`.
  - Fonctionne pour les aperçus PDF initiaux auto-générés et pour tout document révisé importé.
