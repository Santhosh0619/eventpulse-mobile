import { createStackNavigator } from '@react-navigation/stack'

import { CategoryEventsScreen } from '@/screens/events/CategoryEventsScreen'
import { EventDetailScreen } from '@/screens/events/EventDetailScreen'
import { HomeScreen } from '@/screens/home/HomeScreen'
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
    </Stack.Navigator>
  )
}
