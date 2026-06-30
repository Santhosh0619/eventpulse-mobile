import { StyleSheet, Text, View } from 'react-native'

import { RatingStars } from '@/components/reviews/RatingStars'
import { Card } from '@/components/ui'
import { formatDateLong } from '@/lib/datetime'
import type { Review } from '@/types/review'
import { colors, fontSizes, spacing } from '@/theme'

export function ReviewCard({ review }: { review: Review }) {
  return (
    <Card style={styles.card}>
      <View style={styles.head}>
        <RatingStars rating={review.rating} />
        <Text style={styles.date}>{formatDateLong(review.created_at)}</Text>
      </View>
      {review.title ? <Text style={styles.title}>{review.title}</Text> : null}
      {review.comment ? (
        <Text style={styles.comment}>{review.comment}</Text>
      ) : null}
      {review.organizer_response ? (
        <View style={styles.response}>
          <Text style={styles.responseLabel}>Organizer response</Text>
          <Text style={styles.responseText}>{review.organizer_response}</Text>
        </View>
      ) : null}
    </Card>
  )
}

const styles = StyleSheet.create({
  card: { gap: spacing.xs },
  head: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  date: { fontSize: fontSizes.xs, color: colors.textMuted },
  title: { fontSize: fontSizes.md, fontWeight: '700', color: colors.text },
  comment: { fontSize: fontSizes.md, color: colors.text, lineHeight: 22 },
  response: {
    marginTop: spacing.sm,
    padding: spacing.md,
    backgroundColor: colors.surfaceAlt,
    borderRadius: spacing.sm,
    gap: spacing.xs,
  },
  responseLabel: {
    fontSize: fontSizes.xs,
    fontWeight: '700',
    color: colors.primary,
    textTransform: 'uppercase',
  },
  responseText: { fontSize: fontSizes.sm, color: colors.text, lineHeight: 20 },
})
