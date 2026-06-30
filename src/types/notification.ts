/** Notification types mirroring the backend NotificationRead schema. */

export interface AppNotification {
  id: string
  user_id: string
  type: string
  title: string
  message: string
  /** Deep-link / routing payload (e.g. { event_id, order_id }). */
  data: Record<string, unknown>
  channel: string
  is_read: boolean
  read_at: string | null
  created_at: string
}
