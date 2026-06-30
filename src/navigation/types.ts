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
  Organizations: undefined
  OrgDetail: { orgId: string; name?: string }
  AcceptInvitation: { token: string }
}

/** Home tab stack. */
export type HomeStackParamList = {
  HomeMain: undefined
  EventDetail: { eventId: string; title?: string }
  CategoryEvents: { categoryId: string; name: string }
}

/** Discover tab stack. */
export type DiscoverStackParamList = {
  DiscoverMain: undefined
  MapDiscover: undefined
  EventDetail: { eventId: string; title?: string }
}

/** Bottom tabs — the signed-in app shell. */
export type MainTabsParamList = {
  Home: NavigatorScreenParams<HomeStackParamList> | undefined
  Discover: NavigatorScreenParams<DiscoverStackParamList> | undefined
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
