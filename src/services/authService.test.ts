import { api } from '@/services/api'
import { authService } from '@/services/authService'
import { useAuthStore } from '@/store/authStore'

jest.mock('@/services/api', () => ({
  api: { post: jest.fn(), get: jest.fn() },
}))

const mockApi = api as unknown as {
  post: jest.Mock
  get: jest.Mock
}

const USER = {
  id: 'u1',
  email: 'a@b.com',
  role: 'attendee',
  is_active: true,
  is_verified: true,
}

describe('authService', () => {
  beforeEach(() => {
    useAuthStore.getState().clear()
    jest.clearAllMocks()
  })

  it('login stores the token pair and loads the current user', async () => {
    mockApi.post.mockResolvedValueOnce({
      data: { access_token: 'acc', refresh_token: 'ref', token_type: 'bearer' },
    })
    mockApi.get.mockResolvedValueOnce({ data: USER })

    const user = await authService.login('a@b.com', 'pw')

    expect(mockApi.post).toHaveBeenCalledWith('/api/v1/auth/login', {
      email: 'a@b.com',
      password: 'pw',
    })
    expect(useAuthStore.getState().accessToken).toBe('acc')
    expect(useAuthStore.getState().refreshToken).toBe('ref')
    expect(useAuthStore.getState().user).toEqual(USER)
    expect(user).toEqual(USER)
  })

  it('register posts the signup payload', async () => {
    mockApi.post.mockResolvedValueOnce({ data: {} })
    await authService.register({
      email: 'a@b.com',
      password: 'password1',
      first_name: 'Ada',
      last_name: 'Lovelace',
    })
    expect(mockApi.post).toHaveBeenCalledWith('/api/v1/auth/register', {
      email: 'a@b.com',
      password: 'password1',
      first_name: 'Ada',
      last_name: 'Lovelace',
    })
  })

  it('logout revokes the refresh token and clears the session', async () => {
    useAuthStore.getState().setSession({ access: 'acc', refresh: 'ref' })
    mockApi.post.mockResolvedValueOnce({ data: { message: 'ok' } })

    await authService.logout()

    expect(mockApi.post).toHaveBeenCalledWith('/api/v1/auth/logout', {
      refresh_token: 'ref',
    })
    expect(useAuthStore.getState().accessToken).toBeNull()
  })

  it('logout still clears the session if the API call fails', async () => {
    useAuthStore.getState().setSession({ access: 'acc', refresh: 'ref' })
    mockApi.post.mockRejectedValueOnce(new Error('network'))

    // The error propagates (try/finally, no catch) but the session is cleared.
    await expect(authService.logout()).rejects.toThrow('network')
    expect(useAuthStore.getState().accessToken).toBeNull()
  })

  it('forgotPassword / resetPassword / verifyEmail hit the right endpoints', async () => {
    mockApi.post.mockResolvedValue({ data: {} })

    await authService.forgotPassword('a@b.com')
    expect(mockApi.post).toHaveBeenCalledWith('/api/v1/auth/forgot-password', {
      email: 'a@b.com',
    })

    await authService.resetPassword('tok', 'newpassword1')
    expect(mockApi.post).toHaveBeenCalledWith('/api/v1/auth/reset-password', {
      token: 'tok',
      new_password: 'newpassword1',
    })

    await authService.verifyEmail('vtok')
    expect(mockApi.post).toHaveBeenCalledWith('/api/v1/auth/verify-email', {
      token: 'vtok',
    })
  })
})
