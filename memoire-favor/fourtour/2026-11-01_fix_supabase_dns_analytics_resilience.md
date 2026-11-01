# Fourtour - 2026-11-01 - Résilience Analytics & Diagnostic DNS Supabase

## 1. Contexte du problème
Erreurs répétitives observées dans les logs de l'application Next.js :
```
[cause]: Error: getaddrinfo ENOTFOUND db.{{SUPABASE_PROJECT_REF}}.supabase.co
    errno: -3008, code: 'ENOTFOUND', syscall: 'getaddrinfo'
POST /api/analytics 500
GET /client/profil 200 / GET /client/dashboard
```

## 2. Causes identifiées
1. **Mise en veille Supabase (Projet gratuit)** : Après 7 jours d'inactivité, Supabase met automatiquement le projet en pause et supprime les entrées DNS du domaine `db.{{PROJECT_REF}}.supabase.co`.
2. **Dépréciation IPv4 Supabase sur la connexion directe (port 5432)** : Supabase a basculé les connexions directes vers IPv6 uniquement. Si l'environnement ou le FAI ne supporte pas nativement l'IPv6, la résolution DNS échoue (`ENOTFOUND`). La solution officielle recommandée par Supabase est d'utiliser l'URL du **Connection Pooler (Supavisor)** :
   `postgresql://postgres.{{PROJECT_REF}}:{{PASSWORD}}@aws-0-{{REGION}}.pooler.supabase.com:6543/postgres?pgbouncer=true` (ou port 5432 mode session).
3. **Fragilité de la route `/api/analytics`** : La route renvoyait une erreur 500 lorsqu'une insertion SQL échouait, ce qui polluait la console du navigateur lors des changements de page client.

## 3. Actions correctives appliquées
- **`src/app/api/analytics/route.ts`** : Insertion enveloppée dans des `try/catch` distincts avec retour HTTP 200 `{ success: false, warning: "Database unavailable" }` et journalisation `console.warn`. La télémétrie ne bloque plus la navigation.
- **`src/lib/db/index.ts`** : Ajout de l'option `prepare: false` sur le client `postgres-js` afin d'éviter tout conflit avec le Connection Pooler Supabase en mode transactionnel (PgBouncer/Supavisor).
- **Validation** : 67/67 tests Vitest passés avec succès.

