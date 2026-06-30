import { formatCountdown, formatEventRange, formatTime } from '@/lib/datetime'

describe('formatCountdown', () => {
  it('formats milliseconds as mm:ss', () => {
    expect(formatCountdown(90_000)).toBe('01:30')
    expect(formatCountdown(5_000)).toBe('00:05')
  })
  it('clamps negatives to 00:00', () => {
    expect(formatCountdown(-1000)).toBe('00:00')
  })
})

// Use local (no-Z) ISO strings so formatting is timezone-stable in CI.
describe('datetime helpers', () => {
  it('formatTime renders a 12-hour time', () => {
    expect(formatTime('2026-07-12T19:30:00')).toBe('7:30 PM')
  })

  it('formatEventRange collapses same-day events to one date with a time span', () => {
    const out = formatEventRange('2026-07-12T19:00:00', '2026-07-12T22:00:00')
    expect(out).toContain('12 Jul 2026')
    expect(out).toContain('7:00 PM')
    expect(out).toContain('10:00 PM')
    // single date, not two
    expect(out.match(/2026/g)?.length).toBe(1)
  })

  it('formatEventRange shows both dates for multi-day events', () => {
    const out = formatEventRange('2026-07-12T19:00:00', '2026-07-14T02:00:00')
    expect(out).toContain('12 Jul')
    expect(out).toContain('14 Jul 2026')
  })
})
