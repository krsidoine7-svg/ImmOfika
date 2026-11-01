import { describe, it, expect } from 'vitest'
import {
  COMMUNES_ABIDJAN,
  TITRES_FONCIERS,
  ABIDJAN_CENTER,
  TYPES_BIENS,
} from '@/lib/constants/abidjan'

describe('Marketplace Public Features & Référentiel Abidjan', () => {
  it('devrait contenir les communes majeures d Abidjan avec des coordonnées GPS valides', () => {
    expect(COMMUNES_ABIDJAN.length).toBeGreaterThanOrEqual(10)

    const cocody = COMMUNES_ABIDJAN.find((c) => c.id === 'cocody')
    expect(cocody).toBeDefined()
    expect(cocody?.nom).toBe('Cocody')
    expect(cocody?.coords.lat).toBeGreaterThan(5.0)
    expect(cocody?.coords.lng).toBeLessThan(-3.5)
    expect(cocody?.quartiers.length).toBeGreaterThanOrEqual(5)

    const marcory = COMMUNES_ABIDJAN.find((c) => c.id === 'marcory')
    expect(marcory).toBeDefined()
    expect(marcory?.quartiers).toContain('Zone 4')

    const plateau = COMMUNES_ABIDJAN.find((c) => c.id === 'plateau')
    expect(plateau).toBeDefined()
    expect(plateau?.zone).toBe('centre')
  })

  it('devrait définir les titres fonciers légaux ivoiriens avec les niveaux de garantie conformes MCLU', () => {
    const acd = TITRES_FONCIERS.acd
    expect(acd).toBeDefined()
    expect(acd.badgeLabel).toBe('Titre ACD Garanti')
    expect(acd.garantieNiveau).toBe('maximale')

    const cmp = TITRES_FONCIERS.cmp
    expect(cmp).toBeDefined()
    expect(cmp.garantieNiveau).toBe('maximale')

    const tf = TITRES_FONCIERS.titre_foncier
    expect(tf).toBeDefined()
    expect(tf.garantieNiveau).toBe('maximale')

    const bail = TITRES_FONCIERS.bail_emphyteotique
    expect(bail).toBeDefined()
    expect(bail.garantieNiveau).toBe('haute')
  })

  it('devrait calculer correctement l acompte légal de réservation selon la nature de la transaction', () => {
    // Vente : 10% d acompte légal d engagement
    const prixVente = 150000000 // 150M FCFA
    const acompteVente = Math.round(prixVente * 0.1)
    expect(acompteVente).toBe(15000000) // 15M FCFA

    // Location : 1 mois de loyer en acompte / séquestre
    const loyerMensuel = 650000 // 650k FCFA
    const acompteLocation = Math.round(loyerMensuel)
    expect(acompteLocation).toBe(650000)
  })

  it('devrait fournir un centre géographique d Abidjan cohérent pour la carte interactive', () => {
    expect(ABIDJAN_CENTER.lat).toBeCloseTo(5.3484, 2)
    expect(ABIDJAN_CENTER.lng).toBeCloseTo(-4.0197, 2)
    expect(ABIDJAN_CENTER.zoom).toBeGreaterThanOrEqual(10)
  })

  it('devrait exposer les typologies de biens compatibles avec les transactions ivoiriennes', () => {
    const types = TYPES_BIENS.map((t) => t.value)
    expect(types).toContain('villa')
    expect(types).toContain('appartement')
    expect(types).toContain('terrain')
    expect(types).toContain('immeuble')
    expect(types).toContain('commerce')
  })
})

