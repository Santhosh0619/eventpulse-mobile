import { api } from '@/services/api'
import { ticketService } from '@/services/ticketService'

jest.mock('@/services/api', () => ({ api: { get: jest.fn() } }))

const mockApi = api as unknown as { get: jest.Mock }

describe('ticketService', () => {
  beforeEach(() => jest.clearAllMocks())

  it('listTypes fetches ticket types for an event', async () => {
    mockApi.get.mockResolvedValueOnce({ data: [] })
    await ticketService.listTypes('e1')
    expect(mockApi.get).toHaveBeenCalledWith('/api/v1/events/e1/ticket-types')
  })

  it('getAvailability fetches availability for an event', async () => {
    mockApi.get.mockResolvedValueOnce({ data: { event_id: 'e1', tiers: [] } })
    await ticketService.getAvailability('e1')
    expect(mockApi.get).toHaveBeenCalledWith('/api/v1/events/e1/availability')
  })
})
