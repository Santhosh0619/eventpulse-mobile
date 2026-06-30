import { api } from '@/services/api'
import { notificationService } from '@/services/notificationService'

jest.mock('@/services/api', () => ({ api: { get: jest.fn(), put: jest.fn() } }))

const mockApi = api as unknown as { get: jest.Mock; put: jest.Mock }

describe('notificationService', () => {
  beforeEach(() => jest.clearAllMocks())

  it('list fetches notifications', async () => {
    mockApi.get.mockResolvedValueOnce({ data: [] })
    await notificationService.list()
    expect(mockApi.get).toHaveBeenCalledWith('/api/v1/notifications')
  })

  it('unreadCount returns the unread number', async () => {
    mockApi.get.mockResolvedValueOnce({ data: { unread: 3 } })
    expect(await notificationService.unreadCount()).toBe(3)
    expect(mockApi.get).toHaveBeenCalledWith(
      '/api/v1/notifications/unread-count',
    )
  })

  it('markRead PUTs the read endpoint', async () => {
    mockApi.put.mockResolvedValueOnce({ data: {} })
    await notificationService.markRead('n1')
    expect(mockApi.put).toHaveBeenCalledWith('/api/v1/notifications/n1/read')
  })

  it('markAllRead PUTs read-all', async () => {
    mockApi.put.mockResolvedValueOnce({ data: {} })
    await notificationService.markAllRead()
    expect(mockApi.put).toHaveBeenCalledWith('/api/v1/notifications/read-all')
  })
})
