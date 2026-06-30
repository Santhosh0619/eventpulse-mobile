import { api } from '@/services/api'
import type { Review, ReviewInput, ReviewSummary } from '@/types/review'

/** Review API calls for attendees. */
export const reviewService = {
  async list(eventId: string): Promise<Review[]> {
    const { data } = await api.get<Review[]>(
      `/api/v1/events/${eventId}/reviews`,
    )
    return data
  },

  async getSummary(eventId: string): Promise<ReviewSummary> {
    const { data } = await api.get<ReviewSummary>(
      `/api/v1/events/${eventId}/reviews/summary`,
    )
    return data
  },

  async submit(eventId: string, input: ReviewInput): Promise<Review> {
    const { data } = await api.post<Review>(
      `/api/v1/events/${eventId}/reviews`,
      input,
    )
    return data
  },
}
