import { create } from 'zustand'

/**
 * Tracks the unread notification count so the tab badge can render without each
 * screen re-querying. Wired up in Phase 7 alongside notificationService.
 */
interface NotificationState {
  unreadCount: number
  setUnreadCount: (count: number) => void
  decrement: () => void
  reset: () => void
}

export const useNotificationStore = create<NotificationState>((set) => ({
  unreadCount: 0,
  setUnreadCount: (count) => set({ unreadCount: Math.max(0, count) }),
  decrement: () =>
    set((s) => ({ unreadCount: Math.max(0, s.unreadCount - 1) })),
  reset: () => set({ unreadCount: 0 }),
}))
