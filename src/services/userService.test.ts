import { api } from '@/services/api'
import { userService } from '@/services/userService'
import { useAuthStore } from '@/store/authStore'

jest.mock('@/services/api', () => ({
  api: { get: jest.fn(), put: jest.fn() },
}))

const mockApi = api as unknown as { get: jest.Mock; put: jest.Mock }

const USER = {
  id: 'u1',
  email: 'a@b.com',
  role: 'attendee',
  is_active: true,
  is_verified: true,
  profile: { first_name: 'Ada', last_name: 'Lovelace', avatar_url: null },
}

describe('userService', () => {
  beforeEach(() => {
    useAuthStore.getState().clear()
    jest.clearAllMocks()
  })

  it('getMyProfile caches the user in the store', async () => {
    mockApi.get.mockResolvedValueOnce({ data: USER })
    const user = await userService.getMyProfile()
    expect(mockApi.get).toHaveBeenCalledWith('/api/v1/users/me')
    expect(useAuthStore.getState().user).toEqual(USER)
    expect(user).toEqual(USER)
  })

  it('updateMyProfile PUTs the patch and updates the cached user', async () => {
    const updated = { ...USER, profile: { ...USER.profile, city: 'London' } }
    mockApi.put.mockResolvedValueOnce({ data: updated })

    await userService.updateMyProfile({ city: 'London' })

    expect(mockApi.put).toHaveBeenCalledWith('/api/v1/users/me', {
      city: 'London',
    })
    expect(useAuthStore.getState().user?.profile?.city).toBe('London')
  })

  it('uploadAvatar sends multipart form data and updates the avatar', async () => {
    useAuthStore.getState().setUser(USER)
    mockApi.put.mockResolvedValueOnce({
      data: { avatar_url: '/uploads/a.jpg' },
    })

    const url = await userService.uploadAvatar('file:///tmp/pic.png')

    expect(url).toBe('/uploads/a.jpg')
    const [path, body] = mockApi.put.mock.calls[0]
    expect(path).toBe('/api/v1/users/me/avatar')
    expect(body).toBeInstanceOf(FormData)
    // No explicit Content-Type: the runtime sets the multipart boundary.
    expect(useAuthStore.getState().user?.profile?.avatar_url).toBe(
      '/uploads/a.jpg',
    )
  })

  it('updateFcmToken PUTs the token', async () => {
    mockApi.put.mockResolvedValueOnce({ data: { message: 'ok' } })
    await userService.updateFcmToken('fcm-123')
    expect(mockApi.put).toHaveBeenCalledWith('/api/v1/users/me/fcm-token', {
      fcm_token: 'fcm-123',
    })
  })
})
