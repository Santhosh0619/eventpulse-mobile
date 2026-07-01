import { api } from '@/services/api'
import { recommendationService } from '@/services/recommendationService'

jest.mock('@/services/api', () => ({ api: { get: jest.fn() } }))

const mockApi = api as unknown as { get: jest.Mock }

describe('recommendationService', () => {
  beforeEach(() => jest.clearAllMocks())

  it('personalized fetches recommendations with a limit', async () => {
    mockApi.get.mockResolvedValueOnce({ data: [] })
    await recommendationService.personalized(5)
    expect(mockApi.get).toHaveBeenCalledWith('/api/v1/recommendations/events', {
      params: { limit: 5 },
    })
  })

  it('similar fetches similar events for an event', async () => {
    mockApi.get.mockResolvedValueOnce({ data: [] })
    await recommendationService.similar('ev1', 8)
    expect(mockApi.get).toHaveBeenCalledWith(
      '/api/v1/recommendations/events/ev1/similar',
      { params: { limit: 8 } },
    )
  })

  it('forMe fetches the AI personalized feed with a limit', async () => {
    mockApi.get.mockResolvedValueOnce({ data: [] })
    await recommendationService.forMe(8)
    expect(mockApi.get).toHaveBeenCalledWith('/api/v1/recommendations/for-me', {
      params: { limit: 8 },
    })
  })

  it('forMe defaults the limit to 8', async () => {
    mockApi.get.mockResolvedValueOnce({ data: [] })
    await recommendationService.forMe()
    expect(mockApi.get).toHaveBeenCalledWith('/api/v1/recommendations/for-me', {
      params: { limit: 8 },
    })
  })

  it('similarAi fetches AI similar events for an event', async () => {
    mockApi.get.mockResolvedValueOnce({
      data: [{ event: { id: 'ev2' }, reason: 'Same genre', score: null }],
    })
    const res = await recommendationService.similarAi('ev1', 6)
    expect(mockApi.get).toHaveBeenCalledWith('/api/v1/events/ev1/similar', {
      params: { limit: 6 },
    })
    expect(res[0].reason).toBe('Same genre')
  })
})
