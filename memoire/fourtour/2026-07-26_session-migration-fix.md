# Addendum Migration PostgreSQL — Colonnes Contrats, Reçus & Visites (26 Juillet 2026)

## 📌 Problème Résolu
- **Erreur analysée** : `PostgresError: column "contrat_genere_url" does not exist` lors de l'accès à la route `/api/export/contrat/[reservationId]`.
- **Cause** : Le schéma Drizzle ORM comportait les nouvelles colonnes (`contrat_genere_url`, `contrat_genere_nom`, `contrat_statut`, `contrat_rejet_raison`, `signature_client_url`, `signed_at`, `signature_token`, `agrement_numero`, `notaire_nom`, `recu_numero`, `recu_url`, `cumul_paye`, `reste_a_payer`, `plage_horaire` et la table `visite_avis`), mais la base PostgreSQL distante n'avait pas encore reçu les requêtes DDL `ALTER TABLE`.

## 🛠️ Action Effectuée
- Création et exécution du script de migration `scripts/apply_contrat_and_visites_migration.ts`.
- Ajout sécurisé des 14 nouvelles colonnes et de la table `visite_avis` via des requêtes `ALTER TABLE ... ADD COLUMN IF NOT EXISTS` et `CREATE TABLE IF NOT EXISTS`.
- Résultat : Migration appliquée à 100% sans perte de données.
- Validation : Re-exécution de `npm run build` terminée avec succès (57/57 pages).
