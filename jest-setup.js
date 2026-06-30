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
