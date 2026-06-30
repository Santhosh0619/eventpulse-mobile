import { StyleSheet, Text, View } from 'react-native'

import { Screen } from '@/components/ui'
import { colors, fontSizes, spacing } from '@/theme'

interface PlaceholderProps {
  title: string
  subtitle?: string
}

/**
 * Stand-in for screens not yet built. Each feature phase replaces these with
 * real implementations. Keeps the navigation graph wired end-to-end from
 * Phase 0 so we can run the app and exercise routing immediately.
 */
export function Placeholder({ title, subtitle }: PlaceholderProps) {
  return (
    <Screen>
      <View style={styles.center}>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.subtitle}>
          {subtitle ?? 'Coming soon in a later phase.'}
        </Text>
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
  subtitle: { fontSize: fontSizes.sm, color: colors.textMuted },
})
