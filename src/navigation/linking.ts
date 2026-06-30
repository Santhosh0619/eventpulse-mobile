import * as Linking from 'expo-linking'
import type { LinkingOptions } from '@react-navigation/native'

import type { RootStackParamList } from './types'

/**
 * Deep link configuration. The `eventpulse://` scheme (and https universal
 * links once configured) map to screens here. Notification taps and email
 * links resolve through this config — extended as detail/checkout screens are
 * added in later phases.
 */
export const linking: LinkingOptions<RootStackParamList> = {
  prefixes: [Linking.createURL('/'), 'eventpulse://', 'https://eventpulse.app'],
  config: {
    screens: {
      Auth: {
        screens: {
          Login: 'login',
          Register: 'register',
          ForgotPassword: 'forgot-password',
        },
      },
      Main: {
        screens: {
          Home: 'home',
          Discover: 'discover',
          Tickets: 'tickets',
          Profile: {
            screens: {
              ProfileHome: 'profile',
              Organizations: 'organizations',
              OrgDetail: 'organizations/:orgId',
              // Invitation emails deep-link here: eventpulse://invitations/:token/accept
              AcceptInvitation: 'invitations/:token/accept',
            },
          },
        },
      },
    },
  },
}
