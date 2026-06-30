import {
  ActivityIndicator,
  Pressable,
  type PressableProps,
  StyleSheet,
  Text,
  View,
} from 'react-native'

import { colors, fontSizes, fontWeights, radii, spacing } from '@/theme'

export type ButtonVariant =
  'primary' | 'secondary' | 'outline' | 'ghost' | 'danger'
export type ButtonSize = 'sm' | 'md' | 'lg'

interface ButtonProps extends Omit<PressableProps, 'children'> {
  title: string
  variant?: ButtonVariant
  size?: ButtonSize
  loading?: boolean
  fullWidth?: boolean
  leftIcon?: React.ReactNode
}

export function Button({
  title,
  variant = 'primary',
  size = 'md',
  loading = false,
  fullWidth = true,
  leftIcon,
  disabled,
  style,
  ...rest
}: ButtonProps) {
  const isDisabled = disabled || loading
  const v = VARIANTS[variant]
  const s = SIZES[size]

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ disabled: !!isDisabled, busy: loading }}
      disabled={isDisabled}
      style={(state) => [
        styles.base,
        { backgroundColor: v.bg, borderColor: v.border, paddingVertical: s.py },
        fullWidth && styles.fullWidth,
        state.pressed && !isDisabled && styles.pressed,
        isDisabled && styles.disabled,
        typeof style === 'function' ? style(state) : style,
      ]}
      {...rest}
    >
      {loading ? (
        <ActivityIndicator color={v.fg} />
      ) : (
        <View style={styles.content}>
          {leftIcon}
          <Text style={[styles.label, { color: v.fg, fontSize: s.fontSize }]}>
            {title}
          </Text>
        </View>
      )}
    </Pressable>
  )
}

const VARIANTS: Record<
  ButtonVariant,
  { bg: string; fg: string; border: string }
> = {
  primary: {
    bg: colors.primary,
    fg: colors.textInverse,
    border: colors.primary,
  },
  secondary: {
    bg: colors.surfaceAlt,
    fg: colors.text,
    border: colors.surfaceAlt,
  },
  outline: { bg: 'transparent', fg: colors.primary, border: colors.primary },
  ghost: { bg: 'transparent', fg: colors.primary, border: 'transparent' },
  danger: { bg: colors.danger, fg: colors.textInverse, border: colors.danger },
}

const SIZES: Record<ButtonSize, { py: number; fontSize: number }> = {
  sm: { py: spacing.sm, fontSize: fontSizes.sm },
  md: { py: spacing.md, fontSize: fontSizes.md },
  lg: { py: spacing.lg, fontSize: fontSizes.lg },
}

const styles = StyleSheet.create({
  base: {
    borderRadius: radii.md,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.lg,
  },
  fullWidth: { alignSelf: 'stretch' },
  pressed: { opacity: 0.85 },
  disabled: { opacity: 0.5 },
  content: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  label: { fontWeight: fontWeights.semibold },
})
