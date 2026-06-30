import * as LocalAuthentication from 'expo-local-authentication'

/**
 * Biometric (Face ID / Touch ID / fingerprint) helpers built on
 * expo-local-authentication. Used to offer a quick-unlock on the login screen
 * for returning users whose session tokens are already in the keychain — we
 * never store the password itself.
 */
export const biometric = {
  /** True when the device has biometric hardware AND the user has enrolled. */
  async isAvailable(): Promise<boolean> {
    const [hasHardware, isEnrolled] = await Promise.all([
      LocalAuthentication.hasHardwareAsync(),
      LocalAuthentication.isEnrolledAsync(),
    ])
    return hasHardware && isEnrolled
  },

  /** Prompt for biometric auth. Resolves true only on a successful match. */
  async authenticate(promptMessage = 'Unlock EventPulse'): Promise<boolean> {
    const result = await LocalAuthentication.authenticateAsync({
      promptMessage,
      disableDeviceFallback: false,
    })
    return result.success
  },
}
