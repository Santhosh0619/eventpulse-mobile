import { api } from '@/services/api'
import { eventService } from '@/services/eventService'

jest.mock('@/services/api', () => ({ api: { get: jest.fn() } }))

const mockApi = api as unknown as { get: jest.Mock }

describe('eventService', () => {
  beforeEach(() => jest.clearAllMocks())

  it('search passes query params and returns the page', async () => {
    const page = { items: [], total: 0, page: 1, limit: 20, pages: 0 }
    mockApi.get.mockResolvedValueOnce({ data: page })

    const result = await eventService.search({ q: 'jazz', category_id: 'c1' })

    expect(mockApi.get).toHaveBeenCalledWith('/api/v1/events', {
      params: { q: 'jazz', category_id: 'c1' },
    })
    expect(result).toEqual(page)
  })

  it('featured fetches the featured list', async () => {
    mockApi.get.mockResolvedValueOnce({ data: [] })
    await eventService.featured()
    expect(mockApi.get).toHaveBeenCalledWith('/api/v1/events/featured')
  })

  it('getById fetches a single event', async () => {
    mockApi.get.mockResolvedValueOnce({ data: { id: 'e1' } })
    await eventService.getById('e1')
    expect(mockApi.get).toHaveBeenCalledWith('/api/v1/events/e1')
  })

  it('getMedia fetches event media', async () => {
    mockApi.get.mockResolvedValueOnce({ data: [] })
    await eventService.getMedia('e1')
    expect(mockApi.get).toHaveBeenCalledWith('/api/v1/events/e1/media')
  })

  it('listCategories fetches categories', async () => {
    mockApi.get.mockResolvedValueOnce({ data: [] })
    await eventService.listCategories()
    expect(mockApi.get).toHaveBeenCalledWith('/api/v1/categories')
  })
})
