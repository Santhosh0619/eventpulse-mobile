import { api } from '@/services/api'
import { paymentService } from '@/services/paymentService'

jest.mock('@/services/api', () => ({ api: { post: jest.fn() } }))

const mockApi = api as unknown as { post: jest.Mock }

describe('paymentService', () => {
  beforeEach(() => jest.clearAllMocks())

  it('createIntent posts the order id and returns the client secret', async () => {
    mockApi.post.mockResolvedValueOnce({
      data: {
        client_secret: 'cs_123',
        payment_intent_id: 'pi_123',
        amount: '1499.00',
        currency: 'INR',
      },
    })

    const intent = await paymentService.createIntent('ord1')

    expect(mockApi.post).toHaveBeenCalledWith(
      '/api/v1/payments/create-intent',
      {
        order_id: 'ord1',
      },
    )
    expect(intent.client_secret).toBe('cs_123')
  })
})
