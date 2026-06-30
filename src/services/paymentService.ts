import { api } from '@/services/api'

/** Client secret + metadata for confirming a payment on the device. */
export interface PaymentIntent {
  client_secret: string
  payment_intent_id: string
  amount: string
  currency: string
}

/** Payment API calls. */
export const paymentService = {
  /** Create (or fetch) a Stripe PaymentIntent for a pending order. */
  async createIntent(orderId: string): Promise<PaymentIntent> {
    const { data } = await api.post<PaymentIntent>(
      '/api/v1/payments/create-intent',
      { order_id: orderId },
    )
    return data
  },
}
