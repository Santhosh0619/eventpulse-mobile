import {
  fireEvent,
  render,
  screen,
  waitFor,
} from '@testing-library/react-native'

import { EventChatScreen } from '@/screens/events/EventChatScreen'
import { chatService } from '@/services/chatService'

jest.mock('@react-navigation/native', () => ({
  useRoute: () => ({ params: { eventId: 'ev1', eventTitle: 'Jazz Night' } }),
}))

jest.mock('@/services/chatService', () => ({
  chatService: { ask: jest.fn() },
}))

const mockAsk = chatService.ask as jest.Mock

describe('EventChatScreen', () => {
  beforeEach(() => jest.clearAllMocks())

  it('sends a question and shows the answer and remaining quota', async () => {
    mockAsk.mockResolvedValueOnce({
      answer: 'Doors open at 6pm.',
      generated_by_ai: true,
      questions_remaining: 4,
    })
    render(<EventChatScreen />)

    fireEvent.changeText(
      screen.getByPlaceholderText(/Ask about this event/),
      'When do doors open?',
    )
    fireEvent.press(screen.getByText('Send'))

    await waitFor(() =>
      expect(mockAsk).toHaveBeenCalledWith('ev1', 'When do doors open?'),
    )
    expect(await screen.findByText('Doors open at 6pm.')).toBeTruthy()
    expect(screen.getByText('4 questions left this hour')).toBeTruthy()
    expect(screen.queryByText('AI assistant unavailable')).toBeNull()
  })

  it('flags a fallback answer when the AI was unavailable', async () => {
    mockAsk.mockResolvedValueOnce({
      answer: 'Sorry, the AI assistant is unavailable right now.',
      generated_by_ai: false,
      questions_remaining: 3,
    })
    render(<EventChatScreen />)

    fireEvent.changeText(
      screen.getByPlaceholderText(/Ask about this event/),
      'hi',
    )
    fireEvent.press(screen.getByText('Send'))

    expect(await screen.findByText('AI assistant unavailable')).toBeTruthy()
  })

  it('shows the rate-limit error message', async () => {
    mockAsk.mockRejectedValueOnce({
      status: 429,
      message: 'You can ask up to 5 questions per event per hour.',
    })
    render(<EventChatScreen />)

    fireEvent.changeText(
      screen.getByPlaceholderText(/Ask about this event/),
      'again?',
    )
    fireEvent.press(screen.getByText('Send'))

    expect(
      await screen.findByText(
        'You can ask up to 5 questions per event per hour.',
      ),
    ).toBeTruthy()
  })
})
