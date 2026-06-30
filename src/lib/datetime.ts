import { format, isSameDay, parseISO } from 'date-fns'

/** "Sat, 12 Jul · 7:00 PM" — compact event start label. */
export function formatEventDate(iso: string): string {
  const d = parseISO(iso)
  return format(d, 'EEE, d MMM · h:mm a')
}

/** "Sat, 12 Jul 2026" — date only. */
export function formatDateLong(iso: string): string {
  return format(parseISO(iso), 'EEE, d MMM yyyy')
}

/** "7:00 PM" — time only. */
export function formatTime(iso: string): string {
  return format(parseISO(iso), 'h:mm a')
}

/**
 * A human range: same-day events collapse to one date with a time span,
 * multi-day events show both dates.
 */
export function formatEventRange(startIso: string, endIso: string): string {
  const start = parseISO(startIso)
  const end = parseISO(endIso)
  if (isSameDay(start, end)) {
    return `${format(start, 'EEE, d MMM yyyy')} · ${format(start, 'h:mm a')} – ${format(end, 'h:mm a')}`
  }
  return `${format(start, 'd MMM, h:mm a')} – ${format(end, 'd MMM yyyy, h:mm a')}`
}
