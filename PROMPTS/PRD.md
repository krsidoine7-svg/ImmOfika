# PRD — Product Requirements Document
## Favor Company International — Plateforme Immobilière SaaS

> **Version :** 1.0  
> **Date :** Mai 2026  
> **Statut :** Draft  
> **Auteur :** Favor Company International  
> **Contact :** Favorcompanyint@gmail.com | +225 2724370155

---

## 1. Vision Produit

### 1.1 Résumé Exécutif
Favor Company International est un promoteur immobilier agréé basé à Abidjan (Yaho, Immeuble face à la Maison Blanche, 2ème étage, Côte d'Ivoire). La plateforme est un **SaaS immobilier africain tout-en-un** couvrant : site vitrine e-commerce, CRM intégré, gestion des biens, paiements en ligne (Paystack / Mobile Money), génération de contrats, pipeline de vente, et administration multi-rôles.

### 1.2 Objectifs Business
- Générer de la notoriété et inspirer confiance auprès des prospects
- Produire des leads qualifiés et augmenter les ventes
- Digitaliser toutes les opérations du promoteur immobilier agréé (de la visite à la signature du contrat)
- Ouvrir vers un modèle SaaS multi-promoteurs/agences (V3/V4)

### 1.3 Cibles
| Segment | Description |
|---|---|
| Particuliers | Personnes physiques souhaitant se loger, acheter un terrain ou une maison |
| Personnes morales | Entreprises souhaitant acquérir des biens immobiliers |
| Agences/Promoteurs partenaires | Autres agences/promoteurs immobiliers partenaires |
| Agents internes | Équipe Favor Company (agents, admins, RH, tech) |

---

## 2. Services Favor Company

- Lotissement & aménagement foncier
- Études et travaux de topographie
- Gestion des biens immobiliers
- Achat et vente de biens meubles et immeubles
- Intermédiation commerciale
- Commerce général
- Construction & vente de matériel de construction
- Achat et vente de terrains
- Achat et vente de produits agricoles

---

## 3. Personas Utilisateurs

### 3.1 CLIENT (visiteur / prospect → acheteur)
- Arrive sur le site via recherche, réseaux sociaux, ou lien direct
- Consulte les biens disponibles (terrains, maisons, lotissements)
- Réserve une visite et/ou un bien
- Paie en ligne (acompte, 1/3, total)
- Suit son dossier dans un espace client
- Reçoit des notifications et relances automatiques

### 3.2 AGENT (admin_agent)
- Chargé du suivi des dossiers clients
- Gère les leads qualifiés qui lui sont attribués
- Suit les visites et les étapes du pipeline
- Communique avec les clients par téléphone / message
- Envoie des liens de paiement et des contrats

### 3.3 ADMIN FONCTIONNEL (admin)
- Supervise les agents et les dossiers
- Gère les biens (ajout, modification, statuts)
- Accède aux statistiques et rapports
- Configure les droits de base

### 3.4 ADMIN MANAGER (admin_manager)
- Gère les équipes (agents, admins)
- Accède aux KPIs et tableaux de bord globaux
- Valide les paiements et les contrats importants
- Gère les promotions et annonces

### 3.5 SUPER ADMIN / CRÉATEUR (super_admin)
- Droits complets sur toute la plateforme
- Crée et gère tous les comptes
- Configure le système globalement

### 3.6 ADMIN TECHNIQUE (tech_super_admin)
- Gère l'infrastructure, les webhooks, l'API
- Accède à la documentation technique et aux logs
- Configure les intégrations (Paystack, Resend, etc.)

### 3.7 ADMIN RH (admin_rh)
- Gère les profils des collaborateurs
- Suit les performances des agents
- Accède aux rapports RH

### 3.8 PARTENAIRE
- Compte temporaire configurable
- Peut ajouter et gérer ses propres biens
- Voit ses statistiques et commissions

---

## 4. Fonctionnalités Requises

### 4.1 Site Vitrine (Front-end Public)

#### Page d'Accueil
- Hero section avec animation vidéo / 3D / scrolling effect
- Accroche percutante + sous-titre + 2 boutons CTA côte à côte
- Section "À propos" de l'entreprise
- Section équipe (photo, nom, fonction, LinkedIn, description du poste)
- Section biens avec : nom, prix, image(s), vidéo, description, document annexe, bouton Réserver, statut, localisation, m², taille
- Section FAQ
- Section avis clients
- Section Call To Action
- Footer complet
- Navbar : logo gauche + liens sections

#### Page Produit (style e-commerce)
- Nom du bien, description complète
- Galerie multi-images + vidéo
- Bouton Réserver / Acheter
- Notation par étoiles
- Nombre de vues
- Avis clients
- Mots-clés / tags
- Localisation + carte interactive (Maps)
- PDF annexe téléchargeable
- Biens suggérés (même catégorie + source de traffic)
- Section tous les biens + bouton "Voir plus"
- Slug unique par bien (URL SEO-friendly)

#### Recherche & Filtres
- Recherche par prix, ville, zone, type de bien
- Carte interactive avec géolocalisation
- Recherche géolocalisée
- Filtres avancés (surface, statut, catégorie)
- Sauvegarde des recherches
- Favoris
- Alertes email sur nouveaux biens correspondants

#### Authentification
- Inscription : nom, prénom, email, téléphone, mot de passe
- Connexion : email/password, Google OAuth, téléphone + OTP
- Mot de passe oublié + OTP
- Confirmation email
- Option "Rester connecté"
- Double authentification (2FA)

### 4.2 Espace Client
- Tableau de bord personnel
- Suivi des réservations et dossiers
- Historique des paiements
- Documents (contrats, factures)
- Messagerie avec l'agent assigné
- Profil et préférences

### 4.3 CRM & Pipeline de Vente

#### Pipeline en 8 étapes
1. Prospect / Lead entrant
2. Lead qualifié
3. Visite planifiée
4. Visite effectuée
5. Négociation
6. Offre acceptée
7. Contrat signé
8. Vente finalisée

#### Gestion des Leads
- Leads entrants via site web → qualification automatique
- Attribution automatique à un agent
- Suivi des interactions (appels, emails, WhatsApp)
- Scoring client
- Historique complet par client
- Relances automatiques (WhatsApp / email)

#### Gestion des Clients
- Fiche client complète (infos, documents, historique)
- Stockage de tous les numéros et emails
- Notes et commentaires internes
- Statut du dossier en temps réel

#### 4.3.5 Smart Delete & Impact Radio (Sécurité métier)
- Analyse automatique des dépendances avant toute suppression d'un objet "parent" (agent, client, bien).
- Affichage d'une boîte de dialogue détaillée montrant les conséquences (nombre de dossiers bloqués, de paiements orphelins, etc.).
- Suggestion de transfert de responsabilité (ex: réattribuer les clients à un autre agent) directement dans la modale.
- Historisation de la décision prise lors de la suppression.

### 4.4 Gestion des Biens (Stock)

#### Catalogue Biens
- Types : terrain, maison, appartement, lotissement
- Informations : nom, description, prix, surface (m²), localisation, images, vidéo, documents PDF
- Statuts : Disponible, Réservé, Vendu, En négociation
- Slug unique (lien direct)
- Protection anti-double réservation simultanée (verrou transactionnel)
- Géolocalisation sur carte interactive

#### Réservation
- Paiement d'un acompte pour réserver (montant 1/3 de la somme)
- Réservation valable 3 mois maximum
- 3 relances automatiques :
  - À 2 mois après la réservation
  - 2 semaines avant l'échéance
  - 2 semaines après l'échéance
- Si non finalisé : statut → Disponible
- Si +1 mois après les 3 mois : remboursement de 87% de l'acompte (après 2 relances espacées de 2 semaines)

### 4.5 Paiements (Paystack)

#### Modalités
- Paiement en une fois (lien de paiement direct)
- Paiement en plusieurs fois (modalités discutées avec le client)
- Paiement du 1/3 à la réservation
- Paiement par carte, Mobile Money (Orange Money, MTN MoMo, Wave)

#### Automatisation
- Génération et envoi automatique du lien de paiement
- Calcul automatique du prochain paiement
- Relance 1 semaine avant l'échéance
- Stockage des transactions en base de données

#### Factures
- Génération automatique de factures légalisées (normes ivoiriennes + internationales)
- Numéro FNE / RNE
- Format PDF téléchargeable et exportable

### 4.6 Génération de Documents

#### Contrats
- Génération de contrats au format Markdown / Word (.docx) / PDF
- Titres de différentes tailles, listes à puces, liens, citations
- Signature électronique intégrée
- Hachage cryptographique (intégrité du document — le document ne peut pas être falsifié)
- Envoi pour signature
- Stockage sécurisé (Cloudflare)
- Ajout automatique en base de données et CRM après signature
- Notification automatique aux admins concernés

#### Formulaires
- Génération et envoi de formulaires personnalisés (style Tally)
- Choix des champs : texte court, texte long, liste déroulante, tags, case à cocher, etc.
- Remplissage en ligne par le client
- Stockage des réponses

### 4.7 Base de Données Visuelle (Style Airtable)

- Vue **Grid** (tableau classique)
- Vue **Calendar** (calendrier)
- Vue **Kanban** (pipeline)
- Vue **Gallery** (galerie)
- Vue **Graph / Graphe**
- Ajout de lignes et colonnes librement
- Types de champs : texte court, texte long, liste déroulante, tag, case à cocher, date, nombre, relation, email, téléphone, fichier
- Modification des champs en double-cliquant
- Filtres avancés
- Relations entre lignes et colonnes
- Exportation (PDF, CSV, Excel)

### 4.8 Gestion des Dossiers & Tâches
- Création et gestion de dossiers clients
- Ajout, suppression, modification de tâches
- Suivi et progression (avec pourcentage)
- Gestion des blocages
- Vues : Kanban, Tableau, Grid, Calendrier
- Attribution de clients à un agent
- Statistiques de progression par dossier

### 4.9 Notifications & Communication
- Notifications en temps réel (in-app)
- Notifications email (via Resend)
- Notifications WhatsApp (relances automatiques)
- Notifications SMS (OTP, confirmations)
- Alertes admin à chaque étape clé

### 4.10 Chatbot IA (Agent RAG)
- Présent sur toutes les pages du site
- Base de connaissances alimentée par les données Favor Company
- Répond à toutes les questions utilisateur (biens, services, prix, processus, etc.)
- Disponible 24h/24
- Escalade vers un agent humain si nécessaire

---

## 5. Permissions & RBAC (Role-Based Access Control)

### Principe
Les droits sont attribués **élément par élément** (jamais en bloc). Pour chaque fonctionnalité et section, on peut cocher ou décocher individuellement :

| Permission | Description |
|---|---|
| `voir` | L'élément/section apparaît dans l'interface |
| `ne_pas_voir` | L'élément/section est masqué |
| `lire` | Consultation des données |
| `écrire` | Création de nouvelles entrées |
| `modifier` | Édition des entrées existantes |
| `supprimer` | Suppression d'entrées |
| `masquer` | Masquer un élément aux autres |
| `exporter` | Téléchargement en PDF/CSV/Excel |
| `ne_pas_exporter` | Exportation bloquée |
| `envoyer` | Envoi d'emails/liens |
| `transférer` | Transfert de dossier/paiement |
| `télécharger` | Téléchargement de fichiers |
| `exécuter` | Déclencher une action/automatisation |
| `ajouter_admin` | Créer des comptes admin |
| `créer_compte` | Créer des comptes utilisateurs |

### Sections contrôlables par permission
- Dashboard (statistiques, KPIs)
- Biens (ajout, modification, suppression, statuts)
- Clients / CRM
- Paiements (voir, modifier, envoyer lien, transférer, exporter)
- Factures (voir, télécharger, exporter)
- Contrats (générer, envoyer, signer, stocker)
- Agents (attribuer, voir performances)
- Utilisateurs (créer, modifier, supprimer, voir)
- Modération
- Annonces
- Droits & Accès
- Leads
- Commandes & Réservations
- Rapports & Exports
- Section paiement (voir / ne pas voir / modifier / supprimer / consulter / envoyer / transférer / télécharger / exporter)
- Paramètres

---

## 6. Dashboards par Rôle

### Dashboard Commun (selon droits)
- Statistiques et KPIs
- Paiements
- Modération
- Utilisateurs
- Gestion des droits et accès
- Annonces
- Produits / Biens
- Promotions & Services
- CRM + Leads
- Envoi de mails
- Numéros de téléphone (stockage et leads)
- Commandes & Réservations
- Ajout de comptes admin spécifiques
- Extraction (PDF, CSV, Excel)
- Upload de PDF
- Documentation API
- Automatisation (webhooks)
- Attribution de droits spécifiques
- Envoi via Resend

### KPIs à surveiller
- Chiffre d'affaires (mensuel, trimestriel, annuel)
- Bénéfices nets
- Nombre de leads entrants
- Taux de conversion lead → vente
- Nombre de visites planifiées / effectuées
- Biens disponibles / réservés / vendus
- Taux de rétention client
- Performance par agent
- Heatmap des zones les plus demandées
- Scoring client moyen

---

## 7. Conformité Légale & Réglementaire

### Normes Ivoiriennes
- Factures FNE / RNE conformes
- Conformité loi ivoirienne sur la protection des données personnelles (Loi n°2013-450)
- ACD (Attestation de Cession de Droit) et Titre Foncier
- Conformité OHADA pour la comptabilité et les contrats
- CGU, Politique de confidentialité, Mentions légales, Conditions Générales de Vente
- Clauses éthiques et déontologiques

### Sécurité des Données
- Chiffrement AES-256-GCM pour les données sensibles (CNI, numéros de téléphone, données financières)
- Hachage bcrypt pour les mots de passe
- Protection CSRF
- Rate limiting sur l'API
- Validation des inputs avec Zod
- Audit injection SQL
- Vérification des RLS policies (Supabase)
- Scan des clés exposées côté client
- Validation des webhooks côté serveur (jamais côté client)

---

## 8. Intégrations Tierces

| Service | Usage |
|---|---|
| **Paystack** | Paiements en ligne (carte, Mobile Money) |
| **Supabase** | Base de données, auth, storage, RLS |
| **Cloudflare** | Stockage d'images et fichiers |
| **Resend** | Envoi d'emails transactionnels |
| **Google Analytics** | Tracking et analytics |
| **Sentry / LogSnag** | Monitoring et alertes d'erreurs |
| **PostHog** | Analytics produit et comportement utilisateur |
| **WhatsApp API** | Relances automatiques |
| **Google Maps** | Géolocalisation et carte interactive |
| **Google OAuth** | Connexion sociale |
| **n8n** | Automatisation des workflows |

---

## 9. Contraintes Non-Fonctionnelles

- Performance : temps de chargement < 2s (LCP)
- Disponibilité : 99.9% uptime
- Responsive : mobile-first, compatible tablette et desktop
- Accessibilité : WCAG 2.1 niveau AA
- SEO : métadonnées, sitemap, slugs optimisés
- Multilingue : Français (principal), Anglais (futur)
- Sécurité : OWASP Top 10 couvert

---

## 10. Hors Scope (MVP)

- Application mobile native (React Native — V3+)
- Multi-promoteurs / multi-agences SaaS (V3+)
- Visites virtuelles 360° (V2+)
- Module comptabilité OHADA avancé (V2+)
- IA de pricing automatique (V3+)

---

*Document vivant — à mettre à jour à chaque itération.*
