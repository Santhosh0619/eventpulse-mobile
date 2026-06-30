import { api } from '@/services/api'
import type { Order, OrderCreate } from '@/types/order'

/** Order pipeline API calls for attendees. */
export const orderService = {
  async place(payload: OrderCreate): Promise<Order> {
    const { data } = await api.post<Order>('/api/v1/orders', payload)
    return data
  },

  async listMine(): Promise<Order[]> {
    const { data } = await api.get<Order[]>('/api/v1/users/me/orders')
    return data
  },

  async get(orderId: string): Promise<Order> {
    const { data } = await api.get<Order>(`/api/v1/orders/${orderId}`)
    return data
  },

  async cancel(orderId: string): Promise<Order> {
    const { data } = await api.post<Order>(`/api/v1/orders/${orderId}/cancel`)
    return data
  },
}
