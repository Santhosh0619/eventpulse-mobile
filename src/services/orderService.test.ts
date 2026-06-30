import { api } from '@/services/api'
import { orderService } from '@/services/orderService'

jest.mock('@/services/api', () => ({
  api: { get: jest.fn(), post: jest.fn() },
}))

const mockApi = api as unknown as { get: jest.Mock; post: jest.Mock }

describe('orderService', () => {
  beforeEach(() => jest.clearAllMocks())

  it('place posts the order payload', async () => {
    mockApi.post.mockResolvedValueOnce({ data: { id: 'ord1' } })
    const payload = {
      event_id: 'e1',
      items: [{ ticket_type_id: 't1', quantity: 2 }],
    }
    const order = await orderService.place(payload)
    expect(mockApi.post).toHaveBeenCalledWith('/api/v1/orders', payload)
    expect(order).toEqual({ id: 'ord1' })
  })

  it('listMine fetches the current user orders', async () => {
    mockApi.get.mockResolvedValueOnce({ data: [] })
    await orderService.listMine()
    expect(mockApi.get).toHaveBeenCalledWith('/api/v1/users/me/orders')
  })

  it('get fetches a single order', async () => {
    mockApi.get.mockResolvedValueOnce({ data: { id: 'ord1' } })
    await orderService.get('ord1')
    expect(mockApi.get).toHaveBeenCalledWith('/api/v1/orders/ord1')
  })

  it('cancel posts to the cancel endpoint', async () => {
    mockApi.post.mockResolvedValueOnce({
      data: { id: 'ord1', status: 'cancelled' },
    })
    await orderService.cancel('ord1')
    expect(mockApi.post).toHaveBeenCalledWith('/api/v1/orders/ord1/cancel')
  })
})
