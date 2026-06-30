import { render, screen, waitFor } from '@testing-library/react-native'

import { CheckInDashboardScreen } from '@/screens/staff/CheckInDashboardScreen'
import { attendeeService } from '@/services/attendeeService'

jest.mock('@react-navigation/native', () => ({
  useRoute: () => ({ params: { eventId: 'ev1' } }),
}))
jest.mock('@/services/attendeeService', () => ({
  attendeeService: { getStats: jest.fn(), listForEvent: jest.fn() },
}))

const mockStats = attendeeService.getStats as jest.Mock
const mockList = attendeeService.listForEvent as jest.Mock

function attendee(id: string, name: string, at: string | null) {
  return {
    id,
    event_id: 'ev1',
    order_item_id: null,
    user_id: null,
    ticket_code: `EP-ATT-${id}`,
    first_name: name,
    last_name: 'X',
    email: 'a@b.com',
    check_in_status: at ? 'checked_in' : 'not_checked_in',
    checked_in_at: at,
    created_at: '2026-01-01T00:00:00',
  }
}

describe('CheckInDashboardScreen', () => {
  beforeEach(() => jest.clearAllMocks())

  it('shows stats, percentage, and recent check-ins', async () => {
    mockStats.mockResolvedValue({
      event_id: 'ev1',
      total: 10,
      checked_in: 4,
      not_checked_in: 6,
      check_in_rate: 0.4,
    })
    mockList.mockResolvedValue([
      attendee('1', 'Ada', '2026-07-12T19:05:00'),
      attendee('2', 'Bob', null),
    ])

    render(<CheckInDashboardScreen />)

    expect(await screen.findByText('40% checked in')).toBeTruthy()
    expect(screen.getByText('Checked in')).toBeTruthy()
    // Ada is checked in and appears in recent; Bob (not checked in) does not.
    await waitFor(() => expect(screen.getByText('Ada X')).toBeTruthy())
    expect(screen.queryByText('Bob X')).toBeNull()
  })
})
