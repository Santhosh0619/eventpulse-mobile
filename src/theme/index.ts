/**
 * Design tokens for the EventPulse mobile app. Mirrors the web app's palette
 * (violet primary) so the two clients feel like one product. Components import
 * from here instead of hard-coding colors/spacing.
 */

export const colors = {
  primary: '#6D28D9',
  primaryDark: '#5B21B6',
  primaryLight: '#EDE9FE',
  background: '#FFFFFF',
  surface: '#F9FAFB',
  surfaceAlt: '#F3F4F6',
  border: '#E5E7EB',
  text: '#111827',
  textMuted: '#6B7280',
  textInverse: '#FFFFFF',
  /** True black — used for full-bleed camera backdrops. */
  black: '#000000',
  success: '#059669',
  successLight: '#D1FAE5',
  warning: '#D97706',
  warningLight: '#FEF3C7',
  danger: '#DC2626',
  dangerLight: '#FEE2E2',
  info: '#2563EB',
  infoLight: '#DBEAFE',
} as const

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32,
} as const

export const radii = {
  sm: 6,
  md: 10,
  lg: 16,
  xl: 24,
  full: 9999,
} as const

export const fontSizes = {
  xs: 12,
  sm: 14,
  md: 16,
  lg: 18,
  xl: 22,
  xxl: 28,
  display: 34,
} as const

export const fontWeights = {
  regular: '400',
  medium: '500',
  semibold: '600',
  bold: '700',
} as const

export type ThemeColor = keyof typeof colors
