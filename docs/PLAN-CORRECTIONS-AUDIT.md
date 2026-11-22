# Anyilo — Plan de corrections issu de l'audit « investisseur sceptique »

> Date : 2026-11-22 · Source : audit du code du 2026-11-22 (`memoire-favor/fourtour/2026-11-22_audit_investisseur_sceptique.md`)
> Domaines : production `https://anyilo.com` · préproduction `https://preprod.anyilo.com`
> Règle : chaque lot passe d'abord en préproduction, est validé avec le cahier de recette, puis part en production.

## 0. Déjà fait (2026-11-22)

| Réf. | Élément | État |
| :--- | :--- | :--- |
| F-01 | Marque officielle **Anyilo** partout (code, textes, logos, documentation, emails `@anyilo.com`) | ✅ Fait — migration de données `0026` prête |
| F-02 | **Tout paiement en ligne retiré** : plus aucune passerelle ni agrégateur (code, routes, CSP, variables, documentation) | ✅ Fait |
| F-03 | **Connexion Google retirée** (email + mot de passe ou OTP uniquement) | ✅ Fait dans le code — désactiver aussi le fournisseur Google dans Supabase |
| F-04 | Règle d'acompte affichée unifiée (vente 10 %, location 1 mois), réglée hors plateforme | ✅ Fait |
| F-05 | Préproduction exclue des moteurs de recherche | ✅ Fait |
| F-07 | **Fonctions hors cœur supprimées** : FNE, contrats, tâches et dossiers internes, agenda des agents et iCal, pages « Communauté » et « Offres VIP » ; réservations confirmées par simple changement de statut | ✅ Fait |
| F-06 | Migrations `0025` (colonnes de paiement neutres) et `0026` (marque) appliquées en préproduction | ⛔ Bloqué : la base Supabase ne répond plus (projet en pause ou supprimé) |

Inventaire complet des fonctionnalités, MVP et fonctionnalités à forte valeur : voir `docs/FEATURES-PRIORITES-MVP.md`.

## 1. Priorité 1 — Confiance et fonctions annoncées mais absentes (semaine 1–2)

| Réf. | Problème constaté | Correction | Effort | Critère d'acceptation |
| :--- | :--- | :--- | :---: | :--- |
| P1-01 | Badge « Particulier Vérifié » affiché pour **tout** annonceur sans organisation, même non vérifié | Afficher « Particulier » par défaut ; « Vérifié » seulement si KYC validé (`profiles.kyc_status = 'valide'`) | 0,5 j | Un particulier sans KYC n'a plus le badge vérifié |
| P1-02 | **Alertes de recherche jamais envoyées** : événements `ALERTE_CORRESPONDANCE`, `BIEN_VALIDE`, `BIEN_REJETE`, `SIGNALEMENT_TRAITE` déclarés sans traitement | Implémenter les 4 branches dans `src/lib/notifications/service.ts` (in-app + email + push) ; déclencher aussi l'alerte quand un bien est publié directement par le staff | 4–5 j | Test 21.4 du cahier passe à OK |
| P1-03 | Recherche : texte saisi injecté tel quel dans le filtre `.or(...)` (risque de requête cassée ou détournée) | Échapper `,()%` ou passer par une fonction SQL `search_biens()` paramétrée | 1 j | Une recherche « a,b) » ne provoque ni erreur 500 ni résultat hors filtre |
| P1-04 | Pas de limite de débit sur les routes publiques (`/api/biens`, signalement, contact) | Appliquer `checkRateLimit` (Upstash, déjà présent) | 1 j | 429 au-delà du seuil |
| P1-05 | Annonces jamais retirées automatiquement | Champ `expire_le` (60 j location / 120 j vente), cron de relance au propriétaire puis masquage | 2 j | Une annonce non confirmée disparaît après échéance |
| P1-06 | Base Supabase de préproduction injoignable | Réactiver le projet (Supabase > Restore) ou en créer un nouveau, puis appliquer les migrations `0025` et `0026` | 0,5 j | `/api/health/supabase` répond OK |

## 2. Priorité 2 — Modèle de revenus : paiement au nombre de clients obtenus (semaine 2–4)

Décision : **pas de paiement en ligne pour les locataires et les acheteurs, pas d'abonnement mensuel.** L'annonceur paie Anyilo **en fonction du nombre de clients** que la plateforme lui a apportés.

| Réf. | Élément | Action | Effort |
| :--- | :--- | :--- | :---: |
| P2-01 | Définir ce qu'est un « client » facturable | **À décider** : un contact (clic WhatsApp ou appel), une demande de visite, une réservation, ou un bail signé ? (voir questions) | — |
| P2-02 | Comptage | Table `leads` : annonce, annonceur, canal (WhatsApp, appel, visite, réservation), date, client (si connecté) ; enregistrement à chaque action de contact | 4 j |
| P2-03 | Anti-fraude du comptage | 1 client = 1 personne par annonce sur 30 jours ; exclusion des clics de l'annonceur lui-même | 1 j |
| P2-04 | Relevé mensuel | Écran admin et annonceur : nombre de clients, détail, montant dû ; export PDF ou Excel | 3 j |
| P2-05 | Encaissement | Hors plateforme au départ (virement, Mobile Money vers ton compte) ; le relevé sert de facture | — |
| P2-06 | Tarif | À tester, par exemple 2 000 à 5 000 FCFA par client qualifié (location) et un forfait plus élevé pour une vente ou un terrain | — |

Seuil de rentabilité indicatif : ~700 000 FCFA de charges par mois ⇒ ~175 à 350 clients facturés par mois selon le tarif retenu.

## 3. Priorité 3 — Expérience mobile et pertinence (semaine 5–8)

| Réf. | Élément | Action | Effort |
| :--- | :--- | :--- | :---: |
| P4-01 | Recherche sans pertinence ; « Aucun bien trouvé » sec | Score simple (écart au budget, commune, critères) + suggestions « communes voisines / budget +15 % » | 3 j |
| P4-02 | Pages lourdes (framer-motion, lenis, recharts sur pages publiques) | Mesurer (Lighthouse 3G), retirer les animations des pages publiques, viser < 300 Ko JS | 3 j |
| P4-03 | Hors-ligne : seules les ressources statiques en cache | Mettre en cache les dernières annonces consultées et favoris | 2 j |
| P4-04 | Alertes WhatsApp / SMS | Intégrer un fournisseur (ex. WhatsApp Business API) après P1-02 | 4 j |
| P4-05 | Visite vidéo / plan | Champ vidéo obligatoire pour badge « Annonce vérifiée terrain » | 2 j |

## 4. Priorité 4 — Terrain et croissance (en parallèle, non technique)

| Réf. | Élément | Objectif |
| :--- | :--- | :--- |
| P5-01 | Stock d'annonces vérifiées | 300–500 annonces dans 2–3 communes (Cocody, Yopougon, Bingerville) avant l'acquisition de locataires |
| P5-02 | Test de prix | 10 agences rencontrées, 3 abonnements payants signés |
| P5-03 | Vérification foncière | Partenariat géomètre / notaire pour un visa « terrain vérifié » réel (aujourd'hui : simple contrôle de document) |
| P5-04 | Mesure | Tableau : annonces actives, visiteurs, contacts WhatsApp, réservations, revenus — chaque semaine |

## 5. Mise en ligne Anyilo (prérequis techniques)

1. Préproduction : projet Vercel lié à `preprod.anyilo.com`, `NEXT_PUBLIC_APP_URL=https://preprod.anyilo.com`, base Supabase séparée de la production.
2. Appliquer les migrations `0025` et `0026` en préproduction, tester, puis en production.
3. DNS : `anyilo.com` et `www.anyilo.com` → Vercel production ; `preprod.anyilo.com` → Vercel préproduction.
4. Resend : vérifier le domaine `anyilo.com` (SPF, DKIM) pour `noreply@`, `contact@`, `facturation@`.
5. Supabase Auth : ajouter `https://anyilo.com/**` et `https://preprod.anyilo.com/**` aux URL de redirection autorisées, et **désactiver le fournisseur Google** (Authentication > Providers).
6. Renommer le dépôt GitHub et le projet Vercel (facultatif, actuellement `ImmOfika`).
