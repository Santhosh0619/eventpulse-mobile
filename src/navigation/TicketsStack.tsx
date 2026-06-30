import { createStackNavigator } from '@react-navigation/stack'

import { PaymentScreen } from '@/screens/checkout/PaymentScreen'
import { OrderDetailScreen } from '@/screens/tickets/OrderDetailScreen'
import { MyTicketsScreen } from '@/screens/tickets/MyTicketsScreen'
import { QRFullScreen } from '@/screens/tickets/QRFullScreen'
import { colors } from '@/theme'

import type { TicketsStackParamList } from './types'

const Stack = createStackNavigator<TicketsStackParamList>()

export function TicketsStack() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerTintColor: colors.primary,
        headerTitleStyle: { color: colors.text },
      }}
    >
      <Stack.Screen
        name="TicketsMain"
        component={MyTicketsScreen}
        options={{ title: 'My Tickets' }}
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
    </Stack.Navigator>
  )
}
