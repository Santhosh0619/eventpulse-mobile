import AsyncStorage from '@react-native-async-storage/async-storage'

/**
 * Tiny JSON cache over AsyncStorage for offline fallback (e.g. showing tickets
 * and their QR codes at a venue with no signal). All operations are best-effort
 * and never throw.
 */
export const offlineCache = {
  async get<T>(key: string): Promise<T | null> {
    try {
      const raw = await AsyncStorage.getItem(key)
      return raw ? (JSON.parse(raw) as T) : null
    } catch {
      return null
    }
  },
  async set<T>(key: string, value: T): Promise<void> {
    try {
      await AsyncStorage.setItem(key, JSON.stringify(value))
    } catch {
      // best-effort
    }
  },
}

export const CACHE_KEYS = {
  myOrders: 'cache.myOrders',
  ticketsForEvent: (eventId: string) => `cache.tickets.${eventId}`,
}
