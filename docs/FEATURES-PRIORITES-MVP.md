# Anyilo — Inventaire des fonctionnalités, priorités et MVP

> Date : 2026-11-22 · Base : lecture du code (routes `src/app`, actions serveur, schéma `src/lib/db/schema.ts`).
> Modèle économique retenu : **aucun paiement sur le site pour les locataires et les acheteurs.** Les annonceurs (agences, propriétaires, promoteurs) **paient Anyilo en fonction du nombre de clients obtenus**, **sans abonnement mensuel**.
> Légende de l'état : ✅ fonctionne · ⚠️ existe mais incomplet ou défaillant · ❌ n'existe pas.

## 1. Toutes les fonctionnalités, par priorité

### 🔴 URGENT — bloque le lancement, la confiance ou le modèle de revenus

| # | Fonctionnalité | État | Pourquoi c'est urgent |
| :-- | :--- | :---: | :--- |
| U1 | **Base Supabase de préproduction joignable** | ❌ | Le domaine du projet ne répond plus (pause ou suppression). Sans base, le site n'a pas de données. |
| U2 | **Comptage des clients par annonceur** (chaque contact WhatsApp, appel, demande de visite ou réservation est enregistré et rattaché à l'annonce et à l'annonceur) | ❌ | C'est la base de ta facturation. Sans comptage fiable, pas de revenus. |
| U3 | **Relevé mensuel par annonceur** (nombre de clients, détail, montant dû) avec export PDF ou Excel | ❌ | Ce que tu envoies à l'annonceur pour être payé. |
| U4 | Badge « Particulier Vérifié » corrigé (vérifié seulement après KYC validé) | ⚠️ | Aujourd'hui il est trompeur : risque juridique et de confiance. |
| U5 | Recherche protégée (texte saisi échappé) et limite de requêtes sur les routes publiques | ⚠️ | Faille technique exploitable. |
| U6 | Annonces périmées retirées automatiquement (date d'expiration et relance de l'annonceur) | ❌ | Les annonces déjà louées tuent la confiance. |
| U7 | Mentions légales et identité réelles d'Anyilo (RCCM, NCC, adresse, téléphone) dans `src/config/site.ts` | ⚠️ | Les valeurs actuelles semblent fictives. |

### 🟠 IMPORTANT — fait revenir les utilisateurs et donne de la valeur aux annonceurs

| # | Fonctionnalité | État |
| :-- | :--- | :---: |
| I1 | Alertes de recherche réellement envoyées (email + notification, puis WhatsApp) | ⚠️ déclarées, jamais envoyées |
| I2 | Notifications de modération à l'annonceur (annonce validée ou refusée) et au signaleur | ⚠️ déclarées, non traitées |
| I3 | Demande de visite en 1 clic depuis la fiche (créneau, téléphone) | ⚠️ module visites présent côté admin |
| I4 | Tableau de bord annonceur : vues, contacts et clients par annonce | ⚠️ partiel (KPIs de base) |
| I5 | Recherche pertinente (score, communes voisines et budget élargi si aucun résultat) | ❌ |
| I6 | Version mobile légère (moins d'animations, pages < 300 Ko, cache hors-ligne des favoris) | ⚠️ |
| I7 | Partage d'une annonce sur WhatsApp (lien et aperçu propres) | ⚠️ |
| I8 | Vérification terrain (badge « visité par Anyilo », photos datées) | ❌ |

### 🟢 SECONDAIRE — utile mais peut attendre après les premiers revenus

| # | Fonctionnalité | État |
| :-- | :--- | :---: |
| S1 | Dossier candidat (solvabilité, pièces) | ✅ |
| S2 | KYC (pièce d'identité) | ✅ |
| S3 | Favoris | ✅ |
| S4 | Biens à proximité (GPS) | ✅ |
| S5 | Chatbot (arbre de questions) | ✅ |
| S6 | Newsletter | ✅ |
| S7 | Page d'accueil configurable (admin vitrine) | ✅ |
| S8 | Promoteurs en vedette avec interrupteur général | ✅ |
| S9 | Organisation et équipe d'agence (inviter des négociateurs) | ✅ |
| S10 | Application installable (PWA) et notifications push | ✅ |
| S11 | Analytics internes (audiences, tunnels, flux) | ✅ |

### ⚫ SUPPRIMÉ le 2026-11-22 (hors du cœur « mise en relation »)

| # | Fonctionnalité | Ce qui reste |
| :-- | :--- | :--- |
| G1 | Facturation électronique FNE (certification DGI, QR code, avoirs) | Historique des paiements en lecture seule |
| G2 | Génération et suivi de contrats (modèles, contrat scanné, signature) | Bail ou compromis signé directement avec l'annonceur |
| G3 | Dossiers et tâches internes (kanban), agenda des agents et synchronisation iCal | Demande de visite conservée, créneaux calculés sur les visites existantes |
| G4 | Pages client « Communauté » et « Niveau d'offre » (VIP) | — |
| G5 | Matrice de rôles avancée (RBAC hybride) | Conservée telle quelle, ne plus l'étendre |

Les tables correspondantes restent en base (aucune donnée supprimée).

## 2. MVP — le minimum pour lancer et facturer

Objectif : **une personne trouve un logement en moins de 2 minutes, contacte l'annonceur, et ce contact est compté pour ta facturation.**

| # | Brique du MVP | Existe déjà ? | Travail restant |
| :-- | :--- | :---: | :--- |
| M1 | Recherche par commune, budget et type, avec carte | ✅ | Protéger la recherche (U5) |
| M2 | Fiche bien : photos, prix, quartier, carte, contact WhatsApp et appel | ✅ | — |
| M3 | Compte annonceur (propriétaire, agence, promoteur) et publication d'annonce | ✅ | — |
| M4 | Modération avant publication et signalement d'annonce | ✅ | Notifications (I2) |
| M5 | **Comptage des contacts et clients par annonceur** | ❌ | U2 (≈ 4 jours) |
| M6 | **Relevé mensuel et montant dû par annonceur** | ❌ | U3 (≈ 3 jours) |
| M7 | Badge vérifié honnête | ⚠️ | U4 (≈ 0,5 jour) |
| M8 | Expiration automatique des annonces | ❌ | U6 (≈ 2 jours) |
| M9 | Pages légales et identité réelles | ⚠️ | U7 (≈ 0,5 jour, après tes informations) |

**Effort technique estimé pour le MVP : 10 à 12 jours**, plus la remise en route de la base (U1).
Tout ce qui n'est pas dans cette liste peut être caché du menu pour le lancement, sans être supprimé.

## 3. Fonctionnalités à forte valeur ajoutée (différenciation)

Classées par rapport valeur / effort. Ce sont elles qui distinguent Anyilo d'Immo+ (application mobile uniquement, sans recherche web ni vérification foncière visible).

| Rang | Fonctionnalité | Valeur | Effort |
| :---: | :--- | :--- | :---: |
| 1 | **Alertes WhatsApp** « nouvelle maison qui correspond à ta recherche » | Raison n°1 de revenir ; le canal que tout le monde utilise à Abidjan | 4–5 j |
| 2 | **Badge « Visité par Anyilo »** (agent passé sur place, photos datées et géolocalisées) | Répond directement à la peur des arnaques ; difficile à copier car demande du terrain | 3 j + terrain |
| 3 | **Vérification foncière réelle des terrains** (ACD contrôlé par un géomètre ou notaire partenaire) | Différenciation forte sur les terrains, là où les arnaques coûtent le plus cher | 2 j + partenariat |
| 4 | **Preuve de résultat pour l'annonceur** (tableau « X personnes vous ont contacté via Anyilo ») | Justifie ta facture, rend le paiement au résultat acceptable | inclus dans U2/U3 |
| 5 | **Annonce toujours à jour** (l'annonceur confirme « toujours disponible » par WhatsApp tous les 7 jours, sinon masquée) | Fin des annonces fantômes | 2 j |
| 6 | **Recherche sans résultat intelligente** (« 3 maisons à Bingerville à 10 % au-dessus de ton budget ») | Moins d'abandons | 3 j |
| 7 | **Fiche quartier** (loyer moyen, transport, eau et électricité, sécurité) | Contenu utile et trouvable sur Google, que les groupes Facebook n'ont pas | 3 j + données |
| 8 | **Mode ultra-léger** pour connexions lentes | Accessible à tout le monde, même en 2G/3G | 3 j |
