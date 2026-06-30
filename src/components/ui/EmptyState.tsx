import { Ionicons } from '@expo/vector-icons'
import { StyleSheet, Text, View } from 'react-native'

import { Button } from './Button'
import { colors, fontSizes, spacing } from '@/theme'

interface EmptyStateProps {
  icon?: keyof typeof Ionicons.glyphMap
  title: string
  message?: string
  actionLabel?: string
  onAction?: () => void
}

/** Centered placeholder for empty lists and error states, with an optional CTA. */
export function EmptyState({
  icon = 'file-tray-outline',
  title,
  message,
  actionLabel,
  onAction,
}: EmptyStateProps) {
  return (
    <View style={styles.container}>
      <Ionicons name={icon} size={48} color={colors.textMuted} />
      <Text style={styles.title}>{title}</Text>
      {message ? <Text style={styles.message}>{message}</Text> : null}
      {actionLabel && onAction ? (
        <View style={styles.action}>
          <Button title={actionLabel} variant="outline" onPress={onAction} />
        </View>
      ) : null}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    padding: spacing.xl,
  },
  title: { fontSize: fontSizes.lg, fontWeight: '700', color: colors.text },
  message: {
    fontSize: fontSizes.sm,
    color: colors.textMuted,
    textAlign: 'center',
  },
  action: { marginTop: spacing.md, alignSelf: 'stretch' },
})
