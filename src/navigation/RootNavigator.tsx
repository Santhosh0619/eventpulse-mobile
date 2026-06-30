import { NavigationContainer } from '@react-navigation/native'
import { createStackNavigator } from '@react-navigation/stack'
import { useEffect } from 'react'

import { Spinner } from '@/components/ui'
import { useAuthStore } from '@/store/authStore'

import { AuthStack } from './AuthStack'
import { linking } from './linking'
import { MainTabs } from './MainTabs'
import type { RootStackParamList } from './types'

const Stack = createStackNavigator<RootStackParamList>()

/**
 * Top-level navigator. Hydrates the persisted session on mount, shows a spinner
 * while reading the keychain, then routes to the auth flow or the main tabs
 * based on whether a token is present.
 */
export function RootNavigator() {
  const isHydrating = useAuthStore((s) => s.isHydrating)
  const accessToken = useAuthStore((s) => s.accessToken)
  const hydrate = useAuthStore((s) => s.hydrate)

  useEffect(() => {
    void hydrate()
  }, [hydrate])

  if (isHydrating) {
    return <Spinner fullscreen label="Loading…" />
  }

  return (
    <NavigationContainer linking={linking}>
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
