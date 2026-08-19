# ROADMAP.md — Plan de Bataille
## Favor Company International

> **Approche :** Feature by feature — Tester chaque feature avant de passer à la suivante  
> **Principe :** Build → Test → Commit → Next Feature

---

## Vue d'Ensemble

```
MVP_1 (Semaines 1-5)  → Fondations, Auth, Biens, Paiements, Admin de base
MVP_2 (Semaines 6-10) → CRM, Pipeline, Leads, Agents, Notifications
MVP_3 (Semaines 11-16)→ Contrats, Formulaires, Base de données visuelle, Chatbot IA
MVP_4 (Semaines 17-22)→ SaaS multi-promoteurs/agences, Mobile, Analytiques avancées
```

---

## MVP_1 — Fondations & Core (Semaines 1-5)

### Objectif
Avoir un site fonctionnel avec : catalogue de biens, réservation, paiement, et un backoffice admin de base.

### Features par ordre de développement

#### F01 — Setup du projet
- [ ] Initialisation Next.js 15 + TypeScript strict
- [ ] Configuration Tailwind CSS v4
- [ ] Installation shadcn/ui + lucide-react
- [ ] Configuration Supabase (DB + Auth + Storage)
- [ ] Configuration Drizzle ORM + schema initial
- [ ] Variables d'environnement sécurisées
- [ ] GitHub + CI/CD (GitHub Actions)
- [ ] ESLint + Prettier
- [ ] Structure des dossiers (voir TDD.md)
- **Test :** `npm run dev` tourne sans erreur, connexion Supabase OK

#### F02 — Authentification
- [ ] Page login (email/password)
- [ ] Page inscription (nom, prénom, email, téléphone, password)
- [ ] Google OAuth
- [ ] OTP (téléphone)
- [ ] Mot de passe oublié + reset
- [ ] Confirmation email (Resend)
- [ ] Middleware de protection des routes
- [ ] Session "Rester connecté"
- [ ] Rate limiting sur les endpoints auth
- **Test :** Inscription → Confirmation → Login → Déconnexion → Reset password

#### F03 — Page d'accueil (Front public)
- [ ] Navbar (logo gauche + liens sections)
- [ ] Hero avec animation (vidéo/3D/scroll effect)
- [ ] Section À propos
- [ ] Section Équipe
- [ ] Section Biens (affichage dynamique depuis DB)
- [ ] Section FAQ (accordéon)
- [ ] Section Avis clients
- [ ] Section CTA
- [ ] Footer complet
- [ ] SEO (meta tags, OG, sitemap)
- **Test :** Rendu responsive sur mobile, tablette, desktop. Performance LCP < 2.5s

#### F04 — Catalogue & Détail Biens
- [ ] Page liste des biens avec filtres (type, prix, ville, surface, statut)
- [ ] Barre de recherche
- [ ] Carte interactive (Google Maps)
- [ ] Page détail bien (slug unique)
- [ ] Galerie multi-images
- [ ] Vidéo intégrée
- [ ] Téléchargement PDF annexe
- [ ] Étoiles / notes / avis
- [ ] Nombre de vues (incrémentation)
- [ ] Biens suggérés (même catégorie)
- [ ] Bouton Réserver
- [ ] Favoris
- **Test :** Naviguer vers un bien via son slug, filtrer les biens, voir la carte

#### F05 — Système de Réservation
- [ ] Modal de réservation (connexion requise)
- [ ] Confirmation de réservation (boîte de dialogue)
- [ ] Protection anti-double réservation (transaction atomique PostgreSQL)
- [ ] Gestion des statuts de biens (disponible → réservé → vendu)
- [ ] Réservation avec acompte (1/3 du prix)
- [ ] Délai de 3 mois max
- [ ] Relances automatiques (3 relances : J+60, J-14 expiration, J+14 expiration)
- [ ] Remboursement 87% si dépassement (après 2 relances espacées de 2 semaines)
- **Test :** Deux utilisateurs tentent de réserver le même bien simultanément → seul le premier réussit

#### F06 — Paiements Paystack
- [ ] Intégration Paystack SDK
- [ ] Paiement en une fois (lien de paiement)
- [ ] Paiement acompte (réservation)
- [ ] Paiement mobile money (Orange Money, MTN MoMo, Wave)
- [ ] Webhook Paystack (validation de signature côté serveur)
- [ ] Mise à jour automatique des statuts après paiement
- [ ] Génération automatique de facture après paiement
- [ ] Envoi facture par email (Resend)
- [ ] Calcul et planification du prochain paiement
- [ ] Relance 1 semaine avant échéance
- **Test :** Paiement test → Webhook reçu et validé → Statut mis à jour → Facture reçue par email

#### F07 — Génération de Factures
- [ ] Template facture (normes ivoiriennes + internationales)
- [ ] Numéro FNE / RNE
- [ ] Export PDF (Cloudflare R2)
- [ ] Historique des factures dans l'espace client
- **Test :** Facture générée avec bon format, téléchargeable

#### F08 — Admin Dashboard (Base)
- [ ] Layout admin avec sidebar
- [ ] Dashboard principal (stats simples : biens, réservations, paiements)
- [ ] CRUD Biens (ajouter, modifier, supprimer, voir)
- [ ] Upload images/vidéos vers Cloudflare R2
- [ ] Gestion des utilisateurs (liste, voir, suspendre)
- [ ] Gestion des réservations (voir, modifier statut)
- [ ] Gestion des paiements (voir, exporter)
- [ ] Extraction (PDF, CSV, Excel)
- [ ] Paramètres de base
- **Test :** Admin peut créer un bien, le modifier, le supprimer. Voir les réservations

#### F09 — Espace Client
- [ ] Dashboard client (mes réservations, mes paiements, mes documents)
- [ ] Suivi du dossier en temps réel
- [ ] Téléchargement des factures
- [ ] Modification du profil
- **Test :** Client voit ses données uniquement (RLS validé)

#### F10 — Permissions RBAC (Base)
- [ ] Seed des rôles initiaux
- [ ] Seed des permissions granulaires
- [ ] Interface admin pour attribuer des permissions élément par élément
- [ ] Middleware de vérification des permissions sur les routes
- [ ] Composant HOC `<PermissionGate permission="biens.modifier">`
- **Test :** Un admin_agent ne peut pas accéder aux sections qu'il n'a pas le droit de voir

---

## MVP_2 — CRM & Pipeline (Semaines 6-10)

#### F11 — Gestion des Leads
- [ ] Formulaire de contact / lead capture sur le site
- [ ] Liste des leads dans le backoffice
- [ ] Scoring automatique des leads
- [ ] Attribution d'un lead à un agent
- [ ] Historique des interactions par lead
- [ ] Filtres et recherche avancée
- **Test :** Lead entrant → Qualifié → Attribué à un agent

#### F12 — Pipeline de Vente (8 étapes)
- [ ] Vue Kanban du pipeline
- [ ] Drag & drop entre les étapes
- [ ] Vue liste du pipeline
- [ ] Vue calendrier
- [ ] Filtres par agent, statut, date
- [ ] Statistiques du pipeline
- **Test :** Déplacer un lead de "Prospect" à "Visite Planifiée"

#### F13 — Gestion des Dossiers & Tâches
- [ ] Création de dossiers clients
- [ ] Ajout de tâches dans un dossier
- [ ] Attribution de tâches à des agents
- [ ] Vue Kanban des tâches
- [ ] Vue tableau, calendrier
- [ ] Progression du dossier (%)
- [ ] Gestion des blocages
- [ ] Deadline et alertes
- **Test :** Créer un dossier, ajouter 3 tâches, déplacer une tâche en "En cours"

#### F14 — Gestion des Visites
- [ ] Calendrier de réservation de visites
- [ ] Validation / refus de visite par l'admin
- [ ] Attribution d'un agent pour la visite
- [ ] Confirmation automatique (email + WhatsApp)
- [ ] Suivi automatique des rendez-vous
- [ ] Visites payantes (intégration Paystack)
- **Test :** Client réserve une visite → Agent reçoit une notification → Confirme → Client reçoit confirmation

#### F15 — Notifications & Communication
- [ ] Système de notifications in-app (temps réel via Supabase Realtime)
- [ ] Emails transactionnels (Resend) : confirmation, relance, alerte
- [ ] Relances automatiques WhatsApp
- [ ] Centre de notifications (marquer comme lu, archiver)
- **Test :** Paiement reçu → Notification in-app + email envoyé automatiquement

#### F16 — Rapports & KPIs
- [ ] Dashboard KPIs : CA, bénéfices, taux de conversion, nb leads
- [ ] Heatmap des zones demandées
- [ ] Scoring client
- [ ] Performance par agent
- [ ] Rapports exportables (PDF, CSV, Excel)
- **Test :** Voir les KPIs du mois courant, exporter en Excel

#### F25 — Système de Radiographie d'Impact UI (Smart Delete)
- [ ] Création d'un composant `ImpactDialog` réutilisable
- [ ] Analyse en temps réel des dépendances (ex: compter les clients liés à un agent avant suppression)
- [ ] Affichage des conséquences métier avant validation
- [ ] Option de transfert de données intégré à la boîte de dialogue
- **Test :** Tenter de supprimer un agent ayant des clients → Voir la radio s'afficher avec les chiffres corrects.

---

## MVP_3 — Documents, Airtable View, Chatbot (Semaines 11-16)

#### F17 — Génération de Contrats
- [ ] Template de contrat en Markdown
- [ ] Variables dynamiques (nom client, bien, montant, dates)
- [ ] Export Word (.docx) et PDF
- [ ] Hachage SHA-256 pour l'intégrité du document
- [ ] Envoi pour signature électronique
- [ ] Stockage sécurisé (Cloudflare R2)
- [ ] Ajout automatique en DB + CRM après signature
- [ ] Notification admins après signature
- **Test :** Générer un contrat de vente, l'envoyer, le signer, vérifier le hash d'intégrité

#### F18 — Générateur de Formulaires (style Tally)
- [ ] Interface de création de formulaires (champs configurables)
- [ ] Types de champs : texte court, texte long, liste déroulante, tag, case à cocher, date, fichier
- [ ] Partage par lien unique
- [ ] Collecte et stockage des réponses
- [ ] Export des réponses
- **Test :** Créer un formulaire de 5 champs, l'envoyer, remplir, voir les réponses en admin

#### F19 — Base de Données Visuelle (style Airtable)
- [ ] Vue Grid (tableau modifiable)
- [ ] Vue Calendar
- [ ] Vue Kanban
- [ ] Vue Gallery
- [ ] Vue Graph
- [ ] Ajout de lignes et colonnes
- [ ] Types de champs configurables (texte, nombre, date, liste déroulante, tag, relation)
- [ ] Modification des champs en double-cliquant
- [ ] Filtres avancés
- [ ] Relations entre tables
- [ ] Export (PDF, CSV, Excel)
- **Test :** Créer une vue grid, ajouter une colonne "Statut" de type tag, filtrer par statut

#### F20 — Chatbot IA (Agent RAG)
- [ ] Widget chatbot sur toutes les pages
- [ ] Base de connaissances (biens, services, FAQ, processus Favor Company)
- [ ] Réponses contextuelles (RAG)
- [ ] Escalade vers agent humain
- [ ] Historique des conversations
- **Test :** Poser une question sur un bien spécifique → Le bot répond avec les infos correctes

---

## MVP_4 — SaaS Multi-Promoteurs / Agences & Avancé (Semaines 17-22)

#### F21 — Multi-Tenancy (SaaS)
- [ ] Gestion de plusieurs promoteurs / agences (tenants)
- [ ] Isolation des données par promoteur/agence (RLS par tenant_id)
- [ ] Abonnements et facturation des promoteurs/agences
- [ ] Onboarding d'un nouveau promoteur/agence
- [ ] Configuration par promoteur/agence (logo, couleurs, domaine)

#### F22 — Gestion des Partenaires
- [ ] Compte partenaire avec accès limité
- [ ] Création de comptes temporaires configurables
- [ ] Dashboard partenaire (ses biens, ses commissions, ses statistiques)
- [ ] Gestion des commissions

#### F23 — Application Mobile (React Native)
- [ ] Consultation des biens
- [ ] Réservation de visites
- [ ] Suivi des dossiers
- [ ] Notifications push
- [ ] Paiement mobile money intégré

#### F24 — Automatisation Avancée (n8n / Webhooks)
- [ ] Workflows automatisés (n8n)
- [ ] Webhooks sortants configurables
- [ ] Documentation API publique (Scalar)
- [ ] SDK partenaires

---

## Règles de Développement

1. **Une feature = une branche Git** → `git checkout -b feature/F01-setup`
2. **Commit après chaque feature qui marche** → message clair et descriptif
3. **Test immédiat** → tester dans le navigateur après chaque bloc
4. **Jamais de code sur `main` directement**
5. **Mettre à jour TASKS.md** avant de coder une nouvelle feature
6. **Mettre à jour ARCHITECTURE.md** après avoir codé une feature

---

## KPIs de Lancement (MVP_1)

| KPI | Objectif |
|---|---|
| Inscriptions | 50 dans les 30 premiers jours |
| Réservations | 5 réservations dans les 30 premiers jours |
| Taux de conversion visite → réservation | > 20% |
| Temps de chargement moyen | < 2.5s |
| Uptime | > 99.5% |
