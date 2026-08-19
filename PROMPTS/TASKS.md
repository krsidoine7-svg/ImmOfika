# TASKS.md — Backlog des Tâches
## Favor Company International

> **Usage :** Ce fichier est la source de vérité des tâches en cours et à venir.  
> Mettre à jour avant de coder une feature et après l'avoir terminée.

---

## Légende
- ⬜ Todo
- 🔄 En cours
- ✅ Terminé
- ❌ Bloqué
- ⏸ En pause

---

## MVP_1 — Fondations & Core

### ✅ F01 — Setup du Projet
**Sprint :** Semaine 1 | **Estimé :** 1 jour | **Branche :** `feature/F01-setup`

**Critères d'acceptance :**
- [x] `npm run dev` tourne sans erreur
- [x] Connexion Supabase validée
- [x] GitHub + CI/CD actif
- [x] Build Next.js réussi
- [x] ESLint 0 erreur

**Notes :** Voir MVP_1.md §F01 pour les commandes complètes

---

### 🔄 F02 — Authentification
**Sprint :** Semaine 1 | **Estimé :** 2 jours | **Branche :** `feature/F02-auth`

**Critères d'acceptance :**
- [x] Inscription email/password + confirmation email
- [x] Connexion email/password
- [ ] Google OAuth
- [ ] OTP téléphone
- [ ] Reset mot de passe
- [ ] Middleware de protection des routes
- [ ] Rate limiting actif

---

### ✅ F03 — Page d'Accueil
**Sprint :** Semaine 2 | **Estimé :** 3 jours | **Branche :** `feature/F03-home`

**Critères d'acceptance :**
- [x] Hero section avec animation
- [x] Section équipe dynamique
- [x] Section biens (6 derniers)
- [x] FAQ accordéon
- [x] Avis clients
- [x] Footer + Navbar
- [x] Responsive + Performance LCP < 2.5s

---

### ⬜ F04 — Catalogue & Détail Biens
**Sprint :** Semaine 2–3 | **Estimé :** 3 jours | **Branche :** `feature/F04-catalogue`

**Critères d'acceptance :**
- [ ] Page liste avec filtres
- [ ] Recherche full-text
- [ ] Carte interactive
- [ ] Page détail (slug)
- [ ] Galerie images/vidéo
- [ ] PDF téléchargeable
- [ ] Biens suggérés
- [ ] Favoris
- [ ] Compteur de vues

---

### ⬜ F05 — Réservation
**Sprint :** Semaine 3 | **Estimé :** 2 jours | **Branche :** `feature/F05-reservation`

**Critères d'acceptance :**
- [ ] Modal de réservation
- [ ] Confirmation boîte de dialogue
- [ ] Anti-double réservation (atomique)
- [ ] Gestion des statuts
- [ ] Acompte 1/3
- [ ] 3 mois max + relances
- [ ] Remboursement 87%
- [ ] Email de confirmation

---

### ✅ F06 — Paiements Paystack
**Sprint :** Semaine 3–4 | **Estimé :** 2 jours | **Branche :** `feature/F06-paystack`

**Critères d'acceptance :**
- [x] Init paiement côté serveur
- [x] Webhook + validation signature
- [x] Update statuts après paiement
- [x] Facture auto générée
- [x] Email confirmation
- [x] Relances 1 semaine avant

---

### ⬜ F07 — Génération Factures
**Sprint :** Semaine 4 | **Estimé :** 1 jour | **Branche :** `feature/F07-factures`

**Critères d'acceptance :**
- [ ] Template normes ivoiriennes
- [ ] Numérotation auto FC-2026-XXXX
- [ ] Export PDF sur Cloudflare R2
- [ ] Email avec PDF
- [ ] Historique espace client

---

### ⬜ F08 — Admin Dashboard (Base)
**Sprint :** Semaine 4–5 | **Estimé :** 3 jours | **Branche :** `feature/F08-admin`

**Critères d'acceptance :**
- [ ] Layout sidebar admin
- [ ] Stats dashboard
- [ ] CRUD Biens complet
- [ ] Upload Cloudflare R2
- [ ] Liste utilisateurs
- [ ] Liste réservations
- [ ] Liste paiements + export

---

### ⬜ F09 — Espace Client
**Sprint :** Semaine 5 | **Estimé :** 1 jour | **Branche :** `feature/F09-client-space`

**Critères d'acceptance :**
- [ ] Dashboard client
- [ ] Suivi réservation
- [ ] Historique paiements
- [ ] Téléchargement factures
- [ ] Modification profil
- [ ] RLS respecté

---

### ⬜ F10 — Permissions RBAC
**Sprint :** Semaine 5 | **Estimé :** 2 jours | **Branche :** `feature/F10-rbac`

**Critères d'acceptance :**
- [ ] Seed rôles + permissions
- [ ] Interface attribution granulaire
- [ ] Composant PermissionGate
- [ ] Middleware permissions
- [ ] Tests par rôle

---

## MVP_2 — CRM & Pipeline

### ⬜ F11 — Gestion des Leads
**Sprint :** Semaine 6 | **Estimé :** 2 jours | **Branche :** `feature/F11-leads`

### ⬜ F12 — Pipeline de Vente (8 Étapes)
**Sprint :** Semaine 7 | **Estimé :** 3 jours | **Branche :** `feature/F12-pipeline`

### ⬜ F13 — Dossiers & Tâches
**Sprint :** Semaine 7–8 | **Estimé :** 3 jours | **Branche :** `feature/F13-dossiers`

### ⬜ F14 — Gestion des Visites
**Sprint :** Semaine 8–9 | **Estimé :** 2 jours | **Branche :** `feature/F14-visites`

### ⬜ F15 — Notifications & Communication
**Sprint :** Semaine 9 | **Estimé :** 2 jours | **Branche :** `feature/F15-notifications`

### ⬜ F16 — Rapports & KPIs
**Sprint :** Semaine 10 | **Estimé :** 2 jours | **Branche :** `feature/F16-kpis`

### ⬜ F25 — Système de Radiographie d'Impact UI
**Sprint :** Semaine 10 | **Estimé :** 2 jours | **Branche :** `feature/F25-impact-ui`

**Critères d'acceptance :**
- [ ] Boîte de dialogue d'impact dynamique lors des suppressions
- [ ] Calcul des dépendances (leads, clients, paiements)
- [ ] Options de transfert de données intégrées
- [ ] Logging de chaque "radio" effectuée
- [ ] RLS et permissions respectées

---

## MVP_3 — Documents, Airtable View & Chatbot

### ⬜ F17 — Génération de Contrats
**Sprint :** Semaine 11–12 | **Estimé :** 4 jours | **Branche :** `feature/F17-contrats`

### ⬜ F18 — Générateur de Formulaires
**Sprint :** Semaine 13 | **Estimé :** 3 jours | **Branche :** `feature/F18-formulaires`

### ⬜ F19 — Vue Base de Données Airtable
**Sprint :** Semaine 14–15 | **Estimé :** 5 jours | **Branche :** `feature/F19-airtable-view`

### ⬜ F20 — Chatbot IA (RAG)
**Sprint :** Semaine 16 | **Estimé :** 3 jours | **Branche :** `feature/F20-chatbot`

---

## MVP_4 — SaaS & Avancé

### ⬜ F21 — Multi-Tenancy SaaS
**Sprint :** Semaine 17–18 | **Estimé :** 5 jours

### ⬜ F22 — Gestion des Partenaires
**Sprint :** Semaine 19 | **Estimé :** 3 jours

### ⬜ F23 — Application Mobile
**Sprint :** Semaine 20–22 | **Estimé :** 10 jours

### ⬜ F24 — Automatisation Avancée (n8n)
**Sprint :** Semaine 22 | **Estimé :** 3 jours

---

## Backlog Non Prioritaire

- [ ] Visites virtuelles 360°
- [ ] Module comptabilité OHADA avancé
- [ ] IA de pricing automatique
- [ ] Integration WhatsApp Business API
- [ ] Widget partage sur les réseaux sociaux
- [ ] Système de parrainage (referral)
- [ ] Comparateur de biens
- [ ] Calculateur de prêt immobilier
- [ ] Heatmap des zones en temps réel (Google Maps + données)

---

## Bugs Connus

| # | Description | Priorité | Assigné |
|---|---|---|---|
| — | — | — | — |

---

*Dernière mise à jour : Mai 2026*
