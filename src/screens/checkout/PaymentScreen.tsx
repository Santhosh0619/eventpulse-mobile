import { Ionicons } from '@expo/vector-icons'
import type { RouteProp } from '@react-navigation/native'
import { useNavigation, useRoute } from '@react-navigation/native'
import type { StackNavigationProp } from '@react-navigation/stack'
import { PaymentSheetError, useStripe } from '@stripe/stripe-react-native'
import { useCallback, useEffect, useRef, useState } from 'react'
import { StyleSheet, Text, View } from 'react-native'

import { Button, Screen, Spinner } from '@/components/ui'
import { env } from '@/lib/env'
import { formatMoney } from '@/lib/money'
import type { ApiError } from '@/services/api'
import { orderService } from '@/services/orderService'
import { paymentService } from '@/services/paymentService'
import type { CheckoutScreens } from '@/navigation/types'
import { colors, fontSizes, spacing } from '@/theme'

type Phase = 'preparing' | 'ready' | 'paying' | 'confirming' | 'done' | 'error'

/** Poll the order until the Stripe webhook flips it to confirmed (or give up). */
async function waitForConfirmation(orderId: string): Promise<boolean> {
  for (let i = 0; i < 12; i++) {
    const order = await orderService.get(orderId)
    if (order.status === 'confirmed') return true
    if (['cancelled', 'expired', 'refunded'].includes(order.status))
      return false
    await new Promise((r) => setTimeout(r, 2500))
  }
  return false
}

export function PaymentScreen() {
  const route = useRoute<RouteProp<CheckoutScreens, 'Payment'>>()
  const navigation =
    useNavigation<StackNavigationProp<CheckoutScreens, 'Payment'>>()
  const { orderId } = route.params
  const { initPaymentSheet, presentPaymentSheet } = useStripe()

  const [phase, setPhase] = useState<Phase>('preparing')
  const [error, setError] = useState<string | null>(null)
  const [label, setLabel] = useState<string>('')

  const configured = Boolean(env.stripePublishableKey)

  // Guard async setState/navigation: the user can back out mid-flight.
  const mounted = useRef(true)
  useEffect(
    () => () => {
      mounted.current = false
    },
    [],
  )

  const prepare = useCallback(async () => {
    setPhase('preparing')
    setError(null)
    try {
      const intent = await paymentService.createIntent(orderId)
      if (!mounted.current) return
      setLabel(formatMoney(intent.amount, intent.currency))
      const { error: initError } = await initPaymentSheet({
        merchantDisplayName: 'EventPulse',
        paymentIntentClientSecret: intent.client_secret,
        returnURL: 'eventpulse://payment-complete',
      })
      if (!mounted.current) return
      if (initError) {
        setError(initError.message)
        setPhase('error')
      } else {
        setPhase('ready')
      }
    } catch (e) {
      if (!mounted.current) return
      setError((e as ApiError).message ?? 'Could not start payment.')
      setPhase('error')
    }
  }, [orderId, initPaymentSheet])

  useEffect(() => {
    if (configured) void prepare()
  }, [configured, prepare])

  // While paying/confirming, block back navigation so the flow can't be
  // interrupted mid-payment (mirrors the Confirmation screen).
  const locked = phase === 'paying' || phase === 'confirming'
  useEffect(() => {
    navigation.setOptions({
      gestureEnabled: !locked,
      headerLeft: locked ? () => null : undefined,
    })
  }, [navigation, locked])

  const pay = async () => {
    if (phase !== 'ready') return
    setError(null)
    setPhase('paying')
    const { error: payError } = await presentPaymentSheet()
    if (!mounted.current) return
    if (payError) {
      // User cancelled or the card failed; let them retry.
      if (payError.code !== PaymentSheetError.Canceled)
        setError(payError.message)
      setPhase('ready')
      return
    }
    // Payment succeeded on Stripe; the order confirms via webhook (async).
    setPhase('confirming')
    await waitForConfirmation(orderId)
    if (!mounted.current) return
    setPhase('done')
    navigation.replace('OrderDetail', { orderId, justPaid: true })
  }

  if (!configured) {
    return (
      <Screen>
        <View style={styles.center}>
          <Ionicons name="card-outline" size={64} color={colors.textMuted} />
          <Text style={styles.title}>Payments unavailable</Text>
          <Text style={styles.body}>
            Card payments aren’t configured in this build.
          </Text>
        </View>
      </Screen>
    )
  }

  if (phase === 'preparing') {
    return <Spinner fullscreen label="Preparing payment…" />
  }
  if (phase === 'confirming') {
    return <Spinner fullscreen label="Confirming your order…" />
  }

  return (
    <Screen>
      <View style={styles.center}>
        <Ionicons name="lock-closed" size={56} color={colors.primary} />
        <Text style={styles.title}>Secure payment</Text>
        <Text style={styles.body}>
          You’ll pay {label} via Stripe. Your card details never touch our
          servers.
        </Text>
        {error ? <Text style={styles.error}>{error}</Text> : null}
      </View>
      <View style={styles.footer}>
        {phase === 'error' ? (
          <Button title="Try again" onPress={prepare} />
        ) : (
          <Button
            title={label ? `Pay ${label}` : 'Pay'}
            loading={phase === 'paying'}
            onPress={pay}
          />
        )}
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
  title: { fontSize: fontSizes.xl, fontWeight: '700', color: colors.text },
  body: {
    fontSize: fontSizes.md,
    color: colors.textMuted,
    textAlign: 'center',
    paddingHorizontal: spacing.lg,
  },
  error: {
    fontSize: fontSizes.sm,
    color: colors.danger,
    marginTop: spacing.sm,
  },
  footer: { paddingVertical: spacing.lg },
})
