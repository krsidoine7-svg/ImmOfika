# GITHUB.md — Workflow Git & CI/CD
## Favor Company International

---

## 1. Structure des Branches

```text
main                      ← [PROD] La version stable que tes clients utilisent.
  │                         (Interdit de coder ici directement !)
  │
  ├── develop             ← [DEV] Le brouillon principal. C'est ici que tu regroupes 
  │     │                   tout ton travail avant de le mettre en ligne.
  │     │
  │     ├── feature/F01   ← [TRAVAIL] Branches temporaires pour créer une seule chose
  │     ├── feature/F02     précise (ex: F02 pour l'auth). Tu la supprimes quand 
  │     └── ...             c'est fini et fusionné dans 'develop'.
  │
  ├── hotfix/urgence      ← [URGENCE] Branche de secours pour réparer un bug grave 
  │                         directement en prod sans attendre.
  │
  └── release/v1.0        ← [LIVRAISON] Phase de test final avant de passer du 
                            mode 'brouillon' (develop) au mode 'en ligne' (main).
```

---

## 2. Convention de Commits (Conventional Commits)

```bash
# Format
<type>(<scope>): <description courte>

# Types
feat:     Nouvelle fonctionnalité
fix:      Correction de bug
docs:     Documentation
style:    Formatage (pas de logique)
refactor: Refactoring (pas de nouvelle feature)
test:     Ajout ou modification de tests
chore:    Maintenance (deps, config)
perf:     Amélioration de performance
security: Correctif de sécurité

# Exemples
feat(biens): add property reservation modal with payment integration
fix(auth): correct OTP expiration handling
docs(readme): update installation instructions
security(webhook): add Paystack signature validation
feat(crm): implement kanban pipeline with drag and drop
fix(payments): handle failed payment webhook correctly
```

---

## 3. Workflow Feature

```bash
# 1. Créer une branche depuis develop
git checkout develop
git pull origin develop
git checkout -b feature/F04-catalogue-biens

# 2. Développer la feature (commits réguliers)
git add .
git commit -m "feat(biens): add property listing page with filters"
git commit -m "feat(biens): add property detail page with gallery"
git commit -m "feat(biens): add map integration for property location"
git commit -m "test(biens): add unit tests for property filtering"

# 3. Push et Pull Request
git push origin feature/F04-catalogue-biens

# 4. Créer une PR vers develop sur GitHub
# - Titre clair : "feat(biens): Catalogue biens avec filtres et carte"
# - Description : ce qui a été fait, comment tester
# - Lier à la tâche TASKS.md correspondante

# 5. Après merge, supprimer la branche
git branch -d feature/F04-catalogue-biens
git push origin --delete feature/F04-catalogue-biens
```

---

## 4. GitHub Actions — CI/CD

```yaml
# .github/workflows/ci.yml
name: CI

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main, develop]

jobs:
  lint-and-type-check:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'
      - run: npm ci
      - run: npm run lint
      - run: npm run type-check

  test:
    runs-on: ubuntu-latest
    needs: lint-and-type-check
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'
      - run: npm ci
      - run: npm run test
        env:
          NEXT_PUBLIC_SUPABASE_URL: ${{ secrets.TEST_SUPABASE_URL }}
          NEXT_PUBLIC_SUPABASE_ANON_KEY: ${{ secrets.TEST_SUPABASE_ANON_KEY }}

  security-scan:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - run: npm audit --audit-level=high
      - name: Scan for exposed secrets
        run: |
          # Vérifier qu'aucune clé API n'est exposée côté client
          grep -r "PAYSTACK_SECRET_KEY" ./app --include="*.ts" --include="*.tsx" && exit 1 || echo "OK"
          grep -r "SUPABASE_SERVICE_ROLE_KEY" ./app --include="*.ts" --include="*.tsx" && exit 1 || echo "OK"

  build:
    runs-on: ubuntu-latest
    needs: [lint-and-type-check, test]
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'
      - run: npm ci
      - run: npm run build
        env:
          NEXT_PUBLIC_SUPABASE_URL: ${{ secrets.NEXT_PUBLIC_SUPABASE_URL }}
          NEXT_PUBLIC_SUPABASE_ANON_KEY: ${{ secrets.NEXT_PUBLIC_SUPABASE_ANON_KEY }}
```

---

## 5. Secrets GitHub à Configurer

Aller dans `Settings > Secrets and variables > Actions` et ajouter :

```
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY
SUPABASE_SERVICE_ROLE_KEY
PAYSTACK_SECRET_KEY
NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY
PAYSTACK_WEBHOOK_SECRET
RESEND_API_KEY
ENCRYPTION_KEY
CLOUDFLARE_R2_ACCESS_KEY_ID
CLOUDFLARE_R2_SECRET_ACCESS_KEY
SENTRY_DSN
```

---

## 6. Protection de la branche main

```
Settings > Branches > Branch protection rules > main

☑ Require a pull request before merging
☑ Require approvals: 1
☑ Require status checks to pass before merging
  - lint-and-type-check
  - test
  - build
☑ Require branches to be up to date before merging
☑ Do not allow bypassing the above settings
```

---

## 7. .gitignore

```gitignore
# Dependencies
node_modules/
.pnp
.pnp.js

# Next.js
.next/
out/
build/

# Environment variables — CRITIQUE
.env
.env.local
.env.development.local
.env.test.local
.env.production.local

# Debug
npm-debug.log*
yarn-debug.log*
yarn-error.log*

# Vercel
.vercel

# TypeScript
*.tsbuildinfo
next-env.d.ts

# IDE
.vscode/
.idea/
*.swp
*.swo

# OS
.DS_Store
Thumbs.db

# Tests
coverage/
playwright-report/
test-results/

# Misc
*.log
.cache/
```

---

## 8. Commandes Utiles

```bash
# Setup initial
git clone https://github.com/azertyyt/FavorCI.git
cd FavorCI
npm install
cp .env.example .env.local
# Remplir .env.local avec les vraies valeurs

# Développement
npm run dev                    # Serveur de dev
npm run build                  # Build production
npm run start                  # Serveur production local
npm run lint                   # Vérification ESLint
npm run type-check             # Vérification TypeScript
npm run test                   # Tests unitaires
npm run test:e2e               # Tests E2E (Playwright)

# Base de données
npm run db:generate            # Générer les migrations Drizzle
npm run db:migrate             # Appliquer les migrations
npm run db:studio              # Interface Drizzle Studio
npm run db:seed                # Insérer les données de référence

# Git utiles
git log --oneline -20          # Historique compact
git stash                      # Sauvegarder les changements temporairement
git stash pop                  # Restaurer les changements
git cherry-pick <commit-hash>  # Appliquer un commit spécifique
```

---

## 9. README.md du Projet

```markdown
# Favor Company International — Plateforme Immobilière

Plateforme SaaS immobilière pour le marché ivoirien.

## Stack
- Next.js 15 (App Router) + React 19
- TypeScript strict
- Tailwind CSS v4 + shadcn/ui
- Supabase (PostgreSQL + Auth + Storage)
- Drizzle ORM
- Paystack (paiements)
- Cloudflare R2 (stockage)
- Resend (emails)
- Vercel (déploiement)

## Démarrage

```bash
git clone https://github.com/azertyyt/FavorCI.git
cd FavorCI
```
npm install
cp .env.example .env.local
# Configurer .env.local
npm run db:migrate
npm run db:seed
npm run dev


## Documentation
- [PRD.md](./docs/PRD.md) — Spécifications fonctionnelles
- [ARCHITECTURE.md](./docs/ARCHITECTURE.md) — Architecture technique
- [SECURITY.md](./docs/SECURITY.md) — Politique de sécurité
- [ROADMAP.md](./docs/ROADMAP.md) — Plan de développement
- [DB_SCHEMA.md](./docs/DB_SCHEMA.md) — Schéma de base de données
```

---

*Workflow Git v1.0 — Mai 2026*
