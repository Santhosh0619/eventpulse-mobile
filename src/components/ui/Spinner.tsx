import { ActivityIndicator, StyleSheet, Text, View } from 'react-native'

import { colors, fontSizes, spacing } from '@/theme'

interface SpinnerProps {
  /** When set, fills its parent and centers — use for full-screen loading. */
  fullscreen?: boolean
  label?: string
  size?: 'small' | 'large'
}

export function Spinner({
  fullscreen = false,
  label,
  size = 'large',
}: SpinnerProps) {
  return (
    <View style={[styles.container, fullscreen && styles.fullscreen]}>
      <ActivityIndicator size={size} color={colors.primary} />
      {label ? <Text style={styles.label}>{label}</Text> : null}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
  },
  fullscreen: { flex: 1, backgroundColor: colors.background },
  label: { fontSize: fontSizes.sm, color: colors.textMuted },
})
