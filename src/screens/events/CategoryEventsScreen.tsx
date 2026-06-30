import type { RouteProp } from '@react-navigation/native'
import { useNavigation, useRoute } from '@react-navigation/native'
import type { StackNavigationProp } from '@react-navigation/stack'
import { useCallback } from 'react'
import { ActivityIndicator, FlatList, StyleSheet } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'

import { EventCard } from '@/components/events/EventCard'
import { EmptyState } from '@/components/ui'
import { useEventPagination } from '@/hooks/useEventPagination'
import { eventService } from '@/services/eventService'
import type { Event } from '@/types/event'
import type { HomeStackParamList } from '@/navigation/types'
import { colors, spacing } from '@/theme'

const PAGE_SIZE = 20

export function CategoryEventsScreen() {
  const route = useRoute<RouteProp<HomeStackParamList, 'CategoryEvents'>>()
  const navigation =
    useNavigation<StackNavigationProp<HomeStackParamList, 'CategoryEvents'>>()
  const { categoryId } = route.params

  const fetchPage = useCallback(
    (page: number) =>
      eventService.search({ category_id: categoryId, page, limit: PAGE_SIZE }),
    [categoryId],
  )

  const { items, loading, loadingMore, error, loadMore } = useEventPagination(
    fetchPage,
    [categoryId],
  )

  const openEvent = useCallback(
    (event: Event) =>
      navigation.navigate('EventDetail', {
        eventId: event.id,
        title: event.title,
      }),
    [navigation],
  )

  return (
    <SafeAreaView style={styles.safe} edges={['left', 'right']}>
      <FlatList
        data={items}
        keyExtractor={(e) => e.id}
        renderItem={({ item }) => (
          <EventCard event={item} onPress={openEvent} />
        )}
        contentContainerStyle={styles.list}
        onEndReached={loadMore}
        onEndReachedThreshold={0.4}
        ListFooterComponent={
          loadingMore ? (
            <ActivityIndicator color={colors.primary} style={styles.footer} />
          ) : null
        }
        ListEmptyComponent={
          loading ? (
            <ActivityIndicator color={colors.primary} style={styles.footer} />
          ) : (
            <EmptyState
              icon={error ? 'alert-circle-outline' : 'calendar-outline'}
              title={
                error ? "Couldn't load events" : 'No events in this category'
              }
              message={error ?? undefined}
            />
          )
        }
      />
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.surface },
  list: { padding: spacing.lg, gap: spacing.md, flexGrow: 1 },
  footer: { paddingVertical: spacing.lg },
})
