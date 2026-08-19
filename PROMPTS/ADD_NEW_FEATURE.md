# ADD_NEW_FEATURE.md — Protocole d'Ajout de Feature
## Favor Company International

> **Règle absolue :** Suivre ces étapes dans l'ordre pour ne jamais casser le projet existant.

---

## Les 7 Étapes du Protocole

### Étape 1 — Faire une Radiographie d'Impact (3D Scan)

Avant d'écrire la moindre ligne de code, demande une **Radiographie d'Impact en 3 dimensions** à l'IA :

```
Fais-moi une RADIOGRAPHIE D'IMPACT 3D pour : [description précise].
Voici mon ARCHITECTURE.md et DB_SCHEMA.md pour contexte.

Analyse selon ces 3 axes :
1. RADIO TECHNIQUE : Quels fichiers/composants sont modifiés ? Risques de régression ?
2. RADIO MÉTIER & DONNÉES : Impact sur les relations DB (clés étrangères) ? Impact sur le processus client de bout en bout ? Intégrité des données ?
3. RADIO UX/UI : Changements d'états ? Feedbacks visuels/sonores requis ? Impact sur le flux utilisateur ?
```

**Ce que tu cherches à voir sur la "Radio" :**
- **Fractures Techniques** : Conflits de code ou fichiers impactés.
- **Fuites de Données/Logique** : Clients orphelins, liens DB cassés, historique perdu.
- **Zones d'ombre UX** : Utilisateur perdu, manque de feedback ou de clarté.

---

### Étape 2 — Mettre à Jour TASKS.md Avant de Coder

Ajouter le ticket de la feature dans TASKS.md **avant** de commencer. Format :

```markdown
## [En cours] F_XX — Nom de la Feature
**Priorité :** haute / normale / basse
**MVP :** 1 / 2 / 3 / 4
**Estimé :** X jours

### Critères d'acceptance
- [ ] Critère 1
- [ ] Critère 2
- [ ] Critère 3

### Fichiers impactés
- `src/components/...`
- `src/app/actions/...`
- `src/lib/db/schema.ts`

### Tests requis
- [ ] Test unitaire : ...
- [ ] Test E2E : ...
```

---

### Étape 3 — Créer une Branche Git Dédiée

```bash
# Toujours depuis develop (jamais depuis main)
git checkout develop
git pull origin develop
git checkout -b feature/F_XX-nom-de-la-feature

# Exemples :
git checkout -b feature/F17-generation-contrats
git checkout -b feature/F20-chatbot-ia
git checkout -b hotfix/fix-reservation-bug
```

**Règles des branches :**
- `feature/` → nouvelle fonctionnalité
- `fix/` → correction de bug
- `hotfix/` → correction urgente sur production
- `refactor/` → refactoring sans nouvelle feature
- `chore/` → maintenance, mise à jour des dépendances

---

### Étape 4 — Coller le Contexte Complet au Début du Prompt

Chaque prompt à l'IA doit commencer par ce template :

```
# Contexte du projet
Stack : Next.js 15 App Router + React 19 + TypeScript strict
Backend : Supabase (PostgreSQL + Auth + Storage + RLS)
ORM : Drizzle
Styling : Tailwind CSS v4 + shadcn/ui
Paiement : Paystack
Stockage : Cloudflare R2
Pays : Côte d'Ivoire, devise XOF

# Contraintes absolues
- Jamais de `any` TypeScript
- Jamais de clés API côté client (pas dans NEXT_PUBLIC_ sauf celles autorisées)
- Uniquement App Router (pas de pages/)
- Mutations uniquement via Server Actions
- Valider TOUJOURS les webhooks avant de modifier la DB
- RLS activé sur toutes les tables
- Zod pour valider tous les inputs côté serveur
- Composants réutilisables (pas de copier/coller UI)

# Architecture actuelle
[Colle le contenu de ARCHITECTURE.md ou la section pertinente]

# Ce que je veux implémenter
[Description précise de la feature]

# Question / Tâche
[Ce que tu veux que l'IA fasse exactement]
```

---

### Étape 5 — Développer la Feature (Feature by Feature)

**Ordre de développement :**

1. **Schéma DB d'abord** (si nécessaire)
   ```bash
   # Modifier src/lib/db/schema.ts
   # Générer la migration
   npm run db:generate
   # Appliquer la migration
   npm run db:migrate
   ```

2. **Server Actions / API Routes** (logique métier)
   ```typescript
   // src/app/actions/ma-feature.ts
   'use server'
   // 1. Vérifier auth
   // 2. Vérifier permissions
   // 3. Valider inputs (Zod)
   // 4. Exécuter la logique
   // 5. Retourner { success, data } ou { error }
   ```

3. **Composants UI** (du plus simple au plus complexe)
   ```typescript
   // Commencer par le composant de base
   // Tester dans le navigateur
   // Ajouter les états (loading, error, success)
   // Ajouter les animations si nécessaire
   ```

4. **Intégration** (relier UI ↔ Server Action)

5. **Tests** (unitaires + E2E)

**Commit après chaque sous-tâche fonctionnelle :**
```bash
git add .
git commit -m "feat(ma-feature): add database schema for X"
git commit -m "feat(ma-feature): implement server action for Y"
git commit -m "feat(ma-feature): add UI component Z"
git commit -m "test(ma-feature): add unit tests for Y"
```

---

### Étape 6 — Tester Avant de Passer à la Suite

**Checklist de test obligatoire :**

```
□ La feature fonctionne dans le navigateur (happy path)
□ Les cas d'erreur sont gérés (réseau, validation, auth)
□ Aucune régression sur les features existantes
□ Responsive : mobile, tablette, desktop
□ Performance : pas de chute notable des métriques
□ Sécurité : pas de donnée sensible exposée
□ Permissions RBAC : les restrictions sont respectées
□ Tests unitaires : tous les tests passent (npm run test)
□ Build réussi : npm run build sans erreur
```

**Template de test rapide :**
```
Scénario 1 — Happy Path
1. [Action initiale]
2. [Étape suivante]
3. [Résultat attendu] ✓

Scénario 2 — Cas d'erreur
1. [Action qui échoue]
2. [Message d'erreur attendu] ✓

Scénario 3 — Sécurité
1. [Tentative d'accès non autorisé]
2. [Rejet attendu] ✓
```

---

### Étape 7 — Mettre à Jour la Documentation

Après avoir codé et testé la feature :

**1. Mettre à jour ARCHITECTURE.md**
```
Demande à l'IA : "Mets à jour mon ARCHITECTURE.md avec cette nouvelle feature.
Voici ce qui a été ajouté : [description]
Voici les fichiers modifiés : [liste]"
```

**2. Mettre à jour TASKS.md**
```markdown
## [✅ Terminé] F_XX — Nom de la Feature
**Terminé le :** JJ/MM/AAAA
**Branche :** feature/F_XX-nom
**PR :** #XX
```

**3. Créer la Pull Request**
```markdown
## PR Title : feat(module): Description courte

## Qu'est-ce qui a changé ?
- [Changement 1]
- [Changement 2]

## Comment tester ?
1. [Étape 1]
2. [Étape 2]
3. [Résultat attendu]

## Checklist
- [ ] Tests passent (npm run test)
- [ ] Build réussi (npm run build)
- [ ] Lint OK (npm run lint)
- [ ] TypeScript OK (npm run type-check)
- [ ] Testé sur mobile et desktop
- [ ] ARCHITECTURE.md mis à jour
- [ ] Pas de clés API exposées
```

---

---

## Protocole de Modification d'une Feature

Si tu dois changer le fonctionnement d'une chose qui existe déjà :

1. **La Radio de Modification** : Demande à l'IA : *"Fais une RADIOGRAPHIE D'IMPACT pour modifier la feature [Nom]. Je veux changer [X] en [Y]. Qu'est-ce qui va casser dans le code actuel ?"*
2. **Migration (si besoin)** : Si tu modifies la DB, crée une migration Drizzle (`npm run db:generate`).
3. **Branche** : `git checkout -b refactor/F_XX-nom-modif` ou `feature/...`.
4. **Code & Clean** : Modifie le code, mais assure-toi de supprimer les anciennes fonctions qui ne servent plus.
5. **Test de régression** : Vérifie que tout ce qui fonctionnait *avant* fonctionne toujours.

---

## Protocole de Suppression d'une Feature

Pour retirer proprement une fonctionnalité sans laisser de "code mort" :

1. **La Radio d'Excision** : Demande à l'IA : *"Fais une RADIOGRAPHIE D'IMPACT pour SUPPRIMER la feature [Nom]. Qui d'autre utilise ce code ? Où sont les imports à nettoyer ?"*
2. **Nettoyage DB** : Crée une migration pour supprimer les tables ou colonnes inutiles.
3. **Branche** : `git checkout -b chore/delete-F_XX`.
4. **Suppression** : 
   - Supprime les fichiers `.ts`, `.tsx` dédiés.
   - Nettoie les imports dans les autres fichiers (le compilateur TypeScript t'aidera avec les erreurs).
   - Supprime les entrées dans `TASKS.md` et `ARCHITECTURE.md`.
5. **Test Final** : `npm run build` est obligatoire pour vérifier qu'aucun fichier ne réclame encore la feature supprimée.

---

## Protocole Debug

### Quand quelque chose ne fonctionne pas

**Étape 1 — Lire le message d'erreur complet**

Copier TOUT : le message, la stack trace, le fichier et la ligne. Pas juste "ça marche pas".

**Étape 2 — Prompt de debug structuré**

```
J'ai cette erreur exacte :
[ERREUR COMPLÈTE AVEC STACK TRACE]

Stack : Next.js 15 + Supabase + TypeScript
Fichier concerné : [chemin exact du fichier]

Voici le code concerné (20 lignes max autour du problème) :
[CODE]

J'attendais ce comportement :
[CE QUI DEVRAIT SE PASSER]

Qu'est-ce qui ne va pas et comment fixer ?
```

**Étape 3 — Vérifier la source officielle**

Si l'IA invente une API, vérifier dans la doc officielle :
- Supabase : https://supabase.com/docs
- Next.js : https://nextjs.org/docs
- Drizzle : https://orm.drizzle.team/docs
- Paystack : https://paystack.com/docs/api/

**Étape 4 — Isoler le problème**

```
Ignore tout le reste du projet.
Concentre-toi UNIQUEMENT sur cette fonction de [N] lignes :
[CODE ISOLÉ]
Le bug est : [description précise]
```

**Étape 5 — Ajouter des console.log stratégiques**

```
Le code compile sans erreur mais le résultat est [X] au lieu de [Y].
Ajoute des console.log stratégiques pour déboguer étape par étape.
```

---

## Les 5 Règles Anti-Gaspillage de Tokens

### Règle 1 — Une tâche = une conversation
Ne pas tout mettre dans une seule session. Chaque feature = nouvelle conversation avec le contexte minimal nécessaire.

### Règle 2 — Coller seulement le code pertinent
Pas besoin de coller 500 lignes si le bug est dans une fonction de 20 lignes. Isoler avant de coller.

### Règle 3 — Demander du pseudocode d'abord
```
Explique l'approche en pseudocode avant de coder.
Je veux valider la logique avant de générer du vrai code.
```

### Règle 4 — Template de prompt économique
```
// ❌ Mauvais (gaspille des tokens)
"Voici tout mon projet [500 lignes]. J'ai un bug quelque part, trouve-le."

// ✅ Bon (ciblé)
"Stack : Next.js 15, Supabase, TypeScript.
Fichier : app/api/payment/route.ts
Problème : [erreur précise]
Code concerné : [20 lignes max]
Question : [question précise]"
```

### Règle 5 — Contexte permanent dans les Projects IA
Mettre ARCHITECTURE.md, CONSTRAINTS.md, et le template de prompt dans les Projects de l'IA. Plus besoin de recoller à chaque fois.

---

## Exemple Complet — Ajouter la Feature "Alertes Email"

### Étape 1 — Analyse d'impact
```
Je veux ajouter des alertes email automatiques quand un bien correspondant
aux critères sauvegardés d'un client est mis en ligne.
Fichiers impactés : biens (insert trigger), recherches_sauvegardees (lecture),
notifications (insert), emails (envoi Resend).
```

### Étape 2 — TASKS.md
```markdown
## [En cours] F21 — Alertes Email Biens Correspondants
**Priorité :** normale
**MVP :** 2
**Critères :**
- [ ] Trigger DB au INSERT sur biens
- [ ] Vérifier les critères de chaque recherche sauvegardée
- [ ] Envoyer email via Resend si correspondance
- [ ] Notification in-app aussi
```

### Étape 3 — Branche
```bash
git checkout -b feature/F21-alertes-email-biens
```

### Étape 4 — Développement
```sql
-- 1. Trigger Supabase
CREATE OR REPLACE FUNCTION notifier_nouveaux_biens()
RETURNS TRIGGER AS $$
BEGIN
  -- Appeler une Edge Function pour envoyer les emails
  PERFORM net.http_post(
    url := current_setting('app.supabase_functions_url') || '/notify-matching-biens',
    body := json_build_object('bien_id', NEW.id)::text
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER on_bien_inserted
  AFTER INSERT ON biens
  FOR EACH ROW EXECUTE FUNCTION notifier_nouveaux_biens();
```

### Étapes 5–7
```bash
# Tester → Commit → PR → Mettre à jour ARCHITECTURE.md
```

---

*Ce fichier est le guide de référence pour tout ajout de feature.*  
*Dernière mise à jour : Mai 2026*
