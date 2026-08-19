import { vi, describe, it, expect, beforeEach } from 'vitest'
import { subscribeToNewsletter } from '@/app/actions/newsletter'
import { db } from '@/lib/db/index'

vi.mock('@/lib/db/index', () => {
  const mockSelect = vi.fn()
  const mockInsert = vi.fn()
  
  return {
    db: {
      select: mockSelect,
      insert: mockInsert,
    },
  }
})

describe('subscribeToNewsletter', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('devrait retourner une erreur pour un email invalide', async () => {
    const res = await subscribeToNewsletter('invalid-email')
    expect(res.success).toBe(false)
    expect(res.error).toBe('Adresse e-mail invalide')
  })

  it('devrait retourner un message de succès si déjà abonné', async () => {
    const mockLimit = vi.fn().mockResolvedValue([{ id: '1', email: 'test@example.com' }])
    const mockWhere = vi.fn().mockReturnValue({ limit: mockLimit })
    const mockFrom = vi.fn().mockReturnValue({ where: mockWhere })
    db.select = vi.fn().mockReturnValue({ from: mockFrom })

    const res = await subscribeToNewsletter('test@example.com')
    expect(res.success).toBe(true)
    expect(res.message).toBe('Vous êtes déjà abonné à notre newsletter !')
    expect(db.select).toHaveBeenCalled()
  })

  it('devrait insérer un nouvel abonné avec succès', async () => {
    const mockLimit = vi.fn().mockResolvedValue([])
    const mockWhere = vi.fn().mockReturnValue({ limit: mockLimit })
    const mockFrom = vi.fn().mockReturnValue({ where: mockWhere })
    db.select = vi.fn().mockReturnValue({ from: mockFrom })

    const mockValues = vi.fn().mockResolvedValue({ id: '2', email: 'new@example.com' })
    db.insert = vi.fn().mockReturnValue({ values: mockValues })

    const res = await subscribeToNewsletter('new@example.com')
    expect(res.success).toBe(true)
    expect(res.message).toBe('Inscription réussie ! Merci pour votre confiance.')
    expect(db.select).toHaveBeenCalled()
    expect(db.insert).toHaveBeenCalled()
  })
})
