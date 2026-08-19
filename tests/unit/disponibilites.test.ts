import { vi, describe, it, expect, beforeEach } from 'vitest'
import { fetchAgentICalEvents } from '@/app/actions/disponibilites'
import { parseICal } from '@/lib/calendar/ical-parser'

vi.mock('@/lib/calendar/ical-parser', () => ({
  parseICal: vi.fn().mockReturnValue([{ title: 'Event 1' }]),
}))

describe('fetchAgentICalEvents', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('devrait récupérer les événements depuis le réseau s\'il n\'y a pas de cache', async () => {
    const mockResponse = {
      ok: true,
      text: vi.fn().mockResolvedValue('MOCK ICS CONTENT'),
    }
    global.fetch = vi.fn().mockResolvedValue(mockResponse)

    const url = 'https://example.com/calendar-uncached.ics'
    const result = await fetchAgentICalEvents(url)

    expect(global.fetch).toHaveBeenCalledWith(url, expect.any(Object))
    expect(parseICal).toHaveBeenCalledWith('MOCK ICS CONTENT')
    expect(result).toEqual([{ title: 'Event 1' }])
  })

  it('devrait utiliser le cache s\'il est présent et non expiré', async () => {
    const mockResponse = {
      ok: true,
      text: vi.fn().mockResolvedValue('MOCK ICS CONTENT'),
    }
    global.fetch = vi.fn().mockResolvedValue(mockResponse)

    const url = 'https://example.com/calendar-cached.ics'
    
    // Premier appel : remplit le cache
    await fetchAgentICalEvents(url)
    expect(global.fetch).toHaveBeenCalledTimes(1)

    // Deuxième appel : doit lire le cache sans fetcher à nouveau
    const result = await fetchAgentICalEvents(url)
    expect(global.fetch).toHaveBeenCalledTimes(1)
    expect(result).toEqual([{ title: 'Event 1' }])
  })

  it('devrait gérer le timeout ou l\'erreur réseau et renvoyer un tableau vide', async () => {
    global.fetch = vi.fn().mockRejectedValue(new Error('Network error'))

    const url = 'https://example.com/calendar-error.ics'
    const result = await fetchAgentICalEvents(url)

    expect(global.fetch).toHaveBeenCalledWith(url, expect.any(Object))
    expect(result).toEqual([])
  })
})
