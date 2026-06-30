import {
  fireEvent,
  render,
  screen,
  waitFor,
} from '@testing-library/react-native'

import { TicketSelector } from '@/components/tickets/TicketSelector'
import { ticketService } from '@/services/ticketService'

jest.mock('@/services/ticketService', () => ({
  ticketService: { getAvailability: jest.fn() },
}))

const mockAvailability = ticketService.getAvailability as jest.Mock

const AVAILABILITY = {
  event_id: 'e1',
  total_available: 100,
  tiers: [
    {
      ticket_type_id: 't1',
      name: 'General',
      price: '500.00',
      currency: 'INR',
      quantity_total: 100,
      quantity_sold: 0,
      quantity_available: 100,
      is_on_sale: true,
    },
  ],
}

describe('TicketSelector', () => {
  beforeEach(() => jest.clearAllMocks())

  it('loads tiers and continues with the chosen quantities', async () => {
    mockAvailability.mockResolvedValueOnce(AVAILABILITY)
    const onContinue = jest.fn()
    render(
      <TicketSelector
        visible
        onClose={jest.fn()}
        eventId="e1"
        onContinue={onContinue}
      />,
    )

    expect(await screen.findByText('General')).toBeTruthy()

    // Continue is disabled until a ticket is chosen.
    fireEvent.press(screen.getByTestId('inc-t1'))
    fireEvent.press(screen.getByTestId('inc-t1'))
    fireEvent.press(screen.getByText('Continue (2)'))

    expect(onContinue).toHaveBeenCalledWith([
      {
        ticketTypeId: 't1',
        name: 'General',
        price: '500.00',
        currency: 'INR',
        quantity: 2,
      },
    ])
  })

  it('shows an empty message when there are no tiers', async () => {
    mockAvailability.mockResolvedValueOnce({
      event_id: 'e1',
      total_available: 0,
      tiers: [],
    })
    render(
      <TicketSelector
        visible
        onClose={jest.fn()}
        eventId="e1"
        onContinue={jest.fn()}
      />,
    )
    await waitFor(() =>
      expect(
        screen.getByText('No tickets available for this event.'),
      ).toBeTruthy(),
    )
  })
})
