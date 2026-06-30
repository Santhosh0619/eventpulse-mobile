import { createNavigationContainerRef } from '@react-navigation/native'

import type { RootStackParamList } from './types'

/** Container ref so non-component code can navigate (e.g. deep-link replay). */
export const navigationRef = createNavigationContainerRef<RootStackParamList>()

/** Navigate to the invitation-accept screen inside the Profile tab stack. */
export function navigateToAcceptInvitation(token: string) {
  if (!navigationRef.isReady()) return
  navigationRef.navigate('Main', {
    screen: 'Profile',
    params: { screen: 'AcceptInvitation', params: { token } },
  })
}
