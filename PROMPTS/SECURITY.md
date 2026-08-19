# SECURITY.md — Politique de Sécurité
## Favor Company International

> **Standard :** OWASP Top 10 + spécificités SaaS immobilier  
> **Niveau :** Production-ready

---

## 1. Checklist Sécurité (Obligatoire avant déploiement)

### Authentification & Sessions
- [ ] Mots de passe hachés avec bcrypt (cost factor ≥ 12)
- [ ] JWT tokens avec expiration courte (15 min access, 7 jours refresh)
- [ ] Rotation automatique des refresh tokens
- [ ] Rate limiting sur `/api/auth/*` (5 tentatives/15min par IP)
- [ ] Blocage temporaire après 10 échecs de connexion
- [ ] OTP avec expiration (10 minutes max)
- [ ] Validation de la force du mot de passe (min 8 chars, majuscule, chiffre, spécial)

### Données Sensibles
- [ ] Numéros de téléphone chiffrés (AES-256-GCM) avant insertion
- [ ] Numéros CNI chiffrés (AES-256-GCM) avant insertion
- [ ] Données financières chiffrées (AES-256-GCM)
- [ ] Clé de chiffrement ENCRYPTION_KEY de 32 bytes, jamais exposée
- [ ] Aucune clé API dans le code source (vérifier `NEXT_PUBLIC_*`)
- [ ] `.env.local` dans `.gitignore`
- [ ] Secrets Vercel configurés côté serveur uniquement

### API & Webhooks
- [ ] Validation de la signature Paystack sur chaque webhook (HMAC-SHA512)
- [ ] Jamais faire confiance au frontend pour les montants de paiement
- [ ] Validation Zod sur tous les inputs (Server Actions + API Routes)
- [ ] Headers CORS restrictifs (pas de `*`)
- [ ] Rate limiting global sur l'API (Upstash Redis)
- [ ] Protection CSRF sur les mutations
- [ ] Sanitisation des inputs pour prévenir l'injection SQL

### Base de Données (Supabase RLS)
- [ ] RLS activé sur TOUTES les tables
- [ ] Un client ne voit que ses propres données
- [ ] Les admins ont des policies explicites, pas un bypass RLS général
- [ ] Service Role Key jamais exposée côté client
- [ ] Audit des policies RLS avant mise en production
- [ ] Transactions atomiques pour les opérations critiques (réservation)

### Fichiers & Stockage
- [ ] Validation du type MIME côté serveur (pas seulement l'extension)
- [ ] Limite de taille des fichiers uploadés
- [ ] URLs signées (expiration courte) pour les fichiers sensibles
- [ ] Scan antivirus sur les uploads (optionnel MVP, recommandé V2)

### Infrastructure
- [ ] HTTPS forcé (Vercel le fait par défaut)
- [ ] Headers de sécurité HTTP configurés dans `next.config.ts`
- [ ] Content Security Policy (CSP)
- [ ] Monitoring des erreurs (Sentry)
- [ ] Alertes de sécurité (LogSnag)

---

## 2. Chiffrement des Données Sensibles

```typescript
// lib/utils/crypto.ts
import crypto from 'crypto'

const ALG = 'aes-256-gcm'

function getKey(): Buffer {
  const key = process.env.ENCRYPTION_KEY
  if (!key || key.length !== 64) {
    throw new Error('ENCRYPTION_KEY must be a 32-byte hex string (64 chars)')
  }
  return Buffer.from(key, 'hex')
}

export function encrypt(text: string): string {
  const iv = crypto.randomBytes(16)
  const cipher = crypto.createCipheriv(ALG, getKey(), iv)
  const encrypted = Buffer.concat([
    cipher.update(text, 'utf8'),
    cipher.final()
  ])
  const tag = cipher.getAuthTag()
  return [
    iv.toString('hex'),
    encrypted.toString('hex'),
    tag.toString('hex')
  ].join(':')
}

export function decrypt(hash: string): string {
  const parts = hash.split(':')
  if (parts.length !== 3) throw new Error('Invalid encrypted format')
  const [ivHex, encHex, tagHex] = parts
  const decipher = crypto.createDecipheriv(
    ALG, 
    getKey(), 
    Buffer.from(ivHex, 'hex')
  )
  decipher.setAuthTag(Buffer.from(tagHex, 'hex'))
  return Buffer.concat([
    decipher.update(Buffer.from(encHex, 'hex')),
    decipher.final()
  ]).toString('utf8')
}

// Génération d'une clé sécurisée (à faire une seule fois)
// node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

---

## 3. Validation Webhook Paystack

```typescript
// app/api/webhooks/paystack/route.ts
import crypto from 'crypto'
import { NextRequest } from 'next/server'

export async function POST(request: NextRequest) {
  const body = await request.text()
  const paystackSignature = request.headers.get('x-paystack-signature')

  if (!paystackSignature) {
    return Response.json({ error: 'Missing signature' }, { status: 400 })
  }

  // CRITIQUE : Toujours valider la signature avant de traiter
  const expectedHash = crypto
    .createHmac('sha512', process.env.PAYSTACK_WEBHOOK_SECRET!)
    .update(body)
    .digest('hex')

  if (expectedHash !== paystackSignature) {
    console.error('Invalid Paystack webhook signature')
    return Response.json({ error: 'Invalid signature' }, { status: 401 })
  }

  const event = JSON.parse(body)

  // Traitement idempotent (vérifier si déjà traité)
  switch (event.event) {
    case 'charge.success':
      await handlePaymentSuccess(event.data)
      break
    case 'refund.processed':
      await handleRefund(event.data)
      break
  }

  return Response.json({ received: true })
}

// RÈGLE ABSOLUE : Ne jamais créditer un compte sans valider la signature
```

---

## 4. Headers de Sécurité HTTP

```typescript
// next.config.ts
const securityHeaders = [
  {
    key: 'X-DNS-Prefetch-Control',
    value: 'on'
  },
  {
    key: 'Strict-Transport-Security',
    value: 'max-age=63072000; includeSubDomains; preload'
  },
  {
    key: 'X-Frame-Options',
    value: 'SAMEORIGIN'
  },
  {
    key: 'X-Content-Type-Options',
    value: 'nosniff'
  },
  {
    key: 'Referrer-Policy',
    value: 'strict-origin-when-cross-origin'
  },
  {
    key: 'Permissions-Policy',
    value: 'camera=(), microphone=(), geolocation=(self)'
  },
  {
    key: 'Content-Security-Policy',
    value: [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline' https://js.paystack.co https://www.googletagmanager.com",
      "style-src 'self' 'unsafe-inline'",
      "img-src 'self' data: https: blob:",
      "font-src 'self'",
      "connect-src 'self' https://*.supabase.co wss://*.supabase.co https://api.paystack.co",
      "frame-src https://js.paystack.co",
    ].join('; ')
  }
]

export default {
  headers: async () => [
    {
      source: '/(.*)',
      headers: securityHeaders,
    }
  ]
}
```

---

## 5. Rate Limiting

```typescript
// middleware.ts
import { Ratelimit } from '@upstash/ratelimit'
import { Redis } from '@upstash/redis'

const ratelimit = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(10, '1 m'),
})

export async function middleware(request: NextRequest) {
  // Rate limit sur les routes API sensibles
  if (request.nextUrl.pathname.startsWith('/api/auth')) {
    const ip = request.ip ?? '127.0.0.1'
    const { success } = await ratelimit.limit(ip)
    if (!success) {
      return Response.json(
        { error: 'Trop de tentatives. Réessayez dans une minute.' },
        { status: 429 }
      )
    }
  }
}
```

---

## 6. Protection Anti-Double Réservation

```sql
-- Fonction atomique avec verrou PostgreSQL (voir DB_SCHEMA.md)
-- Garantit qu'un bien ne peut pas être réservé deux fois simultanément
-- Utiliser FOR UPDATE pour verrouiller la ligne pendant la transaction
```

---

## 7. Scan Sécurité — Commandes

```bash
# Vérifier les clés exposées côté client
grep -r "NEXT_PUBLIC_PAYSTACK_SECRET" .
grep -r "SUPABASE_SERVICE_ROLE_KEY" ./app  # Ne doit jamais apparaître dans /app côté client

# Audit des dépendances npm
npm audit

# Vérifier les CVE connues
npx audit-ci --high

# Vérifier les injections potentielles
npx eslint . --rule '{"no-eval": "error"}'
```

---

## 8. Politique de Gestion des Incidents

### Niveaux de sévérité
| Niveau | Description | Délai de réponse |
|---|---|---|
| P0 — Critique | Données exposées, paiements compromis | < 1 heure |
| P1 — Élevé | Accès non autorisé, perte de données | < 4 heures |
| P2 — Moyen | Bug affectant des fonctionnalités de paiement | < 24 heures |
| P3 — Bas | Bug UI, performance | < 1 semaine |

### Procédure
1. Détection (Sentry / LogSnag alerte)
2. Isolation (bloquer la route ou le compte concerné)
3. Investigation (logs, Supabase dashboard)
4. Correction (hotfix sur branche dédiée)
5. Déploiement d'urgence
6. Post-mortem (documenter ce qui s'est passé)

---

## 9. Conformité Données (Loi ivoirienne n°2013-450)

- Consentement explicite requis avant collecte de données
- Droit d'accès, de rectification et de suppression des données personnelles
- Données sensibles (CNI, finances) chiffrées en base
- Journalisation des accès aux données sensibles
- Politique de confidentialité conforme et accessible
- Durée de conservation des données définie et respectée
- Notification en cas de violation de données (ARTCI)

---

## 10. Variables d'Environnement — Référence Complète

```bash
# =====================
# OBLIGATOIRES
# =====================

# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhb...        # Public OK
SUPABASE_SERVICE_ROLE_KEY=eyJhb...             # JAMAIS côté client

# Paystack
PAYSTACK_SECRET_KEY=sk_live_...               # JAMAIS côté client
NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY=pk_live_...   # Public OK
PAYSTACK_WEBHOOK_SECRET=...                   # JAMAIS côté client

# Chiffrement
ENCRYPTION_KEY=<64-char hex string>           # JAMAIS exposé

# Auth
NEXTAUTH_SECRET=<random string>

# Email
RESEND_API_KEY=re_...                        # JAMAIS côté client

# Cloudflare R2
CLOUDFLARE_R2_ACCOUNT_ID=
CLOUDFLARE_R2_ACCESS_KEY_ID=
CLOUDFLARE_R2_SECRET_ACCESS_KEY=
CLOUDFLARE_R2_BUCKET_NAME=

# =====================
# OPTIONNELS
# =====================
SENTRY_DSN=
NEXT_PUBLIC_POSTHOG_KEY=
NEXT_PUBLIC_GA_ID=G-...
UPSTASH_REDIS_REST_URL=
UPSTASH_REDIS_REST_TOKEN=
```

---

*Dernière mise à jour : Mai 2026*  
*Révision : À chaque déploiement majeur*



---

## 6. CVE 2025 - 2026 LISTE DES CVE 2026 À ÉVITER 