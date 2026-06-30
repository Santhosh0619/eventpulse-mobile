import type { RouteProp } from '@react-navigation/native'
import { useNavigation, useRoute } from '@react-navigation/native'
import type { StackNavigationProp } from '@react-navigation/stack'
import { useCallback } from 'react'
import { FlatList, StyleSheet, Text, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'

import { RatingStars } from '@/components/reviews/RatingStars'
import { ReviewCard } from '@/components/reviews/ReviewCard'
import { Button, Card, EmptyState, Spinner } from '@/components/ui'
import { useAsync } from '@/hooks/useAsync'
import { reviewService } from '@/services/reviewService'
import type { Review, ReviewSummary } from '@/types/review'
import type { ReviewScreens } from '@/navigation/types'
import { colors, fontSizes, spacing } from '@/theme'

export function ReviewsScreen() {
  const route = useRoute<RouteProp<ReviewScreens, 'Reviews'>>()
  const navigation =
    useNavigation<StackNavigationProp<ReviewScreens, 'Reviews'>>()
  const { eventId } = route.params

  const { data, loading, error, reload } = useAsync(
    () =>
      Promise.all([
        reviewService.getSummary(eventId),
        reviewService.list(eventId),
      ]).then(([summary, reviews]) => ({ summary, reviews })),
    [eventId],
  )

  const header = useCallback(
    (summary: ReviewSummary) => (
      <View style={styles.summaryWrap}>
        <Card style={styles.summary}>
          <Text style={styles.avg}>{summary.average_rating.toFixed(1)}</Text>
          <RatingStars rating={summary.average_rating} size={20} />
          <Text style={styles.count}>
            {summary.total_reviews}{' '}
            {summary.total_reviews === 1 ? 'review' : 'reviews'}
          </Text>
        </Card>
        <Button
          title="Write a review"
          variant="outline"
          onPress={() => navigation.navigate('ReviewForm', { eventId })}
        />
      </View>
    ),
    [navigation, eventId],
  )

  if (loading && !data) {
    return <Spinner fullscreen label="Loading reviews…" />
  }
  if (error || !data) {
    return (
      <SafeAreaView style={styles.safe}>
        <EmptyState
          icon="alert-circle-outline"
          title="Couldn't load reviews"
          message={error?.message}
          actionLabel="Retry"
          onAction={reload}
        />
      </SafeAreaView>
    )
  }

  return (
    <SafeAreaView style={styles.safe} edges={['left', 'right']}>
      <FlatList
        data={data.reviews}
        keyExtractor={(r: Review) => r.id}
        renderItem={({ item }) => <ReviewCard review={item} />}
        ListHeaderComponent={header(data.summary)}
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          <Text style={styles.empty}>
            No reviews yet. Be the first to share your experience.
          </Text>
        }
      />
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.surface },
  list: { padding: spacing.lg, gap: spacing.md, flexGrow: 1 },
  summaryWrap: { gap: spacing.md, marginBottom: spacing.md },
  summary: { alignItems: 'center', gap: spacing.xs },
  avg: { fontSize: fontSizes.display, fontWeight: '700', color: colors.text },
  count: { fontSize: fontSizes.sm, color: colors.textMuted },
  empty: {
    fontSize: fontSizes.sm,
    color: colors.textMuted,
    textAlign: 'center',
    marginTop: spacing.lg,
  },
})
