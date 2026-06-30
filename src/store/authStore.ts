import { create } from 'zustand'

import { secureStorage, STORAGE_KEYS } from '@/lib/secureStorage'

/** The authenticated user's account (mirrors the backend UserRead schema). */
export interface AuthUser {
  id: string
  email: string
  role: string
  is_active: boolean
  is_verified: boolean
}

interface AuthState {
  user: AuthUser | null
  accessToken: string | null
  refreshToken: string | null
  /** True until tokens have been read back from secure storage on launch. */
  isHydrating: boolean
  setSession: (tokens: { access: string; refresh: string }) => void
  setUser: (user: AuthUser | null) => void
  clear: () => void
  hydrate: () => Promise<void>
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

  setSession: ({ access, refresh }) => {
    set({ accessToken: access, refreshToken: refresh })
    void secureStorage.set(STORAGE_KEYS.accessToken, access)
    void secureStorage.set(STORAGE_KEYS.refreshToken, refresh)
  },

  setUser: (user) => set({ user }),

  clear: () => {
    set({ user: null, accessToken: null, refreshToken: null })
    void secureStorage.remove(STORAGE_KEYS.accessToken)
    void secureStorage.remove(STORAGE_KEYS.refreshToken)
  },

  hydrate: async () => {
    try {
      const [access, refresh] = await Promise.all([
        secureStorage.get(STORAGE_KEYS.accessToken),
        secureStorage.get(STORAGE_KEYS.refreshToken),
      ])
      if (access && refresh) {
        set({ accessToken: access, refreshToken: refresh })
      }
    } finally {
      set({ isHydrating: false })
    }
  },

  isAuthenticated: () => Boolean(get().accessToken),
}))
