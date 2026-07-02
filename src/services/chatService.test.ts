import { api } from '@/services/api'
import { chatService } from '@/services/chatService'

jest.mock('@/services/api', () => ({
  api: { post: jest.fn() },
}))

const mockApi = api as unknown as { post: jest.Mock }

describe('chatService', () => {
  beforeEach(() => jest.clearAllMocks())

  it('posts the question and returns the typed answer', async () => {
    mockApi.post.mockResolvedValueOnce({
      data: {
        answer: 'The event starts at 6pm.',
        generated_by_ai: true,
        questions_remaining: 4,
      },
    })

    const res = await chatService.ask('ev1', 'When does it start?')

    expect(mockApi.post).toHaveBeenCalledWith('/api/v1/events/ev1/chat', {
      question: 'When does it start?',
    })
    expect(res.answer).toBe('The event starts at 6pm.')
    expect(res.questions_remaining).toBe(4)
  })

  it('propagates a rate-limit error', async () => {
    mockApi.post.mockRejectedValueOnce({
      status: 429,
      message: 'You can ask up to 5 questions per event per hour.',
    })
    await expect(chatService.ask('ev1', 'again?')).rejects.toMatchObject({
      status: 429,
    })
  })
})
