# Session 096 — Cadrage & Alignement /grill-me Chatbot IA & Agent RAG (F20)

**Date :** 19 Août 2026

## 📌 Résumé des Décisions Validées
- **Moteur Sans LLM Externe** : Modèle déterministe par arborescence de boutons interactifs, direct BDD Supabase (`biens`).
- **Fonctionnalités Clés** :
  1. Recherche guidée de biens (Transaction -> Type -> Commune) avec affichage d'une liste textuelle et liens cliquables `/biens/[slug]`.
  2. FAQ & Procédures ImmOfika (acompte 1/3, 3 mois max, relances, 87% remboursement, documents ACD/Titre foncier).
  3. Statistiques en direct (compteurs de biens en temps réel).
  4. Escalade vers la page `/contact`.
- **UI/UX** : Widget Flottant Global aux couleurs Émeraude Menthe (`#10B981`).

## 🔒 Sécurité
Aucune clé API externe requise, utilisation des routes sécurisées Supabase avec RLS et variables d'environnement (`{{SUPABASE_URL}}`, `{{SUPABASE_ANON_KEY}}`).
