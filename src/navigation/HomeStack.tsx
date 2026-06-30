import { createStackNavigator } from '@react-navigation/stack'

import { NotificationBell } from '@/components/NotificationBell'
import { ConfirmationScreen } from '@/screens/checkout/ConfirmationScreen'
import { OrderSummaryScreen } from '@/screens/checkout/OrderSummaryScreen'
import { PaymentScreen } from '@/screens/checkout/PaymentScreen'
import { CategoryEventsScreen } from '@/screens/events/CategoryEventsScreen'
import { EventDetailScreen } from '@/screens/events/EventDetailScreen'
import { ReviewFormScreen } from '@/screens/events/ReviewFormScreen'
import { ReviewsScreen } from '@/screens/events/ReviewsScreen'
import { HomeScreen } from '@/screens/home/HomeScreen'
import { NotificationCenterScreen } from '@/screens/notifications/NotificationCenterScreen'
import { OrderDetailScreen } from '@/screens/tickets/OrderDetailScreen'
import { QRFullScreen } from '@/screens/tickets/QRFullScreen'
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
        options={({ navigation }) => ({
          title: 'EventPulse',
          headerRight: () => (
            <NotificationBell
              onPress={() => navigation.navigate('NotificationCenter')}
            />
          ),
        })}
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
      <Stack.Screen
        name="Payment"
        component={PaymentScreen}
        options={{ title: 'Payment' }}
      />
      <Stack.Screen
        name="QRFull"
        component={QRFullScreen}
        options={{ title: 'Ticket' }}
      />
      <Stack.Screen
        name="Reviews"
        component={ReviewsScreen}
        options={{ title: 'Reviews' }}
      />
      <Stack.Screen
        name="ReviewForm"
        component={ReviewFormScreen}
        options={{ title: 'Write a Review' }}
      />
      <Stack.Screen
        name="NotificationCenter"
        component={NotificationCenterScreen}
        options={{ title: 'Notifications' }}
      />
    </Stack.Navigator>
  )
}
