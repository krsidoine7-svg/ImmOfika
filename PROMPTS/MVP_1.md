# MVP_1.md — Fondations & Core
## Favor Company International

> **Durée :** Semaines 1–5  
> **Objectif :** Site fonctionnel avec catalogue, réservation, paiement, et backoffice admin de base  
> **Règle :** Tester chaque feature avant de passer à la suivante

---

## Périmètre MVP_1

| # | Feature | Priorité | Statut |
|---|---|---|---|
| F01 | Setup du projet | 🔴 Critique | ✅ Terminé |
| F02 | Authentification | 🔴 Critique | 🔄 En cours |
| F03 | Page d'accueil | 🔴 Critique | ✅ Terminé |
| F04 | Catalogue & Détail Biens | 🔴 Critique | ⬜ Todo |
| F05 | Réservation de biens | 🔴 Critique | ⬜ Todo |
| F06 | Paiements Paystack | 🔴 Critique | ⬜ Todo |
| F07 | Génération de Factures | 🟠 Important | ⬜ Todo |
| F08 | Admin Dashboard (base) | 🔴 Critique | ⬜ Todo |
| F09 | Espace Client | 🟠 Important | ⬜ Todo |
| F10 | Permissions RBAC (base) | 🔴 Critique | ⬜ Todo |

---

## F01 — Setup du Projet

### Critères d'acceptance
- [x] `npm run dev` tourne sans erreur
- [x] Connexion Supabase OK (test avec une query simple)
- [x] GitHub repository créé avec CI/CD actif
- [x] Build Next.js réussi (`npm run build`)
- [x] ESLint 0 erreur

### Commandes de setup
```bash
# Initialiser le projet
npx create-next-app@latest favor-company \
  --typescript \
  --tailwind \
  --app \
  --src-dir \
  --import-alias "@/*"

cd favor-company

# Installer les dépendances core
npm install @supabase/supabase-js @supabase/ssr
npm install drizzle-orm drizzle-kit postgres
npm install zod react-hook-form @hookform/resolvers
npm install @tanstack/react-query
npm install lucide-react
npm install framer-motion
npm install resend

# shadcn/ui
npx shadcn@latest init
npx shadcn@latest add button input label card dialog
npx shadcn@latest add table badge select textarea
npx shadcn@latest add dropdown-menu sheet toast
npx shadcn@latest add form alert avatar separator
npx shadcn@latest add tabs popover calendar command

# Sécurité
npm install bcryptjs
npm install @types/bcryptjs -D
npm install @upstash/ratelimit @upstash/redis

# Dev
npm install -D @types/node tsx
```

### Structure dossiers à créer
```bash
mkdir -p src/{app,components,lib,hooks,types,constants}
mkdir -p src/app/\(public\)
mkdir -p src/app/\(client\)
mkdir -p src/app/\(admin\)
mkdir -p src/app/api/webhooks/paystack
mkdir -p src/components/{ui,shared,biens,admin,payment}
mkdir -p src/lib/{supabase,db,utils,paystack,resend,cloudflare}
mkdir -p src/lib/db/queries
mkdir -p src/app/actions
mkdir -p docs
```

### Fichiers de configuration
```typescript
// src/lib/supabase/client.ts
import { createBrowserClient } from '@supabase/ssr'

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}
```

```typescript
// src/lib/supabase/server.ts
import { createServerClient as createSSRClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export async function createServerClient() {
  const cookieStore = await cookies()
  return createSSRClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return cookieStore.getAll() },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options)
          )
        },
      },
    }
  )
}
```

```typescript
// drizzle.config.ts
import { defineConfig } from 'drizzle-kit'

export default defineConfig({
  schema: './src/lib/db/schema.ts',
  out: './supabase/migrations',
  dialect: 'postgresql',
  dbCredentials: {
    url: process.env.DATABASE_URL!,
  },
})
```

```typescript
// next.config.ts
import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: '*.supabase.co' },
      { protocol: 'https', hostname: '*.cloudflare.com' },
      { protocol: 'https', hostname: 'pub-*.r2.dev' },
    ],
  },
  headers: async () => [
    {
      source: '/(.*)',
      headers: [
        { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
        { key: 'X-Content-Type-Options', value: 'nosniff' },
        { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
        {
          key: 'Strict-Transport-Security',
          value: 'max-age=63072000; includeSubDomains; preload',
        },
      ],
    },
  ],
}

export default nextConfig
```

---

## F02 — Authentification

### Critères d'acceptance
- [x] Inscription avec email + mot de passe fonctionne
- [x] Email de confirmation reçu (via Supabase Auth + Resend)
- [x] Connexion fonctionne
- [x] Déconnexion fonctionne
- [x] Google OAuth fonctionne
- [x] OTP téléphone fonctionne
- [x] Réinitialisation mot de passe fonctionne
- [x] Les routes `/admin/*` et `/(client)/*` sont protégées
- [x] Rate limiting actif sur les endpoints auth (Géré par Supabase)
- [x] Tentatives multiples bloquées (Géré par Supabase)

### Pages à créer
```
src/app/(public)/auth/
  login/page.tsx           → Formulaire login
  register/page.tsx        → Formulaire inscription
  forgot-password/page.tsx → Demande reset
  reset-password/page.tsx  → Nouveau mot de passe
  verify-otp/page.tsx      → Saisie OTP
  callback/route.ts        → Callback OAuth Google
```

### Middleware de protection
```typescript
// src/middleware.ts
import { createServerClient } from '@supabase/ssr'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

const PUBLIC_ROUTES = ['/', '/biens', '/auth/login', '/auth/register', '/legal']
const ADMIN_ROUTES = ['/admin']
const CLIENT_ROUTES = ['/client']

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  let response = NextResponse.next({ request })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return request.cookies.getAll() },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  const { data: { user } } = await supabase.auth.getUser()

  // Routes admin → rediriger si non connecté
  if (pathname.startsWith('/admin') && !user) {
    return NextResponse.redirect(new URL('/auth/login', request.url))
  }

  // Routes client → rediriger si non connecté
  if (pathname.startsWith('/client') && !user) {
    return NextResponse.redirect(new URL('/auth/login', request.url))
  }

  // Si connecté et sur login/register → rediriger vers dashboard
  if (user && (pathname === '/auth/login' || pathname === '/auth/register')) {
    return NextResponse.redirect(new URL('/client/dashboard', request.url))
  }

  return response
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\.png$).*)'],
}
```

---

## F03 — Page d'Accueil

### Critères d'acceptance
- [x] Hero section avec vidéo/animation
- [x] Accroche + 2 boutons CTA côte à côte
- [x] Section À propos
- [x] Section Équipe (avec données dynamiques depuis Supabase)
- [x] Section Biens (6 derniers biens disponibles)
- [x] Section FAQ (accordéon)
- [x] Section Avis clients
- [x] Section CTA
- [x] Footer
- [x] Navbar sticky avec scroll effect
- [x] Responsive mobile/tablette/desktop
- [x] Performance : LCP < 2.5s sur mobile

### Structure Composants
```
src/components/public/
  HeroSection.tsx
  AboutSection.tsx
  TeamSection.tsx
  BiensSection.tsx
  FaqSection.tsx
  TestimonialsSection.tsx
  CtaSection.tsx
  Footer.tsx
src/components/shared/
  Navbar.tsx
  ChatBot.tsx         ← Placeholder pour MVP_3
```

---

## F04 — Catalogue & Détail Biens

### Critères d'acceptance
- [x] Page `/biens` avec liste paginée
- [ ] Filtres : type, prix min/max, ville, zone, surface, statut (Type, Ville, PrixMax et Transaction déjà présents)
- [x] Barre de recherche full-text
- [x] Carte interactive (Leaflet / OpenStreetMap) avec markers (Intégration épurée Or & Navy Blue)
- [x] Page `/biens/[slug]` avec toutes les infos
- [ ] Galerie images/vidéo
- [ ] PDF annexe téléchargeable
- [x] Biens suggérés (même catégorie)
- [x] Nombre de vues incrémenté à chaque visite
- [x] Bouton Réserver actif si "disponible"
- [x] Bouton Favoris (si connecté)
- [x] Slug unique auto-généré à la création 

### Queries Drizzle
```typescript
// src/lib/db/queries/biens.ts
import { db } from '@/lib/db'
import { biens, bienImages } from '@/lib/db/schema'
import { eq, and, gte, lte, like, desc } from 'drizzle-orm'

export async function getBiensDisponibles(filters: {
  type?: string
  prixMin?: number
  prixMax?: number
  ville?: string
  statut?: string
  page?: number
  limit?: number
}) {
  const { type, prixMin, prixMax, ville, statut = 'disponible', page = 1, limit = 12 } = filters
  
  const conditions = [eq(biens.statut, statut)]
  if (type) conditions.push(eq(biens.type, type))
  if (prixMin) conditions.push(gte(biens.prix, prixMin.toString()))
  if (prixMax) conditions.push(lte(biens.prix, prixMax.toString()))
  if (ville) conditions.push(like(biens.ville, `%${ville}%`))

  return db
    .select()
    .from(biens)
    .where(and(...conditions))
    .orderBy(desc(biens.createdAt))
    .limit(limit)
    .offset((page - 1) * limit)
}

export async function getBienBySlug(slug: string) {
  const [bien] = await db
    .select()
    .from(biens)
    .where(eq(biens.slug, slug))
    .limit(1)
  return bien
}
```

---

## F05 — Réservation

### Critères d'acceptance
- [x] Modal de réservation accessible uniquement si connecté
- [ ] Boîte de dialogue de confirmation
- [ ] Protection anti-double réservation (transaction atomique)
- [x] Statut du bien passe à "réservé" immédiatement
- [x] Réservation valable 3 mois max
- [ ] 3 relances planifiées automatiquement (cron job Supabase)
- [ ] Remboursement 87% si dépassement (après 2 relances)
- [x] Client reçoit email de confirmation

### Fonction RPC Supabase (atomique)
```sql
-- À exécuter dans l'éditeur SQL Supabase
CREATE OR REPLACE FUNCTION reserver_bien_atomic(
  p_bien_id UUID,
  p_client_id UUID
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_statut TEXT;
  v_reservation_id UUID;
BEGIN
  -- Verrouiller la ligne pour éviter concurrence
  SELECT statut INTO v_statut
  FROM biens
  WHERE id = p_bien_id
  FOR UPDATE NOWAIT;

  IF NOT FOUND THEN
    RETURN jsonb_build_object('success', false, 'error', 'Bien introuvable');
  END IF;

  IF v_statut != 'disponible' THEN
    RETURN jsonb_build_object('success', false, 'error', 'Bien non disponible');
  END IF;

  -- Créer la réservation
  INSERT INTO reservations (bien_id, client_id, statut, date_expiration)
  VALUES (
    p_bien_id,
    p_client_id,
    'en_attente',
    NOW() + INTERVAL '3 months'
  )
  RETURNING id INTO v_reservation_id;

  -- Mettre à jour le statut du bien
  UPDATE biens SET statut = 'réservé', updated_at = NOW()
  WHERE id = p_bien_id;

  RETURN jsonb_build_object(
    'success', true,
    'reservation_id', v_reservation_id
  );

EXCEPTION
  WHEN lock_not_available THEN
    RETURN jsonb_build_object('success', false, 'error', 'Bien en cours de réservation par un autre utilisateur');
END;
$$;
```

---

## F06 — Paiements Paystack

### Critères d'acceptance
- [x] Lien de paiement généré côté serveur
- [x] Redirection vers Paystack pour paiement
- [x] Webhook reçu et signature validée
- [x] Statut paiement mis à jour en DB
- [x] Facture générée automatiquement
- [x] Email de confirmation envoyé
- [x] Relances automatiques planifiées
- [x] Remboursement 87% fonctionne

> Voir `INTÉGRATION_PAYSTACK.md` pour le code complet.

---

## F07 — Génération de Factures

### Critères d'acceptance
- [x] Template facture conforme normes ivoiriennes
- [x] Numérotation automatique (FC-2026-XXXX)
- [x] Export PDF (Cloudflare R2)
- [x] Email avec PDF en pièce jointe (Resend)
- [x] Historique des factures dans l'espace client
- [x] stockage de docuement, photos, pdf dans r2 pour l'instant. apres on passera sur google cloud storage et goolge drive pour sauvegarder les documents, les images, les pdf, les videos des biens.

### Template React Email
```tsx
// src/lib/emails/FactureEmail.tsx
import { Html, Head, Body, Container, Text, Heading } from '@react-email/components'

interface FactureEmailProps {
  clientNom: string
  factureNumero: string
  bienNom: string
  montant: number
  datePaiement: string
  factureUrl: string
}

export function FactureEmail({
  clientNom,
  factureNumero,
  bienNom,
  montant,
  datePaiement,
  factureUrl,
}: FactureEmailProps) {
  return (
    <Html>
      <Head />
      <Body>
        <Container>
          <Heading>Favor Company International</Heading>
          <Text>Bonjour {clientNom},</Text>
          <Text>
            Votre paiement pour le bien "{bienNom}" a été confirmé.
            Votre facture N° {factureNumero} est disponible.
          </Text>
          <Text>Montant : {montant.toLocaleString('fr-CI')} FCFA</Text>
          <Text>Date : {datePaiement}</Text>
          <Text>
            <a href={factureUrl}>Télécharger ma facture</a>
          </Text>
          <Text>
            Favor Company International<br />
            Yaho, Abidjan - Côte d'Ivoire<br />
            +225 2724370155
          </Text>
        </Container>
      </Body>
    </Html>
  )
}
```

---

## F08 — Admin Dashboard (Base)

### Critères d'acceptance
- [x] Layout avec sidebar collapsible
- [x] Dashboard : stats (biens, réservations, revenus du mois)
- [x] CRUD Biens complet (ajouter, modifier, supprimer, voir)
- [x] Upload images/vidéo vers Cloudflare R2
- [x] Liste Utilisateurs (voir, suspendre)
- [x] Liste Réservations (voir, changer statut)
- [x] Liste Paiements (voir, exporter CSV/Excel)
- [x] Extraction PDF, CSV, Excel

### Layout Admin
```tsx
// src/app/(admin)/layout.tsx
import { AdminSidebar } from '@/components/admin/Sidebar'
import { AdminHeader } from '@/components/admin/Header'
import { checkAdminAccess } from '@/lib/auth/permissions'
import { redirect } from 'next/navigation'

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const hasAccess = await checkAdminAccess()
  if (!hasAccess) redirect('/auth/login')

  return (
    <div className="flex h-screen bg-secondary-50">
      <AdminSidebar />
      <div className="flex flex-col flex-1 overflow-hidden">
        <AdminHeader />
        <main className="flex-1 overflow-auto p-6">
          {children}
        </main>
      </div>
    </div>
  )
}
```

---

## F09 — Espace Client

### Critères d'acceptance
- [ ] Dashboard client avec résumé (réservations actives, paiements, documents)
- [ ] Suivi réservation en temps réel (statut, étape)
- [ ] Historique des paiements avec statuts
- [ ] Téléchargement des factures PDF
- [ ] Modification profil (nom, téléphone, avatar)
- [ ] Les données RLS sont respectées (client voit uniquement ses données)

---

## F10 — Permissions RBAC

### Critères d'acceptance
- [ ] Tous les rôles sont seedés en DB
- [ ] Toutes les permissions granulaires sont seedées
- [ ] Interface admin pour attribuer les permissions élément par élément
- [ ] Composant `<PermissionGate>` fonctionnel
- [ ] Middleware vérifie les permissions sur toutes les routes admin
- [ ] Un `admin_agent` ne voit que ce qui lui est autorisé

### Hook de permissions
```typescript
// src/hooks/usePermissions.ts
'use client'

import { useQuery } from '@tanstack/react-query'

export function usePermissions() {
  const { data: permissions = [] } = useQuery({
    queryKey: ['user-permissions'],
    queryFn: async () => {
      const res = await fetch('/api/me/permissions')
      return res.json()
    },
  })

  function hasPermission(code: string): boolean {
    return permissions.some(
      (p: { code: string; granted: boolean }) =>
        p.code === code && p.granted
    )
  }

  function hasAnyPermission(codes: string[]): boolean {
    return codes.some(code => hasPermission(code))
  }

  return { permissions, hasPermission, hasAnyPermission }
}
```

```tsx
// src/components/shared/PermissionGate.tsx
'use client'

import { usePermissions } from '@/hooks/usePermissions'

interface PermissionGateProps {
  permission: string | string[]
  children: React.ReactNode
  fallback?: React.ReactNode
}

export function PermissionGate({
  permission,
  children,
  fallback = null,
}: PermissionGateProps) {
  const { hasPermission, hasAnyPermission } = usePermissions()

  const allowed = Array.isArray(permission)
    ? hasAnyPermission(permission)
    : hasPermission(permission)

  return allowed ? <>{children}</> : <>{fallback}</>
}
```

---

## Tests de Recette MVP_1

Avant de passer à MVP_2, valider les scénarios suivants :

### Scénario 1 — Parcours Client Complet
1. Arriver sur la page d'accueil
2. Parcourir les biens disponibles
3. Filtrer par type "terrain" et prix < 20 000 000 FCFA
4. Cliquer sur un bien
5. S'inscrire / se connecter
6. Réserver le bien et payer l'acompte
7. Recevoir l'email de confirmation avec la facture
8. Consulter la réservation dans l'espace client

### Scénario 2 — Anti-Double Réservation
1. Deux utilisateurs simultanés tentent de réserver le même bien
2. Seul le premier réussit
3. Le deuxième reçoit un message "Bien non disponible"

### Scénario 3 — Admin Complet
1. Se connecter en tant qu'admin
2. Ajouter un nouveau bien avec images et PDF
3. Modifier le statut d'une réservation
4. Voir la liste des paiements et exporter en CSV

### Scénario 4 — Sécurité
1. Tenter d'accéder à `/admin/biens` sans être connecté → Redirection login
2. Tenter un paiement avec un montant modifié côté client → Rejeté
3. Envoyer un webhook Paystack avec signature invalide → HTTP 401

---

*MVP_1 terminé → Passer à MVP_2.md*
