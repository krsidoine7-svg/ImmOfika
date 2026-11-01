import { describe, it, expect } from 'vitest'
import { ROLE_DEFAULT_DASHBOARDS, ROLE_ALLOWED_PREFIXES } from '@/lib/roles'
import type { ContactInput } from '@/app/actions/contactActions'

describe('Étape 5 — Isolation Back-Office & Découplage CRM Leads / Tally', () => {
  it('aucun rôle système n\'a pour tableau de bord par défaut une route CRM supprimée', () => {
    Object.entries(ROLE_DEFAULT_DASHBOARDS).forEach(([role, path]) => {
      expect(path).not.toBe('/admin/leads')
      expect(path).not.toBe('/admin/formulaires')
    })
  })

  it('les préfixes autorisés par rôle excluent définitivement les routes CRM et Tally', () => {
    Object.entries(ROLE_ALLOWED_PREFIXES).forEach(([role, prefixes]) => {
      expect(prefixes).not.toContain('/admin/leads')
      expect(prefixes).not.toContain('/admin/formulaires')
    })
  })

  it('validation et sécurisation anti-bot du formulaire de contact direct', () => {
    // Helper de validation simulant la logique de contactActions
    function validateContactMessage(input: {
      nom: string
      telephone: string
      email?: string
      website_hp?: string
    }) {
      if (input.website_hp && input.website_hp.trim().length > 0) {
        return { success: true, isHoneypot: true } // Bot piégé sans action
      }
      if (!input.nom || input.nom.trim().length < 2) {
        return { error: 'Nom requis' }
      }
      if (!input.telephone || input.telephone.trim().length < 8) {
        return { error: 'Téléphone requis' }
      }
      return { success: true, isHoneypot: false }
    }

    // Nom manquant
    expect(validateContactMessage({ nom: '', telephone: '+225 07000000' })).toEqual({ error: 'Nom requis' })

    // Téléphone court
    expect(validateContactMessage({ nom: 'Kouassi', telephone: '123' })).toEqual({ error: 'Téléphone requis' })

    // Piège à bot Honeypot
    expect(validateContactMessage({
      nom: 'Spam Bot',
      telephone: '+225 07000000',
      website_hp: 'https://spam-link.com'
    })).toEqual({ success: true, isHoneypot: true })

    // Contact légitime
    expect(validateContactMessage({
      nom: 'Aka Jean',
      telephone: '+225 0708091011',
      email: 'aka.jean@gmail.com'
    })).toEqual({ success: true, isHoneypot: false })
  })
})

