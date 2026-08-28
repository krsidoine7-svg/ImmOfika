# Journal de Session — 28 Août 2026 (Session 105)

## 📌 Sujet & Demande Utilisateur
Demande d'explication détaillée sur le fonctionnement du script [`scripts/migrate_full_project.ts`](file:///c:/Users/Toto.ADMINISTRATOR/Desktop/Krsidoine Automatisations/SAAS/IMMOPRO/scripts/migrate_full_project.ts) créé pour cloner / pousser la base de données PostgreSQL d'un Projet A vers un Projet B.

## 📝 Explications & Fonctionnement du Script
1. **Source (Projet A)** :
   - Extrait l'ensemble des 27 tables définies dans `src/lib/db/schema.ts` via Drizzle ORM et `postgres-js`.
   - Se connecte via `DATABASE_URL`.
   - Génère un fichier snapshot JSON complet dans `scripts/exports/snapshot_latest.json`.

2. **Destination (Projet B)** :
   - Si `DEST_DATABASE_URL` est configuré dans `.env.local`, se connecte au Projet B.
   - Pousse l'ensemble des données par lots (chunks de 50 lignes) avec `onConflictDoNothing()`.

## 🔒 Sécurité
Variables sensibles masquées avec placeholders (`{{DATABASE_URL}}`, `{{DEST_DATABASE_URL}}`).
