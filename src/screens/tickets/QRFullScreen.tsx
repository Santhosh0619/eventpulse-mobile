import type { RouteProp } from '@react-navigation/native'
import { useRoute } from '@react-navigation/native'
import * as Brightness from 'expo-brightness'
import { useEffect } from 'react'
import { StyleSheet, Text, View } from 'react-native'
import QRCode from 'react-native-qrcode-svg'

import { Screen } from '@/components/ui'
import type { TicketsStackParamList } from '@/navigation/types'
import { colors, fontSizes, spacing } from '@/theme'

/**
 * Full-screen ticket QR for scanning at the door. Boosts screen brightness to
 * max while visible (scanners read dim screens poorly) and restores it on exit.
 */
export function QRFullScreen() {
  const route = useRoute<RouteProp<TicketsStackParamList, 'QRFull'>>()
  const { ticketCode, name, eventTitle } = route.params

  useEffect(() => {
    let previous: number | null = null
    let cancelled = false
    void (async () => {
      try {
        previous = await Brightness.getBrightnessAsync()
        if (!cancelled) await Brightness.setBrightnessAsync(1)
      } catch {
        // Brightness control is best-effort; ignore if unavailable.
      }
    })()
    return () => {
      cancelled = true
      if (previous != null) void Brightness.setBrightnessAsync(previous)
    }
  }, [])

  return (
    <Screen edges={['top', 'left', 'right', 'bottom']}>
      <View style={styles.center}>
        {eventTitle ? <Text style={styles.event}>{eventTitle}</Text> : null}
        {name ? <Text style={styles.name}>{name}</Text> : null}
        <View style={styles.qrWrap}>
          <QRCode value={ticketCode} size={240} />
        </View>
        <Text style={styles.code}>{ticketCode}</Text>
        <Text style={styles.hint}>Show this to staff at the entrance.</Text>
      </View>
    </Screen>
  )
}

const styles = StyleSheet.create({
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.md,
  },
  event: { fontSize: fontSizes.lg, fontWeight: '700', color: colors.text },
  name: { fontSize: fontSizes.md, color: colors.textMuted },
  qrWrap: {
    padding: spacing.lg,
    // Always white so the QR stays scannable regardless of theme.
    backgroundColor: colors.textInverse,
    borderRadius: spacing.md,
  },
  code: {
    fontSize: fontSizes.md,
    fontWeight: '700',
    color: colors.text,
    letterSpacing: 1,
  },
  hint: { fontSize: fontSizes.sm, color: colors.textMuted },
})
