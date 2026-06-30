import { create } from 'zustand'

import { secureStorage, STORAGE_KEYS } from '@/lib/secureStorage'
import type { AuthUser } from '@/types/user'

export type { AuthUser }

interface AuthState {
  user: AuthUser | null
  accessToken: string | null
  refreshToken: string | null
  /** True until tokens have been read back from secure storage on launch. */
  isHydrating: boolean
  /** True when a persisted session is loaded but gated behind biometric unlock. */
  locked: boolean
  setSession: (tokens: { access: string; refresh: string }) => void
  setUser: (user: AuthUser | null) => void
  clear: () => void
  hydrate: () => Promise<void>
  unlock: () => void
  isAuthenticated: () => boolean
}

/**
 * Authentication state. Unlike the web store (localStorage via zustand/persist),
 * tokens live in the device keychain via expo-secure-store. We mirror them into
 * Zustand state for synchronous reads by the Axios interceptor, and write
 * through to secure storage on every session change.
 */
export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  accessToken: null,
  refreshToken: null,
  isHydrating: true,
  locked: false,

  setSession: ({ access, refresh }) => {
    set({ accessToken: access, refreshToken: refresh })
    void secureStorage.set(STORAGE_KEYS.accessToken, access)
    void secureStorage.set(STORAGE_KEYS.refreshToken, refresh)
  },

  setUser: (user) => set({ user }),

  clear: () => {
    set({ user: null, accessToken: null, refreshToken: null, locked: false })
    void secureStorage.remove(STORAGE_KEYS.accessToken)
    void secureStorage.remove(STORAGE_KEYS.refreshToken)
  },

  hydrate: async () => {
    try {
      const [access, refresh, biometric] = await Promise.all([
        secureStorage.get(STORAGE_KEYS.accessToken),
        secureStorage.get(STORAGE_KEYS.refreshToken),
        secureStorage.get(STORAGE_KEYS.biometricEnabled),
      ])
      if (access && refresh) {
        // A persisted session exists. Gate it behind biometric unlock if the
        // user opted in; otherwise restore it immediately (auto-login).
        set({
          accessToken: access,
          refreshToken: refresh,
          locked: biometric === '1',
        })
      }
    } finally {
      set({ isHydrating: false })
    }
  },

  unlock: () => set({ locked: false }),

  isAuthenticated: () => Boolean(get().accessToken),
}))
