import {
  fireEvent,
  render,
  screen,
  waitFor,
} from '@testing-library/react-native'

import { PaymentScreen } from '@/screens/checkout/PaymentScreen'
import { orderService } from '@/services/orderService'
import { paymentService } from '@/services/paymentService'

jest.mock('@/lib/env', () => ({
  env: {
    stripePublishableKey: 'pk_test_123',
    apiBaseUrl: 'http://localhost:8000',
    googleMapsApiKey: '',
  },
}))

jest.mock('@/services/paymentService', () => ({
  paymentService: { createIntent: jest.fn() },
}))
jest.mock('@/services/orderService', () => ({
  orderService: { get: jest.fn() },
}))

const mockReplace = jest.fn()
jest.mock('@react-navigation/native', () => ({
  useRoute: () => ({ params: { orderId: 'ord1' } }),
  useNavigation: () => ({ replace: mockReplace, setOptions: jest.fn() }),
}))

const mockCreateIntent = paymentService.createIntent as jest.Mock
const mockGet = orderService.get as jest.Mock

describe('PaymentScreen', () => {
  beforeEach(() => jest.clearAllMocks())

  it('prepares the sheet, pays, waits for confirmation, then opens the order', async () => {
    mockCreateIntent.mockResolvedValueOnce({
      client_secret: 'cs_1',
      payment_intent_id: 'pi_1',
      amount: '1499.00',
      currency: 'INR',
    })
    mockGet.mockResolvedValueOnce({ id: 'ord1', status: 'confirmed' })

    render(<PaymentScreen />)

    const payButton = await screen.findByText(/^Pay/)
    expect(mockCreateIntent).toHaveBeenCalledWith('ord1')

    fireEvent.press(payButton)

    await waitFor(() =>
      expect(mockReplace).toHaveBeenCalledWith('OrderDetail', {
        orderId: 'ord1',
        justPaid: true,
      }),
    )
  })
})
