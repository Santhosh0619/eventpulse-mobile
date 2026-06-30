import type { NavigatorScreenParams } from '@react-navigation/native'

/** Auth flow — shown when there is no valid session. */
export type AuthStackParamList = {
  Login: undefined
  Register: undefined
  ForgotPassword: undefined
}

/** Profile tab stack. */
export type ProfileStackParamList = {
  ProfileHome: undefined
  EditProfile: undefined
}

/** Bottom tabs — the signed-in app shell. */
export type MainTabsParamList = {
  Home: undefined
  Discover: undefined
  Tickets: undefined
  Profile: NavigatorScreenParams<ProfileStackParamList> | undefined
}

/**
 * Root stack. Hosts either the auth flow or the main tabs, plus modal/detail
 * screens pushed over the tabs (event detail, checkout, etc. — added in later
 * phases).
 */
export type RootStackParamList = {
  Auth: NavigatorScreenParams<AuthStackParamList>
  Main: NavigatorScreenParams<MainTabsParamList>
}

declare global {
  namespace ReactNavigation {
    interface RootParamList extends RootStackParamList {}
  }
}
