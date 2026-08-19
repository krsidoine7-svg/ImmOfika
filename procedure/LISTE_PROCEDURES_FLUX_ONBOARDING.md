# Répertoire et Nomenclature des Procédures, Flux & Onboarding
## Favor Company International — Promoteur Immobilier Agréé

Ce document recense exclusivement la liste officielle et les intitulés des différentes procédures, des flux métiers et des parcours d'intégration (onboarding) en vigueur sur la plateforme Favor Company International.

---

### 1. 🚀 Les Flux et Procédures d'Onboarding (Intégration & Inscription)
* **Onboarding Visiteur & Lead Direct** (Navigation catalogue public, demande de brochure PDF, interaction chatbot et soumission de formulaire de contact)
* **Onboarding Client par E-mail & Mot de passe** (Création de compte via `/auth/register`, vérification d'adresse e-mail par Supabase Auth et attribution du rôle `client`)
* **Onboarding Client par Google SSO** (Authentification rapide OAuth via `/auth/callback` et création instantanée de profil)
* **Onboarding & Complément de Profil Obligatoire** (Procédure modale d'enregistrement et de vérification du numéro de téléphone international pour les comptes SSO)
* **Onboarding & Configuration Agent Commercial** (Création de compte par la direction administrative, attribution du rôle `agent` et paramétrage du flux Google Calendar / iCal)

---

### 2. 🗺️ Les Flux Métier & Parcours de Vente Client
* **Flux de Demande et Planification de Visite** (Sélection de créneau sur agenda en ligne ➔ Routage automatique vers un agent disponible ➔ Notification Client/Agent ➔ Visite terrain ➔ Compte-rendu CRM)
* **Flux de Réservation Atomique de Bien (`reserver_bien_atomic`)** (Soumission d'intention d'achat sur `/client/reserver/[slug]` ➔ Blocage temporaire du lot ➔ Passage en statut `en_attente`)
* **Flux de Paiement en Ligne par Passerelle Paystack** (Règlement de l'acompte de 1/3 par Mobile Money [Wave, Orange Money, MTN MoMo] ou Carte bancaire ➔ Validation par Webhook ➔ Confirmation de réservation)
* **Flux de Paiement Hors-Ligne & Virement Bancaire** (Téléversement du bordereau de virement ou règlement espèces en agence ➔ Rapprochement et validation manuelle par l'administrateur financier)
* **Flux de Génération Documentaire & Contrat OHADA** (Émission automatique de la facture PDF signée ➔ Édition du contrat de réservation conforme au statut de Promoteur Immobilier Agréé)
* **Flux d'Expiration et Libération Automatique (Cron J+72h)** (Tâche planifiée de nettoyage libérant les lots non payés dans les délais impartis et réinitialisant leur statut à `disponible`)
* **Flux de Relances Automatisées des Réservations** (Cycle de relances par e-mail et WhatsApp à J+60, J+76 et J+104 avant résiliation légale et application des clauses contractuelles)

---

### 3. 💼 Les Procédures Opérationnelles Commerciales (CRM & Agents)
* **Procédure de Gating du Pipeline Prospect / Lead (F11)** (Règles conditionnelles et verrous de passage d'étapes : *Prospect ➔ Qualifié ➔ Visite effectuée ➔ Contrat signé ➔ Vente finalisée*)
* **Procédure de Synchronisation Bidirectionnelle iCal / Google Calendar (F08)** (Lecture des indisponibilités agents en continu toutes les 15 minutes et export agenda personnalisé `export.ics` vers mobiles)
* **Procédure de Soumission Résiliente Hors-Ligne (PWA / `useOfflineLeadSubmit`)** (Capture des leads dans le `localStorage` en cas de coupure de connectivité et synchronisation automatique au retour du réseau)

---

### 4. 🛡️ Les Procédures Administratives, Sécurité & Modération (Super Admin)
* **Procédure de Supervision LBC-FT et Anti-Blanchiment (F16)** (Inspection continue des comptes, transactions Paystack, factures et documents justificatifs selon la réglementation OHADA)
* **Procédure de Sanction Administrative ("Bannir / Suspendre")** (Restriction d'accès avec enregistrement d'un motif légal en base et affichage transparent sur la route dédiée `/suspended`)
* **Procédure de Diagnostic en Temps Réel & Santé Serveur (Health Check)** (Ping SQL continu, mesure de latence en millisecondes et détection d'arrêt ou de mise en pause de Supabase)
* **Procédure de Notification et Intégration Webhook Make.com** (Transmission automatisée et instantanée des alertes de santé système et rapports d'audit LBC-FT vers les scénarios Make.com)
* **Procédure de Gestion des Rôles et Permissions Granulaires (F14)** (Attribution et contrôle d'accès via matrice de permissions Drizzle : `client`, `agent`, `admin`, `super_admin`, `tech_super_admin`)
* **Procédure de Diffusion de Notifications Groupées (F15)** (Envoi de messages informatifs, promotionnels ou d'alerte par lots SQL avec ciblage par rôle et liens d'action)
* **Procédure de Traitement Manuel d'Encaissement en Agence** (Enregistrement par la direction d'un règlement en espèces ou par chèque et validation immédiate du dossier client)
