# INTÉGRATION_PAYSTACK.md
## Favor Company International — Paiements

> **API :** Paystack  
> **Docs :** https://support.paystack.com/en  
> **Couverture :** Côte d'Ivoire (Orange Money, MTN MoMo, Wave, Carte)

---

## 1. Configuration

```bash
# .env.local
PAYSTACK_SECRET_KEY=sk_live_xxxxxxxxxxxx        # JAMAIS côté client
NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY=pk_live_xxxx    # OK côté client
PAYSTACK_WEBHOOK_SECRET=whsec_xxxxxxxxxxxx      # JAMAIS côté client
```

```typescript
// lib/paystack/client.ts
const PAYSTACK_BASE = 'https://api.paystack.co'

export const paystack = {
  baseUrl: PAYSTACK_BASE,
  secretKey: process.env.PAYSTACK_SECRET_KEY!,
  publicKey: process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY!,
}
```

---

## 2. Initialiser un Paiement (Server Action)

```typescript
// app/actions/paiements.ts
'use server'

import { z } from 'zod'
import { createServerClient } from '@/lib/supabase/server'

const PaiementSchema = z.object({
  clientId: z.string().uuid(),
  bienId: z.string().uuid(),
  montant: z.number().positive(),  // En XOF (pas de centimes)
  email: z.string().email(),
  type: z.enum(['acompte', 'partiel', 'total']),
  metadata: z.record(z.string()).optional(),
})

export async function initierPaiement(input: z.infer<typeof PaiementSchema>) {
  const parsed = PaiementSchema.safeParse(input)
  if (!parsed.success) return { error: parsed.error.flatten() }

  const { clientId, bienId, montant, email, type, metadata } = parsed.data

  // Créer la référence unique
  const reference = `FC-${Date.now()}-${Math.random().toString(36).slice(2, 8).toUpperCase()}`

  // Sauvegarder en DB avant le paiement (état "en_attente")
  const supabase = createServerClient()
  const { error: dbError } = await supabase.from('paiements').insert({
    reference,
    client_id: clientId,
    bien_id: bienId,
    montant,
    statut: 'en_attente',
    type_paiement: type,
    devise: 'XOF',
  })

  if (dbError) return { error: 'Erreur lors de la création du paiement' }

  // Initialiser via l'API Paystack
  const response = await fetch('https://api.paystack.co/transaction/initialize', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      email,
      amount: montant * 100,  // Paystack utilise les centimes (kobo/pesewas)
      // Note : Pour XOF, vérifier la conversion exacte avec Paystack CI
      reference,
      currency: 'GHS',  // Adapter selon les devises supportées en CI
      channels: ['mobile_money', 'card'],
      metadata: {
        favor_company: true,
        bien_id: bienId,
        type_paiement: type,
        ...metadata,
      },
      callback_url: `${process.env.NEXT_PUBLIC_APP_URL}/paiement/confirmation`,
    }),
  })

  const data = await response.json()

  if (!data.status) {
    return { error: data.message || 'Erreur Paystack' }
  }

  return {
    success: true,
    authorizationUrl: data.data.authorization_url,
    reference: data.data.reference,
  }
}
```

---

## 3. Webhook Handler (Critique — Valider la Signature)

```typescript
// app/api/webhooks/paystack/route.ts
import crypto from 'crypto'
import { createServerClient } from '@/lib/supabase/server'
import { NextRequest } from 'next/server'

// RÈGLE ABSOLUE : Jamais traiter un webhook sans valider la signature
export async function POST(request: NextRequest) {
  const body = await request.text()
  const paystackSignature = request.headers.get('x-paystack-signature')

  if (!paystackSignature) {
    return Response.json({ error: 'Signature manquante' }, { status: 400 })
  }

  const expectedHash = crypto
    .createHmac('sha512', process.env.PAYSTACK_WEBHOOK_SECRET!)
    .update(body)
    .digest('hex')

  if (expectedHash !== paystackSignature) {
    console.error('[Paystack] Signature invalide — Webhook rejeté')
    return Response.json({ error: 'Signature invalide' }, { status: 401 })
  }

  let event: PaystackWebhookEvent
  try {
    event = JSON.parse(body)
  } catch {
    return Response.json({ error: 'JSON invalide' }, { status: 400 })
  }

  console.log(`[Paystack] Événement reçu : ${event.event}`)

  const supabase = createServerClient()

  switch (event.event) {
    case 'charge.success':
      await handleChargeSuccess(event.data, supabase)
      break
    case 'refund.processed':
      await handleRefund(event.data, supabase)
      break
    case 'transfer.success':
      await handleTransfer(event.data, supabase)
      break
    default:
      console.log(`[Paystack] Événement non géré : ${event.event}`)
  }

  return Response.json({ received: true })
}

async function handleChargeSuccess(data: PaystackChargeData, supabase: SupabaseClient) {
  const { reference, amount, customer } = data

  // 1. Vérifier que le paiement n'a pas déjà été traité (idempotence)
  const { data: existing } = await supabase
    .from('paiements')
    .select('id, statut')
    .eq('reference', reference)
    .single()

  if (existing?.statut === 'succès') {
    console.log(`[Paystack] Paiement ${reference} déjà traité`)
    return
  }

  // 2. Mettre à jour le statut du paiement
  await supabase
    .from('paiements')
    .update({
      statut: 'succès',
      paystack_reference: reference,
      paystack_response: data,
    })
    .eq('reference', reference)

  // 3. Récupérer les infos du paiement pour la suite
  const { data: paiement } = await supabase
    .from('paiements')
    .select('*, biens(*), users(*)')
    .eq('reference', reference)
    .single()

  if (!paiement) return

  // 4. Générer la facture
  await genererFacture(paiement, supabase)

  // 5. Notifier le client (email via Resend)
  await envoyerConfirmationPaiement(paiement)

  // 6. Notifier les admins
  await notifierAdmins('paiement_reçu', paiement)

  // 7. Calculer le prochain paiement si échelonné
  if (paiement.type_paiement === 'partiel') {
    await planifierProchainPaiement(paiement, supabase)
  }
}

async function handleRefund(data: unknown, supabase: SupabaseClient) {
  // Gérer les remboursements (ex: réservation expirée → 87% remboursé)
  // Implémenter selon la logique métier
}
```

---

## 4. Vérification d'un Paiement (côté serveur)

```typescript
// lib/paystack/verify.ts
export async function verifierPaiement(reference: string) {
  const response = await fetch(
    `https://api.paystack.co/transaction/verify/${reference}`,
    {
      headers: {
        Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
      },
    }
  )

  const data = await response.json()

  if (!data.status || data.data.status !== 'success') {
    return { success: false, error: 'Paiement non confirmé' }
  }

  return {
    success: true,
    amount: data.data.amount / 100,
    reference: data.data.reference,
    customer: data.data.customer,
    channel: data.data.channel,
    paidAt: data.data.paid_at,
  }
}
```

---

## 5. Lien de Paiement Direct (pour les agents)

```typescript
// Un agent peut générer et envoyer un lien de paiement à un client
export async function genererLienPaiement(input: {
  clientEmail: string
  montant: number
  description: string
  bienId: string
}) {
  // Utiliser Paystack Payment Pages pour générer un lien standalone
  const response = await fetch('https://api.paystack.co/paymentrequest', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      description: input.description,
      amount: input.montant * 100,
      send_notification: true,
      customer: {
        email: input.clientEmail,
      },
      metadata: {
        bien_id: input.bienId,
      },
    }),
  })

  const data = await response.json()
  return {
    lien: data.data?.offline_reference || data.data?.link,
    reference: data.data?.offline_reference,
  }
}
```

---

## 6. Remboursement (87% pour réservation expirée)

```typescript
export async function rembourserClient(paystackReference: string, montantTotal: number) {
  const montantRembourse = Math.floor(montantTotal * 0.87)  // 87%

  const response = await fetch('https://api.paystack.co/refund', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      transaction: paystackReference,
      amount: montantRembourse * 100,  // En centimes
      currency: 'XOF',
      merchant_note: 'Remboursement réservation expirée — Favor Company',
    }),
  })

  const data = await response.json()
  return data
}
```

---

## 7. Canaux de Paiement en Côte d'Ivoire

| Canal | Code Paystack | Notes |
|---|---|---|
| Orange Money CI | `orange_money_ci` | Très utilisé |
| MTN Mobile Money | `mtn_mobile_money_ci` | Très utilisé |
| Wave | `wave_ci` | En croissance |
| Moov Money | `moov_money_ci` | Disponible |
| Carte bancaire | `card` | Visa/Mastercard |

```typescript
// Configurer les canaux acceptés
channels: ['orange_money_ci', 'mtn_mobile_money_ci', 'wave_ci', 'card']
```

---

## 8. Test en Mode Sandbox

```bash
# Clés de test
PAYSTACK_SECRET_KEY=sk_test_xxxx
NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY=pk_test_xxxx

# Numéros de test Mobile Money (Paystack sandbox)
Orange Money : 0700000000
MTN : 0500000000

# Carte de test
Numéro : 4084 0840 8408 4081
Expiry  : 01/28
CVV     : 408
OTP     : 123456
```

---

## 9. Schéma de Flux Complet

```
Client → Clique "Payer" → Server Action → Init Paystack (server)
       → Reçoit URL Paystack → Redirigé vers Paystack
       → Paiement effectué → Paystack envoie Webhook
       → Notre serveur valide signature → Met à jour DB
       → Génère facture → Envoie email confirmation
       → Notifie admins → Client voit confirmation
```

---

## 10. Sécurité Paystack — Rappels

- La signature du webhook **doit** être validée avec HMAC-SHA512
- Le montant **ne doit jamais** venir du frontend — toujours recalculer côté serveur
- La vérification du paiement (`/transaction/verify`) doit être faite côté serveur
- Stocker `paystack_reference` pour l'idempotence (ne pas traiter deux fois)
- En cas de doute, appeler `/transaction/verify` pour confirmer l'état réel

---

*Liens utiles :*  
- API Reference : https://paystack.com/docs/api/  
- Webhooks : https://paystack.com/docs/payments/webhooks/  
- Test Cards : https://paystack.com/docs/payments/test-payments/
