import type { RouteProp } from '@react-navigation/native'
import { useNavigation, useRoute } from '@react-navigation/native'
import type { StackNavigationProp } from '@react-navigation/stack'
import { Ionicons } from '@expo/vector-icons'
import { StyleSheet, Text, View } from 'react-native'

import { Button, Screen, Spinner } from '@/components/ui'
import { useAsync } from '@/hooks/useAsync'
import { orgService } from '@/services/orgService'
import type { ProfileStackParamList } from '@/navigation/types'
import { colors, fontSizes, spacing } from '@/theme'

/**
 * Target of the `eventpulse://invitations/:token/accept` deep link. Accepts the
 * invitation on mount and routes the user into their organizations.
 */
export function AcceptInvitationScreen() {
  const route = useRoute<RouteProp<ProfileStackParamList, 'AcceptInvitation'>>()
  const navigation =
    useNavigation<
      StackNavigationProp<ProfileStackParamList, 'AcceptInvitation'>
    >()
  const { token } = route.params

  const { data, loading, error, reload } = useAsync(
    () => orgService.acceptInvitation(token),
    [token],
  )

  if (loading) {
    return <Spinner fullscreen label="Accepting invitation…" />
  }

  return (
    <Screen>
      <View style={styles.center}>
        {error ? (
          <>
            <Ionicons name="close-circle" size={64} color={colors.danger} />
            <Text style={styles.title}>Invitation invalid</Text>
            <Text style={styles.body}>
              {error.message ?? 'This invitation could not be accepted.'}
            </Text>
            <View style={styles.actions}>
              <Button title="Try again" variant="outline" onPress={reload} />
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
              name="checkmark-circle"
              size={64}
              color={colors.success}
            />
            <Text style={styles.title}>You&apos;re in!</Text>
            <Text style={styles.body}>
              You joined as {data?.role ?? 'a member'}.
            </Text>
            <View style={styles.actions}>
              <Button
                title="View my organizations"
                onPress={() => navigation.navigate('Organizations')}
              />
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
