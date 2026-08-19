# Workflow Git — Favor Company International

> **Règle d'or :** Aucune action sur le code (Ajout, Modif, Suppression) ne commence sans une **Radiographie d'Impact**.

---

## 🚨 Règle Critique pour l'Intelligence Artificielle (Sauvegarde et Push)
> **NE JAMAIS POUSSER DIRECTEMENT SUR `main`.**
> Avant d'exécuter un `git push` pour sauvegarder le travail de la session, l'IA **doit obligatoirement** :
> 1. Vérifier la branche courante (`git branch --show-current`).
> 2. Demander explicitement à l'utilisateur : *"Sur quelle branche veux-tu que je sauvegarde (push) ces modifications ?"* (ex: `feature/nom-de-la-feature`).
> 3. Ne jamais prendre l'initiative de pousser sur `main` sans accord formel de l'utilisateur.

---

## 1. Cycle de Vie d'une Feature

### A. Ajout d'une Feature
1. **Radio d'Impact** : Demander à l'IA de scanner le projet.
2. **Branche** : `feature/F_XX-nom`
3. **TASKS.md** : Créer le ticket.
4. **Dev** : Code + Tests.

### B. Modification d'une Feature
1. **Radio de Modification** : Identifier ce qui va "casser" dans l'existant.
2. **Branche** : `refactor/F_XX-nom` ou `feature/...`
3. **Clean code** : Supprimer l'ancien code remplacé.

### C. Suppression d'une Feature
1. **Radio d'Excision** : Identifier tous les imports et dépendances à nettoyer.
2. **Branche** : `chore/delete-F_XX`
3. **Build test** : `npm run build` est obligatoire pour valider la suppression.

---

## 2. Conventions de Branche
- `main` : Production stable.
- `develop` : Intégration.
- `feature/` : Développement.
- `hotfix/` : Urgence prod.
- `release/` : Test avant prod.

---

## 3. Radiographie d'Impact 3D (Standard)

Le prompt à utiliser systématiquement avant toute modification :
```
Fais-moi une RADIOGRAPHIE D'IMPACT 3D pour [Action] sur [Feature].
1. TECHNIQUE : Fichiers fracturés ?
2. MÉTIER : Processus orphelins ou liens DB cassés ?
3. UX/UI : Feedback et Storytelling impactés ?
```

---
*Dernière mise à jour : Mai 2026*
