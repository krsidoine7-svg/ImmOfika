# Journal de Session — 28 Août 2026 (Session 106)

## 📌 Sujet & Demande Utilisateur
Exécution de la duplication et du clonage de la base de données source (`DATABASE_URL`) vers la base destination (`DEST_DATABASE_URL`) avec la commande `npm run db:migrate-full`.

## 📝 Résultats & Validation
1. **Extraction Source (DATABASE_URL)** :
   - Total extrait : 27 tables balayées.
   - 50 biens, 26 profils, 99 permissions de rôles, 17 réservations, 14 paiements, 153 notifications, 19 leads, 38 interactions, 14 tâches, 16 visites, 10 souscriptions push, etc.
   - Snapshot JSON généré : `scripts/exports/snapshot_latest.json`.

2. **Injection Destination (DEST_DATABASE_URL)** :
   - Injection réussie par lots (chunks de 50 enregistrements).
   - `onConflictDoNothing()` a protégé les doublons d'ID.
   - Statut final : **MIGRATION COMPLÈTE ET INJECTION RÉUSSIE VERS LA BASE DESTINATION !**

## 🔒 Sécurité
Les identifiants et clés de bases de données restent sécurisés via les variables d'environnement (`{{DATABASE_URL}}`, `{{DEST_DATABASE_URL}}`).
