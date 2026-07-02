import { Ionicons } from '@expo/vector-icons'
import { useNavigation } from '@react-navigation/native'
import type { StackNavigationProp } from '@react-navigation/stack'
import { useCallback, useEffect, useState } from 'react'
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  StyleSheet,
  TextInput,
  View,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'

import { EventCard } from '@/components/events/EventCard'
import { FilterSheet } from '@/components/events/FilterSheet'
import { Badge, EmptyState } from '@/components/ui'
import { useEventPagination } from '@/hooks/useEventPagination'
import { listPerf } from '@/lib/listPerf'
import { eventService } from '@/services/eventService'
import { useEventStore } from '@/store/eventStore'
import type { Category, Event } from '@/types/event'
import type { DiscoverStackParamList } from '@/navigation/types'
import { colors, fontSizes, radii, spacing } from '@/theme'

const PAGE_SIZE = 20

export function DiscoverScreen() {
  const navigation =
    useNavigation<StackNavigationProp<DiscoverStackParamList, 'DiscoverMain'>>()
  const filters = useEventStore((s) => s.filters)
  const setFilters = useEventStore((s) => s.setFilters)
  const resetFilters = useEventStore((s) => s.resetFilters)

  const [searchText, setSearchText] = useState(filters.search)
  const [sheetVisible, setSheetVisible] = useState(false)
  const [categories, setCategories] = useState<Category[]>([])

  // Debounce the search box into the shared filter.
  useEffect(() => {
    const t = setTimeout(() => setFilters({ search: searchText }), 400)
    return () => clearTimeout(t)
  }, [searchText, setFilters])

  useEffect(() => {
    eventService
      .listCategories()
      .then(setCategories)
      .catch(() => setCategories([]))
  }, [])

  const fetchPage = useCallback(
    (page: number) =>
      eventService.search({
        page,
        limit: PAGE_SIZE,
        q: filters.search || undefined,
        category_id: filters.categoryId ?? undefined,
        city: filters.city ?? undefined,
      }),
    [filters.search, filters.categoryId, filters.city],
  )

  const { items, loading, loadingMore, error, loadMore } = useEventPagination(
    fetchPage,
    [filters.search, filters.categoryId, filters.city],
  )

  const openEvent = useCallback(
    (event: Event) =>
      navigation.navigate('EventDetail', {
        eventId: event.id,
        title: event.title,
      }),
    [navigation],
  )

  const activeFilterCount =
    (filters.categoryId ? 1 : 0) + (filters.city ? 1 : 0)

  return (
    <SafeAreaView style={styles.safe} edges={['left', 'right']}>
      <View style={styles.searchRow}>
        <View style={styles.searchBox}>
          <Ionicons name="search" size={18} color={colors.textMuted} />
          <TextInput
            value={searchText}
            onChangeText={setSearchText}
            placeholder="Search events"
            placeholderTextColor={colors.textMuted}
            style={styles.searchInput}
            returnKeyType="search"
            autoCapitalize="none"
          />
          {searchText ? (
            <Pressable
              onPress={() => setSearchText('')}
              hitSlop={8}
              accessibilityRole="button"
              accessibilityLabel="Clear search"
            >
              <Ionicons
                name="close-circle"
                size={18}
                color={colors.textMuted}
              />
            </Pressable>
          ) : null}
        </View>
        <Pressable
          style={styles.filterBtn}
          onPress={() => setSheetVisible(true)}
          hitSlop={8}
          accessibilityRole="button"
          accessibilityLabel="Open filters"
        >
          <Ionicons name="options-outline" size={22} color={colors.primary} />
          {activeFilterCount > 0 ? (
            <View style={styles.filterBadge}>
              <Badge label={String(activeFilterCount)} tone="primary" />
            </View>
          ) : null}
        </Pressable>
      </View>

      <FlatList
        {...listPerf}
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
              icon={error ? 'alert-circle-outline' : 'search-outline'}
              title={error ? "Couldn't load events" : 'No events found'}
              message={error ?? 'Try adjusting your search or filters.'}
            />
          )
        }
      />

      <FilterSheet
        visible={sheetVisible}
        onClose={() => setSheetVisible(false)}
        categories={categories}
        filters={filters}
        onApply={setFilters}
        onClear={resetFilters}
      />
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.surface },
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    padding: spacing.lg,
  },
  searchBox: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.md,
    paddingHorizontal: spacing.md,
  },
  searchInput: {
    flex: 1,
    paddingVertical: spacing.md,
    fontSize: fontSizes.md,
    color: colors.text,
  },
  filterBtn: {
    padding: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.md,
    backgroundColor: colors.background,
  },
  filterBadge: { position: 'absolute', top: -6, right: -6 },
  list: { padding: spacing.lg, paddingTop: 0, gap: spacing.md, flexGrow: 1 },
  footer: { paddingVertical: spacing.lg },
})
