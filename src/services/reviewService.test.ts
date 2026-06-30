import { api } from '@/services/api'
import { reviewService } from '@/services/reviewService'

jest.mock('@/services/api', () => ({
  api: { get: jest.fn(), post: jest.fn() },
}))

const mockApi = api as unknown as { get: jest.Mock; post: jest.Mock }

describe('reviewService', () => {
  beforeEach(() => jest.clearAllMocks())

  it('list fetches an event reviews', async () => {
    mockApi.get.mockResolvedValueOnce({ data: [] })
    await reviewService.list('ev1')
    expect(mockApi.get).toHaveBeenCalledWith('/api/v1/events/ev1/reviews')
  })

  it('getSummary fetches the aggregate summary', async () => {
    mockApi.get.mockResolvedValueOnce({ data: {} })
    await reviewService.getSummary('ev1')
    expect(mockApi.get).toHaveBeenCalledWith(
      '/api/v1/events/ev1/reviews/summary',
    )
  })

  it('submit posts the review payload', async () => {
    mockApi.post.mockResolvedValueOnce({ data: { id: 'r1' } })
    await reviewService.submit('ev1', { rating: 5, title: 'Great' })
    expect(mockApi.post).toHaveBeenCalledWith('/api/v1/events/ev1/reviews', {
      rating: 5,
      title: 'Great',
    })
  })
})
