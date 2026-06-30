import type { RouteProp } from '@react-navigation/native'
import { useRoute } from '@react-navigation/native'
import { parseISO } from 'date-fns'
import { useEffect, useState } from 'react'
import { Alert, StyleSheet, Text, View } from 'react-native'

import {
  Badge,
  Button,
  Card,
  EmptyState,
  Screen,
  Spinner,
} from '@/components/ui'
import { useAsync } from '@/hooks/useAsync'
import { formatCountdown, formatDateLong } from '@/lib/datetime'
import { formatMoney } from '@/lib/money'
import { orderStatusBadge } from '@/lib/orderStatus'
import type { ApiError } from '@/services/api'
import { orderService } from '@/services/orderService'
import type { TicketsStackParamList } from '@/navigation/types'
import { colors, fontSizes, spacing } from '@/theme'

export function OrderDetailScreen() {
  const route = useRoute<RouteProp<TicketsStackParamList, 'OrderDetail'>>()
  const { orderId } = route.params

  const {
    data: order,
    loading,
    error,
    reload,
  } = useAsync(() => orderService.get(orderId), [orderId])
  const [cancelling, setCancelling] = useState(false)
  const [now, setNow] = useState(() => Date.now())

  const pending = order?.status === 'pending'
  const expiresAt = order?.expires_at
    ? parseISO(order.expires_at).getTime()
    : null

  // Tick once a second while a pending order counts down to expiry, then stop
  // (no point re-rendering a static "expired" view forever).
  useEffect(() => {
    if (!pending || expiresAt == null) return
    const id = setInterval(() => {
      const t = Date.now()
      setNow(t)
      if (t >= expiresAt) clearInterval(id)
    }, 1000)
    return () => clearInterval(id)
  }, [pending, expiresAt])

  if (loading && !order) {
    return <Spinner fullscreen label="Loading order…" />
  }
  if (error || !order) {
    return (
      <EmptyState
        icon="alert-circle-outline"
        title="Couldn't load order"
        message={error?.message}
        actionLabel="Retry"
        onAction={reload}
      />
    )
  }

  const badge = orderStatusBadge(order.status)
  const remaining = expiresAt != null ? expiresAt - now : null
  const expired = remaining != null && remaining <= 0

  const confirmCancel = () => {
    Alert.alert('Cancel order', 'Release these reserved tickets?', [
      { text: 'Keep', style: 'cancel' },
      {
        text: 'Cancel order',
        style: 'destructive',
        onPress: async () => {
          setCancelling(true)
          try {
            await orderService.cancel(order.id)
            reload()
          } catch (e) {
            Alert.alert('Error', (e as ApiError).message ?? 'Could not cancel.')
          } finally {
            setCancelling(false)
          }
        },
      },
    ])
  }

  return (
    <Screen scroll>
      <View style={styles.header}>
        <Text style={styles.orderNo}>Order {order.order_number}</Text>
        <Badge label={badge.label} tone={badge.tone} />
      </View>
      <Text style={styles.placed}>
        Placed {formatDateLong(order.created_at)}
      </Text>

      {pending && remaining != null ? (
        <Card style={expired ? styles.expiredCard : styles.countdownCard}>
          <Text style={styles.countdownLabel}>
            {expired ? 'This order has expired' : 'Complete payment within'}
          </Text>
          {!expired ? (
            <Text style={styles.countdown}>{formatCountdown(remaining)}</Text>
          ) : null}
        </Card>
      ) : null}

      <Card>
        {order.items.map((item) => (
          <View key={item.id} style={styles.line}>
            <Text style={styles.lineQty}>{item.quantity}×</Text>
            <Text style={styles.lineSubtotal}>
              {formatMoney(item.subtotal, order.currency)}
            </Text>
          </View>
        ))}
        <View style={styles.totalRow}>
          <Text style={styles.totalLabel}>Total</Text>
          <Text style={styles.total}>
            {formatMoney(order.total_amount, order.currency)}
          </Text>
        </View>
      </Card>

      {pending && !expired ? (
        <View style={styles.actions}>
          <Button
            title="Pay now"
            onPress={() =>
              Alert.alert('Payment', 'Card payment arrives in the next update.')
            }
          />
          <Button
            title="Cancel order"
            variant="ghost"
            loading={cancelling}
            onPress={confirmCancel}
          />
        </View>
      ) : null}
    </Screen>
  )
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  orderNo: { fontSize: fontSizes.lg, fontWeight: '700', color: colors.text },
  placed: {
    fontSize: fontSizes.sm,
    color: colors.textMuted,
    marginBottom: spacing.md,
  },
  countdownCard: { alignItems: 'center', backgroundColor: colors.warningLight },
  expiredCard: { alignItems: 'center', backgroundColor: colors.surfaceAlt },
  countdownLabel: { fontSize: fontSizes.sm, color: colors.text },
  countdown: {
    fontSize: fontSizes.display,
    fontWeight: '700',
    color: colors.warning,
  },
  line: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  lineQty: { fontSize: fontSizes.md, color: colors.text },
  lineSubtotal: {
    fontSize: fontSizes.md,
    fontWeight: '600',
    color: colors.text,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: spacing.md,
  },
  totalLabel: { fontSize: fontSizes.lg, fontWeight: '700', color: colors.text },
  total: { fontSize: fontSizes.lg, fontWeight: '700', color: colors.primary },
  actions: { gap: spacing.sm, marginTop: spacing.lg },
})
