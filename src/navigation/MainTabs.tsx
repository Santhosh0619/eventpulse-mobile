import { Ionicons } from '@expo/vector-icons'
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs'

import { colors } from '@/theme'

import { DiscoverStack } from './DiscoverStack'
import { HomeStack } from './HomeStack'
import { ProfileStack } from './ProfileStack'
import { TicketsStack } from './TicketsStack'

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
      <Tab.Screen
        name="Home"
        component={HomeStack}
        options={{ headerShown: false }}
      />
      <Tab.Screen
        name="Discover"
        component={DiscoverStack}
        options={{ headerShown: false, title: 'Discover' }}
      />
      <Tab.Screen
        name="Tickets"
        component={TicketsStack}
        options={{ headerShown: false, title: 'My Tickets' }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileStack}
        options={{ headerShown: false }}
      />
    </Tab.Navigator>
  )
}
