import {
  fireEvent,
  render,
  screen,
  waitFor,
} from '@testing-library/react-native'

import { ReviewFormScreen } from '@/screens/events/ReviewFormScreen'
import { reviewService } from '@/services/reviewService'

const mockGoBack = jest.fn()
jest.mock('@react-navigation/native', () => ({
  useRoute: () => ({ params: { eventId: 'ev1' } }),
  useNavigation: () => ({ goBack: mockGoBack }),
}))
jest.mock('@/services/reviewService', () => ({
  reviewService: { submit: jest.fn() },
}))

const mockSubmit = reviewService.submit as jest.Mock

describe('ReviewFormScreen', () => {
  beforeEach(() => jest.clearAllMocks())

  it('requires a star rating before submitting', () => {
    render(<ReviewFormScreen />)
    fireEvent.press(screen.getByText('Submit review'))
    expect(screen.getByText('Please choose a star rating.')).toBeTruthy()
    expect(mockSubmit).not.toHaveBeenCalled()
  })

  it('submits the chosen rating and goes back', async () => {
    mockSubmit.mockResolvedValueOnce({ id: 'r1' })
    render(<ReviewFormScreen />)

    fireEvent.press(screen.getByTestId('star-4'))
    fireEvent.press(screen.getByText('Submit review'))

    await waitFor(() =>
      expect(mockSubmit).toHaveBeenCalledWith('ev1', { rating: 4 }),
    )
    await waitFor(() => expect(mockGoBack).toHaveBeenCalled())
  })
})
