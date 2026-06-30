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
import type { ApiError } from '@/services/api'
import { authService } from '@/services/authService'
import type { AuthStackParamList } from '@/navigation/types'
import { colors, fontSizes, spacing } from '@/theme'

interface RegisterForm {
  first_name: string
  last_name: string
  email: string
  password: string
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export function RegisterScreen() {
  const navigation =
    useNavigation<StackNavigationProp<AuthStackParamList, 'Register'>>()
  const { control, handleSubmit } = useForm<RegisterForm>({
    defaultValues: { first_name: '', last_name: '', email: '', password: '' },
  })
  const [submitting, setSubmitting] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)
  const [done, setDone] = useState(false)

  const onSubmit = handleSubmit(async (values) => {
    setSubmitting(true)
    setFormError(null)
    try {
      await authService.register({
        ...values,
        email: values.email.trim(),
        first_name: values.first_name.trim(),
        last_name: values.last_name.trim(),
      })
      setDone(true)
    } catch (err) {
      setFormError((err as ApiError).message ?? 'Unable to create account.')
    } finally {
      setSubmitting(false)
    }
  })

  if (done) {
    return (
      <Screen>
        <View style={styles.doneWrap}>
          <Text style={styles.doneTitle}>Check your email</Text>
          <Text style={styles.doneBody}>
            We sent a verification link to confirm your account. Verify it, then
            sign in.
          </Text>
          <Button title="Back to sign in" onPress={() => navigation.goBack()} />
        </View>
      </Screen>
    )
  }

  return (
    <Screen scroll>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.flex}
      >
        <Text style={styles.title}>Create your account</Text>

        <View style={styles.form}>
          <FormField
            control={control}
            name="first_name"
            label="First name"
            placeholder="Ada"
            rules={{ required: 'First name is required' }}
          />
          <FormField
            control={control}
            name="last_name"
            label="Last name"
            placeholder="Lovelace"
            rules={{ required: 'Last name is required' }}
          />
          <FormField
            control={control}
            name="email"
            label="Email"
            placeholder="you@example.com"
            autoCapitalize="none"
            keyboardType="email-address"
            rules={{
              required: 'Email is required',
              pattern: { value: EMAIL_RE, message: 'Enter a valid email' },
            }}
          />
          <FormField
            control={control}
            name="password"
            label="Password"
            placeholder="At least 8 characters"
            secureTextEntry
            rules={{
              required: 'Password is required',
              minLength: { value: 8, message: 'At least 8 characters' },
            }}
          />

          {formError ? <Text style={styles.error}>{formError}</Text> : null}

          <Button
            title="Create account"
            loading={submitting}
            onPress={onSubmit}
          />
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>Already have an account? </Text>
          <Pressable onPress={() => navigation.goBack()} hitSlop={8}>
            <Text style={[styles.link, styles.linkStrong]}>Sign in</Text>
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    </Screen>
  )
}

const styles = StyleSheet.create({
  flex: { flex: 1, justifyContent: 'center', gap: spacing.xl },
  title: {
    fontSize: fontSizes.xxl,
    fontWeight: '700',
    color: colors.text,
    textAlign: 'center',
  },
  form: { gap: spacing.lg },
  error: { color: colors.danger, fontSize: fontSizes.sm },
  link: { color: colors.primary, fontSize: fontSizes.sm },
  linkStrong: { fontWeight: '700' },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  footerText: { color: colors.textMuted, fontSize: fontSizes.sm },
  doneWrap: { flex: 1, justifyContent: 'center', gap: spacing.lg },
  doneTitle: {
    fontSize: fontSizes.xxl,
    fontWeight: '700',
    color: colors.text,
    textAlign: 'center',
  },
  doneBody: {
    fontSize: fontSizes.md,
    color: colors.textMuted,
    textAlign: 'center',
  },
})
