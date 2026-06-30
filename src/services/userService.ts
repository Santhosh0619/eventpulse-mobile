import { api } from '@/services/api'
import { useAuthStore } from '@/store/authStore'
import type { AuthUser, ProfileUpdate } from '@/types/user'

/** Profile & account API calls wired to the backend's /users/me endpoints. */
export const userService = {
  async getMyProfile(): Promise<AuthUser> {
    const { data } = await api.get<AuthUser>('/api/v1/users/me')
    useAuthStore.getState().setUser(data)
    return data
  },

  async updateMyProfile(patch: ProfileUpdate): Promise<AuthUser> {
    const { data } = await api.put<AuthUser>('/api/v1/users/me', patch)
    useAuthStore.getState().setUser(data)
    return data
  },

  /**
   * Upload an avatar image. `uri` comes from expo-image-picker; we wrap it in
   * FormData with the platform file shape React Native's fetch/Axios expects.
   */
  async uploadAvatar(uri: string): Promise<string> {
    const name = uri.split('/').pop() || 'avatar.jpg'
    const match = /\.(\w+)$/.exec(name)
    const ext = (match?.[1] ?? 'jpg').toLowerCase()
    const type = ext === 'png' ? 'image/png' : 'image/jpeg'

    const form = new FormData()
    // RN FormData accepts this {uri,name,type} object for file parts.
    form.append('file', { uri, name, type } as unknown as Blob)

    const { data } = await api.put<{ avatar_url: string }>(
      '/api/v1/users/me/avatar',
      form,
      { headers: { 'Content-Type': 'multipart/form-data' } },
    )
    // Reflect the new avatar in the cached user immediately.
    const { user, setUser } = useAuthStore.getState()
    if (user?.profile) {
      setUser({
        ...user,
        profile: { ...user.profile, avatar_url: data.avatar_url },
      })
    }
    return data.avatar_url
  },

  updateFcmToken(fcmToken: string) {
    return api.put('/api/v1/users/me/fcm-token', { fcm_token: fcmToken })
  },
}
