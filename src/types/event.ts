/** Event, category, and media types mirroring the backend schemas. */

export interface Category {
  id: string
  name: string
  slug: string
  icon: string | null
  description: string | null
  sort_order: number
  is_active: boolean
  created_at: string
}

export interface EventMedia {
  id: string
  event_id: string
  type: string
  url: string
  thumbnail_url: string | null
  caption: string | null
  sort_order: number
  file_size_bytes: number | null
}

export type EventStatus = 'draft' | 'published' | 'cancelled' | 'completed'

/** Full event representation (backend EventRead). */
export interface Event {
  id: string
  organization_id: string
  category_id: string | null
  title: string
  slug: string
  description: string | null
  short_description: string | null
  venue_name: string | null
  venue_address: string | null
  city: string | null
  country: string | null
  latitude: number | null
  longitude: number | null
  start_datetime: string
  end_datetime: string
  timezone: string
  status: EventStatus | string
  is_featured: boolean
  max_capacity: number | null
  cover_image_url: string | null
  tags: string[]
  created_at: string
  updated_at: string
}

/** A page of results plus pagination metadata (backend PaginatedResponse). */
export interface Paginated<T> {
  items: T[]
  total: number
  page: number
  limit: number
  pages: number
}

/** Query params for the event search endpoint. */
export interface EventSearchParams {
  page?: number
  limit?: number
  category_id?: string
  city?: string
  country?: string
  q?: string
  tags?: string[]
  start_after?: string
  start_before?: string
  is_featured?: boolean
  organization_id?: string
  latitude?: number
  longitude?: number
  radius_km?: number
}
