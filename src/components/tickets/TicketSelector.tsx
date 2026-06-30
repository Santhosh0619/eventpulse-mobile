import { Ionicons } from '@expo/vector-icons'
import { useMemo, useState } from 'react'
import { Pressable, StyleSheet, Text, View } from 'react-native'

import { BottomSheet, Button, Spinner } from '@/components/ui'
import { useAsync } from '@/hooks/useAsync'
import { formatMoney } from '@/lib/money'
import { ticketService } from '@/services/ticketService'
import type { TicketSelection, TierAvailability } from '@/types/order'
import { colors, fontSizes, radii, spacing } from '@/theme'

interface TicketSelectorProps {
  visible: boolean
  onClose: () => void
  eventId: string
  onContinue: (selections: TicketSelection[]) => void
}

export function TicketSelector({
  visible,
  onClose,
  eventId,
  onContinue,
}: TicketSelectorProps) {
  const { data, loading, error } = useAsync(
    () => ticketService.getAvailability(eventId),
    [eventId],
  )
  const [quantities, setQuantities] = useState<Record<string, number>>({})

  const tiers = useMemo(() => data?.tiers ?? [], [data])

  const setQty = (tier: TierAvailability, delta: number) => {
    setQuantities((prev) => {
      const current = prev[tier.ticket_type_id] ?? 0
      const max = Math.min(tier.quantity_available, 10)
      const next = Math.max(0, Math.min(max, current + delta))
      return { ...prev, [tier.ticket_type_id]: next }
    })
  }

  const selections: TicketSelection[] = useMemo(
    () =>
      tiers
        .filter((t) => (quantities[t.ticket_type_id] ?? 0) > 0)
        .map((t) => ({
          ticketTypeId: t.ticket_type_id,
          name: t.name,
          price: t.price,
          currency: t.currency,
          quantity: quantities[t.ticket_type_id],
        })),
    [tiers, quantities],
  )

  const subtotal = selections.reduce(
    (acc, s) => acc + Number(s.price) * s.quantity,
    0,
  )
  const totalCount = selections.reduce((acc, s) => acc + s.quantity, 0)
  const currency = tiers[0]?.currency ?? 'INR'

  return (
    <BottomSheet visible={visible} onClose={onClose} title="Select tickets">
      {loading ? (
        <Spinner label="Loading tickets…" />
      ) : error ? (
        <Text style={styles.error}>{error.message}</Text>
      ) : tiers.length === 0 ? (
        <Text style={styles.muted}>No tickets available for this event.</Text>
      ) : (
        <>
          {tiers.map((tier) => {
            const qty = quantities[tier.ticket_type_id] ?? 0
            const soldOut = tier.quantity_available <= 0
            const max = Math.min(tier.quantity_available, 10)
            const disabled = soldOut || !tier.is_on_sale
            return (
              <View key={tier.ticket_type_id} style={styles.tier}>
                <View style={styles.tierInfo}>
                  <Text style={styles.tierName}>{tier.name}</Text>
                  <Text style={styles.tierPrice}>
                    {formatMoney(tier.price, tier.currency)}
                  </Text>
                  <Text style={styles.tierMeta}>
                    {soldOut
                      ? 'Sold out'
                      : !tier.is_on_sale
                        ? 'Not on sale'
                        : `${tier.quantity_available} available`}
                  </Text>
                </View>
                <View style={styles.stepper}>
                  <Pressable
                    onPress={() => setQty(tier, -1)}
                    disabled={qty === 0}
                    style={[
                      styles.stepBtn,
                      qty === 0 && styles.stepBtnDisabled,
                    ]}
                    hitSlop={6}
                    testID={`dec-${tier.ticket_type_id}`}
                  >
                    <Ionicons name="remove" size={18} color={colors.primary} />
                  </Pressable>
                  <Text style={styles.qty}>{qty}</Text>
                  <Pressable
                    onPress={() => setQty(tier, 1)}
                    disabled={disabled || qty >= max}
                    style={[
                      styles.stepBtn,
                      (disabled || qty >= max) && styles.stepBtnDisabled,
                    ]}
                    hitSlop={6}
                    testID={`inc-${tier.ticket_type_id}`}
                  >
                    <Ionicons name="add" size={18} color={colors.primary} />
                  </Pressable>
                </View>
              </View>
            )
          })}

          <View style={styles.summary}>
            <Text style={styles.subtotalLabel}>Subtotal</Text>
            <Text style={styles.subtotal}>
              {formatMoney(subtotal, currency)}
            </Text>
          </View>

          <Button
            title={
              totalCount > 0 ? `Continue (${totalCount})` : 'Select tickets'
            }
            disabled={totalCount === 0}
            onPress={() => onContinue(selections)}
          />
        </>
      )}
    </BottomSheet>
  )
}

const styles = StyleSheet.create({
  error: { color: colors.danger, fontSize: fontSizes.sm },
  muted: { color: colors.textMuted, fontSize: fontSizes.sm },
  tier: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  tierInfo: { flex: 1, gap: 2 },
  tierName: { fontSize: fontSizes.md, fontWeight: '600', color: colors.text },
  tierPrice: {
    fontSize: fontSizes.md,
    color: colors.primary,
    fontWeight: '700',
  },
  tierMeta: { fontSize: fontSizes.xs, color: colors.textMuted },
  stepper: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  stepBtn: {
    width: 32,
    height: 32,
    borderRadius: radii.full,
    borderWidth: 1,
    borderColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepBtnDisabled: { borderColor: colors.border, opacity: 0.5 },
  qty: {
    fontSize: fontSizes.md,
    fontWeight: '700',
    minWidth: 20,
    textAlign: 'center',
  },
  summary: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.sm,
  },
  subtotalLabel: { fontSize: fontSizes.md, color: colors.textMuted },
  subtotal: { fontSize: fontSizes.lg, fontWeight: '700', color: colors.text },
})
