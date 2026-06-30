import { NavigationContainer } from '@react-navigation/native'
import { createStackNavigator } from '@react-navigation/stack'
import * as Linking from 'expo-linking'
import { useCallback, useEffect, useRef } from 'react'

import { Spinner } from '@/components/ui'
import { LockScreen } from '@/screens/auth/LockScreen'
import { useAuthStore } from '@/store/authStore'

import { AuthStack } from './AuthStack'
import {
  consumePendingInviteToken,
  parseInviteToken,
  setPendingInviteToken,
} from './deepLink'
import { linking } from './linking'
import { MainTabs } from './MainTabs'
import { navigateToAcceptInvitation, navigationRef } from './navigationRef'
import type { RootStackParamList } from './types'

const Stack = createStackNavigator<RootStackParamList>()

/**
 * Top-level navigator. Hydrates the persisted session on mount, shows a spinner
 * while reading the keychain, then routes to the auth flow or the main tabs.
 * Also captures invitation deep links that arrive while logged out and replays
 * them once the user signs in (the AcceptInvitation screen lives under Main).
 */
export function RootNavigator() {
  const isHydrating = useAuthStore((s) => s.isHydrating)
  const accessToken = useAuthStore((s) => s.accessToken)
  const locked = useAuthStore((s) => s.locked)
  const hydrate = useAuthStore((s) => s.hydrate)

  const isAuthed = Boolean(accessToken) && !locked
  // Read current auth status inside the (mount-only) URL listener.
  const authedRef = useRef(isAuthed)
  authedRef.current = isAuthed

  useEffect(() => {
    void hydrate()
  }, [hydrate])

  // Capture invitation links. When authed, React Navigation's linking routes to
  // the screen directly; when not, stash the token for post-login replay.
  useEffect(() => {
    const handle = (url: string | null) => {
      const token = parseInviteToken(url)
      if (token && !authedRef.current) setPendingInviteToken(token)
    }
    void Linking.getInitialURL().then(handle)
    const sub = Linking.addEventListener('url', ({ url }) => handle(url))
    return () => sub.remove()
  }, [])

  // Replay a pending invite once the user is authenticated and the nav is ready.
  useEffect(() => {
    if (isAuthed && navigationRef.isReady()) {
      const token = consumePendingInviteToken()
      if (token) navigateToAcceptInvitation(token)
    }
  }, [isAuthed])

  const onReady = useCallback(() => {
    if (authedRef.current) {
      const token = consumePendingInviteToken()
      if (token) navigateToAcceptInvitation(token)
    }
  }, [])

  if (isHydrating) {
    return <Spinner fullscreen label="Loading…" />
  }

  // A persisted session gated behind biometric unlock: show the lock screen
  // until the user authenticates (outside NavigationContainer — it's a gate).
  if (accessToken && locked) {
    return <LockScreen />
  }

  return (
    <NavigationContainer
      ref={navigationRef}
      linking={linking}
      onReady={onReady}
    >
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {accessToken ? (
          <Stack.Screen name="Main" component={MainTabs} />
        ) : (
          <Stack.Screen name="Auth" component={AuthStack} />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  )
}
