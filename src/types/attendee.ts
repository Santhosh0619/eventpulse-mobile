/** Attendee (ticket) & check-in types mirroring the backend schemas. */

export type CheckInStatus = 'not_checked_in' | 'checked_in' | string

export interface Attendee {
  id: string
  event_id: string
  order_item_id: string | null
  user_id: string | null
  ticket_code: string
  first_name: string
  last_name: string
  email: string
  check_in_status: CheckInStatus
  checked_in_at: string | null
  created_at: string
}

export interface CheckInResponse {
  success: boolean
  already_checked_in: boolean
  message: string
  attendee: Attendee | null
}

export interface AttendeeStats {
  event_id: string
  total: number
  checked_in: number
  not_checked_in: number
  check_in_rate: number
}
