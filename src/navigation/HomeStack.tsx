import { createStackNavigator } from '@react-navigation/stack'

import { ConfirmationScreen } from '@/screens/checkout/ConfirmationScreen'
import { OrderSummaryScreen } from '@/screens/checkout/OrderSummaryScreen'
import { CategoryEventsScreen } from '@/screens/events/CategoryEventsScreen'
import { EventDetailScreen } from '@/screens/events/EventDetailScreen'
import { HomeScreen } from '@/screens/home/HomeScreen'
import { OrderDetailScreen } from '@/screens/tickets/OrderDetailScreen'
import { colors } from '@/theme'

import type { HomeStackParamList } from './types'

const Stack = createStackNavigator<HomeStackParamList>()

export function HomeStack() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerTintColor: colors.primary,
        headerTitleStyle: { color: colors.text },
      }}
    >
      <Stack.Screen
        name="HomeMain"
        component={HomeScreen}
        options={{ title: 'EventPulse' }}
      />
      <Stack.Screen
        name="EventDetail"
        component={EventDetailScreen}
        options={({ route }) => ({ title: route.params.title ?? 'Event' })}
      />
      <Stack.Screen
        name="CategoryEvents"
        component={CategoryEventsScreen}
        options={({ route }) => ({ title: route.params.name })}
      />
      <Stack.Screen
        name="OrderSummary"
        component={OrderSummaryScreen}
        options={{ title: 'Order Summary' }}
      />
      <Stack.Screen
        name="Confirmation"
        component={ConfirmationScreen}
        options={{
          title: 'Confirmation',
          headerLeft: () => null,
          gestureEnabled: false,
        }}
      />
      <Stack.Screen
        name="OrderDetail"
        component={OrderDetailScreen}
        options={{ title: 'Order' }}
      />
    </Stack.Navigator>
  )
}
