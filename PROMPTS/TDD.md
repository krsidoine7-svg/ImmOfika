# TDD — Technical Design Document
## Favor Company International

> **Version :** 1.0  
> **Date :** Mai 2026  
> **Stack :** Next.js 15 + Supabase + Tailwind CSS v4 + shadcn/ui + Paystack

---

## 1. Stack Technique

### Frontend
| Technologie | Version | Usage |
|---|---|---|
| **Next.js** | 15 (App Router) | Framework principal SSR/SSG |
| **React** | 19 stable | UI Components |
| **TypeScript** | 5.x strict | Typage statique |
| **Tailwind CSS** | v4 | Styling utility-first |
| **shadcn/ui** | latest | Composants UI accessibles |
| **Lucide React** | latest | Icônes |
| **Framer Motion** | latest | Animations |
| **Zod** | latest | Validation des schémas |
| **React Hook Form** | latest | Gestion des formulaires |
| **TanStack Query** | v5 | Data fetching & cache |

### Backend / BaaS
| Technologie | Version | Usage |
|---|---|---|
| **Supabase** | latest | DB PostgreSQL + Auth + Storage + RLS |
| **Drizzle ORM** | latest | ORM TypeScript type-safe |
| **Node.js** | 20 LTS | Runtime serveur |
| **Next.js API Routes** | — | Server Actions & API handlers |

### Services Cloud
| Service | Usage |
|---|---|
| **Cloudflare R2** | Stockage images, vidéos, documents |
| **Paystack** | Paiements (carte, Mobile Money) |
| **Resend** | Emails transactionnels |
| **Vercel** | Déploiement et hosting |

### Sécurité
| Outil | Usage |
|---|---|
| **bcrypt** | Hachage des mots de passe |
| **AES-256-GCM** | Chiffrement données sensibles |
| **Zod** | Validation des inputs |
| **CSRF tokens** | Protection CSRF |
| **Rate limiting** | Protection API (Upstash Redis) |

### Monitoring & Analytics
| Outil | Usage |
|---|---|
| **Sentry** | Error monitoring en production |
| **PostHog** | Analytics produit |
| **Google Analytics 4** | Analytics marketing |
| **LogSnag** | Alertes temps réel |

### DevOps
| Outil | Usage |
|---|---|
| **GitHub** | Source control + CI/CD |
| **GitHub Actions** | Pipelines CI/CD |
| **ESLint** | Linting |
| **Prettier** | Formatage |
| **Vitest** | Tests unitaires |
| **Playwright** | Tests E2E |

---

## 2. Architecture Globale

```
┌─────────────────────────────────────────────────────────┐
│                     CLIENTS                             │
│  Browser (Next.js SSR)  │  Mobile (futur React Native)  │
└──────────────┬──────────────────────────────────────────┘
               │ HTTPS
┌──────────────▼──────────────────────────────────────────┐
│              VERCEL (Edge Network)                       │
│  ┌─────────────────────────────────────────────────┐    │
│  │           Next.js App Router                    │    │
│  │  ┌──────────────┐  ┌───────────────────────┐   │    │
│  │  │ App Pages    │  │  Server Actions / API  │   │    │
│  │  │ (RSC + CSR)  │  │  Routes (Next.js)      │   │    │
│  │  └──────────────┘  └──────────┬────────────┘   │    │
│  └─────────────────────────────────────────────────┘    │
└─────────────────────────┬───────────────────────────────┘
                          │
┌─────────────────────────▼───────────────────────────────┐
│                    SUPABASE                              │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌────────┐  │
│  │PostgreSQL│  │   Auth   │  │  Storage │  │Realtime│  │
│  │ + RLS    │  │  (JWT)   │  │          │  │        │  │
│  └──────────┘  └──────────┘  └──────────┘  └────────┘  │
└─────────────────────────────────────────────────────────┘
          │                    │
┌─────────▼──────┐   ┌─────────▼──────────────────────────┐
│ Cloudflare R2  │   │      Services Externes              │
│ (Images/Docs)  │   │  Paystack │ Resend │ Maps │ n8n    │
└────────────────┘   └────────────────────────────────────┘
```

---

## 3. Structure du Projet

```
favor-company/
├── app/                          # Next.js App Router
│   ├── (public)/                 # Routes publiques
│   │   ├── page.tsx              # Page d'accueil
│   │   ├── biens/
│   │   │   ├── page.tsx          # Liste des biens
│   │   │   └── [slug]/
│   │   │       └── page.tsx      # Détail d'un bien
│   │   ├── auth/
│   │   │   ├── login/page.tsx
│   │   │   ├── register/page.tsx
│   │   │   ├── forgot-password/page.tsx
│   │   │   └── verify-otp/page.tsx
│   │   ├── contact/page.tsx
│   │   └── legal/
│   │       ├── privacy/page.tsx
│   │       ├── terms/page.tsx
│   │       └── cgv/page.tsx
│   ├── (client)/                 # Espace client authentifié
│   │   ├── layout.tsx
│   │   ├── dashboard/page.tsx
│   │   ├── mes-biens/page.tsx
│   │   ├── mes-paiements/page.tsx
│   │   ├── mes-documents/page.tsx
│   │   └── profil/page.tsx
│   ├── (admin)/                  # Backoffice admin
│   │   ├── layout.tsx
│   │   ├── dashboard/page.tsx
│   │   ├── biens/
│   │   │   ├── page.tsx
│   │   │   ├── ajouter/page.tsx
│   │   │   └── [id]/page.tsx
│   │   ├── clients/
│   │   │   ├── page.tsx
│   │   │   └── [id]/page.tsx
│   │   ├── agents/page.tsx
│   │   ├── crm/
│   │   │   ├── pipeline/page.tsx
│   │   │   ├── leads/page.tsx
│   │   │   └── dossiers/page.tsx
│   │   ├── paiements/page.tsx
│   │   ├── contrats/page.tsx
│   │   ├── utilisateurs/page.tsx
│   │   ├── droits/page.tsx
│   │   ├── rapports/page.tsx
│   │   ├── parametres/page.tsx
│   │   └── api-docs/page.tsx
│   └── api/                      # API Routes
│       ├── webhooks/
│       │   └── paystack/route.ts
│       ├── biens/route.ts
│       ├── reservations/route.ts
│       ├── paiements/route.ts
│       └── contrats/route.ts
├── components/
│   ├── ui/                       # shadcn/ui components
│   ├── shared/                   # Composants partagés
│   │   ├── Navbar.tsx
│   │   ├── Footer.tsx
│   │   ├── ChatBot.tsx
│   │   ├── ConfirmDialog.tsx
│   │   └── PageLoader.tsx
│   ├── public/                   # Composants pages publiques
│   │   ├── HeroSection.tsx
│   │   ├── BiensSection.tsx
│   │   ├── TeamSection.tsx
│   │   ├── FaqSection.tsx
│   │   ├── AvisSection.tsx
│   │   └── CtaSection.tsx
│   ├── biens/                    # Composants biens
│   │   ├── BienCard.tsx
│   │   ├── BienDetail.tsx
│   │   ├── BienGallery.tsx
│   │   ├── BienMap.tsx
│   │   └── ReservationModal.tsx
│   ├── admin/                    # Composants admin
│   │   ├── DataTable.tsx
│   │   ├── AirtableView.tsx
│   │   ├── KanbanBoard.tsx
│   │   ├── Pipeline.tsx
│   │   └── StatsCard.tsx
│   └── payment/                  # Composants paiement
│       ├── PaymentModal.tsx
│       └── PaymentHistory.tsx
├── lib/
│   ├── supabase/
│   │   ├── client.ts
│   │   ├── server.ts
│   │   └── middleware.ts
│   ├── db/
│   │   ├── schema.ts             # Drizzle schema
│   │   └── queries/              # Queries organisées par domaine
│   ├── utils/
│   │   ├── crypto.ts             # AES-256-GCM encrypt/decrypt
│   │   ├── format.ts
│   │   └── validators.ts
│   ├── paystack/
│   │   └── client.ts
│   ├── resend/
│   │   └── client.ts
│   └── cloudflare/
│       └── r2.ts
├── hooks/                        # Custom React hooks
├── types/                        # TypeScript types globaux
├── constants/                    # Constantes de l'app
├── middleware.ts                  # Auth middleware Next.js
├── drizzle.config.ts
└── docs/                         # Documentation projet
    ├── ARCHITECTURE.md
    ├── SECURITY.md
    ├── TASKS.md
    └── PROMPTS.md
```

---

## 4. Schéma de Base de Données (Résumé)

> Détail complet dans `DB_SCHEMA.md`

### Tables Principales
- `users` — Tous les utilisateurs (clients, admins, agents)
- `roles` — Rôles disponibles
- `permissions` — Permissions granulaires
- `user_roles` — Association utilisateur ↔ rôle
- `role_permissions` — Association rôle ↔ permissions
- `biens` — Catalogue des biens immobiliers
- `bien_images` — Images des biens
- `reservations` — Réservations de biens
- `visites` — Rendez-vous de visite
- `paiements` — Transactions de paiement
- `factures` — Factures générées
- `contrats` — Contrats générés
- `leads` — Prospects entrants
- `dossiers` — Dossiers clients
- `taches` — Tâches liées aux dossiers
- `crm_pipeline` — Étapes du pipeline de vente
- `notifications` — Notifications utilisateurs
- `documents` — Documents stockés
- `avis` — Avis clients
- `formulaires` — Formulaires personnalisés
- `formulaire_reponses` — Réponses aux formulaires
- `partenaires` — Comptes partenaires
- `agents` — Agents du promoteur

---

## 5. Sécurité

### Chiffrement des données sensibles
```typescript
// utils/crypto.ts
import crypto from 'crypto'

const ALG = 'aes-256-gcm'

export function encrypt(text: string): string {
  const iv = crypto.randomBytes(16)
  const cipher = crypto.createCipheriv(
    ALG, 
    Buffer.from(process.env.ENCRYPTION_KEY!, 'hex'), 
    iv
  )
  const encrypted = Buffer.concat([cipher.update(text, 'utf8'), cipher.final()])
  const tag = cipher.getAuthTag()
  return [
    iv.toString('hex'),
    encrypted.toString('hex'),
    tag.toString('hex')
  ].join(':')
}

export function decrypt(hash: string): string {
  const [ivHex, encHex, tagHex] = hash.split(':')
  const decipher = crypto.createDecipheriv(
    ALG,
    Buffer.from(process.env.ENCRYPTION_KEY!, 'hex'),
    Buffer.from(ivHex, 'hex')
  )
  decipher.setAuthTag(Buffer.from(tagHex, 'hex'))
  return Buffer.concat([
    decipher.update(Buffer.from(encHex, 'hex')),
    decipher.final()
  ]).toString('utf8')
}
```

### Variables d'environnement
```bash
# .env.local — NE JAMAIS COMMITER
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=       # Jamais côté client
PAYSTACK_SECRET_KEY=             # Jamais côté client
PAYSTACK_WEBHOOK_SECRET=
RESEND_API_KEY=
CLOUDFLARE_R2_ACCESS_KEY=
CLOUDFLARE_R2_SECRET_KEY=
ENCRYPTION_KEY=                  # 32 bytes hex
NEXTAUTH_SECRET=
```

### Règles RLS Supabase (exemple)
```sql
-- Un client ne peut voir que ses propres réservations
CREATE POLICY "client_see_own_reservations"
ON reservations
FOR SELECT
USING (auth.uid() = client_id);

-- Les admins voient toutes les réservations
CREATE POLICY "admin_see_all_reservations"
ON reservations
FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM user_roles ur
    JOIN roles r ON r.id = ur.role_id
    WHERE ur.user_id = auth.uid()
    AND r.name IN ('admin', 'admin_manager', 'super_admin')
  )
);
```

### Validation Webhook Paystack
```typescript
// app/api/webhooks/paystack/route.ts
import crypto from 'crypto'

export async function POST(request: Request) {
  const body = await request.text()
  const signature = request.headers.get('x-paystack-signature')
  
  const hash = crypto
    .createHmac('sha512', process.env.PAYSTACK_WEBHOOK_SECRET!)
    .update(body)
    .digest('hex')
  
  if (hash !== signature) {
    return new Response('Unauthorized', { status: 401 })
  }
  
  // Traiter le webhook seulement si la signature est valide
  const event = JSON.parse(body)
  // ...
}
```

---

## 6. Protection Anti-Double Réservation

```typescript
// Utiliser une transaction PostgreSQL avec verrou
async function reserverBien(bienId: string, clientId: string) {
  const { data, error } = await supabase.rpc('reserver_bien_atomic', {
    p_bien_id: bienId,
    p_client_id: clientId
  })
  return { data, error }
}
```

```sql
-- Fonction PostgreSQL atomique
CREATE OR REPLACE FUNCTION reserver_bien_atomic(
  p_bien_id UUID,
  p_client_id UUID
) RETURNS JSONB AS $$
DECLARE
  v_statut TEXT;
  v_reservation_id UUID;
BEGIN
  -- Verrouiller la ligne pour éviter les réservations simultanées
  SELECT statut INTO v_statut
  FROM biens
  WHERE id = p_bien_id
  FOR UPDATE;
  
  IF v_statut != 'disponible' THEN
    RETURN jsonb_build_object('success', false, 'error', 'Bien non disponible');
  END IF;
  
  -- Créer la réservation
  INSERT INTO reservations (bien_id, client_id, statut, date_expiration)
  VALUES (p_bien_id, p_client_id, 'en_attente', NOW() + INTERVAL '3 months')
  RETURNING id INTO v_reservation_id;
  
  -- Mettre à jour le statut du bien
  UPDATE biens SET statut = 'réservé' WHERE id = p_bien_id;
  
  RETURN jsonb_build_object('success', true, 'reservation_id', v_reservation_id);
END;
$$ LANGUAGE plpgsql;
```

---

## 7. Server Actions Pattern

```typescript
// app/actions/biens.ts — Jamais de 'use client' ici
'use server'

import { z } from 'zod'
import { createServerClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

const BienSchema = z.object({
  nom: z.string().min(3).max(200),
  prix: z.number().positive(),
  description: z.string().min(10),
  type: z.enum(['terrain', 'maison', 'appartement', 'lotissement']),
  surface: z.number().positive(),
  localisation: z.string(),
  statut: z.enum(['disponible', 'réservé', 'vendu']).default('disponible'),
})

export async function ajouterBien(formData: FormData) {
  const supabase = createServerClient()
  
  const parsed = BienSchema.safeParse({
    nom: formData.get('nom'),
    prix: Number(formData.get('prix')),
    // ...
  })
  
  if (!parsed.success) {
    return { error: parsed.error.flatten() }
  }
  
  const { error } = await supabase
    .from('biens')
    .insert(parsed.data)
  
  if (error) return { error: error.message }
  
  revalidatePath('/admin/biens')
  revalidatePath('/biens')
  return { success: true }
}
```

---

## 8. Composants Réutilisables — Principes

- **Atomic Design** : atoms → molecules → organisms → templates → pages
- **Pas de `any`** — TypeScript strict partout
- **Props typées** avec interfaces explicites
- **Composants en PascalCase**, utilitaires en camelCase
- **Server Components par défaut**, `'use client'` seulement si nécessaire
- **Pas de pages/ directory** — uniquement App Router
- **CSS via Tailwind CSS v4** — pas de styles inline
- **shadcn/ui** pour les composants de base (Dialog, Table, Form, etc.)

---

## 9. Tests

### Stratégie
```
Unitaires (Vitest)    → Fonctions utilitaires, crypto, validators
Intégration (Vitest)  → Server Actions, API routes
E2E (Playwright)      → Parcours utilisateur critiques
```

### Parcours critiques à tester
1. Inscription / Connexion
2. Recherche et filtrage des biens
3. Réservation d'un bien (flux complet)
4. Paiement Paystack
5. Génération et envoi d'un contrat
6. Attribution lead → agent
7. Gestion des permissions RBAC

---

## 10. Performance

### Optimisations Next.js
- Images optimisées avec `next/image`
- Lazy loading des composants non critiques
- Route Segment Config pour le cache
- Streaming avec Suspense
- Prefetch des routes probables

### Métriques cibles
| Métrique | Cible |
|---|---|
| LCP | < 2.5s |
| FID | < 100ms |
| CLS | < 0.1 |
| TTFB | < 600ms |

---

*Voir aussi : ARCHITECTURE.md, SECURITY.md, DB_SCHEMA.md*
