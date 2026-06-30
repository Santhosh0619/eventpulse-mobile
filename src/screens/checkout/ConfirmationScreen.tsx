import { Ionicons } from '@expo/vector-icons'
import type { RouteProp } from '@react-navigation/native'
import { useNavigation, useRoute } from '@react-navigation/native'
import type { StackNavigationProp } from '@react-navigation/stack'
import { StyleSheet, Text, View } from 'react-native'

import { Button, EmptyState, Screen, Spinner } from '@/components/ui'
import { useAsync } from '@/hooks/useAsync'
import { formatMoney } from '@/lib/money'
import { orderService } from '@/services/orderService'
import type { HomeStackParamList } from '@/navigation/types'
import { colors, fontSizes, spacing } from '@/theme'

export function ConfirmationScreen() {
  const route = useRoute<RouteProp<HomeStackParamList, 'Confirmation'>>()
  const navigation =
    useNavigation<StackNavigationProp<HomeStackParamList, 'Confirmation'>>()
  const { orderId } = route.params

  const {
    data: order,
    loading,
    error,
    reload,
  } = useAsync(() => orderService.get(orderId), [orderId])

  if (loading && !order) {
    return <Spinner fullscreen label="Finalizing…" />
  }
  if (error || !order) {
    return (
      <EmptyState
        icon="alert-circle-outline"
        title="Couldn't load your order"
        message={error?.message}
        actionLabel="Retry"
        onAction={reload}
      />
    )
  }

  const pending = order.status === 'pending'

  return (
    <Screen>
      <View style={styles.center}>
        <Ionicons
          name={pending ? 'time-outline' : 'checkmark-circle'}
          size={72}
          color={pending ? colors.warning : colors.success}
        />
        <Text style={styles.title}>
          {pending ? 'Order placed' : 'You’re going!'}
        </Text>
        <Text style={styles.orderNo}>Order {order.order_number}</Text>
        <Text style={styles.total}>
          {formatMoney(order.total_amount, order.currency)}
        </Text>
        <Text style={styles.body}>
          {pending
            ? 'Your tickets are reserved. Complete payment from the order screen to confirm them.'
            : 'Your tickets are confirmed. Find them under My Tickets.'}
        </Text>

        <View style={styles.actions}>
          <Button
            title="View order"
            onPress={() =>
              navigation.replace('OrderDetail', { orderId: order.id })
            }
          />
          <Button
            title="Back to home"
            variant="ghost"
            onPress={() => navigation.popToTop()}
          />
        </View>
      </View>
    </Screen>
  )
}

const styles = StyleSheet.create({
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
  },
  title: { fontSize: fontSizes.xxl, fontWeight: '700', color: colors.text },
  orderNo: { fontSize: fontSizes.sm, color: colors.textMuted },
  total: { fontSize: fontSizes.xl, fontWeight: '700', color: colors.primary },
  body: {
    fontSize: fontSizes.md,
    color: colors.textMuted,
    textAlign: 'center',
    marginTop: spacing.sm,
  },
  actions: { alignSelf: 'stretch', gap: spacing.sm, marginTop: spacing.xl },
})
