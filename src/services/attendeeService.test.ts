import { api } from '@/services/api'
import { attendeeService } from '@/services/attendeeService'

jest.mock('@/services/api', () => ({
  api: { get: jest.fn(), post: jest.fn() },
}))

const mockApi = api as unknown as { get: jest.Mock; post: jest.Mock }

describe('attendeeService', () => {
  beforeEach(() => jest.clearAllMocks())

  it('listMine fetches my tickets without a filter', async () => {
    mockApi.get.mockResolvedValueOnce({ data: [] })
    await attendeeService.listMine()
    expect(mockApi.get).toHaveBeenCalledWith('/api/v1/users/me/attendees', {
      params: undefined,
    })
  })

  it('listMine passes the event filter', async () => {
    mockApi.get.mockResolvedValueOnce({ data: [] })
    await attendeeService.listMine('ev1')
    expect(mockApi.get).toHaveBeenCalledWith('/api/v1/users/me/attendees', {
      params: { event_id: 'ev1' },
    })
  })

  it('checkIn posts the ticket code', async () => {
    mockApi.post.mockResolvedValueOnce({
      data: { success: true, already_checked_in: false, message: 'ok' },
    })
    await attendeeService.checkIn('EP-ATT-abc')
    expect(mockApi.post).toHaveBeenCalledWith('/api/v1/attendees/check-in', {
      ticket_code: 'EP-ATT-abc',
    })
  })

  it('getStats and listForEvent hit the event endpoints', async () => {
    mockApi.get.mockResolvedValue({ data: {} })
    await attendeeService.getStats('ev1')
    expect(mockApi.get).toHaveBeenCalledWith(
      '/api/v1/events/ev1/attendees/stats',
    )
    await attendeeService.listForEvent('ev1')
    expect(mockApi.get).toHaveBeenCalledWith('/api/v1/events/ev1/attendees')
  })
})
