import { Ionicons } from '@expo/vector-icons'
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs'
import * as Notifications from 'expo-notifications'
import { useEffect } from 'react'

import { registerForPush } from '@/lib/notifications'
import { notificationService } from '@/services/notificationService'
import { useNotificationStore } from '@/store/notificationStore'
import { colors } from '@/theme'

import { DiscoverStack } from './DiscoverStack'
import { HomeStack } from './HomeStack'
import { navigationRef } from './navigationRef'
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
  const setUnreadCount = useNotificationStore((s) => s.setUnreadCount)

  useEffect(() => {
    // Register for push and seed the unread badge once the tabs mount (authed).
    void registerForPush()
    const loadCount = () =>
      notificationService
        .unreadCount()
        .then(setUnreadCount)
        .catch(() => {})
    void loadCount()

    // A push arriving in the foreground bumps the badge.
    const received = Notifications.addNotificationReceivedListener(loadCount)
    // Tapping a push deep-links to the relevant screen using the notification's
    // data payload, falling back to the notification center.
    const responded = Notifications.addNotificationResponseReceivedListener(
      (response) => {
        if (!navigationRef.isReady()) return
        const data = (response.notification.request.content.data ??
          {}) as Record<string, unknown>
        const eventId =
          typeof data.event_id === 'string' ? data.event_id : undefined
        const orderId =
          typeof data.order_id === 'string' ? data.order_id : undefined
        if (eventId) {
          navigationRef.navigate('Main', {
            screen: 'Home',
            params: { screen: 'EventDetail', params: { eventId } },
          })
        } else if (orderId) {
          navigationRef.navigate('Main', {
            screen: 'Tickets',
            params: { screen: 'OrderDetail', params: { orderId } },
          })
        } else {
          navigationRef.navigate('Main', {
            screen: 'Home',
            params: { screen: 'NotificationCenter' },
          })
        }
      },
    )
    return () => {
      received.remove()
      responded.remove()
    }
  }, [setUnreadCount])

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
