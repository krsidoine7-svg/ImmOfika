# Addendum — Centrage du Hero dans le Viewport Mobile & Suppression Définitive de la Phase 2 sur Mobile (26 Juillet 2026)

## 📌 Ajustements Mobile Appliqués
1. **Suppression Définitive de la Phase 2 (Vidéo/Exécutifs) sur Mobile** :
   - Masquage strict de la Phase 2 sur les téléphones mobile (`hidden sm:flex`). La vidéo et la superposition d'exécutifs restent réservées aux grands écrans desktop.
2. **Centrage Parfait du Hero dans le Viewport Mobile (`min-h-[100dvh]`)** :
   - Désactivation du scroll sticky 200vh sur mobile (`h-auto sm:h-[200vh]`).
   - Le Hero est désormais centré verticalement dans le viewport mobile (`min-h-[100dvh] flex flex-col justify-center items-center`), offrant une première vue propre sans aucun défilement parasite.
- **Validation Build** : `npm run build` exécuté avec 100% de succès.
