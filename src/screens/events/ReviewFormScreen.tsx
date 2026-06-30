import type { RouteProp } from '@react-navigation/native'
import { useNavigation, useRoute } from '@react-navigation/native'
import type { StackNavigationProp } from '@react-navigation/stack'
import { useState } from 'react'
import { StyleSheet, Text, View } from 'react-native'

import { RatingStars } from '@/components/reviews/RatingStars'
import { Button, Input, Screen } from '@/components/ui'
import type { ApiError } from '@/services/api'
import { reviewService } from '@/services/reviewService'
import type { ReviewScreens } from '@/navigation/types'
import { colors, fontSizes, spacing } from '@/theme'

export function ReviewFormScreen() {
  const route = useRoute<RouteProp<ReviewScreens, 'ReviewForm'>>()
  const navigation =
    useNavigation<StackNavigationProp<ReviewScreens, 'ReviewForm'>>()
  const { eventId } = route.params

  const [rating, setRating] = useState(0)
  const [title, setTitle] = useState('')
  const [comment, setComment] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const submit = async () => {
    if (rating < 1) {
      setError('Please choose a star rating.')
      return
    }
    setSubmitting(true)
    setError(null)
    try {
      await reviewService.submit(eventId, {
        rating,
        title: title.trim() || undefined,
        comment: comment.trim() || undefined,
      })
      navigation.goBack()
    } catch (e) {
      setError((e as ApiError).message ?? 'Could not submit your review.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Screen scroll>
      <Text style={styles.label}>Your rating</Text>
      <View style={styles.stars}>
        <RatingStars rating={rating} size={36} onChange={setRating} />
      </View>

      <View style={styles.form}>
        <Input
          label="Title (optional)"
          value={title}
          onChangeText={setTitle}
          placeholder="Sum it up in a line"
          maxLength={200}
        />
        <Input
          label="Review (optional)"
          value={comment}
          onChangeText={setComment}
          placeholder="What did you think?"
          multiline
          numberOfLines={5}
          style={styles.commentInput}
        />
        {error ? <Text style={styles.error}>{error}</Text> : null}
        <Button title="Submit review" loading={submitting} onPress={submit} />
      </View>
    </Screen>
  )
}

const styles = StyleSheet.create({
  label: { fontSize: fontSizes.md, fontWeight: '700', color: colors.text },
  stars: { alignItems: 'center', paddingVertical: spacing.lg },
  form: { gap: spacing.lg },
  commentInput: { minHeight: 120, textAlignVertical: 'top' },
  error: { fontSize: fontSizes.sm, color: colors.danger },
})
