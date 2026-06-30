import { StyleSheet, Text, View } from 'react-native'

import { Screen } from '@/components/ui'
import { colors, fontSizes, spacing } from '@/theme'

/**
 * Phase 0 placeholder. The real login form (email/password, biometric unlock)
 * is built in Phase 2.
 */
export function LoginScreen() {
  return (
    <Screen>
      <View style={styles.center}>
        <Text style={styles.brand}>EventPulse</Text>
        <Text style={styles.subtitle}>Sign in — coming in Phase 2.</Text>
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
  brand: {
    fontSize: fontSizes.display,
    fontWeight: '700',
    color: colors.primary,
  },
  subtitle: { fontSize: fontSizes.md, color: colors.textMuted },
})
