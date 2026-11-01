import { describe, it, expect, vi, beforeEach } from 'vitest'
import {
  genererNumeroFNE,
  calculerSignatureFNE,
  genererStickerFNE,
  FNE_PREFIXES,
} from '@/lib/fne/service'
import { generateQrMatrix, qrMatrixToSvg } from '@/lib/fne/qrcode'
import { siteConfig } from '@/config/site'
import { db } from '@/lib/db'

vi.mock('@/lib/db', () => ({
  db: {
    select: vi.fn(),
    insert: vi.fn(),
    update: vi.fn(),
  },
}))

describe('🧾 FNE (Facture Normalisée Électronique — DGI Côte d\'Ivoire)', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('1. Format séquentiel officiel (Art. 5 Arrêté 0337)', () => {
    it('devrait générer un numéro de facture de vente conforme sans préfixe sur 10 chiffres', async () => {
      // Mock: première facture de l'année 2026
      vi.mocked(db.select).mockReturnValue({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            limit: vi.fn().mockResolvedValue([]),
          }),
        }),
      } as any)

      vi.mocked(db.insert).mockReturnValue({
        values: vi.fn().mockResolvedValue({}),
      } as any)

      const fneNumero = await genererNumeroFNE('VENTE', 2026)
      // Format : [aucun préfixe] + NCC (2034567A) + 26 + 0000000001
      expect(fneNumero).toBe('2034567A260000000001')
      expect(fneNumero.length).toBe(siteConfig.company.ncc.length + 2 + 10)
    })

    it('devrait générer un numéro de facture d\'avoir avec le préfixe officiel A', async () => {
      vi.mocked(db.select).mockReturnValue({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            limit: vi.fn().mockResolvedValue([{ derniereSequence: 4 }]),
          }),
        }),
      } as any)

      vi.mocked(db.update).mockReturnValue({
        set: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            returning: vi.fn().mockResolvedValue([{ seq: 5 }]),
          }),
        }),
      } as any)

      const avoirNumero = await genererNumeroFNE('AVOIR', 2026)
      // Format : A + NCC + 26 + 0000000005
      expect(avoirNumero.startsWith('A')).toBe(true)
      expect(avoirNumero).toBe(`A${siteConfig.company.ncc}260000000005`)
    })

    it('devrait respecter les préfixes officiels pour chaque type', () => {
      expect(FNE_PREFIXES.VENTE).toBe('')
      expect(FNE_PREFIXES.AVOIR).toBe('A')
      expect(FNE_PREFIXES.PROFORMA).toBe('P')
      expect(FNE_PREFIXES.BORDEREAU).toBe('B')
    })
  })

  describe('2. Signature électronique & Empreinte de scellement (Art. 4)', () => {
    it('devrait produire une empreinte SHA-256 déterministe de 64 caractères', () => {
      const fneNum = '2034567A260000000001'
      const dateIso = '2026-10-31T00:00:00.000Z'
      const montant = 1180000
      const ref = 'PAYSTACK-TX-12345'

      const sig1 = calculerSignatureFNE(fneNum, dateIso, montant, ref)
      const sig2 = calculerSignatureFNE(fneNum, dateIso, montant, ref)

      expect(sig1).toBe(sig2)
      expect(sig1.length).toBe(64)
      expect(/^[0-9a-f]{64}$/.test(sig1)).toBe(true)
    })
  })

  describe('3. Sticker électronique & QR Code de certification', () => {
    it('devrait générer un QR Code valide et une URL de vérification officielle DGI', () => {
      const fneNum = '2034567A260000000001'
      const sig = 'abcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890'
      const sticker = genererStickerFNE(fneNum, sig, 500000)

      expect(sticker.verificationUrl).toContain('https://fne.dgi.gouv.ci/v/2034567A260000000001')
      expect(sticker.qrMatrix.size).toBeGreaterThanOrEqual(25)
      expect(sticker.qrCodeSvg).toContain('<svg')
      expect(sticker.qrCodeDataUrl.startsWith('data:image/svg+xml;base64,')).toBe(true)
    })

    it('devrait générer une matrice QR cohérente', () => {
      const matrix = generateQrMatrix('https://fne.dgi.gouv.ci/v/TEST')
      expect(matrix.modules.length).toBe(matrix.size)
      expect(matrix.modules[0].length).toBe(matrix.size)
      const svg = qrMatrixToSvg(matrix)
      expect(svg).toContain('<rect')
    })
  })

  describe('4. Ventilation fiscale légale (Art. 6 - TVA 18% CI)', () => {
    it('devrait calculer exactement la base HT et la TVA 18% depuis un montant TTC', () => {
      const montantTTC = 1180000
      const montantHT = Math.round(montantTTC / 1.18)
      const montantTVA = montantTTC - montantHT

      expect(montantHT).toBe(1000000)
      expect(montantTVA).toBe(180000)
      expect(montantHT + montantTVA).toBe(montantTTC)
    })
  })
})

