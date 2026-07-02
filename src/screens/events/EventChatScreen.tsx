import { Ionicons } from '@expo/vector-icons'
import type { RouteProp } from '@react-navigation/native'
import { useRoute } from '@react-navigation/native'
import { useRef, useState } from 'react'
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native'

import { Button, Input, Spinner } from '@/components/ui'
import type { ApiError } from '@/services/api'
import { chatService } from '@/services/chatService'
import type { HomeStackParamList } from '@/navigation/types'
import { colors, fontSizes, radii, spacing } from '@/theme'

interface Message {
  role: 'user' | 'assistant'
  text: string
  /** For assistant messages: false when the deterministic fallback was served. */
  fromAi?: boolean
}

/** Ask the AI chatbot questions about an event (rate-limited server-side). */
export function EventChatScreen() {
  const route = useRoute<RouteProp<HomeStackParamList, 'EventChat'>>()
  const { eventId } = route.params
  const scrollRef = useRef<ScrollView>(null)
  const [question, setQuestion] = useState('')
  const [messages, setMessages] = useState<Message[]>([])
  const [sending, setSending] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [remaining, setRemaining] = useState<number | null>(null)

  async function send() {
    const q = question.trim()
    if (!q || sending) return

    setError(null)
    setSending(true)
    setQuestion('')
    setMessages((prev) => [...prev, { role: 'user', text: q }])

    try {
      const res = await chatService.ask(eventId, q)
      setMessages((prev) => [
        ...prev,
        { role: 'assistant', text: res.answer, fromAi: res.generated_by_ai },
      ])
      setRemaining(res.questions_remaining)
    } catch (e) {
      setError((e as ApiError).message)
    } finally {
      setSending(false)
    }
  }

  return (
    <KeyboardAvoidingView
      style={styles.flex}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView
        ref={scrollRef}
        contentContainerStyle={styles.messages}
        onContentSizeChange={() =>
          scrollRef.current?.scrollToEnd({ animated: true })
        }
        keyboardShouldPersistTaps="handled"
      >
        {messages.length === 0 ? (
          <Text style={styles.intro}>
            Ask anything about this event — schedule, venue, tickets, and more.
          </Text>
        ) : null}
        {messages.map((msg, i) => (
          <View
            key={i}
            style={[
              styles.bubbleRow,
              msg.role === 'user' ? styles.rowRight : styles.rowLeft,
            ]}
          >
            <View
              style={[
                styles.bubble,
                msg.role === 'user' ? styles.userBubble : styles.aiBubble,
              ]}
            >
              <Text
                style={msg.role === 'user' ? styles.userText : styles.aiText}
              >
                {msg.text}
              </Text>
            </View>
            {msg.role === 'assistant' && msg.fromAi === false ? (
              <Text style={styles.fallbackNote}>AI assistant unavailable</Text>
            ) : null}
          </View>
        ))}
        {sending ? <Spinner size="small" /> : null}
      </ScrollView>

      <View style={styles.footer}>
        {error ? <Text style={styles.error}>{error}</Text> : null}
        {remaining !== null ? (
          <Text style={styles.remaining}>
            {remaining} question{remaining === 1 ? '' : 's'} left this hour
          </Text>
        ) : null}
        <View style={styles.inputRow}>
          <View style={styles.inputWrap}>
            <Input
              value={question}
              onChangeText={setQuestion}
              placeholder="Ask about this event…"
              maxLength={1000}
              editable={!sending}
              onSubmitEditing={send}
              returnKeyType="send"
            />
          </View>
          <Button
            title="Send"
            size="sm"
            fullWidth={false}
            loading={sending}
            disabled={sending || !question.trim()}
            onPress={send}
            leftIcon={
              <Ionicons name="send" size={16} color={colors.textInverse} />
            }
          />
        </View>
      </View>
    </KeyboardAvoidingView>
  )
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: colors.background },
  messages: { padding: spacing.lg, gap: spacing.md, flexGrow: 1 },
  intro: { fontSize: fontSizes.md, color: colors.textMuted },
  bubbleRow: { gap: spacing.xs },
  rowLeft: { alignItems: 'flex-start' },
  rowRight: { alignItems: 'flex-end' },
  bubble: {
    maxWidth: '85%',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radii.md,
  },
  userBubble: { backgroundColor: colors.primaryLight },
  aiBubble: { backgroundColor: colors.surfaceAlt },
  userText: { fontSize: fontSizes.md, color: colors.primaryDark },
  aiText: { fontSize: fontSizes.md, color: colors.text },
  fallbackNote: { fontSize: fontSizes.xs, color: colors.textMuted },
  footer: {
    padding: spacing.lg,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    gap: spacing.sm,
  },
  error: { fontSize: fontSizes.sm, color: colors.danger },
  remaining: { fontSize: fontSizes.xs, color: colors.textMuted },
  inputRow: { flexDirection: 'row', alignItems: 'flex-start', gap: spacing.sm },
  inputWrap: { flex: 1 },
})
