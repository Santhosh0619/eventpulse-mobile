import { Ionicons } from '@expo/vector-icons'
import { useCallback, useEffect, useState } from 'react'
import { StyleSheet, Text, View } from 'react-native'

import { Button } from '@/components/ui'
import { biometric } from '@/lib/biometric'
import { authService } from '@/services/authService'
import { useAuthStore } from '@/store/authStore'
import { colors, fontSizes, spacing } from '@/theme'

/**
 * Shown on launch when a persisted session exists and the user enabled
 * biometric unlock. A successful Face ID / Touch ID match reveals the app;
 * "Sign out" clears the session and returns to the login flow.
 */
export function LockScreen() {
  const unlock = useAuthStore((s) => s.unlock)
  const [error, setError] = useState<string | null>(null)

  const tryUnlock = useCallback(async () => {
    setError(null)
    const ok = await biometric.authenticate('Unlock EventPulse')
    if (ok) {
      unlock()
    } else {
      setError('Authentication failed. Try again.')
    }
  }, [unlock])

  useEffect(() => {
    // Prompt automatically on mount.
    void tryUnlock()
  }, [tryUnlock])

  return (
    <View style={styles.container}>
      <Ionicons name="lock-closed" size={64} color={colors.primary} />
      <Text style={styles.title}>EventPulse is locked</Text>
      {error ? <Text style={styles.error}>{error}</Text> : null}
      <View style={styles.actions}>
        <Button title="Unlock" onPress={tryUnlock} />
        <Button
          title="Sign out"
          variant="ghost"
          onPress={() => authService.logout()}
        />
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.lg,
    padding: spacing.xl,
  },
  title: { fontSize: fontSizes.xl, fontWeight: '700', color: colors.text },
  error: { fontSize: fontSizes.sm, color: colors.danger },
  actions: { alignSelf: 'stretch', gap: spacing.sm },
})
