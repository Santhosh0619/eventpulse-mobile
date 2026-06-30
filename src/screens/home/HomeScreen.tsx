import { useNavigation } from '@react-navigation/native'
import type { StackNavigationProp } from '@react-navigation/stack'
import { useCallback } from 'react'
import { ScrollView, StyleSheet, Text, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'

import { CategoryChip } from '@/components/events/CategoryChip'
import { EventCard } from '@/components/events/EventCard'
import { EmptyState, Spinner } from '@/components/ui'
import { useAsync } from '@/hooks/useAsync'
import { eventService } from '@/services/eventService'
import type { Category, Event } from '@/types/event'
import type { HomeStackParamList } from '@/navigation/types'
import { colors, fontSizes, spacing } from '@/theme'

export function HomeScreen() {
  const navigation =
    useNavigation<StackNavigationProp<HomeStackParamList, 'HomeMain'>>()

  const { data, loading, error, reload } = useAsync(
    () =>
      Promise.all([
        eventService.featured().catch(() => []),
        eventService.listCategories().catch(() => []),
        eventService.search({ limit: 10 }),
      ]).then(([featured, categories, upcoming]) => ({
        featured,
        categories,
        upcoming: upcoming.items,
      })),
    [],
  )

  const openEvent = useCallback(
    (event: Event) =>
      navigation.navigate('EventDetail', {
        eventId: event.id,
        title: event.title,
      }),
    [navigation],
  )

  const openCategory = useCallback(
    (category: Category) =>
      navigation.navigate('CategoryEvents', {
        categoryId: category.id,
        name: category.name,
      }),
    [navigation],
  )

  if (loading && !data) {
    return <Spinner fullscreen label="Loading…" />
  }
  if (error || !data) {
    return (
      <SafeAreaView style={styles.safe}>
        <EmptyState
          icon="alert-circle-outline"
          title="Couldn't load events"
          message={error?.message}
          actionLabel="Retry"
          onAction={reload}
        />
      </SafeAreaView>
    )
  }

  const { featured, categories, upcoming } = data

  return (
    <SafeAreaView style={styles.safe} edges={['left', 'right']}>
      <ScrollView contentContainerStyle={styles.content}>
        {featured.length > 0 ? (
          <View style={styles.section}>
            <Text style={styles.heading}>Featured</Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.carousel}
            >
              {featured.map((e) => (
                <EventCard
                  key={e.id}
                  event={e}
                  variant="carousel"
                  onPress={openEvent}
                />
              ))}
            </ScrollView>
          </View>
        ) : null}

        {categories.length > 0 ? (
          <View style={styles.section}>
            <Text style={styles.heading}>Browse by category</Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.chips}
            >
              {categories.map((c) => (
                <CategoryChip key={c.id} category={c} onPress={openCategory} />
              ))}
            </ScrollView>
          </View>
        ) : null}

        <View style={styles.section}>
          <Text style={styles.heading}>Upcoming events</Text>
          {upcoming.length === 0 ? (
            <Text style={styles.muted}>No upcoming events yet.</Text>
          ) : (
            <View style={styles.list}>
              {upcoming.map((e) => (
                <EventCard key={e.id} event={e} onPress={openEvent} />
              ))}
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.surface },
  content: { paddingVertical: spacing.lg, gap: spacing.xl },
  section: { gap: spacing.md },
  heading: {
    fontSize: fontSizes.xl,
    fontWeight: '700',
    color: colors.text,
    paddingHorizontal: spacing.lg,
  },
  carousel: { paddingHorizontal: spacing.lg },
  chips: { gap: spacing.sm, paddingHorizontal: spacing.lg },
  list: { gap: spacing.md, paddingHorizontal: spacing.lg },
  muted: {
    fontSize: fontSizes.sm,
    color: colors.textMuted,
    paddingHorizontal: spacing.lg,
  },
})
