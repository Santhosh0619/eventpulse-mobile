import { useNavigation } from '@react-navigation/native'
import type { StackNavigationProp } from '@react-navigation/stack'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native'

import { FormField } from '@/components/forms/FormField'
import { Button, Screen } from '@/components/ui'
import { authService } from '@/services/authService'
import type { ApiError } from '@/services/api'
import type { AuthStackParamList } from '@/navigation/types'
import { colors, fontSizes, spacing } from '@/theme'

interface LoginForm {
  email: string
  password: string
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export function LoginScreen() {
  const navigation =
    useNavigation<StackNavigationProp<AuthStackParamList, 'Login'>>()
  const { control, handleSubmit } = useForm<LoginForm>({
    defaultValues: { email: '', password: '' },
  })
  const [submitting, setSubmitting] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)

  const onSubmit = handleSubmit(async ({ email, password }) => {
    setSubmitting(true)
    setFormError(null)
    try {
      // On success the auth store gains a token; RootNavigator swaps to Main.
      await authService.login(email.trim(), password)
    } catch (err) {
      setFormError((err as ApiError).message ?? 'Unable to sign in.')
    } finally {
      setSubmitting(false)
    }
  })

  return (
    <Screen scroll>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.flex}
      >
        <View style={styles.header}>
          <Text style={styles.brand}>EventPulse</Text>
          <Text style={styles.tagline}>Discover and book events near you.</Text>
        </View>

        <View style={styles.form}>
          <FormField
            control={control}
            name="email"
            label="Email"
            placeholder="you@example.com"
            autoCapitalize="none"
            autoComplete="email"
            keyboardType="email-address"
            rules={{
              required: 'Email is required',
              validate: (v: string) =>
                EMAIL_RE.test(v.trim()) || 'Enter a valid email',
            }}
          />
          <FormField
            control={control}
            name="password"
            label="Password"
            placeholder="Your password"
            secureTextEntry
            autoComplete="password"
            rules={{ required: 'Password is required' }}
          />

          {formError ? <Text style={styles.error}>{formError}</Text> : null}

          <Button title="Sign in" loading={submitting} onPress={onSubmit} />

          <Pressable
            onPress={() => navigation.navigate('ForgotPassword')}
            hitSlop={8}
          >
            <Text style={styles.link}>Forgot password?</Text>
          </Pressable>
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>New to EventPulse? </Text>
          <Pressable
            onPress={() => navigation.navigate('Register')}
            hitSlop={8}
          >
            <Text style={[styles.link, styles.linkStrong]}>
              Create an account
            </Text>
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    </Screen>
  )
}

const styles = StyleSheet.create({
  flex: { flex: 1, justifyContent: 'center', gap: spacing.xxl },
  header: { alignItems: 'center', gap: spacing.xs },
  brand: {
    fontSize: fontSizes.display,
    fontWeight: '700',
    color: colors.primary,
  },
  tagline: { fontSize: fontSizes.md, color: colors.textMuted },
  form: { gap: spacing.lg },
  error: { color: colors.danger, fontSize: fontSizes.sm },
  link: { color: colors.primary, fontSize: fontSizes.sm, textAlign: 'center' },
  linkStrong: { fontWeight: '700' },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  footerText: { color: colors.textMuted, fontSize: fontSizes.sm },
})
