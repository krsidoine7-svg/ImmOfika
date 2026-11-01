# Log Brut Session 129 — Étape 10 : Mobile Money & Notifications Multi-Canaux

* Date : 01 Novembre 2026
* Environnement : Local Windows / Staging Supabase
* Opérateur : Lead Dev IA Antigravity pour {{USER_NAME}}

## 1. Actions Réalisées
- Consolidation du calcul de l'acompte légal de réservation dans `src/app/actions/paiements.ts` et `src/app/api/webhooks/paystack/route.ts` :
  - Vente : exigence stricte de 10% d'acompte légal consigné sous séquestre notarié.
  - Location : exigence d'1 mois de loyer mensuel en guise de caution d'engagement.
  - Rejet côté serveur de toute transaction sous-évaluée.
- Sécurisation du Webhook Paystack :
  - Vérification cryptographique HMAC-SHA512.
  - Idempotence transactionnelle.
  - Verrouillage automatique de l'annonce (`statut = 'reserve'`) et de la réservation (`statut = 'confirme'`).
  - Notification conjointe de l'acquéreur, du propriétaire annonceur et des administrateurs.
- Extension du service de notifications multi-canaux (`src/lib/notifications/service.ts`) :
  - Support des types `'moderation'` et `'alerte'` dans `creerNotificationHelper`.
  - Dispatch des événements `BIEN_VALIDE` (avec badge visa ACD) et `BIEN_REJETE` (avec motif obligatoire).
  - Événement `SIGNALEMENT_TRAITE` informant l'auteur du signalement de l'arbitrage.
  - Événement `ALERTE_CORRESPONDANCE` matching les acquéreurs ayant une alerte active (commune, type, transaction, budget).
- Suite de tests unitaires :
  - `tests/unit/payments-notifications.test.ts` (4/4 tests réussis).
  - Vitest globale : **67/67 tests au vert** sur 14 suites de tests.
  - TypeScript : 0 erreur (`npx tsc --noEmit`).
- Documentation et recette :
  - Ajout du **Module 21** dans `docs/CAHIER-DE-RECETTE.md` (4 scénarios P1, 0 erreur, 0 avertissement linter). Total : **94 scénarios**.
  - Régénération de `docs/CAHIER-DE-RECETTE.docx`.
  - Mise à jour des sections 4.4 et 4.5 dans `docs/GUIDE-UTILISATEUR-ADMIN.md`.

