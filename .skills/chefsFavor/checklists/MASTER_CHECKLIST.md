# MASTER_CHECKLIST.md — Contrôle Qualité Global
## Favor Company International — chefsFavor

> Ce document est utilisé par chefsFavor pour valider chaque livraison avant merge.

---

## Checklist Avant Merge (Obligatoire)

### Code Quality
```
□ npm run build        → 0 erreur (TypeScript + Next.js)
□ npm run lint         → 0 erreur (ESLint)
□ npm run type-check   → 0 erreur (TypeScript strict)
□ npm run test         → 100% des tests passent
□ Pas de `any` TypeScript dans les fichiers modifiés
□ Pas de console.log laissé dans le code (sauf pour le debug intentionnel)
□ Pas de code commenté inutile
```

### Sécurité
```
□ grep -r "PAYSTACK_SECRET" ./src → 0 résultat
□ grep -r "SERVICE_ROLE" ./src → 0 résultat
□ grep -r "ENCRYPTION_KEY" ./src/app → 0 résultat
□ npm audit --audit-level=high → 0 vulnérabilité haute/critique
□ Webhook Paystack : signature validée (si feature de paiement)
□ Données sensibles chiffrées (si nouvelle colonne téléphone/CNI/finances)
□ RLS policy créée (si nouvelle table)
```

### Base de Données
```
□ Migration générée avec npm run db:generate
□ Migration testée sur dev avec npm run db:migrate
□ RLS policy testée avec plusieurs rôles
□ Indexes créés sur les colonnes filtrées
□ Seed data mise à jour si nécessaire
```

### UX & Accessibilité
```
□ Responsive testé : 375px / 768px / 1280px
□ Loading state présent (Skeleton ou Spinner)
□ Error state présent (message d'erreur clair)
□ Boîte de dialogue de confirmation sur les actions destructives
□ aria-label sur les boutons sans texte
□ alt sur toutes les images
□ Labels sur tous les champs de formulaire
□ Contraste suffisant (4.5:1 minimum)
```

### Git & Documentation
```
□ Branche nommée : feature/F[XX]-[nom-kebab]
□ Commits avec messages Conventional Commits
□ Pas de secrets dans les commits (git log --all -p | grep "SECRET")
□ TASKS.md mis à jour (feature marquée ✅)
□ ARCHITECTURE.md mis à jour (si nouveaux fichiers ou patterns)
□ PR créée avec description complète
□ PR liée à la tâche TASKS.md
```

### Tests de Recette
```
□ Happy path testé manuellement
□ Cas d'erreur testés (réseau, validation, auth)
□ Permissions RBAC testées (au moins 2 rôles différents)
□ Feature testée sur mobile (375px)
□ Performance : pas de chute notable du LCP
```

---

## Grille de Score par Feature

| Critère | Poids | Score (0-10) | Pondéré |
|---|---|---|---|
| Code quality (build, lint, types, tests) | 25% | /10 | /2.5 |
| Sécurité | 25% | /10 | /2.5 |
| Fonctionnalité (critères d'acceptance) | 25% | /10 | /2.5 |
| UX & responsive | 15% | /10 | /1.5 |
| Documentation | 10% | /10 | /1.0 |
| **TOTAL** | 100% | | **/10** |

**Seuil de validation : 7/10 minimum**  
**Seuil sécurité minimal : 8/10 (critique)**

---

## Messages de Recadrage Standard

### Recadrage TypeScript

```
⚠️ RECADRAGE — Code non conforme : TypeScript any

Le code suivant utilise `any` :
[code concerné]

Règle du projet : JAMAIS de `any` TypeScript.
Correction requise :
1. Définir une interface explicite pour [objet]
2. Remplacer `any` par l'interface ou le type précis

Reprendre cette partie avant de continuer.
```

### Recadrage Sécurité

```
🚨 RECADRAGE SÉCURITÉ — Critique

Problème : [description du problème]
Fichier : [chemin] ligne [N]
Risque : [impact potentiel]

Correction OBLIGATOIRE avant tout déploiement :
[Code corrigé]

Référence : SECURITY.md §[section]
```

### Recadrage Pattern

```
⚠️ RECADRAGE — Pattern incorrect

Tu as utilisé [pattern incorrect] dans [fichier].
Le pattern correct pour ce projet est :

[Code exemple du bon pattern]

Raison : [explication]
Référence : ARCHITECTURE.md §[section]

Corriger avant de continuer.
```

### Recadrage Feature Hors Scope MVP

```
⏸ RECADRAGE — Feature hors scope MVP actuel

La feature "[nom]" appartient au [MVP_X], pas au [MVP_Y] en cours.
Raison : [explication de la priorité]

Actions :
1. Ajouter cette feature dans TASKS.md sous MVP_[X]
2. Continuer avec la feature en cours : F[XX] — [nom]
3. Revenir à cette idée une fois MVP_[Y] terminé

On reste focalisé sur l'objectif actuel.
```
