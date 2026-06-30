import { createStackNavigator } from '@react-navigation/stack'

import { EditProfileScreen } from '@/screens/profile/EditProfileScreen'
import { ProfileScreen } from '@/screens/profile/ProfileScreen'
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
    </Stack.Navigator>
  )
}
