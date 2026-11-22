# Fourtour - 2026-11-22 - Audit "investisseur sceptique" (lecture seule)

## Demande
Répondre aux 20 questions de `hum.txt` (marché, différenciation, UX, contexte CI, rentabilité, risques) en se basant sur le code réel.

## Constats vérifiés dans le code (aucune modification de code)
- Recherche `/api/biens` : filtres SQL simples (ilike/gte/lte), tri récent/prix/surface, pagination 12. Aucun score de pertinence, aucun élargissement si 0 résultat.
- `src/lib/notifications/service.ts` : les événements `BIEN_VALIDE`, `BIEN_REJETE`, `SIGNALEMENT_TRAITE`, `ALERTE_CORRESPONDANCE` sont déclarés mais SANS branche de traitement -> les alertes de recherche ne sont jamais envoyées (contredit la session 129).
- Acompte : `paiements.ts` impose 10% du prix pour tout ; le webhook Paystack exige 1 mois de loyer pour une location -> incohérence (réservation location reste non confirmée après paiement par défaut).
- Badge "Particulier Vérifié" affiché pour tout annonceur sans organisation, même `verified: false`.
- `statut_moderation` par défaut = 'valide' en base ; le code d'insertion force 'en_attente' pour les non-staff.
- Aucun modèle de revenus implémenté (pas d'abonnement, boost, commission). Seule rétention : 13% sur remboursement d'acompte (`refund.ts`). `featuredUntil` jamais utilisé.
- Paystack : canaux `card` + `mobile_money`, pas de subaccount/split -> fonds encaissés sur le compte plateforme.
- Pas de SMS/WhatsApp sortant (seulement liens wa.me), notifications = email Resend + web push.
- Pas de mode hors-ligne réel (SW ne cache que les assets statiques).
- Tests de charge locust : hérités d'un autre projet, sur localhost, routes obsolètes -> non probants.
- Rate limiting seulement sur l'auth.

## Décision
Réponse livrée en conversation, pas de fichier de rapport créé.

## Suite de session — Rebranding Anyilo & retrait Paystack
- Nom officiel : Anyilo. Domaines : anyilo.com (prod), preprod.anyilo.com (préprod).
- Paystack entièrement retiré du code ; agrégateur CinetPay désactivable (admin + PAYMENTS_ENABLED).
- Migrations à appliquer manuellement : 0025 (colonnes paiement + fonction relances + libellé permission), 0026 (données de marque + emails des comptes @anyilo.com).
- .env.local : clés {{PAYSTACK_*}} retirées, variables CINETPAY_* vides ajoutées ; copie de sauvegarde dans le scratchpad de session.
- Conservés volontairement : URL GitHub du dépôt, URL Vercel existantes, migrations 0000–0024 (historique), outil générique tchor-rectte-pr.
- Concurrence : immoplus.ci analysé (landing d'app mobile, commission 25 % mois d'agence / 2,5–10 % ventes) ; tylimmo.com en erreur 522, non analysé.
- Serveur local lancé sur le port 6001 (le port 6000 est réservé et refusé par Next.js).

## Suite 2 — Retrait de tout paiement en ligne et de la connexion Google
- Décision utilisateur : aucun agrégateur (CinetPay supprimé à son tour), aucun abonnement ; revenus = paiement par les annonceurs au nombre de clients obtenus.
- Supprimés : src/lib/payments/{cinetpay,config,status,confirm}.ts, /api/webhooks/paiement, /api/paiements/retour, /paiement/confirmation, PaymentButton, actions/paiements.ts, interrupteur admin, CSP de paiement, variables {{CINETPAY_*}} et {{GOOGLE_CLIENT_*}} de .env.local.
- Connexion Google retirée de /auth/login et /auth/register (reste à désactiver le fournisseur dans Supabase).
- Tableau de bord client : message « acompte réglé directement avec l'annonceur ». Confirmation des réservations : manuelle via /admin/reservations.
- Migrations 0025/0026 NON appliquées : le domaine Supabase {{PROJECT_REF}} ne résout plus (projet en pause ou supprimé). Script prêt dans le scratchpad de session.
- Mots de passe de test conservés dans le cahier (recette en cours, à retirer plus tard).
- Nouveaux docs : docs/FEATURES-PRIORITES-MVP.md ; plan mis à jour.
- Validation : tsc 0 erreur, vitest 66/66, cahier 22 modules / 96 tests, lint 0/0, DOCX régénérés.

## Suite 3 — Suppression des fonctions hors cœur
- Supprimés : FNE (src/lib/fne, fneActions, factures, FacturePDF, FactureEmail, test-facture, fne.test), contrats (actions contrat/contrats/contractTemplates/templates, page paramètres templates, TemplatesManagerClient, UploadContratModal, AgentStickyContractBanner, ContratEmail), dossiers & tâches (page /admin/dossiers, actions dossiers/kanban-taches, DossiersManagerClient, TachesKanban, e2e crm.spec), agenda & iCal (page /admin/agenda, AgendaSettingsForm, AgendaStats, api agenda export.ics, test-ical, src/lib/calendar, disponibilites.test), pages /client/communaute et /client/offres.
- Conservés et simplifiés : demande de visite (créneaux calculés sur les visites existantes), KPIs agents (sans iCal), /admin/reservations (sélecteur de statut ; confirme -> bien réservé, annule/expire -> bien disponible), /admin/paiements (historique sans FNE).
- Tables en base conservées (aucune donnée supprimée).
- Validation : tsc 0 erreur, ESLint 0 erreur sur les fichiers modifiés, vitest 56/56, cahier 22 modules / 95 tests lint 0/0, DOCX régénérés.

## Suite 4 — Refonte de l'accueil « à l'essentiel »
- Skills lus : minimalist-skill, equipe-site-web, taste-skill (règles : une action principale, aucune preuve inventée, contenu tiré du sujet), ui-ux-pro-max, design-system.
- Nouvel accueil : Hero (recherche GET vers /biens avec transaction/commune/type/prixMax), Annonces récentes, Comment ça marche + encadré anti-arnaque, Avis après visite (réels uniquement, masqué si vide), CTA annonceurs, FAQ honnête (details/summary, sans JS).
- Bug corrigé : l'ancienne barre de recherche envoyait location/budget, ignorés par /biens.
- Fuite corrigée : getPublicAvisTemoignages renvoyait l'email des clients au navigateur ; désormais prénom + initiale.
- Supprimés : AboutSection, TestimonialsSection (faux avis + fausses photos Unsplash), ServicesSection, ExplainerVideoSection, Preloader3D, FeaturedPartnersSection (3 faux partenaires), FloatingSearchBar, CategoryShowcaseSection, BiensSection, NearbyPropertiesSection, BlurText x2, Reveal ; onglets admin hero/vidéo/à propos/expertises/témoignages/faq/cta ; faux badge « 2 000+ clients ».
- Menu et pied de page : retrait « À propos », « Services » (gestion locative, lotissement… inexistants), ajout « Comment ça marche ».
- Migration 0027_homepage_essentiel.sql (non appliquée : base injoignable).
- Validation : tsc 0, vitest 56/56, cahier 98 tests lint 0/0, captures 390/820/1440 sans débordement horizontal.
- Pré-existant non corrigé : 2 erreurs ESLint react-hooks dans MarketplaceShowcaseSection.

## Suite 5 — Photos derrière le titre de l'accueil
- 3 vraies photos d'Abidjan trouvées via taste-skill/assets.mjs (Wikimedia Commons) : Plateau depuis le pont ADO (CC BY 4.0, E. McCullen), Riviera Golf (CC BY 2.0, W. S. Awaho), coucher de soleil Riviera (CC BY-SA 4.0, G. H. Njiale Njiale).
- Converties en WebP dans public/hero/ (85–218 Ko), fondu CSS 18 s (globals.css), désactivé si prefers-reduced-motion, voile sombre, crédits avec liens sous la recherche.
- Docs : guide §4.0, cahier test 2.9.
