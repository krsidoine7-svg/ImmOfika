# PROJET_CONTEXT.md — Contexte Permanent Favor Company

> Ce fichier est le contexte à coller en début de conversation avec l'IA.
> Copier-coller au début de chaque nouvelle session de développement.

---

## Template de Contexte Permanent

```
# Contexte Projet — Favor Company International

## Identité
Promoteur immobilier agréé : Favor Company International
Localisation : Yaho, Abidjan, Côte d'Ivoire
Secteur : Immobilier & Lotissement
Email : Favorcompanyint@gmail.com

## Stack Technique
- Next.js 15 (App Router) + React 19 + TypeScript strict
- Tailwind CSS v4 + shadcn/ui + lucide-react + Framer Motion
- Supabase (PostgreSQL + Auth + Storage + Realtime + RLS)
- Drizzle ORM
- Paystack (paiements CI : Orange Money, MTN MoMo, Wave, Carte)
- Cloudflare R2 (stockage images, vidéos, documents, contrats)
- Resend (emails transactionnels)
- Vercel (déploiement)
- Sentry + PostHog + Google Analytics 4 (monitoring)

## Règles Absolues (JAMAIS violer)
- JAMAIS de `any` TypeScript
- JAMAIS de clé API dans NEXT_PUBLIC_ (sauf clés publiques autorisées)
- JAMAIS de pages/ directory — uniquement App Router
- JAMAIS de mutations côté client — Server Actions uniquement ('use server')
- JAMAIS traiter un webhook sans valider la signature HMAC-SHA512
- JAMAIS de code directement sur la branche main
- TOUJOURS Zod sur tous les inputs côté serveur
- TOUJOURS RLS activé sur toutes les tables Supabase
- TOUJOURS transactions atomiques pour les réservations (FOR UPDATE NOWAIT)
- TOUJOURS chiffrer les données sensibles : AES-256-GCM (téléphone, CNI, finances)
- TOUJOURS des composants React réutilisables (interface typée, pas de any)
- TOUJOURS tester une feature avant de passer à la suivante

## Rôles RBAC
super_admin, admin_manager, admin, admin_agent, admin_rh, tech_super_admin, client, partenaire

## MVP actuel
[Indiquer ici : MVP_1 / MVP_2 / MVP_3]

## Dernière feature terminée
[Indiquer ici : F_XX — Nom]

## Feature en cours
[Indiquer ici : F_XX — Nom]
```

---

## Templates de Prompts Réutilisables

### Implémenter une Feature

```
# Contexte Projet
[Coller le contexte permanent ci-dessus]

# Feature à implémenter
F[XX] — [Nom de la feature]

## Description
[Description précise]

## Critères d'acceptance
- [ ] Critère 1
- [ ] Critère 2

## Fichiers concernés (selon analyse architecte)
- src/...
- src/...

## Contrainte spécifique
[Si applicable]

## Question
Implémente [quoi exactement] en respectant les règles du projet.
```

### Débugger une Erreur

```
# Contexte Projet
Stack : Next.js 15 + Supabase + TypeScript strict

# Erreur exacte
[COLLER ICI L'ERREUR COMPLÈTE AVEC STACK TRACE]

# Fichier concerné
[Chemin exact] ligne [N]

# Code concerné (20 lignes max)
[CODE]

# Comportement attendu
[Ce qui devrait se passer]

# Question
Qu'est-ce qui ne va pas et comment corriger ?
```

### Review de Code

```
# Contexte Projet
[Stack + Règles absolues]

# Code à reviewer
Fichier : [chemin]

[CODE]

# Question
Fais une review complète de ce code :
1. Respecte-t-il les règles du projet (TypeScript strict, sécurité, patterns) ?
2. Y a-t-il des bugs potentiels ?
3. Peut-il être amélioré ?
4. Propose les corrections.
```

### Décision d'Architecture

```
# Contexte Projet
[Stack + Architecture actuelle]

# Question architecturale
Je dois implémenter [fonctionnalité].

Option A : [description]
Option B : [description]

Quelle option recommandes-tu pour ce projet, et pourquoi ?
Quels sont les trade-offs ?
Quel impact sur les autres modules ?
```

### Mise à Jour ARCHITECTURE.md

```
# Feature ajoutée
F[XX] — [Nom]

# Fichiers créés ou modifiés
- src/... : [rôle]
- src/... : [rôle]

# Nouvelles tables DB
- [table] : [description]

# Nouveaux patterns introduits
- [pattern] : [quand l'utiliser]

Met à jour ARCHITECTURE.md pour refléter ces changements.
Format : maintenir le style et la structure existante du document.
```

---

## Séquence de Démarrage d'une Session

```
1. Coller le contexte permanent (ci-dessus)
2. Indiquer l'état du projet (MVP actuel, feature en cours)
3. Formuler la demande avec le bon template
4. Demander l'analyse d'impact AVANT de coder
5. Développer feature par feature
6. Tester avant de passer à la suivante
7. Committer et mettre à jour TASKS.md + ARCHITECTURE.md
```
