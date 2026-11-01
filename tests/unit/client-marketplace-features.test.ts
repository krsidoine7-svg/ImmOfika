import { describe, it, expect } from 'vitest'
import { calculerCompletudeDossier } from '@/lib/dossier'
import { z } from 'zod'

const AlerteCriteresSchema = z.object({
  commune: z.string().optional(),
  type: z.string().optional(),
  transaction: z.enum(['vente', 'location', '']).optional(),
  prixMin: z.number().min(0).optional(),
  prixMax: z.number().min(0).optional(),
  piecesMin: z.number().min(0).optional(),
  typeTitrePropriete: z.string().optional(),
})

const CreerAlerteSchema = z.object({
  titre: z.string().min(2, 'Le titre de l alerte doit comporter au moins 2 caractères'),
  criteres: AlerteCriteresSchema,
  frequence: z.enum(['immediat', 'quotidien', 'hebdomadaire']).default('quotidien'),
})

describe('Client Marketplace Features : Alertes & Dossiers Candidats', () => {
  it('devrait calculer précisément le score de complétude d un dossier candidat', () => {
    // Dossier vide
    expect(calculerCompletudeDossier({}, null, null)).toBe(0)

    // Uniquement profession et revenu
    const scoreBase = calculerCompletudeDossier({}, 'Ingénieur Logiciel', 1200000)
    expect(scoreBase).toBe(40)

    // Ajout CNI
    const scoreAvecCNI = calculerCompletudeDossier(
      { cniUrl: 'https://storage.immofika.ci/cni.pdf' },
      'Directeur Financier',
      2500000
    )
    expect(scoreAvecCNI).toBe(60)

    // Dossier 100% complet
    const scoreComplet = calculerCompletudeDossier(
      {
        cniUrl: 'https://storage.immofika.ci/cni.pdf',
        bulletinsSalaireUrls: ['https://storage.immofika.ci/bulletin1.pdf'],
        attestationTravailUrl: 'https://storage.immofika.ci/attestation.pdf',
        quittanceUrl: 'https://storage.immofika.ci/quittance.pdf',
      },
      'Avocat Associé',
      3000000
    )
    expect(scoreComplet).toBe(100)
  })

  it('devrait valider les critères d alerte avec Zod et rejeter les formats invalides', () => {
    const valide = CreerAlerteSchema.safeParse({
      titre: 'Villa 5 pièces à Cocody',
      criteres: {
        commune: 'Cocody',
        type: 'villa',
        transaction: 'vente',
        prixMax: 200000000,
        typeTitrePropriete: 'acd',
      },
      frequence: 'quotidien',
    })
    expect(valide.success).toBe(true)

    // Rejet : titre trop court
    const titreInvalide = CreerAlerteSchema.safeParse({
      titre: 'V',
      criteres: {},
      frequence: 'quotidien',
    })
    expect(titreInvalide.success).toBe(false)

    // Rejet : fréquence non reconnue
    const freqInvalide = CreerAlerteSchema.safeParse({
      titre: 'Alerte Mensuelle',
      criteres: {},
      frequence: 'mensuel' as any,
    })
    expect(freqInvalide.success).toBe(false)
  })

  it('devrait rejeter un budget négatif dans les critères d alerte', () => {
    const prixNegatif = CreerAlerteSchema.safeParse({
      titre: 'Recherche Yopougon',
      criteres: {
        prixMax: -50000,
      },
      frequence: 'quotidien',
    })
    expect(prixNegatif.success).toBe(false)
  })
})

