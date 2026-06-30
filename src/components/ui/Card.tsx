import { type ReactNode } from 'react'
import { StyleSheet, View, type ViewProps } from 'react-native'

import { colors, radii, spacing } from '@/theme'

interface CardProps extends ViewProps {
  children: ReactNode
  padded?: boolean
}

export function Card({ children, padded = true, style, ...rest }: CardProps) {
  return (
    <View style={[styles.card, padded && styles.padded, style]} {...rest}>
      {children}
    </View>
  )
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.background,
    borderRadius: radii.lg,
    borderWidth: 1,
    borderColor: colors.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
    overflow: 'hidden',
  },
  padded: { padding: spacing.lg },
})
