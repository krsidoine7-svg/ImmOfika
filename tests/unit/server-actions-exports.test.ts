import { describe, it, expect } from 'vitest'
import fs from 'fs'
import path from 'path'
import { PasswordPolicySchema } from '@/lib/auth/passwordPolicy'

describe('Password Policy Schema', () => {
  it('valide un mot de passe conforme (>= 10 car, majuscule, minuscule, chiffre, symbole)', () => {
    const valid = 'Secur3@Immo2026'
    const result = PasswordPolicySchema.safeParse(valid)
    expect(result.success).toBe(true)
  })

  it('rejette un mot de passe trop court (< 10 caractères)', () => {
    const invalid = 'Short1@'
    const result = PasswordPolicySchema.safeParse(invalid)
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.issues[0].message).toContain('au moins 10 caractères')
    }
  })

  it('rejette un mot de passe sans majuscule', () => {
    const invalid = 'secur3@immo2026'
    const result = PasswordPolicySchema.safeParse(invalid)
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.issues[0].message).toContain('au moins une lettre majuscule')
    }
  })

  it('rejette un mot de passe sans chiffre', () => {
    const invalid = 'Secure@ImmoFika'
    const result = PasswordPolicySchema.safeParse(invalid)
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.issues[0].message).toContain('au moins un chiffre')
    }
  })

  it('rejette un mot de passe sans caractère spécial', () => {
    const invalid = 'Secure123ImmoFika'
    const result = PasswordPolicySchema.safeParse(invalid)
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.issues[0].message).toContain('au moins un caractère spécial')
    }
  })
})

describe('Next.js "use server" File Invariant Check', () => {
  it('aucun fichier "use server" dans src/app/actions n\'exporte de constante ou d\'objet non-fonction', () => {
    const actionsDir = path.resolve(process.cwd(), 'src/app/actions')
    const files = fs.readdirSync(actionsDir).filter((f) => f.endsWith('.ts') || f.endsWith('.tsx'))

    const violations: { file: string; match: string }[] = []

    for (const file of files) {
      const fullPath = path.join(actionsDir, file)
      const content = fs.readFileSync(fullPath, 'utf8')

      // Vérifier si le fichier a 'use server'
      if (content.includes("'use server'") || content.includes('"use server"')) {
        // Détecter tout export const, export let, export var, export enum
        const matches = content.match(/^export\s+(const|let|var|enum)\s+([a-zA-Z0-9_]+)/gm)
        if (matches) {
          for (const match of matches) {
            violations.push({ file, match })
          }
        }
      }
    }

    expect(violations).toEqual([])
  })
})

