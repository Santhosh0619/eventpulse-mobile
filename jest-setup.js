/* eslint-env jest */

// expo-secure-store: back it with an in-memory map for tests.
jest.mock('expo-secure-store', () => {
  const store = new Map()
  return {
    setItemAsync: jest.fn((k, v) => {
      store.set(k, v)
      return Promise.resolve()
    }),
    getItemAsync: jest.fn((k) => Promise.resolve(store.get(k) ?? null)),
    deleteItemAsync: jest.fn((k) => {
      store.delete(k)
      return Promise.resolve()
    }),
  }
})

jest.mock('expo-haptics', () => ({
  notificationAsync: jest.fn(),
  impactAsync: jest.fn(),
  selectionAsync: jest.fn(),
  NotificationFeedbackType: {
    Success: 'success',
    Warning: 'warning',
    Error: 'error',
  },
  ImpactFeedbackStyle: { Light: 'light', Medium: 'medium', Heavy: 'heavy' },
}))

jest.mock('expo-local-authentication', () => ({
  hasHardwareAsync: jest.fn(() => Promise.resolve(false)),
  isEnrolledAsync: jest.fn(() => Promise.resolve(false)),
  authenticateAsync: jest.fn(() => Promise.resolve({ success: true })),
}))

// Mock @stripe/stripe-react-native: native payment module isn't available in jest.
// `useStripe` must return a STABLE object (created once in the factory closure) —
// components put its functions in useCallback/useEffect deps, and fresh refs each
// render would cause an infinite effect loop.
jest.mock('@stripe/stripe-react-native', () => {
  const sheet = {
    initPaymentSheet: jest.fn(() => Promise.resolve({})),
    presentPaymentSheet: jest.fn(() => Promise.resolve({})),
  }
  return {
    StripeProvider: ({ children }) => children,
    useStripe: () => sheet,
    PaymentSheetError: { Canceled: 'Canceled', Failed: 'Failed' },
  }
})

// Mock react-native-maps: jest may resolve the .native module, which pulls in
// the native map component. Render simple Views so map screens don't crash.
jest.mock('react-native-maps', () => {
  const React = require('react')
  const { View } = require('react-native')
  const Mock = (props) => React.createElement(View, props, props.children)
  return { __esModule: true, default: Mock, Marker: Mock }
})

// Mock @expo/vector-icons: the real icons try to load native fonts, which
// throws in the jest environment. Render nothing for any icon family.
jest.mock('@expo/vector-icons', () => {
  const Icon = () => null
  return new Proxy(
    {},
    {
      get: () => Icon,
    },
  )
})

// Lightweight safe-area-context mock: render children, zero insets.
jest.mock('react-native-safe-area-context', () => {
  const React = require('react')
  const { View } = require('react-native')
  const insets = { top: 0, right: 0, bottom: 0, left: 0 }
  const frame = { x: 0, y: 0, width: 390, height: 844 }
  const passthrough = ({ children, ...props }) =>
    React.createElement(View, props, children)
  return {
    SafeAreaProvider: passthrough,
    SafeAreaView: passthrough,
    SafeAreaInsetsContext: React.createContext(insets),
    useSafeAreaInsets: () => insets,
    useSafeAreaFrame: () => frame,
    initialWindowMetrics: { insets, frame },
  }
})
