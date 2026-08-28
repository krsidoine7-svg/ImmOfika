import { describe, it, expect } from 'vitest'
import { buildDynamicZodSchema, ChampFormulaire } from '@/types/formulaire'

describe('F18 — Générateur de Formulaires (buildDynamicZodSchema)', () => {
  it('devrait valider un formulaire avec champs requis et facultatifs', () => {
    const champs: ChampFormulaire[] = [
      { id: 'nom', type: 'text', label: 'Nom complet', requis: true },
      { id: 'email', type: 'email', label: 'Email', requis: true },
      { id: 'budget', type: 'number', label: 'Budget', requis: false },
    ]

    const schema = buildDynamicZodSchema(champs)

    // Test valide
    const validData = { nom: 'Jean Kouassi', email: 'jean@exemple.ci', budget: 50000000 }
    const resultValid = schema.safeParse(validData)
    expect(resultValid.success).toBe(true)

    // Test invalide (champ requis manquant)
    const invalidData = { nom: '', email: 'jean@exemple.ci' }
    const resultInvalid = schema.safeParse(invalidData)
    expect(resultInvalid.success).toBe(false)
  })

  it('devrait valider les adresses email correctement', () => {
    const champs: ChampFormulaire[] = [
      { id: 'email', type: 'email', label: 'Email', requis: true },
    ]

    const schema = buildDynamicZodSchema(champs)

    const invalidEmail = schema.safeParse({ email: 'bad-email-format' })
    expect(invalidEmail.success).toBe(false)

    const validEmail = schema.safeParse({ email: 'contact@immofika.ci' })
    expect(validEmail.success).toBe(true)
  })
})
