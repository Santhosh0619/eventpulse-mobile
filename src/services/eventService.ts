import { api } from '@/services/api'
import type {
  Category,
  Event,
  EventMedia,
  EventSearchParams,
  Paginated,
} from '@/types/event'

/** Read-only API calls for events, categories, and media (attendee flows). */
export const eventService = {
  async search(params: EventSearchParams = {}): Promise<Paginated<Event>> {
    const { data } = await api.get<Paginated<Event>>('/api/v1/events', {
      params,
    })
    return data
  },

  async featured(): Promise<Event[]> {
    const { data } = await api.get<Event[]>('/api/v1/events/featured')
    return data
  },

  async getById(id: string): Promise<Event> {
    const { data } = await api.get<Event>(`/api/v1/events/${id}`)
    return data
  },

  async getBySlug(slug: string): Promise<Event> {
    const { data } = await api.get<Event>(`/api/v1/events/slug/${slug}`)
    return data
  },

  async getMedia(eventId: string): Promise<EventMedia[]> {
    const { data } = await api.get<EventMedia[]>(
      `/api/v1/events/${eventId}/media`,
    )
    return data
  },

  async listCategories(): Promise<Category[]> {
    const { data } = await api.get<Category[]>('/api/v1/categories')
    return data
  },
}
