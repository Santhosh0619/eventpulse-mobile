import { createStackNavigator } from '@react-navigation/stack'

import { AcceptInvitationScreen } from '@/screens/organizations/AcceptInvitationScreen'
import { OrgDetailScreen } from '@/screens/organizations/OrgDetailScreen'
import { OrgListScreen } from '@/screens/organizations/OrgListScreen'
import { EditProfileScreen } from '@/screens/profile/EditProfileScreen'
import { PreferencesScreen } from '@/screens/profile/PreferencesScreen'
import { ProfileScreen } from '@/screens/profile/ProfileScreen'
import { CheckInDashboardScreen } from '@/screens/staff/CheckInDashboardScreen'
import { QRScannerScreen } from '@/screens/staff/QRScannerScreen'
import { colors } from '@/theme'

import type { ProfileStackParamList } from './types'

const Stack = createStackNavigator<ProfileStackParamList>()

export function ProfileStack() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerTintColor: colors.primary,
        headerTitleStyle: { color: colors.text },
      }}
    >
      <Stack.Screen
        name="ProfileHome"
        component={ProfileScreen}
        options={{ title: 'Profile' }}
      />
      <Stack.Screen
        name="EditProfile"
        component={EditProfileScreen}
        options={{ title: 'Edit Profile' }}
      />
      <Stack.Screen
        name="Preferences"
        component={PreferencesScreen}
        options={{ title: 'Preferences' }}
      />
      <Stack.Screen
        name="Organizations"
        component={OrgListScreen}
        options={{ title: 'My Organizations' }}
      />
      <Stack.Screen
        name="OrgDetail"
        component={OrgDetailScreen}
        options={({ route }) => ({
          title: route.params.name ?? 'Organization',
        })}
      />
      <Stack.Screen
        name="AcceptInvitation"
        component={AcceptInvitationScreen}
        options={{ title: 'Invitation' }}
      />
      <Stack.Screen
        name="QRScanner"
        component={QRScannerScreen}
        options={{ title: 'Scan Tickets' }}
      />
      <Stack.Screen
        name="CheckInDashboard"
        component={CheckInDashboardScreen}
        options={({ route }) => ({
          title: route.params.eventTitle ?? 'Check-in',
        })}
      />
    </Stack.Navigator>
  )
}
