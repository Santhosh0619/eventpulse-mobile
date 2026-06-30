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

/** Params for the EventDetail screen, shared by every stack that hosts it. */
export type EventDetailParams = { eventId: string; title?: string }

/**
 * Checkout + order screens. Registered in every stack that can start a purchase
 * (Home, Discover) so the flow stays within one stack without cross-tab jumps.
 */
export type CheckoutScreens = {
  OrderSummary: {
    eventId: string
    eventTitle: string
    selections: import('@/types/order').TicketSelection[]
  }
  Confirmation: { orderId: string }
  OrderDetail: { orderId: string; justPaid?: boolean }
  Payment: { orderId: string }
}

/** Home tab stack. */
export type HomeStackParamList = CheckoutScreens & {
  HomeMain: undefined
  EventDetail: EventDetailParams
  CategoryEvents: { categoryId: string; name: string }
}

/** Discover tab stack. */
export type DiscoverStackParamList = CheckoutScreens & {
  DiscoverMain: undefined
  MapDiscover: undefined
  EventDetail: EventDetailParams
}

/** Tickets tab stack. */
export type TicketsStackParamList = {
  TicketsMain: undefined
  OrderDetail: { orderId: string; justPaid?: boolean }
  Payment: { orderId: string }
}

/** Bottom tabs — the signed-in app shell. */
export type MainTabsParamList = {
  Home: NavigatorScreenParams<HomeStackParamList> | undefined
  Discover: NavigatorScreenParams<DiscoverStackParamList> | undefined
  Tickets: NavigatorScreenParams<TicketsStackParamList> | undefined
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
