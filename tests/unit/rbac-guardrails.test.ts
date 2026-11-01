import { describe, it, expect, vi, beforeEach } from 'vitest'
import {
  assertCanTouchSensitivePermission,
  assertActorPossessesPermission,
  assertCanModifyRole,
  assertNotModifyingSelf,
  assertNotLastSuperAdmin,
  checkRoleCompatibility,
  SENSITIVE_PERMISSIONS,
  INCOMPATIBLE_ROLE_PAIRS,
  can,
  type AuthUserContext,
} from '@/lib/auth/permissions'
import { db } from '@/lib/db/index'

// Mock de la base de données Drizzle pour tests unitaires déterministes
vi.mock('@/lib/db/index', () => ({
  db: {
    select: vi.fn(),
    insert: vi.fn(),
    delete: vi.fn(),
    update: vi.fn(),
  },
}))

describe('🛡️ RBAC Guardrails & Least Privilege Suite', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  // ─── 1. Permissions Sensibles 🔒 ────────────────────────────────────────────
  describe('Garde-fou #1 : Permissions Sensibles 🔒', () => {
    it('devrait interdire à un ADMIN d\'accorder ou manipuler une permission sensible', () => {
      const adminActor: AuthUserContext = {
        id: 'admin-user-id',
        email: 'admin@immofika.ci',
        role: 'admin',
        roles: ['ADMIN'],
        hierarchyLevel: 7, // Admin standard
      }

      for (const sensitivePerm of SENSITIVE_PERMISSIONS) {
        expect(() => {
          assertCanTouchSensitivePermission(adminActor, sensitivePerm)
        }).toThrow(/Seul un Super Administrateur peut accorder ou révoquer une permission sensible/)
      }
    })

    it('devrait autoriser le SUPER_ADMIN (niveau 8) à gérer les permissions sensibles', () => {
      const superAdminActor: AuthUserContext = {
        id: 'superadmin-user-id',
        email: 'root@immofika.ci',
        role: 'super_admin',
        roles: ['SUPER_ADMIN'],
        hierarchyLevel: 8,
      }

      expect(() => {
        assertCanTouchSensitivePermission(superAdminActor, 'paiement:configurer')
      }).not.toThrow()
    })
  })

  // ─── 2. Règle du Miroir (Un ADMIN n'accorde que ce qu'il a) ──────────────────
  describe('Garde-fou #2 : Règle du Miroir pour l\'ADMIN', () => {
    it('devrait refuser qu\'un ADMIN accorde une permission qu\'il ne possède pas lui-même', async () => {
      const adminActor: AuthUserContext = {
        id: 'admin-actor-id',
        email: 'admin@immofika.ci',
        role: 'admin',
        roles: ['ADMIN'],
        hierarchyLevel: 7,
      }

      // Mock: l'acteur ne possède pas 'annonce:moderer'
      vi.mocked(db.select).mockReturnValue({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            limit: vi.fn().mockResolvedValue([]),
          }),
        }),
      } as any)

      await expect(
        assertActorPossessesPermission(adminActor, 'annonce:moderer')
      ).rejects.toThrow(/Un Administrateur ne peut accorder que des permissions qu'il possède lui-même/)
    })
  })

  // ─── 3. Anti-auto-modification ──────────────────────────────────────────────
  describe('Garde-fou #3 : Interdiction de modifier ses propres droits', () => {
    it('devrait refuser qu\'un utilisateur modifie ses propres rôles', () => {
      const actor: AuthUserContext = {
        id: 'user-123',
        email: 'actor@immofika.ci',
        role: 'admin',
        roles: ['ADMIN'],
        hierarchyLevel: 7,
      }

      expect(() => {
        assertNotModifyingSelf(actor, 'user-123')
      }).toThrow(/Il est strictement interdit de modifier ses propres rôles ou privilèges/)
    })

    it('devrait autoriser l\'action si la cible est un utilisateur distinct', () => {
      const actor: AuthUserContext = {
        id: 'user-123',
        email: 'actor@immofika.ci',
        role: 'admin',
        roles: ['ADMIN'],
        hierarchyLevel: 7,
      }

      expect(() => {
        assertNotModifyingSelf(actor, 'target-user-456')
      }).not.toThrow()
    })
  })

  // ─── 4. Hiérarchie Stricte & SUPER_ADMIN Verrouillé ─────────────────────────
  describe('Garde-fou #4 : Hiérarchie Stricte & Rôle SUPER_ADMIN Verrouillé', () => {
    it('devrait interdire toute modification des permissions du rôle SUPER_ADMIN (Verrouillé)', async () => {
      const superAdminActor: AuthUserContext = {
        id: 'sa-id',
        email: 'sa@immofika.ci',
        role: 'super_admin',
        roles: ['SUPER_ADMIN'],
        hierarchyLevel: 8,
      }

      await expect(
        assertCanModifyRole(superAdminActor, 'SUPER_ADMIN')
      ).rejects.toThrow(/Le rôle SUPER_ADMIN est strictement verrouillé/)
    })

    it('devrait interdire à un ADMIN (niv. 7) de modifier un rôle de niveau égal ou supérieur', async () => {
      const adminActor: AuthUserContext = {
        id: 'admin-id',
        email: 'admin@immofika.ci',
        role: 'admin',
        roles: ['ADMIN'],
        hierarchyLevel: 7,
      }

      // Mock: rôle cible de niveau 7
      vi.mocked(db.select).mockReturnValue({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            limit: vi.fn().mockResolvedValue([{ level: 7, isSystem: true, isLocked: false }]),
          }),
        }),
      } as any)

      await expect(
        assertCanModifyRole(adminActor, 'AUTRE_ADMIN')
      ).rejects.toThrow(/Vous ne pouvez agir que sur des rôles de niveau STRICTEMENT inférieur au vôtre/)
    })

    it('devrait autoriser un ADMIN (niv. 7) à modifier un rôle de niveau strictement inférieur (ex: SUPPORT niv. 3)', async () => {
      const adminActor: AuthUserContext = {
        id: 'admin-id',
        email: 'admin@immofika.ci',
        role: 'admin',
        roles: ['ADMIN'],
        hierarchyLevel: 7,
      }

      // Mock: rôle cible de niveau 3
      vi.mocked(db.select).mockReturnValue({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            limit: vi.fn().mockResolvedValue([{ level: 3, isSystem: true, isLocked: false }]),
          }),
        }),
      } as any)

      await expect(
        assertCanModifyRole(adminActor, 'SUPPORT')
      ).resolves.not.toThrow()
    })
  })

  // ─── 5. Protection du Dernier SUPER_ADMIN ───────────────────────────────────
  describe('Garde-fou #5 : Protection du Dernier SUPER_ADMIN', () => {
    it('devrait interdire la suppression ou révocation du dernier SUPER_ADMIN', async () => {
      // Mock: 1 seul super_admin dans la plateforme
      vi.mocked(db.select)
        .mockReturnValueOnce({
          from: vi.fn().mockReturnValue({
            where: vi.fn().mockResolvedValue([{ count: 1 }]),
          }),
        } as any)
        .mockReturnValueOnce({
          from: vi.fn().mockReturnValue({
            where: vi.fn().mockReturnValue({
              limit: vi.fn().mockResolvedValue([{ userId: 'last-sa-id', roleName: 'super_admin' }]),
            }),
          }),
        } as any)

      await expect(
        assertNotLastSuperAdmin('last-sa-id')
      ).rejects.toThrow(/Impossible de supprimer, suspendre ou rétrograder le DERNIER Super Administrateur/)
    })
  })

  // ─── 6. Multi-Rôles Sécurisé (Plafond 2 Rôles & Incompatibilités) ────────────
  describe('Garde-fou #6 : Multi-Rôles Sécurisé', () => {
    it('devrait bloquer l\'attribution d\'un 3ème rôle (plafond de 2)', () => {
      const currentRoles = ['CLIENT', 'SUPPORT']
      expect(() => {
        checkRoleCompatibility(currentRoles, 'CATALOGUE')
      }).toThrow(/Un utilisateur ne peut cumuler au maximum que 2 rôles actifs/)
    })

    it('devrait interdire le cumul des rôles ADMIN et SUPER_ADMIN', () => {
      expect(() => {
        checkRoleCompatibility(['ADMIN'], 'SUPER_ADMIN')
      }).toThrow(/Les rôles ADMIN et SUPER_ADMIN sont strictement mutuellement exclusifs/)

      expect(() => {
        checkRoleCompatibility(['SUPER_ADMIN'], 'ADMIN')
      }).toThrow(/Les rôles ADMIN et SUPER_ADMIN sont strictement mutuellement exclusifs/)
    })

    it('devrait bloquer les paires incompatibles (COMPTA+LOGISTIQUE, COMPTA+CATALOGUE, SUPPORT+COMPTA)', () => {
      // COMPTA + LOGISTIQUE
      expect(() => {
        checkRoleCompatibility(['COMPTA'], 'LOGISTIQUE')
      }).toThrow(/Incompatibilité de fonctions/)

      // COMPTA + CATALOGUE
      expect(() => {
        checkRoleCompatibility(['COMPTA'], 'CATALOGUE')
      }).toThrow(/Incompatibilité de fonctions/)

      // SUPPORT + COMPTA
      expect(() => {
        checkRoleCompatibility(['SUPPORT'], 'COMPTA')
      }).toThrow(/Incompatibilité de fonctions/)
    })

    it('devrait autoriser un cumul compatible de 2 rôles (ex: CLIENT + SUPPORT)', () => {
      expect(() => {
        checkRoleCompatibility(['CLIENT'], 'SUPPORT')
      }).not.toThrow()
    })
  })

  // ─── 7. Portée :own et Protection Anti-IDOR ─────────────────────────────────
  describe('Garde-fou #7 : Portée :own (Anti-IDOR) & Moindre Privilège', () => {
    const clientUser: AuthUserContext = {
      id: 'client-user-1',
      email: 'client1@immofika.ci',
      role: 'client',
      roles: ['CLIENT'],
      hierarchyLevel: 1,
    }

    it('devrait autoriser le client sur ses propres ressources (:own)', () => {
      const hasAccess = can(clientUser, 'profil:voir_modifier:own', { ownerId: 'client-user-1' })
      expect(hasAccess).toBe(true)
    })

    it('devrait REFUSER l\'accès à un client tentant d\'accéder aux données d\'un tiers (:own IDOR)', () => {
      const hasAccess = can(clientUser, 'profil:voir_modifier:own', { ownerId: 'autre-client-2' })
      expect(hasAccess).toBe(false)
    })

    it('devrait REFUSER par défaut toute action non accordée au client', () => {
      const hasAccess = can(clientUser, 'annonce:moderer')
      expect(hasAccess).toBe(false)
    })
  })
})

