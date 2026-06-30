import * as SecureStore from 'expo-secure-store'

/**
 * Thin async wrapper over expo-secure-store. Used to persist auth tokens in the
 * device keychain/keystore. Keys must match `[A-Za-z0-9._-]+`.
 */
export const secureStorage = {
  get: (key: string) => SecureStore.getItemAsync(key),
  set: (key: string, value: string) => SecureStore.setItemAsync(key, value),
  remove: (key: string) => SecureStore.deleteItemAsync(key),
}

export const STORAGE_KEYS = {
  accessToken: 'eventpulse.accessToken',
  refreshToken: 'eventpulse.refreshToken',
} as const
