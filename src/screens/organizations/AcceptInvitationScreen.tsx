import { Ionicons } from '@expo/vector-icons'
import type { RouteProp } from '@react-navigation/native'
import { useNavigation, useRoute } from '@react-navigation/native'
import type { StackNavigationProp } from '@react-navigation/stack'
import { useCallback, useRef, useState } from 'react'
import { StyleSheet, Text, View } from 'react-native'

import { Button, Screen, Spinner } from '@/components/ui'
import type { ApiError } from '@/services/api'
import { orgService } from '@/services/orgService'
import type { Member } from '@/types/organization'
import type { ProfileStackParamList } from '@/navigation/types'
import { colors, fontSizes, spacing } from '@/theme'

type Status = 'idle' | 'submitting' | 'success' | 'error'

/**
 * Target of the `eventpulse://invitations/:token/accept` deep link. Accepting is
 * a deliberate user action (a tap), not an on-mount side effect — a mutation
 * must not fire automatically on render/remount. A ref guards against
 * double-submission from rapid taps.
 */
export function AcceptInvitationScreen() {
  const route = useRoute<RouteProp<ProfileStackParamList, 'AcceptInvitation'>>()
  const navigation =
    useNavigation<
      StackNavigationProp<ProfileStackParamList, 'AcceptInvitation'>
    >()
  const { token } = route.params

  const [status, setStatus] = useState<Status>('idle')
  const [member, setMember] = useState<Member | null>(null)
  const [error, setError] = useState<string | null>(null)
  const inFlight = useRef(false)

  const accept = useCallback(async () => {
    if (inFlight.current) return
    inFlight.current = true
    setStatus('submitting')
    setError(null)
    try {
      const result = await orgService.acceptInvitation(token)
      setMember(result)
      setStatus('success')
    } catch (e) {
      setError(
        (e as ApiError).message ?? 'This invitation could not be accepted.',
      )
      setStatus('error')
    } finally {
      inFlight.current = false
    }
  }, [token])

  if (status === 'submitting') {
    return <Spinner fullscreen label="Accepting invitation…" />
  }

  return (
    <Screen>
      <View style={styles.center}>
        {status === 'success' ? (
          <>
            <Ionicons
              name="checkmark-circle"
              size={64}
              color={colors.success}
            />
            <Text style={styles.title}>You&apos;re in!</Text>
            <Text style={styles.body}>
              You joined as {member?.role ?? 'a member'}.
            </Text>
            <View style={styles.actions}>
              <Button
                title="View my organizations"
                onPress={() => navigation.navigate('Organizations')}
              />
            </View>
          </>
        ) : status === 'error' ? (
          <>
            <Ionicons name="close-circle" size={64} color={colors.danger} />
            <Text style={styles.title}>Invitation problem</Text>
            <Text style={styles.body}>{error}</Text>
            <View style={styles.actions}>
              <Button title="Try again" variant="outline" onPress={accept} />
              <Button
                title="Back"
                variant="ghost"
                onPress={() => navigation.navigate('Organizations')}
              />
            </View>
          </>
        ) : (
          <>
            <Ionicons
              name="mail-open-outline"
              size={64}
              color={colors.primary}
            />
            <Text style={styles.title}>You&apos;re invited</Text>
            <Text style={styles.body}>
              Accept this invitation to join the organization.
            </Text>
            <View style={styles.actions}>
              <Button title="Accept invitation" onPress={accept} />
            </View>
          </>
        )}
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
  title: { fontSize: fontSizes.xl, fontWeight: '700', color: colors.text },
  body: {
    fontSize: fontSizes.md,
    color: colors.textMuted,
    textAlign: 'center',
  },
  actions: { alignSelf: 'stretch', gap: spacing.sm, marginTop: spacing.lg },
})
