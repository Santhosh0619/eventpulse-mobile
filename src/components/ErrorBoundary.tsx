import { Component, type ReactNode } from 'react'
import { StyleSheet, Text, View } from 'react-native'

import { Button } from '@/components/ui'
import { colors, fontSizes, spacing } from '@/theme'

interface Props {
  children: ReactNode
}
interface State {
  error: Error | null
}

/**
 * Top-level error boundary so a render crash shows a recoverable screen instead
 * of a white screen. "Try again" clears the error to re-mount the subtree.
 */
export class ErrorBoundary extends Component<Props, State> {
  state: State = { error: null }

  static getDerivedStateFromError(error: Error): State {
    return { error }
  }

  reset = () => this.setState({ error: null })

  render() {
    if (this.state.error) {
      return (
        <View style={styles.container}>
          <Text style={styles.title}>Something went wrong</Text>
          <Text style={styles.message}>
            An unexpected error occurred. Please try again.
          </Text>
          <View style={styles.action}>
            <Button title="Try again" onPress={this.reset} />
          </View>
        </View>
      )
    }
    return this.props.children
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    padding: spacing.xl,
    backgroundColor: colors.background,
  },
  title: { fontSize: fontSizes.xl, fontWeight: '700', color: colors.text },
  message: {
    fontSize: fontSizes.md,
    color: colors.textMuted,
    textAlign: 'center',
  },
  action: { alignSelf: 'stretch', marginTop: spacing.lg },
})
