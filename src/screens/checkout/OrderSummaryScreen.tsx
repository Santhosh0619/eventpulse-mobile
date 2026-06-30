import type { RouteProp } from '@react-navigation/native'
import { useNavigation, useRoute } from '@react-navigation/native'
import type { StackNavigationProp } from '@react-navigation/stack'
import { useState } from 'react'
import { StyleSheet, Text, View } from 'react-native'

import { Button, Card, Screen } from '@/components/ui'
import { formatMoney, sumSelections } from '@/lib/money'
import type { ApiError } from '@/services/api'
import { orderService } from '@/services/orderService'
import type { HomeStackParamList } from '@/navigation/types'
import { colors, fontSizes, spacing } from '@/theme'

export function OrderSummaryScreen() {
  const route = useRoute<RouteProp<HomeStackParamList, 'OrderSummary'>>()
  const navigation =
    useNavigation<StackNavigationProp<HomeStackParamList, 'OrderSummary'>>()
  const { eventId, eventTitle, selections } = route.params

  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const currency = selections[0]?.currency ?? 'INR'
  const total = sumSelections(selections)

  const placeOrder = async () => {
    setSubmitting(true)
    setError(null)
    try {
      const order = await orderService.place({
        event_id: eventId,
        items: selections.map((s) => ({
          ticket_type_id: s.ticketTypeId,
          quantity: s.quantity,
        })),
      })
      // Replace so the back button doesn't return to the summary post-purchase.
      navigation.replace('Confirmation', { orderId: order.id })
    } catch (e) {
      setError((e as ApiError).message ?? 'Could not place your order.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Screen scroll>
      <Text style={styles.event}>{eventTitle}</Text>

      <Card>
        {selections.map((s) => (
          <View key={s.ticketTypeId} style={styles.line}>
            <View style={styles.lineInfo}>
              <Text style={styles.lineName}>{s.name}</Text>
              <Text style={styles.lineMeta}>
                {s.quantity} × {formatMoney(s.price, s.currency)}
              </Text>
            </View>
            <Text style={styles.lineTotal}>
              {formatMoney(Number(s.price) * s.quantity, s.currency)}
            </Text>
          </View>
        ))}
        <View style={styles.totalRow}>
          <Text style={styles.totalLabel}>Total</Text>
          <Text style={styles.total}>{formatMoney(total, currency)}</Text>
        </View>
      </Card>

      <Text style={styles.note}>
        Your order is held for a limited time. Payment is the final step.
      </Text>

      {error ? <Text style={styles.error}>{error}</Text> : null}

      <Button title="Place order" loading={submitting} onPress={placeOrder} />
    </Screen>
  )
}

const styles = StyleSheet.create({
  event: { fontSize: fontSizes.xl, fontWeight: '700', color: colors.text },
  line: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  lineInfo: { flex: 1, gap: 2 },
  lineName: { fontSize: fontSizes.md, fontWeight: '600', color: colors.text },
  lineMeta: { fontSize: fontSizes.sm, color: colors.textMuted },
  lineTotal: { fontSize: fontSizes.md, fontWeight: '600', color: colors.text },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: spacing.md,
  },
  totalLabel: { fontSize: fontSizes.lg, fontWeight: '700', color: colors.text },
  total: { fontSize: fontSizes.xl, fontWeight: '700', color: colors.primary },
  note: { fontSize: fontSizes.sm, color: colors.textMuted },
  error: { fontSize: fontSizes.sm, color: colors.danger },
})
