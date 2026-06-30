import { formatMoney, sumSelections } from '@/lib/money'

describe('money helpers', () => {
  it('formats a decimal string with its currency', () => {
    // Exact glyph/spacing varies by Intl data; assert the amount is present.
    expect(formatMoney('1499.00', 'INR')).toContain('1,499')
  })

  it('handles invalid amounts gracefully', () => {
    expect(formatMoney('not-a-number', 'INR')).toBe('INR 0')
  })

  it('sums selections by price × quantity', () => {
    expect(
      sumSelections([
        { price: '100.00', quantity: 2 },
        { price: '50.50', quantity: 1 },
      ]),
    ).toBeCloseTo(250.5)
  })
})
