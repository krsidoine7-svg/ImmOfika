# Journal de Session — 28 Août 2026

## 📌 Sujet & Demande Utilisateur
Création d'un outil unifié de migration, d'exportation et de ré-injection de données (Full Project Backup & Restore) avec Drizzle ORM et PostgreSQL pour ImmOfika.

## 📝 Actions & Réalisations
1. **Création du script unifié [`scripts/migrate_full_project.ts`](file:///c:/Users/Toto.ADMINISTRATOR/Desktop/Krsidoine%20Automatisations/SAAS/IMMOPRO/scripts/migrate_full_project.ts)** :
   - Extrait l'ensemble des 27 tables de la base de données source (`DATABASE_URL`).
   - Tolérance aux fautes activée (`safeFetchTable`) pour gérer les tables absentes sans faire planter le script.
   - Gestion de la compatibilité avec le Transaction Pooler Supabase (port 6543) via `{ prepare: false }`.
   - Exportation automatique des données au format JSON horodaté dans `scripts/exports/snapshot_latest.json`.
   - Support de la ré-injection directe vers une base destination `DEST_DATABASE_URL` par lot (chunks) avec `onConflictDoNothing()`.

2. **Ajout de la commande dans [`package.json`](file:///c:/Users/Toto.ADMINISTRATOR/Desktop/Krsidoine%20Automatisations/SAAS/IMMOPRO/package.json)** :
   - Ajout de la commande `npm run db:migrate-full` pour exécuter le script en 1 clic.

3. **Validation & Test d'exécution** :
   - Test d'exportation réussi avec 100% de succès : 50 biens, 26 profils, 17 réservations, 14 paiements, 19 leads, 153 notifications extraits et sauvegardés sans aucune perte.

## 🔒 Sécurité
Les identifiants et clés sensibles s'appuient sur les variables d'environnement (`{{DATABASE_URL}}`, `{{DEST_DATABASE_URL}}`).
