import type { RouteProp } from '@react-navigation/native'
import { useNavigation, useRoute } from '@react-navigation/native'
import type { StackNavigationProp } from '@react-navigation/stack'
import { parseISO } from 'date-fns'
import { useEffect, useState } from 'react'
import { Alert, Pressable, StyleSheet, Text, View } from 'react-native'

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
import { CACHE_KEYS, offlineCache } from '@/lib/offlineCache'
import { orderStatusBadge } from '@/lib/orderStatus'
import type { ApiError } from '@/services/api'
import { attendeeService } from '@/services/attendeeService'
import { orderService } from '@/services/orderService'
import type { Attendee } from '@/types/attendee'
import type { TicketsStackParamList } from '@/navigation/types'
import { colors, fontSizes, spacing } from '@/theme'

export function OrderDetailScreen() {
  const route = useRoute<RouteProp<TicketsStackParamList, 'OrderDetail'>>()
  const navigation =
    useNavigation<StackNavigationProp<TicketsStackParamList, 'OrderDetail'>>()
  const { orderId, justPaid } = route.params

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

  // While pending, poll for the webhook-driven confirmation (e.g. after paying)
  // so the screen flips to "Confirmed" without a manual refresh.
  useEffect(() => {
    if (!pending) return
    const id = setInterval(reload, 5000)
    return () => clearInterval(id)
  }, [pending, reload])

  // Once confirmed, load the buyer's tickets (attendee records) for QR display.
  const confirmed = order?.status === 'confirmed'
  const eventId = order?.event_id ?? null
  const { data: tickets } = useAsync(
    () =>
      confirmed && eventId
        ? attendeeService.listMine(eventId)
        : Promise.resolve<Attendee[]>([]),
    [confirmed, eventId],
  )

  // Cache tickets so their QR codes stay viewable offline at the venue.
  const [cachedTickets, setCachedTickets] = useState<Attendee[] | null>(null)
  useEffect(() => {
    if (confirmed && eventId) {
      void offlineCache
        .get<Attendee[]>(CACHE_KEYS.ticketsForEvent(eventId))
        .then(setCachedTickets)
    }
  }, [confirmed, eventId])
  useEffect(() => {
    if (eventId && tickets && tickets.length > 0) {
      void offlineCache.set(CACHE_KEYS.ticketsForEvent(eventId), tickets)
    }
  }, [eventId, tickets])
  const ticketList = tickets ?? cachedTickets ?? []

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

      {pending && justPaid ? (
        <Card style={styles.countdownCard}>
          <Text style={styles.countdownLabel}>
            Payment received — confirming your tickets…
          </Text>
        </Card>
      ) : pending && remaining != null ? (
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

      {confirmed && ticketList.length > 0 ? (
        <Card>
          <Text style={styles.ticketsLabel}>Your tickets</Text>
          {ticketList.map((t) => (
            <Pressable
              key={t.id}
              style={styles.ticketRow}
              onPress={() =>
                navigation.navigate('QRFull', {
                  ticketCode: t.ticket_code,
                  name: `${t.first_name} ${t.last_name}`.trim(),
                })
              }
            >
              <View style={styles.ticketInfo}>
                <Text style={styles.ticketName} numberOfLines={1}>
                  {`${t.first_name} ${t.last_name}`.trim()}
                </Text>
                <Text style={styles.ticketCode}>{t.ticket_code}</Text>
              </View>
              <Badge
                label={t.check_in_status === 'checked_in' ? 'Used' : 'Show QR'}
                tone={
                  t.check_in_status === 'checked_in' ? 'neutral' : 'primary'
                }
              />
            </Pressable>
          ))}
        </Card>
      ) : null}

      {pending && !expired && !justPaid ? (
        <View style={styles.actions}>
          <Button
            title="Pay now"
            onPress={() =>
              navigation.navigate('Payment', { orderId: order.id })
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
  ticketsLabel: {
    fontSize: fontSizes.sm,
    fontWeight: '700',
    color: colors.textMuted,
    textTransform: 'uppercase',
    marginBottom: spacing.sm,
  },
  ticketRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    gap: spacing.md,
  },
  ticketInfo: { flex: 1, gap: 2 },
  ticketName: { fontSize: fontSizes.md, color: colors.text, fontWeight: '600' },
  ticketCode: { fontSize: fontSizes.xs, color: colors.textMuted },
})
