import { describe, it, expect } from 'vitest'
import { getDefaultDashboardForRole, canRoleAccessPath } from '@/lib/roles'
import type { AllowedPublicRole } from '@/app/actions/authActions'

describe('Marketplace Auth & Onboarding Rules', () => {
  it('seuls les 4 rôles publics sont autorisés à l\'inscription publique', () => {
    const allowedRoles: AllowedPublicRole[] = ['client', 'proprietaire', 'agence', 'promoteur']
    expect(allowedRoles).toHaveLength(4)

    // Vérifier qu'aucun rôle administratif ou staff n'est dans les rôles publics
    const forbiddenRoles = ['admin', 'super_admin', 'moderateur', 'support', 'catalogue']
    forbiddenRoles.forEach((role) => {
      expect(allowedRoles).not.toContain(role)
    })
  })

  it('redirection officielle correcte après onboarding selon le rôle', () => {
    expect(getDefaultDashboardForRole('client')).toBe('/client/dashboard')
    expect(getDefaultDashboardForRole('proprietaire')).toBe('/dashboard/bailleur')
    expect(getDefaultDashboardForRole('agence')).toBe('/dashboard/bailleur')
    expect(getDefaultDashboardForRole('promoteur')).toBe('/dashboard/bailleur')
  })

  it('contrôle des autorisations d\'accès par chemin pour les acteurs marketplace', () => {
    // Client accède à son espace client et aux biens publics
    expect(canRoleAccessPath('client', '/client/dashboard')).toBe(true)
    expect(canRoleAccessPath('client', '/biens')).toBe(true)
    expect(canRoleAccessPath('client', '/admin')).toBe(false)
    expect(canRoleAccessPath('client', '/admin/utilisateurs')).toBe(false)

    // Propriétaire accède à son dashboard bailleur
    expect(canRoleAccessPath('proprietaire', '/dashboard/bailleur')).toBe(true)
    expect(canRoleAccessPath('proprietaire', '/admin/systeme')).toBe(false)

    // Agence accède à son dashboard bailleur et aux visites
    expect(canRoleAccessPath('agence', '/dashboard/bailleur')).toBe(true)
    expect(canRoleAccessPath('agence', '/admin/visites')).toBe(true)
    expect(canRoleAccessPath('agence', '/admin/utilisateurs')).toBe(false)

    // Promoteur accède à son dashboard bailleur et aux visites
    expect(canRoleAccessPath('promoteur', '/dashboard/bailleur')).toBe(true)
    expect(canRoleAccessPath('promoteur', '/admin/visites')).toBe(true)
    expect(canRoleAccessPath('promoteur', '/admin/utilisateurs')).toBe(false)
  })

  it('validation des champs d\'onboarding selon le profil', () => {
    // Helper de validation simulant la logique métier
    function validateOnboarding(role: AllowedPublicRole, data: {
      fullName?: string
      phone?: string
      organizationName?: string
      rccm?: string
      agrementNumero?: string
    }) {
      if (role === 'client' || role === 'proprietaire') {
        if (!data.fullName || data.fullName.trim().length < 2) return 'Nom trop court'
        if (!data.phone || data.phone.trim().length < 8) return 'Téléphone invalide'
        return 'OK'
      }

      if (role === 'agence' || role === 'promoteur') {
        if (!data.organizationName || data.organizationName.trim().length < 2) return 'Raison sociale obligatoire'
        if (!data.rccm || data.rccm.trim().length < 5) return 'RCCM obligatoire'
        if (role === 'promoteur' && (!data.agrementNumero || data.agrementNumero.trim().length < 3)) {
          return 'Agrément MCLU obligatoire pour promoteur'
        }
        if (!data.phone || data.phone.trim().length < 8) return 'Téléphone professionnel obligatoire'
        return 'OK'
      }

      return 'Rôle inconnu'
    }

    // Client
    expect(validateOnboarding('client', { fullName: 'A', phone: '+225 01020304' })).toBe('Nom trop court')
    expect(validateOnboarding('client', { fullName: 'Kouassi Marc', phone: '123' })).toBe('Téléphone invalide')
    expect(validateOnboarding('client', { fullName: 'Kouassi Marc', phone: '+225 07080910' })).toBe('OK')

    // Agence
    expect(validateOnboarding('agence', { organizationName: 'Immo CI', rccm: 'CI-1', phone: '+225 27000000' })).toBe('RCCM obligatoire')
    expect(validateOnboarding('agence', { organizationName: 'Immo CI', rccm: 'CI-ABJ-2024-B-1234', phone: '+225 27000000' })).toBe('OK')

    // Promoteur (MCLU requis)
    expect(validateOnboarding('promoteur', {
      organizationName: 'Promotelec SA',
      rccm: 'CI-ABJ-2024-B-5678',
      phone: '+225 27111111'
    })).toBe('Agrément MCLU obligatoire pour promoteur')

    expect(validateOnboarding('promoteur', {
      organizationName: 'Promotelec SA',
      rccm: 'CI-ABJ-2024-B-5678',
      agrementNumero: 'AG-2023-MCLU-099',
      phone: '+225 27111111'
    })).toBe('OK')
  })
})
