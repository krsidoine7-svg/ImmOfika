# Session 097 — Implémentation du Chatbot Interactif BDD (F20)

**Date :** 19 Août 2026

## 📌 Synthèse de l'Implémentation
- **API Route** `src/app/api/chatbot/tree/route.ts` créée pour les requêtes dynamiques de statistiques, recherche de biens et FAQ.
- **Composant UI** `src/components/shared/ChatBot.tsx` mis à jour avec une arborescence interactive multi-étapes, liste textuelle des biens avec liens `/biens/[slug]`, FAQ sur l'acompte (1/3), 87% remboursement et bouton d'action vers `/contact`.
- **Rendu Global** : Intégration globale dans `src/app/layout.tsx`.

## 🔒 Sécurité
Aucune donnée sensible divulguée (`{{SUPABASE_URL}}`, `{{SUPABASE_ANON_KEY}}`).
