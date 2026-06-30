import { useCallback, useEffect, useState } from 'react'
import {
  FlatList,
  Pressable,
  RefreshControl,
  StyleSheet,
  Text,
  View,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'

import { Button, EmptyState, Spinner } from '@/components/ui'
import { useAsync } from '@/hooks/useAsync'
import { formatDateLong } from '@/lib/datetime'
import { listPerf } from '@/lib/listPerf'
import { notificationService } from '@/services/notificationService'
import { useNotificationStore } from '@/store/notificationStore'
import type { AppNotification } from '@/types/notification'
import { colors, fontSizes, spacing } from '@/theme'

export function NotificationCenterScreen() {
  const { data, loading, error, reload } = useAsync(
    () => notificationService.list(),
    [],
  )
  const setUnreadCount = useNotificationStore((s) => s.setUnreadCount)
  const decrement = useNotificationStore((s) => s.decrement)
  const reset = useNotificationStore((s) => s.reset)
  const [busy, setBusy] = useState(false)

  // Keep the badge in sync with the server's unread set whenever the list loads.
  useEffect(() => {
    if (data) setUnreadCount(data.filter((n) => !n.is_read).length)
  }, [data, setUnreadCount])

  const onRead = useCallback(
    async (n: AppNotification) => {
      if (n.is_read) return
      decrement()
      try {
        await notificationService.markRead(n.id)
      } catch {
        // Non-fatal: a failed mark-read will reconcile on next reload.
      }
      reload()
    },
    [decrement, reload],
  )

  const markAll = useCallback(async () => {
    setBusy(true)
    reset()
    try {
      await notificationService.markAllRead()
    } catch {
      // ignore; reload reconciles
    } finally {
      setBusy(false)
      reload()
    }
  }, [reset, reload])

  const renderItem = useCallback(
    ({ item }: { item: AppNotification }) => (
      <Pressable
        onPress={() => onRead(item)}
        style={[styles.row, !item.is_read && styles.rowUnread]}
      >
        {!item.is_read ? (
          <View style={styles.dot} />
        ) : (
          <View style={styles.dotSpacer} />
        )}
        <View style={styles.body}>
          <Text style={[styles.title, !item.is_read && styles.titleUnread]}>
            {item.title}
          </Text>
          <Text style={styles.message}>{item.message}</Text>
          <Text style={styles.time}>{formatDateLong(item.created_at)}</Text>
        </View>
      </Pressable>
    ),
    [onRead],
  )

  if (loading && !data) {
    return <Spinner fullscreen label="Loading notifications…" />
  }
  if (error && !data) {
    return (
      <SafeAreaView style={styles.safe}>
        <EmptyState
          icon="alert-circle-outline"
          title="Couldn't load notifications"
          message={error.message}
          actionLabel="Retry"
          onAction={reload}
        />
      </SafeAreaView>
    )
  }

  const items = data ?? []

  return (
    <SafeAreaView style={styles.safe} edges={['left', 'right']}>
      {items.some((n) => !n.is_read) ? (
        <View style={styles.toolbar}>
          <Button
            title="Mark all read"
            variant="ghost"
            size="sm"
            fullWidth={false}
            loading={busy}
            onPress={markAll}
          />
        </View>
      ) : null}
      <FlatList
        {...listPerf}
        data={items}
        keyExtractor={(n) => n.id}
        renderItem={renderItem}
        contentContainerStyle={styles.list}
        refreshControl={
          <RefreshControl refreshing={loading} onRefresh={reload} />
        }
        ListEmptyComponent={
          <EmptyState
            icon="notifications-outline"
            title="No notifications"
            message="You're all caught up."
          />
        }
      />
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  toolbar: {
    alignItems: 'flex-end',
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.sm,
  },
  list: { padding: spacing.lg, gap: spacing.sm, flexGrow: 1 },
  row: {
    flexDirection: 'row',
    gap: spacing.sm,
    padding: spacing.md,
    borderRadius: spacing.sm,
    backgroundColor: colors.background,
  },
  rowUnread: { backgroundColor: colors.primaryLight },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.primary,
    marginTop: 6,
  },
  dotSpacer: { width: 8 },
  body: { flex: 1, gap: 2 },
  title: { fontSize: fontSizes.md, color: colors.text },
  titleUnread: { fontWeight: '700' },
  message: { fontSize: fontSizes.sm, color: colors.textMuted },
  time: {
    fontSize: fontSizes.xs,
    color: colors.textMuted,
    marginTop: spacing.xs,
  },
})
