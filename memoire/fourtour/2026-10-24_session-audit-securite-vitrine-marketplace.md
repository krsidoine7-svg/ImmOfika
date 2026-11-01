# Journal de Session — Audit de Sécurité, Durcissement & Vitrine Marketplace Multi-Catégories

**Date :** 2026-10-24  
**Plateforme :** ImmOfika (Promoteur & Marketplace Immobilière Agréée)  
**Auteur :** Antigravity Tech Lead  

---

## 1. Contexte & Objectifs de la Session
* Réalisation d'un audit complet en lecture seule (cartographie, rôles, sécurité, UX et code quality).
* Élimination des 4 failles de sécurité critiques identifiées lors de l'audit.
* Mise en place des bonnes pratiques (rate limiting anti-bot, validation stricte d'uploads, CORS et allowed origins).
* Refonte de la présentation des produits sur la page d'accueil sous forme de marketplace multi-catégories (Maisons à louer, Résidences à louer, Appartements à vendre, Terrains à vendre).
* Ajout du bouton « Publier une annonce » et du parcours annonceur.

---

## 2. Actions Techniques Réalisées

### A. Sécurité Critique (Phase A)
1. **Colmatage IDOR sur les reçus de paiement (`/api/export/recu/[id]`) :**
   * Authentification obligatoire via Supabase SSR.
   * Vérification stricte que l'utilisateur est soit membre du staff (admin/agent), soit le payeur ou titulaire de la réservation.
2. **Protection du flux agenda iCal (`/api/agenda/[agentId]/export.ics`) :**
   * Création de `src/lib/calendar/token.ts` avec génération de jetons HMAC SHA-256 déterministes par agent.
   * Blocage des accès non autorisés (401) pour empêcher le scraping des numéros de téléphone et noms des prospects.
3. **Exclusion des identifiants stockés en clair :**
   * Mise à jour de `.gitignore` avec les masques `COMPTES_ACCES*`.
   * Dé-indexation Git des fichiers sensibles contenant des accès de test.
4. **Protection des pièces d'identité KYC :**
   * Ajout de `uploadSecureToR2` et `getSecureR2Object` dans `src/lib/r2/client.ts` stockant dans `private/kyc/`.
   * Création de la route proxy sécurisée `/api/kyc/[userId]/document` restreinte au propriétaire du document et aux modérateurs staff.

### B. Bonnes Pratiques & Durcissement (Phase B)
1. **Origines Server Actions (`next.config.ts`) :**
   * Ajout de `localhost:5000`, `127.0.0.1:5000`, `immofika.ci`, `www.immofika.ci`, `immofika-psi.vercel.app`.
2. **Rate Limiting & Honeypot (`src/lib/security/rateLimiter.ts`, `src/app/actions/leads.ts`) :**
   * Implémentation d'un limiteur glissant (Sliding window) avec support Upstash Redis et repli in-memory.
   * Ajout d'un champ piège invisible `website_hp` bloquant les soumissions de robots publicitaires.
3. **Validation stricte des fichiers uploadés (`src/lib/security/fileValidation.ts`) :**
   * Liste blanche : PDF, Word, JPG, PNG, WebP avec plafond à 5 Mo et blocage des scripts/exécutables.

### C. Vitrine Produits & Marketplace Multi-Catégories (Phase C)
1. **Architecture déclarative et extensible (`src/types/marketplace.ts`) :**
   * Modèle `MarketplaceBien` et registre `MARKETPLACE_CATEGORIES` (Maisons, Résidences, Appartements, Terrains).
2. **Requêtes serveur parallèles (`src/app/actions/marketplaceCategories.ts`) :**
   * `getMarketplaceShowcaseAction` chargeant les 4 catégories simultanément avec exclusion du soft-delete.
3. **Composant réutilisable `MarketplacePropertyCard.tsx` :**
   * Badges de confiance (Promoteur Agréé, Agence Agréée, Particulier).
   * Prix en FCFA avec `/mois` pour locations.
   * Bouton « Contacter » avec fenêtre modale directe (WhatsApp, appel et formulaire anti-spam).
4. **Section interactive `CategoryShowcaseSection.tsx` & Page d'accueil :**
   * Onglets tactiles ergonomiques avec compteurs d'annonces en direct.
   * Bouton « Voir plus » redirigeant vers le catalogue filtré.
5. **Portail Annonceur & Navigation (`Navbar.tsx` & `/biens/publier`) :**
   * Bouton permanent « Publier une annonce » en desktop et mobile.
   * Hub d'orientation pour les bailleurs et agences partenaires.

---

## 3. Données Sensibles Masquées (Conformité)
* URLs Supabase et DB : `{{SUPABASE_URL}}`, `{{DATABASE_URL}}`
* Clés d'API et secrets : `{{PAYSTACK_SECRET_KEY}}`, `{{RESEND_API_KEY}}`, `{{R2_SECRET}}`
* Téléphones annonceurs : `{{PHONE_CONTACT}}`

---

## 4. Résolution des Logs Terminaux & Nettoyage du Cache
* **Éradication des 404 sur `/vercel.svg` et `/next.svg` :** Corrigé dans `public/sw.js` (mise à jour de `ASSETS_TO_CACHE`).
* **Correction des 3 erreurs TypeScript bloquant la compilation :**
  1. `src/app/api/formulaires/submit/route.ts` : suppression de la redéclaration de variable `ipAddress`.
  2. `src/app/api/kyc/[userId]/document/route.ts` : conversion de `byteArray` en `Buffer.from(byteArray)` pour compatibilité BodyInit.
  3. `src/components/public/ContactForm.tsx` : ajout de `website_hp: ''` dans l'état de reset.
* **Purge du cache Turbopack corrompu `.next` :**
  * Validation stricte via `npx tsc --noEmit` : **0 erreur (code 0)**.
  * L'ensemble des routes (`/`, `/admin`, `/auth/login`, `/biens`, `/api/version`) sont à nouveau correctement indexées.

---

## 5. Module de Détection Géographique & Recommandation de Biens Proches
* **Référentiel des Communes Ivoiriennes (`src/config/communes.ts`) :**
  - Cartographie exhaustive des communes d'Abidjan (Cocody, Marcory, Yopougon, Plateau, Bingerville, Port-Bouët, Koumassi, Treichville, Adjamé, Abobo, etc.) et villes principales de Côte d'Ivoire avec coordonnées GPS et alias de quartiers.
  - Formule de Haversine intégrée pour calcul de distance orthodromique instantané en kilomètres sans API tierce payante.
* **Action Serveur `getNearbyBiensAction` (`src/app/actions/nearbyBiens.ts`) :**
  - Filtrage intelligent des biens par proximité géographique ou commune sélectionnée.
  - Tri par distance croissante et fallback dynamique vers les communes voisines.
* **Composant UI `NearbyPropertiesSection.tsx` (`src/components/public/NearbyPropertiesSection.tsx`) :**
  - Badge interactif vert menthe avec statut de commune active.
  - Déclencheur GPS (`navigator.geolocation`) en 1 clic pour mobile et ordinateur.
  - Modal de sélection manuelle rapide avec filtre en temps réel.
  - Puces d'accès direct aux communes populaires.
  - Cartes d'annonces réutilisables avec badge de distance (`À ~X km` ou `Dans votre commune`), contact direct WhatsApp/Téléphone et lien vers le catalogue filtré.
  - Mémorisation locale (`localStorage`) pour conserver la commune lors des prochaines visites.
* **Intégration Page d'Accueil & Barre de recherche (`src/app/page.tsx`, `FloatingSearchBar.tsx`) :**
  - Préchargement serveur sur la homepage pour un affichage instantané sans saut de mise en page.
  - Bouton raccourci « Ma commune » dans la barre de recherche rapide.

---

## 6. Unification dans la Vitrine Unique (`MarketplaceShowcaseSection.tsx`)
* **Problème résolu :** La page d'accueil comportait 3 sections distinctes et redondantes pour afficher les biens (Proximité, Catégories, et BiensSection), provoquant un scroll inutilement long et une fragmentation des produits.
* **Architecture unifiée :**
  - Création de [src/components/public/MarketplaceShowcaseSection.tsx](file:///c:/Users/Toto.ADMINISTRATOR/Desktop/Krsidoine%20Automatisations/SAAS/IMMOFIKA/src/components/public/MarketplaceShowcaseSection.tsx) regroupant :
    1. L'en-tête dynamique avec contrôle de géolocalisation intégré (`📍 Commune : Cocody (Changer)` + `Me géolocaliser`).
    2. La barre d'onglets unifiée : **« 📍 Près de vous »** + **« Maisons à louer »** + **« Résidences à louer »** + **« Appartements à vendre »** + **« Terrains à vendre »**.
    3. Les puces de communes populaires en accès rapide pour l'onglet proximité.
    4. La grille compacte de 3 à 6 cartes avec badges annonceurs, prix FCFA, distance et contact immédiat WhatsApp/Téléphone.
    5. Le bouton « Voir plus » redirigeant vers le catalogue filtré et le bouton « Publier une annonce ici ».
  - Suppression des composants redondants dans `src/app/page.tsx` pour une expérience fluide et un taux de conversion maximal.

---

## 7. Statut & Prochaines Étapes Conseillées
* Plateforme ultra-propre, unifiée, 0 régression TypeScript, build et tests validés.
* Expérience utilisateur fluide : 1 seule vitrine centrale, intuitive sur mobile et desktop.
