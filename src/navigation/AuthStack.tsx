import { createStackNavigator } from '@react-navigation/stack'

import { ForgotPasswordScreen } from '@/screens/auth/ForgotPasswordScreen'
import { LoginScreen } from '@/screens/auth/LoginScreen'
import { RegisterScreen } from '@/screens/auth/RegisterScreen'
import { colors } from '@/theme'

import type { AuthStackParamList } from './types'

const Stack = createStackNavigator<AuthStackParamList>()

export function AuthStack() {
  return (
    <Stack.Navigator
      initialRouteName="Login"
      screenOptions={{
        headerShown: false,
        headerTintColor: colors.primary,
      }}
    >
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen
        name="Register"
        component={RegisterScreen}
        options={{ headerShown: true, title: '', headerBackTitle: 'Back' }}
      />
      <Stack.Screen
        name="ForgotPassword"
        component={ForgotPasswordScreen}
        options={{ headerShown: true, title: '', headerBackTitle: 'Back' }}
      />
    </Stack.Navigator>
  )
}
