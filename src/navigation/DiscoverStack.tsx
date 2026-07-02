import { Ionicons } from '@expo/vector-icons'
import { createStackNavigator } from '@react-navigation/stack'
import { Pressable } from 'react-native'

import { ConfirmationScreen } from '@/screens/checkout/ConfirmationScreen'
import { OrderSummaryScreen } from '@/screens/checkout/OrderSummaryScreen'
import { PaymentScreen } from '@/screens/checkout/PaymentScreen'
import { DiscoverScreen } from '@/screens/discover/DiscoverScreen'
import { MapDiscoverScreen } from '@/screens/discover/MapDiscoverScreen'
import { EventChatScreen } from '@/screens/events/EventChatScreen'
import { EventDetailScreen } from '@/screens/events/EventDetailScreen'
import { ReviewFormScreen } from '@/screens/events/ReviewFormScreen'
import { ReviewsScreen } from '@/screens/events/ReviewsScreen'
import { OrderDetailScreen } from '@/screens/tickets/OrderDetailScreen'
import { QRFullScreen } from '@/screens/tickets/QRFullScreen'
import { colors, spacing } from '@/theme'

import type { DiscoverStackParamList } from './types'

const Stack = createStackNavigator<DiscoverStackParamList>()

export function DiscoverStack() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerTintColor: colors.primary,
        headerTitleStyle: { color: colors.text },
      }}
    >
      <Stack.Screen
        name="DiscoverMain"
        component={DiscoverScreen}
        options={({ navigation }) => ({
          title: 'Discover',
          headerRight: () => (
            <Pressable
              onPress={() => navigation.navigate('MapDiscover')}
              hitSlop={8}
              style={{ marginRight: spacing.lg }}
            >
              <Ionicons name="map-outline" size={22} color={colors.primary} />
            </Pressable>
          ),
        })}
      />
      <Stack.Screen
        name="MapDiscover"
        component={MapDiscoverScreen}
        options={{ title: 'Map' }}
      />
      <Stack.Screen
        name="EventDetail"
        component={EventDetailScreen}
        options={({ route }) => ({ title: route.params.title ?? 'Event' })}
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
        name="EventChat"
        component={EventChatScreen}
        options={{ title: 'Ask AI' }}
      />
    </Stack.Navigator>
  )
}
