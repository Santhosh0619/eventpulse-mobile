import { api } from '@/services/api'
import type { Event } from '@/types/event'

/** An event paired with its recommendation relevance score (0.0–1.0). */
export interface RecommendedEvent {
  event: Event
  score: number
}

/**
 * An AI-recommended event with an optional natural-language rationale.
 *
 * `reason` is present when Gemini curated the pick and `null` when the result
 * came from the heuristic fallback. `score` carries the heuristic relevance
 * score for fallback picks and is `null` for AI-curated picks.
 */
export interface AiRecommendedEvent {
  event: Event
  reason: string | null
  score: number | null
}

/** AI recommendation API calls. */
export const recommendationService = {
  /** Personalized upcoming events for the authenticated user (heuristic). */
  async personalized(limit = 10): Promise<RecommendedEvent[]> {
    const { data } = await api.get<RecommendedEvent[]>(
      '/api/v1/recommendations/events',
      { params: { limit } },
    )
    return data
  },

  /** Events similar to a given event (heuristic). */
  async similar(eventId: string, limit = 10): Promise<RecommendedEvent[]> {
    const { data } = await api.get<RecommendedEvent[]>(
      `/api/v1/recommendations/events/${eventId}/similar`,
      { params: { limit } },
    )
    return data
  },

  /** AI-personalized "For you" feed for the authenticated user (Gemini). */
  async forMe(limit = 8): Promise<AiRecommendedEvent[]> {
    const { data } = await api.get<AiRecommendedEvent[]>(
      '/api/v1/recommendations/for-me',
      { params: { limit } },
    )
    return data
  },

  /** AI-powered similar events for a given event (Gemini, public). */
  async similarAi(eventId: string, limit = 6): Promise<AiRecommendedEvent[]> {
    const { data } = await api.get<AiRecommendedEvent[]>(
      `/api/v1/events/${eventId}/similar`,
      { params: { limit } },
    )
    return data
  },
}
