import { Ionicons } from '@expo/vector-icons'
import { createStackNavigator } from '@react-navigation/stack'
import { Pressable } from 'react-native'

import { DiscoverScreen } from '@/screens/discover/DiscoverScreen'
import { MapDiscoverScreen } from '@/screens/discover/MapDiscoverScreen'
import { EventDetailScreen } from '@/screens/events/EventDetailScreen'
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
    </Stack.Navigator>
  )
}
