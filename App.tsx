import { StripeProvider } from '@stripe/stripe-react-native'
import { StatusBar } from 'expo-status-bar'
import { GestureHandlerRootView } from 'react-native-gesture-handler'
import { SafeAreaProvider } from 'react-native-safe-area-context'

import { env } from '@/lib/env'
import { RootNavigator } from '@/navigation/RootNavigator'

export default function App() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <StripeProvider
        publishableKey={env.stripePublishableKey}
        merchantIdentifier="merchant.com.eventpulse"
      >
        <SafeAreaProvider>
          <StatusBar style="auto" />
          <RootNavigator />
        </SafeAreaProvider>
      </StripeProvider>
    </GestureHandlerRootView>
  )
}
