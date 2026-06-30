import { type ReactNode } from 'react'
import { ScrollView, StyleSheet, View, type ViewStyle } from 'react-native'
import { SafeAreaView, type Edge } from 'react-native-safe-area-context'

import { colors, spacing } from '@/theme'

interface ScreenProps {
  children: ReactNode
  /** Wrap content in a ScrollView. Off for screens with their own FlatList. */
  scroll?: boolean
  padded?: boolean
  edges?: readonly Edge[]
  contentStyle?: ViewStyle
}

export function Screen({
  children,
  scroll = false,
  padded = true,
  edges = ['top', 'left', 'right'],
  contentStyle,
}: ScreenProps) {
  const inner = (
    <View style={[styles.flex, padded && styles.padded, contentStyle]}>
      {children}
    </View>
  )
  return (
    <SafeAreaView style={styles.safe} edges={edges}>
      {scroll ? (
        <ScrollView
          contentContainerStyle={[
            styles.scrollContent,
            padded && styles.padded,
            contentStyle,
          ]}
          keyboardShouldPersistTaps="handled"
        >
          {children}
        </ScrollView>
      ) : (
        inner
      )}
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  flex: { flex: 1 },
  scrollContent: { flexGrow: 1 },
  padded: { padding: spacing.lg },
})
