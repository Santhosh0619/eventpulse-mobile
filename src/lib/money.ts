/**
 * Format a decimal money string (e.g. "1499.00") with its ISO currency code.
 * Falls back to a plain "CODE amount" if the device lacks the currency in Intl.
 */
export function formatMoney(amount: string | number, currency = 'INR'): string {
  const value = typeof amount === 'string' ? Number(amount) : amount
  if (Number.isNaN(value)) return `${currency} 0`
  try {
    return new Intl.NumberFormat(undefined, {
      style: 'currency',
      currency,
      maximumFractionDigits: 2,
    }).format(value)
  } catch {
    return `${currency} ${value.toFixed(2)}`
  }
}

/** Sum line subtotals client-side for display only (backend is authoritative). */
export function sumSelections(
  selections: { price: string; quantity: number }[],
): number {
  return selections.reduce((acc, s) => acc + Number(s.price) * s.quantity, 0)
}
