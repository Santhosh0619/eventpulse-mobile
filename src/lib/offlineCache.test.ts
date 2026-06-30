import { CACHE_KEYS, offlineCache } from '@/lib/offlineCache'

describe('offlineCache', () => {
  it('round-trips a JSON value', async () => {
    await offlineCache.set('k1', { a: 1, b: ['x'] })
    expect(await offlineCache.get<{ a: number; b: string[] }>('k1')).toEqual({
      a: 1,
      b: ['x'],
    })
  })

  it('returns null for a missing key', async () => {
    expect(await offlineCache.get('missing')).toBeNull()
  })

  it('builds a per-event tickets key', () => {
    expect(CACHE_KEYS.ticketsForEvent('ev1')).toBe('cache.tickets.ev1')
  })
})
