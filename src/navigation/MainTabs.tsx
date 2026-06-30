import { Ionicons } from '@expo/vector-icons'
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs'

import { DiscoverScreen } from '@/screens/discover/DiscoverScreen'
import { HomeScreen } from '@/screens/home/HomeScreen'
import { MyTicketsScreen } from '@/screens/tickets/MyTicketsScreen'
import { colors } from '@/theme'

import { ProfileStack } from './ProfileStack'

import type { MainTabsParamList } from './types'

const Tab = createBottomTabNavigator<MainTabsParamList>()

const ICONS: Record<keyof MainTabsParamList, keyof typeof Ionicons.glyphMap> = {
  Home: 'home',
  Discover: 'search',
  Tickets: 'ticket',
  Profile: 'person',
}

/** Defined outside the navigator so it isn't re-created on every render. */
function makeTabBarIcon(routeName: keyof MainTabsParamList) {
  return ({ color, size }: { color: string; size: number }) => (
    <Ionicons name={ICONS[routeName]} color={color} size={size} />
  )
}

export function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: true,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textMuted,
        tabBarIcon: makeTabBarIcon(route.name),
      })}
    >
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen
        name="Discover"
        component={DiscoverScreen}
        options={{ title: 'Discover' }}
      />
      <Tab.Screen
        name="Tickets"
        component={MyTicketsScreen}
        options={{ title: 'My Tickets' }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileStack}
        options={{ headerShown: false }}
      />
    </Tab.Navigator>
  )
}
