import { secureStorage, STORAGE_KEYS } from '@/lib/secureStorage'
import { useAuthStore } from '@/store/authStore'

describe('authStore', () => {
  beforeEach(() => {
    useAuthStore.getState().clear()
    useAuthStore.setState({ isHydrating: true })
    jest.restoreAllMocks()
    jest.spyOn(secureStorage, 'set')
    jest.spyOn(secureStorage, 'remove')
  })

  it('starts unauthenticated', () => {
    expect(useAuthStore.getState().isAuthenticated()).toBe(false)
  })

  it('setSession stores tokens in state and secure storage', () => {
    useAuthStore.getState().setSession({ access: 'a1', refresh: 'r1' })
    const state = useAuthStore.getState()
    expect(state.accessToken).toBe('a1')
    expect(state.refreshToken).toBe('r1')
    expect(state.isAuthenticated()).toBe(true)
    expect(secureStorage.set).toHaveBeenCalledWith(
      STORAGE_KEYS.accessToken,
      'a1',
    )
    expect(secureStorage.set).toHaveBeenCalledWith(
      STORAGE_KEYS.refreshToken,
      'r1',
    )
  })

  it('clear wipes state and secure storage', () => {
    useAuthStore.getState().setSession({ access: 'a1', refresh: 'r1' })
    useAuthStore.getState().setUser({
      id: 'u1',
      email: 'a@b.com',
      role: 'attendee',
      is_active: true,
      is_verified: true,
    })

    useAuthStore.getState().clear()

    const state = useAuthStore.getState()
    expect(state.accessToken).toBeNull()
    expect(state.user).toBeNull()
    expect(state.isAuthenticated()).toBe(false)
    expect(secureStorage.remove).toHaveBeenCalledWith(STORAGE_KEYS.accessToken)
  })

  it('hydrate loads persisted tokens and clears the hydrating flag', async () => {
    await secureStorage.set(STORAGE_KEYS.accessToken, 'persisted-access')
    await secureStorage.set(STORAGE_KEYS.refreshToken, 'persisted-refresh')

    await useAuthStore.getState().hydrate()

    const state = useAuthStore.getState()
    expect(state.accessToken).toBe('persisted-access')
    expect(state.isHydrating).toBe(false)
  })

  it('hydrate clears the hydrating flag even with no stored session', async () => {
    await useAuthStore.getState().hydrate()
    expect(useAuthStore.getState().isHydrating).toBe(false)
    expect(useAuthStore.getState().accessToken).toBeNull()
  })
})
