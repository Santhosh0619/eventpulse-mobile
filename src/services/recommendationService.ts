import { api } from '@/services/api'
import type { Event } from '@/types/event'

/** An event paired with its recommendation relevance score (0.0–1.0). */
export interface RecommendedEvent {
  event: Event
  score: number
}

/** AI recommendation API calls. */
export const recommendationService = {
  /** Personalized upcoming events for the authenticated user. */
  async personalized(limit = 10): Promise<RecommendedEvent[]> {
    const { data } = await api.get<RecommendedEvent[]>(
      '/api/v1/recommendations/events',
      { params: { limit } },
    )
    return data
  },

  /** Events similar to a given event. */
  async similar(eventId: string, limit = 10): Promise<RecommendedEvent[]> {
    const { data } = await api.get<RecommendedEvent[]>(
      `/api/v1/recommendations/events/${eventId}/similar`,
      { params: { limit } },
    )
    return data
  },
}
