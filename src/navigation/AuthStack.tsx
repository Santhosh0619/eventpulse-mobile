import { createStackNavigator } from '@react-navigation/stack'

import { LoginScreen } from '@/screens/auth/LoginScreen'

import type { AuthStackParamList } from './types'

const Stack = createStackNavigator<AuthStackParamList>()

export function AuthStack() {
  return (
    <Stack.Navigator
      initialRouteName="Login"
      screenOptions={{ headerShown: false }}
    >
      <Stack.Screen name="Login" component={LoginScreen} />
    </Stack.Navigator>
  )
}
