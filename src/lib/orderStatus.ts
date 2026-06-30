import type { BadgeTone } from '@/components/ui'

/** Map an order status to a human label and a badge tone. */
export function orderStatusBadge(status: string): {
  label: string
  tone: BadgeTone
} {
  switch (status) {
    case 'confirmed':
      return { label: 'Confirmed', tone: 'success' }
    case 'pending':
      return { label: 'Awaiting payment', tone: 'warning' }
    case 'cancelled':
      return { label: 'Cancelled', tone: 'danger' }
    case 'expired':
      return { label: 'Expired', tone: 'neutral' }
    case 'refunded':
      return { label: 'Refunded', tone: 'info' }
    default:
      return { label: status, tone: 'neutral' }
  }
}
