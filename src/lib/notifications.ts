import * as Notifications from 'expo-notifications'
import { Platform } from 'react-native'

import { userService } from '@/services/userService'

/**
 * Foreground behaviour: show an alert + bump the app badge. Set once at module
 * load so notifications arriving while the app is open are still surfaced.
 */
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: false,
    shouldSetBadge: true,
  }),
})

/**
 * Request notification permission and register this device's push token with
 * the backend (stored as the user's fcm_token). Best-effort: returns false on
 * a simulator, denied permission, or any error — never throws to the caller.
 *
 * We use the native DEVICE push token (FCM on Android / APNs on iOS) rather than
 * an Expo push token, since the backend delivers via Firebase and no EAS
 * projectId is configured.
 */
export async function registerForPush(): Promise<boolean> {
  try {
    const settings = await Notifications.getPermissionsAsync()
    let granted = settings.granted
    if (!granted) {
      const req = await Notifications.requestPermissionsAsync()
      granted = req.granted
    }
    if (!granted) return false

    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync('default', {
        name: 'Default',
        importance: Notifications.AndroidImportance.DEFAULT,
      })
    }

    const token = await Notifications.getDevicePushTokenAsync()
    if (token?.data) {
      await userService.updateFcmToken(String(token.data))
      return true
    }
    return false
  } catch {
    return false
  }
}
