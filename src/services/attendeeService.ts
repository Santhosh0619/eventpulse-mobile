import { api } from '@/services/api'
import type { Attendee, AttendeeStats, CheckInResponse } from '@/types/attendee'

/** Attendee/ticket and staff check-in API calls. */
export const attendeeService = {
  /** The authenticated user's own tickets (optionally for one event). */
  async listMine(eventId?: string): Promise<Attendee[]> {
    const { data } = await api.get<Attendee[]>('/api/v1/users/me/attendees', {
      params: eventId ? { event_id: eventId } : undefined,
    })
    return data
  },

  /** Staff: check in an attendee by ticket code (idempotent). */
  async checkIn(ticketCode: string): Promise<CheckInResponse> {
    const { data } = await api.post<CheckInResponse>(
      '/api/v1/attendees/check-in',
      { ticket_code: ticketCode },
    )
    return data
  },

  /** Staff: check-in statistics for an event. */
  async getStats(eventId: string): Promise<AttendeeStats> {
    const { data } = await api.get<AttendeeStats>(
      `/api/v1/events/${eventId}/attendees/stats`,
    )
    return data
  },

  /** Staff: all attendees for an event (org members only). */
  async listForEvent(eventId: string): Promise<Attendee[]> {
    const { data } = await api.get<Attendee[]>(
      `/api/v1/events/${eventId}/attendees`,
    )
    return data
  },
}
