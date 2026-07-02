/** The chatbot's answer to a question about an event. */
export interface ChatAnswer {
  answer: string
  generated_by_ai: boolean
  questions_remaining: number
}
