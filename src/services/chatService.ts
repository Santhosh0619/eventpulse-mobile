import { api } from '@/services/api'
import type { ChatAnswer } from '@/types/chat'

/** Event AI chatbot API calls. */
export const chatService = {
  async ask(eventId: string, question: string): Promise<ChatAnswer> {
    const { data } = await api.post<ChatAnswer>(
      `/api/v1/events/${eventId}/chat`,
      { question },
    )
    return data
  },
}
