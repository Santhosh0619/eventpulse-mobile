import type { RouteProp } from '@react-navigation/native'
import { useNavigation, useRoute } from '@react-navigation/native'
import type { StackNavigationProp } from '@react-navigation/stack'
import { useCallback, useEffect, useState } from 'react'
import { ActivityIndicator, FlatList, StyleSheet } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'

import { EventCard } from '@/components/events/EventCard'
import { EmptyState } from '@/components/ui'
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

  const [items, setItems] = useState<Event[]>([])
  const [page, setPage] = useState(1)
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let ignore = false
    setLoading(true)
    setError(null)
    eventService
      .search({ category_id: categoryId, page: 1, limit: PAGE_SIZE })
      .then((res) => {
        if (ignore) return
        setItems(res.items)
        setTotal(res.total)
        setPage(1)
      })
      .catch((e) => {
        if (!ignore)
          setError((e as { message?: string }).message ?? 'Failed to load')
      })
      .finally(() => {
        if (!ignore) setLoading(false)
      })
    return () => {
      ignore = true
    }
  }, [categoryId])

  const loadMore = useCallback(() => {
    if (loadingMore || loading || items.length >= total) return
    setLoadingMore(true)
    const next = page + 1
    eventService
      .search({ category_id: categoryId, page: next, limit: PAGE_SIZE })
      .then((res) => {
        setItems((prev) => [...prev, ...res.items])
        setPage(next)
      })
      .catch(() => {})
      .finally(() => setLoadingMore(false))
  }, [loadingMore, loading, items.length, total, page, categoryId])

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
