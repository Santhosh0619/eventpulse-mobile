/** Review types mirroring the backend schemas. */

export interface Review {
  id: string
  event_id: string
  user_id: string
  rating: number
  title: string | null
  comment: string | null
  is_visible: boolean
  organizer_response: string | null
  responded_at: string | null
  created_at: string
  updated_at: string
}

export interface ReviewSummary {
  event_id: string
  total_reviews: number
  average_rating: number
  /** Map of star value (1–5) → count. */
  distribution: Record<string, number>
}

export interface ReviewInput {
  rating: number
  title?: string
  comment?: string
}
