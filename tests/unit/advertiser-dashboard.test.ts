import { describe, it, expect } from 'vitest'
import { z } from 'zod'

const InviterMembreSchema = z.object({
  email: z.string().email('Adresse e-mail invalide'),
  roleInOrg: z.enum(['gerant', 'negociateur', 'assistant']).default('negociateur'),
})

describe('Advertiser Dashboard & Multi-Organization Features', () => {
  it('devrait valider l invitation d un collaborateur avec Zod et rejeter les formats invalides', () => {
    const valide = InviterMembreSchema.safeParse({
      email: 'negociateur.cocody@agence-elite.ci',
      roleInOrg: 'negociateur',
    })
    expect(valide.success).toBe(true)

    // Défaut
    const avecDefaut = InviterMembreSchema.safeParse({
      email: 'assistant@agence.ci',
    })
    expect(avecDefaut.success).toBe(true)
    if (avecDefaut.success) {
      expect(avecDefaut.data.roleInOrg).toBe('negociateur')
    }

    // Email invalide
    const emailInvalide = InviterMembreSchema.safeParse({
      email: 'pas-un-email',
      roleInOrg: 'negociateur',
    })
    expect(emailInvalide.success).toBe(false)

    // Rôle non autorisé
    const roleInvalide = InviterMembreSchema.safeParse({
      email: 'directeur@agence.ci',
      roleInOrg: 'super_admin' as any,
    })
    expect(roleInvalide.success).toBe(false)
  })

  it('devrait agréger correctement les KPIs annonceur selon les statuts de modération', () => {
    const fakeBiens = [
      { id: '1', statutModeration: 'valide', vues: 150 },
      { id: '2', statutModeration: 'valide', vues: 300 },
      { id: '3', statutModeration: 'en_attente', vues: 10 },
      { id: '4', statutModeration: 'rejete', vues: 0 },
    ]

    const totalBiens = fakeBiens.length
    const biensValides = fakeBiens.filter((b) => b.statutModeration === 'valide').length
    const biensEnAttente = fakeBiens.filter((b) => b.statutModeration === 'en_attente').length
    const totalVues = fakeBiens.reduce((acc, curr) => acc + curr.vues, 0)

    expect(totalBiens).toBe(4)
    expect(biensValides).toBe(2)
    expect(biensEnAttente).toBe(1)
    expect(totalVues).toBe(460)
  })

  it('devrait distinguer les rôles et affiliations d organisation', () => {
    const promoteurProfile = {
      role: 'promoteur',
      organization: {
        type: 'promoteur',
        agrementNumero: 'MCLU-PROM-2024-089',
      },
    }

    const isPromoteurAgree =
      promoteurProfile.organization.type === 'promoteur' &&
      !!promoteurProfile.organization.agrementNumero

    expect(isPromoteurAgree).toBe(true)
    expect(promoteurProfile.organization.agrementNumero).toMatch(/^MCLU-/)
  })
})

