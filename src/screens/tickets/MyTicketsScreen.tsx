import { useNavigation } from '@react-navigation/native'
import type { StackNavigationProp } from '@react-navigation/stack'
import { useCallback } from 'react'
import {
  FlatList,
  Pressable,
  RefreshControl,
  StyleSheet,
  Text,
  View,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'

import { Badge, Card, EmptyState, Spinner } from '@/components/ui'
import { useAsync } from '@/hooks/useAsync'
import { formatDateLong } from '@/lib/datetime'
import { formatMoney } from '@/lib/money'
import { orderStatusBadge } from '@/lib/orderStatus'
import { orderService } from '@/services/orderService'
import type { Order } from '@/types/order'
import type { TicketsStackParamList } from '@/navigation/types'
import { colors, fontSizes, spacing } from '@/theme'

export function MyTicketsScreen() {
  const navigation =
    useNavigation<StackNavigationProp<TicketsStackParamList, 'TicketsMain'>>()
  const { data, loading, error, reload } = useAsync(
    () => orderService.listMine(),
    [],
  )

  const renderItem = useCallback(
    ({ item }: { item: Order }) => {
      const badge = orderStatusBadge(item.status)
      return (
        <Pressable
          onPress={() =>
            navigation.navigate('OrderDetail', { orderId: item.id })
          }
        >
          <Card style={styles.card}>
            <View style={styles.row}>
              <Text style={styles.orderNo}>{item.order_number}</Text>
              <Badge label={badge.label} tone={badge.tone} />
            </View>
            <Text style={styles.meta}>{formatDateLong(item.created_at)}</Text>
            <Text style={styles.total}>
              {formatMoney(item.total_amount, item.currency)}
            </Text>
          </Card>
        </Pressable>
      )
    },
    [navigation],
  )

  if (loading && !data) {
    return <Spinner fullscreen label="Loading your tickets…" />
  }
  if (error) {
    return (
      <SafeAreaView style={styles.safe}>
        <EmptyState
          icon="alert-circle-outline"
          title="Couldn't load your tickets"
          message={error.message}
          actionLabel="Retry"
          onAction={reload}
        />
      </SafeAreaView>
    )
  }

  return (
    <SafeAreaView style={styles.safe} edges={['left', 'right']}>
      <FlatList
        data={data ?? []}
        keyExtractor={(o) => o.id}
        renderItem={renderItem}
        contentContainerStyle={styles.list}
        refreshControl={
          <RefreshControl refreshing={loading} onRefresh={reload} />
        }
        ListEmptyComponent={
          <EmptyState
            icon="ticket-outline"
            title="No tickets yet"
            message="Orders you place will show up here."
          />
        }
      />
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.surface },
  list: { padding: spacing.lg, gap: spacing.md, flexGrow: 1 },
  card: { gap: spacing.xs },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  orderNo: { fontSize: fontSizes.md, fontWeight: '700', color: colors.text },
  meta: { fontSize: fontSizes.sm, color: colors.textMuted },
  total: { fontSize: fontSizes.lg, fontWeight: '700', color: colors.primary },
})
