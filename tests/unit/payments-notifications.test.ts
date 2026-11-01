import { describe, it, expect } from 'vitest'
import crypto from 'crypto'
import { z } from 'zod'

// ─── Calcul de l'acompte légal de réservation ────────────────────────────────
function calculerAcompteLegal(prix: number, transaction: 'vente' | 'location'): number {
  if (prix <= 0) return 50000 // Forfaitaire minimum
  if (transaction === 'location') {
    return Math.round(prix) // 1 mois de loyer
  }
  return Math.round(prix * 0.1) // 10% légal en vente
}

// ─── Vérification Signature HMAC-SHA512 Paystack ──────────────────────────────
function verifierSignaturePaystack(rawBody: string, signature: string, secretKey: string): boolean {
  if (!signature || !secretKey) return false
  const expectedHash = crypto
    .createHmac('sha512', secretKey)
    .update(rawBody)
    .digest('hex')
  return expectedHash === signature
}

// ─── Moteur de Matching des Alertes ──────────────────────────────────────────
interface AlerteCritere {
  commune?: string
  type?: string
  transaction?: string
  prixMax?: number
  prixMin?: number
}

function correspondAlerte(critere: AlerteCritere, annonce: {
  commune: string
  type: string
  transaction: string
  prix: number
}): boolean {
  if (critere.commune && critere.commune.toLowerCase() !== annonce.commune.toLowerCase()) {
    return false
  }
  if (critere.type && critere.type.toLowerCase() !== annonce.type.toLowerCase()) {
    return false
  }
  if (critere.transaction && critere.transaction.toLowerCase() !== annonce.transaction.toLowerCase()) {
    return false
  }
  if (critere.prixMax && annonce.prix > critere.prixMax) {
    return false
  }
  if (critere.prixMin && annonce.prix < critere.prixMin) {
    return false
  }
  return true
}

describe('Mobile Money & Notifications Multi-Canaux ImmOfika', () => {
  it('devrait calculer fidèlement l acompte légal selon la nature de transaction (vente 10% vs location 1 mois)', () => {
    // Vente : 10%
    const prixVente = 150000000 // 150M FCFA
    const acompteVente = calculerAcompteLegal(prixVente, 'vente')
    expect(acompteVente).toBe(15000000) // 15M FCFA (10%)

    // Location : 1 mois de caution
    const loyerMensuel = 650000 // 650k FCFA
    const acompteLocation = calculerAcompteLegal(loyerMensuel, 'location')
    expect(acompteLocation).toBe(650000)

    // Forfait minimum
    expect(calculerAcompteLegal(0, 'vente')).toBe(50000)
  })

  it('devrait valider la signature HMAC-SHA512 Paystack et rejeter les payloads falsifiés', () => {
    const secret = 'sk_test_fake_paystack_secret_key_123456789'
    const body = JSON.stringify({
      event: 'charge.success',
      data: {
        reference: 'IM-PAY-1730000000-ABCDEF',
        amount: 1500000000,
        customer: { email: 'client.test@immofika.ci' },
      },
    })

    const signatureValide = crypto.createHmac('sha512', secret).update(body).digest('hex')
    expect(verifierSignaturePaystack(body, signatureValide, secret)).toBe(true)

    // Signature altérée
    const signatureFalsifiee = signatureValide.substring(0, signatureValide.length - 4) + 'ffff'
    expect(verifierSignaturePaystack(body, signatureFalsifiee, secret)).toBe(false)

    // Body falsifié (man-in-the-middle)
    const bodyAltere = body.replace('1500000000', '1000')
    expect(verifierSignaturePaystack(bodyAltere, signatureValide, secret)).toBe(false)
  })

  it('devrait matcher avec précision les alertes actives lors de la publication d un bien', () => {
    const annonceCocody = {
      commune: 'Cocody',
      type: 'villa',
      transaction: 'vente',
      prix: 180000000,
    }

    // Alerte 1 : Cherche villa à Cocody jusqu'à 200M FCFA -> Match
    const alerte1: AlerteCritere = {
      commune: 'Cocody',
      type: 'villa',
      transaction: 'vente',
      prixMax: 200000000,
    }
    expect(correspondAlerte(alerte1, annonceCocody)).toBe(true)

    // Alerte 2 : Cherche appartement à Cocody -> Ne matche pas
    const alerte2: AlerteCritere = {
      commune: 'Cocody',
      type: 'appartement',
      transaction: 'vente',
    }
    expect(correspondAlerte(alerte2, annonceCocody)).toBe(false)

    // Alerte 3 : Cherche à Yopougon -> Ne matche pas
    const alerte3: AlerteCritere = {
      commune: 'Yopougon',
      type: 'villa',
      transaction: 'vente',
    }
    expect(correspondAlerte(alerte3, annonceCocody)).toBe(false)

    // Alerte 4 : Budget max 150M FCFA -> Ne matche pas (180M > 150M)
    const alerte4: AlerteCritere = {
      commune: 'Cocody',
      transaction: 'vente',
      prixMax: 150000000,
    }
    expect(correspondAlerte(alerte4, annonceCocody)).toBe(false)
  })

  it('devrait formater correctement les types de notifications multi-canaux', () => {
    const typesAutorises = ['reservation', 'paiement', 'visite', 'lead', 'system', 'moderation', 'alerte']
    const NotificationSchema = z.object({
      userId: z.string().uuid(),
      title: z.string().min(2),
      message: z.string().min(5),
      type: z.enum(['reservation', 'paiement', 'visite', 'lead', 'system', 'moderation', 'alerte']),
      link: z.string().optional(),
    })

    const notifValide = NotificationSchema.safeParse({
      userId: crypto.randomUUID(),
      title: 'Acompte consigné sous séquestre',
      message: 'Un paiement d acompte légal de 15 000 000 FCFA a été validé pour votre bien.',
      type: 'paiement',
      link: '/dashboard/bailleur',
    })
    expect(notifValide.success).toBe(true)

    const notifMod = NotificationSchema.safeParse({
      userId: crypto.randomUUID(),
      title: 'Annonce validée & en ligne',
      message: 'Votre annonce a été approuvée avec le Visa Foncier ACD.',
      type: 'moderation',
      link: '/biens/villa-cocody',
    })
    expect(notifMod.success).toBe(true)
  })
})

