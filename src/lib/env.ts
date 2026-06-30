import Constants from 'expo-constants'

/**
 * Runtime configuration. Expo inlines `EXPO_PUBLIC_*` env vars at build time;
 * we also read from `expoConfig.extra` as a fallback and default the API URL to
 * localhost for local development.
 */
const extra = (Constants.expoConfig?.extra ?? {}) as Record<string, string>

export const env = {
  apiBaseUrl:
    process.env.EXPO_PUBLIC_API_BASE_URL ??
    extra.apiBaseUrl ??
    'http://localhost:8000',
  stripePublishableKey:
    process.env.EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY ??
    extra.stripePublishableKey ??
    '',
  googleMapsApiKey:
    process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY ?? extra.googleMapsApiKey ?? '',
}
