/**
 * Ticket & order types mirroring the backend schemas. Money fields are
 * serialized as strings (Decimal) — treat them as display values; the backend
 * is the source of truth for totals and inventory.
 */

export interface TicketType {
  id: string
  event_id: string
  name: string
  description: string | null
  price: string
  currency: string
  quantity_total: number
  quantity_sold: number
  sale_start: string | null
  sale_end: string | null
  max_per_order: number
  is_active: boolean
  sort_order: number
}

export interface TierAvailability {
  ticket_type_id: string
  name: string
  price: string
  currency: string
  quantity_total: number
  quantity_sold: number
  quantity_available: number
  is_on_sale: boolean
}

export interface AvailabilityResponse {
  event_id: string
  total_available: number
  tiers: TierAvailability[]
}

export type OrderStatus =
  'pending' | 'confirmed' | 'cancelled' | 'expired' | 'refunded'

export interface OrderItem {
  id: string
  ticket_type_id: string | null
  quantity: number
  unit_price: string
  subtotal: string
}

export interface Order {
  id: string
  order_number: string
  user_id: string | null
  event_id: string | null
  status: OrderStatus | string
  total_amount: string
  currency: string
  notes: string | null
  expires_at: string | null
  confirmed_at: string | null
  cancelled_at: string | null
  created_at: string
  items: OrderItem[]
}

/** Payload for placing an order. */
export interface OrderCreate {
  event_id: string
  items: { ticket_type_id: string; quantity: number }[]
  notes?: string
}

/**
 * A chosen tier + quantity carried through the checkout navigation params
 * (must be JSON-serializable). Prices are display strings.
 */
export interface TicketSelection {
  ticketTypeId: string
  name: string
  price: string
  currency: string
  quantity: number
}
