import { api } from '@/services/api'
import type { AppNotification } from '@/types/notification'

/** In-app notification API calls. */
export const notificationService = {
  async list(): Promise<AppNotification[]> {
    const { data } = await api.get<AppNotification[]>('/api/v1/notifications')
    return data
  },

  async unreadCount(): Promise<number> {
    const { data } = await api.get<{ unread: number }>(
      '/api/v1/notifications/unread-count',
    )
    return data.unread
  },

  async markRead(id: string): Promise<void> {
    await api.put(`/api/v1/notifications/${id}/read`)
  },

  async markAllRead(): Promise<void> {
    await api.put('/api/v1/notifications/read-all')
  },
}
