import { api } from '@/services/api'
import type { AvailabilityResponse, TicketType } from '@/types/order'

/** Read-only ticket-tier API calls for attendees. */
export const ticketService = {
  async listTypes(eventId: string): Promise<TicketType[]> {
    const { data } = await api.get<TicketType[]>(
      `/api/v1/events/${eventId}/ticket-types`,
    )
    return data
  },

  async getAvailability(eventId: string): Promise<AvailabilityResponse> {
    const { data } = await api.get<AvailabilityResponse>(
      `/api/v1/events/${eventId}/availability`,
    )
    return data
  },
}
