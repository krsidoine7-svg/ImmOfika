# ARCHITECTURE.md — Carte du Projet
## Favor Company International

> **Ce document est la source de vérité de l'architecture.**  
> Mettre à jour après chaque nouvelle feature implémentée.

---

## 1. Vue Macroscopique

```
┌─────────────────────────────────────────────────────────────────┐
│                    FAVOR COMPANY PLATFORM                        │
├─────────────────┬──────────────────────┬────────────────────────┤
│   SITE PUBLIC   │   ESPACE CLIENT      │   BACKOFFICE ADMIN     │
│   (Marketing)   │   (Authentifié)      │   (Multi-rôles)        │
│                 │                      │                         │
│ - Page accueil  │ - Dashboard client   │ - Dashboard admin       │
│ - Biens         │ - Mes réservations   │ - Gestion biens         │
│ - Recherche     │ - Mes paiements      │ - CRM + Pipeline        │
│ - Filtres       │ - Mes documents      │ - Gestion clients       │
│ - Maps          │ - Profil             │ - Paiements             │
│ - Auth          │                      │ - Contrats              │
│ - Chatbot       │                      │ - Rapports + KPIs       │
│                 │                      │ - Droits & Accès        │
│                 │                      │ - Paramètres            │
└─────────────────┴──────────────────────┴────────────────────────┘
```

---

## 2. Stack Décisionnelle

### Pourquoi ces choix ?

| Choix | Raison |
|---|---|
| **Next.js 15 App Router** | SSR natif, Server Actions, meilleure DX TypeScript, Vercel natif |
| **Supabase** | PostgreSQL managé + Auth + Storage + Realtime + RLS en un seul service |
| **Drizzle ORM** | Type-safe, léger, génère les migrations depuis le code TypeScript |
| **Tailwind CSS v4** | Utility-first, performant, pas de CSS-in-JS overhead |
| **shadcn/ui** | Composants accessibles, personnalisables, pas de dépendance externe |
| **Paystack** | Meilleure intégration Mobile Money Afrique de l'Ouest (Orange, MTN, Wave) |
| **Cloudflare R2** | Stockage d'objets compatible S3, pas d'egress fees |
| **Resend** | Email transactionnel fiable avec React Email templates |
| **Vercel** | Déploiement zero-config Next.js, edge network global |

---

## 3. Flow de Données

### Réservation d'un Bien

```
Client                    Next.js               Supabase              Paystack
  │                          │                     │                      │
  │──── Clique Réserver ────▶│                     │                      │
  │                          │──── Vérifie auth ──▶│                      │
  │                          │                     │                      │
  │                          │──── RPC atomique ──▶│                      │
  │                          │   (verrou FOR UPDATE)│                      │
  │                          │                     │──── Vérifie statut ──│
  │                          │                     │──── Crée réservation ─│
  │                          │                     │──── Update statut ────│
  │                          │                     │◀─── Reservation ID ───│
  │                          │                     │                      │
  │                          │──────────────────────────── Init paiement ─▶│
  │                          │                                             │
  │◀──── Redirect Paystack ──│                                             │
  │                                                                        │
  │──────────────────────────────────────── Paiement ──────────────────────│
  │                                                                        │
  │                          │◀──── Webhook (signature validée) ───────────│
  │                          │──── Update paiement ──▶│                    │
  │                          │──── Génère facture ───▶│                    │
  │                          │──── Notifie client ───▶│                    │
  │◀──── Email confirmation ─│                         │                    │
```

### Authentification

```
Client                    Next.js Middleware            Supabase Auth
  │                              │                           │
  │──── Requête route /admin ───▶│                           │
  │                              │──── Vérifie JWT ─────────▶│
  │                              │◀─── Token valide/invalide ─│
  │                              │                            │
  │                    [Invalide]│──── Redirect /login        │
  │                    [Valide]  │──── Vérifie permissions ──▶│
  │                              │◀─── user_roles + perms ────│
  │                              │                            │
  │                    [Non autorisé]──── Redirect /403       │
  │                    [Autorisé]──── Sert la page ──────────▶│
```

---

## 4. Modules du Système

### Module Auth
```
app/
  auth/
    login/            → Page de connexion
    register/         → Page d'inscription
    forgot-password/  → Reset mot de passe
    verify-otp/       → Vérification OTP
lib/
  supabase/
    client.ts         → Client Supabase côté navigateur
    server.ts         → Client Supabase côté serveur (Server Components)
    middleware.ts     → Gestion session
middleware.ts         → Protection des routes + vérification permissions
```

### Module Biens
```
app/
  biens/
    page.tsx          → Liste avec filtres
    [slug]/page.tsx   → Détail d'un bien
  (admin)/biens/
    page.tsx          → Liste admin
    ajouter/          → Formulaire ajout
    [id]/             → Détail + modification
components/
  biens/
    BienCard.tsx      → Card réutilisable
    BienGallery.tsx   → Galerie images/vidéo
    BienMap.tsx       → Carte interactive
    ReservationModal.tsx → Modal de réservation
lib/db/queries/
  biens.ts            → Queries Drizzle
app/actions/
  biens.ts            → Server Actions
```

### Module Paiements
```
app/
  api/webhooks/paystack/route.ts  → Webhook handler (signé)
  (admin)/paiements/page.tsx      → Dashboard paiements
lib/
  paystack/client.ts              → Client Paystack
app/actions/
  paiements.ts                    → Server Actions paiement
```

### Module CRM
```
app/
  (admin)/crm/
    pipeline/page.tsx    → Vue Kanban pipeline
    leads/page.tsx       → Gestion des leads
    dossiers/page.tsx    → Gestion des dossiers
components/
  admin/
    KanbanBoard.tsx      → Composant Kanban
    Pipeline.tsx         → Pipeline 8 étapes
    LeadCard.tsx         → Card lead
```

### Module Contrats
```
app/
  (admin)/contrats/
    page.tsx             → Liste des contrats
    [id]/page.tsx        → Détail + signature
lib/
  contrats/
    generator.ts         → Génération Markdown → DOCX → PDF
    hash.ts              → SHA-256 pour intégrité
    signature.ts         → Gestion signatures
```

---

## 5. Patterns de Code

### Server Action (mutations)
```typescript
'use server'
// 1. Vérifier l'authentification
// 2. Vérifier les permissions RBAC
// 3. Valider les inputs avec Zod
// 4. Exécuter la mutation avec Drizzle/Supabase
// 5. Revalider le cache si nécessaire
// 6. Retourner { success, data } ou { error }
```

### Server Component (lecture)
```typescript
// Pas de 'use client' → Server Component par défaut
// Fetcher directement avec le client Supabase serveur
// Passer les données comme props aux Client Components
```

### Client Component
```typescript
'use client'
// Seulement si : useState, useEffect, event handlers, animations
// Recevoir les données du Server Component parent
// Appeler les Server Actions pour les mutations
```

### Composant avec Permissions
```typescript
// components/shared/PermissionGate.tsx
export function PermissionGate({ 
  permission, 
  children 
}: { 
  permission: string
  children: React.ReactNode 
}) {
  const { hasPermission } = usePermissions()
  if (!hasPermission(permission)) return null
  return <>{children}</>
}

// Usage :
// <PermissionGate permission="biens.supprimer">
//   <Button>Supprimer</Button>
// </PermissionGate>
```

---

## 6. Conventions de Nommage

| Élément | Convention | Exemple |
|---|---|---|
| Composants React | PascalCase | `BienCard.tsx` |
| Fonctions/variables | camelCase | `fetchBiens()` |
| Constantes | UPPER_SNAKE | `MAX_FILE_SIZE` |
| Types/Interfaces | PascalCase | `type BienType` |
| Tables DB | snake_case | `bien_images` |
| Routes API | kebab-case | `/api/biens-disponibles` |
| Branches Git | kebab-case avec prefix | `feature/F04-catalogue-biens` |
| Commits Git | Conventional Commits | `feat: add bien reservation modal` |

---

## 7. Règles Absolues (CONSTRAINTS)

1. **Jamais de `any` en TypeScript** — toujours typer explicitement
2. **Jamais de clé API côté client** — vérifier que `NEXT_PUBLIC_` ne contient pas de secrets
3. **Jamais de `pages/` directory** — uniquement App Router
4. **Jamais de mutations côté client** — toujours via Server Actions
5. **Valider TOUJOURS les webhooks** avant de modifier la DB
6. **RLS activé sur toutes les tables** — pas d'exception
7. **Transactions atomiques** pour les opérations de réservation
8. **Chiffrer les données sensibles** avant insertion en DB
9. **Zod sur tous les inputs** — côté serveur uniquement
10. **Composants réutilisables** — pas de copier/coller de UI
11. **Soft Delete obligatoire** — utilisation de `deleted_at` sur les tables critiques
12. **Radiographie d'Impact 3D** — analyse technique, métier et UX avant tout changement de code

---

## 8. Relations Inter-Modules

```
users ──────────── user_roles ──────── roles
  │                                      │
  │                               role_permissions
  │                                      │
  ├── leads ──────── pipeline_positions  permissions
  │
  ├── biens ──────── bien_images
  │       │          bien_documents
  │       │          reservations ───── paiements ─── factures
  │       │          avis
  │       └── visites
  │
  ├── dossiers ───── taches
  │                  interactions
  │
  ├── contrats ───── documents
  │
  ├── notifications
  │
  ├── formulaires ── formulaire_reponses
  │
  └── partenaires
```

---

## 9. Déploiement

```
Development : localhost:3000
Preview     : Vercel (auto sur chaque PR)
Production  : Vercel (auto sur merge main)

Supabase : Projet dédié production (separate du dev)
Cloudflare R2 : Bucket faveur-company-prod
```

---

## 10. Historique des Décisions

| Date | Décision | Raison |
|---|---|---|
| Mai 2026 | Next.js 15 App Router | Abandonne Pages Router pour les Server Actions |
| Mai 2026 | Drizzle ORM | Plus léger et type-safe que Prisma |
| Mai 2026 | Paystack | Meilleure couverture CI Mobile Money |
| Mai 2026 | Cloudflare R2 | Pas de frais d'egress vs AWS S3 |
| Mai 2026 | Soft Delete | Sécurisation des données et préservation de l'historique comptable |
| Mai 2026 | Radiographie d'Impact 3D | Analyse 360° (Tech, Métier, UX) pour réduire la dette technique |

---

*Ce document doit être mis à jour après chaque feature ajoutée.*
