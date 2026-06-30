import { useNavigation } from '@react-navigation/native'
import type { StackNavigationProp } from '@react-navigation/stack'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { StyleSheet, Text, View } from 'react-native'

import { FormField } from '@/components/forms/FormField'
import { Button, Screen } from '@/components/ui'
import type { ApiError } from '@/services/api'
import { authService } from '@/services/authService'
import type { AuthStackParamList } from '@/navigation/types'
import { colors, fontSizes, spacing } from '@/theme'

interface ForgotForm {
  email: string
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export function ForgotPasswordScreen() {
  const navigation =
    useNavigation<StackNavigationProp<AuthStackParamList, 'ForgotPassword'>>()
  const { control, handleSubmit } = useForm<ForgotForm>({
    defaultValues: { email: '' },
  })
  const [submitting, setSubmitting] = useState(false)
  const [sent, setSent] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)

  const onSubmit = handleSubmit(async ({ email }) => {
    setSubmitting(true)
    setFormError(null)
    try {
      await authService.forgotPassword(email.trim())
      // Always show success: the backend doesn't reveal whether an email exists.
      setSent(true)
    } catch (err) {
      setFormError((err as ApiError).message ?? 'Something went wrong.')
    } finally {
      setSubmitting(false)
    }
  })

  return (
    <Screen scroll>
      <View style={styles.flex}>
        <Text style={styles.title}>Reset your password</Text>
        {sent ? (
          <>
            <Text style={styles.body}>
              If an account exists for that email, we&apos;ve sent a reset link.
              Check your inbox.
            </Text>
            <Button
              title="Back to sign in"
              onPress={() => navigation.goBack()}
            />
          </>
        ) : (
          <>
            <Text style={styles.body}>
              Enter your email and we&apos;ll send you a link to reset your
              password.
            </Text>
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
            {formError ? <Text style={styles.error}>{formError}</Text> : null}
            <Button
              title="Send reset link"
              loading={submitting}
              onPress={onSubmit}
            />
          </>
        )}
      </View>
    </Screen>
  )
}

const styles = StyleSheet.create({
  flex: { flex: 1, justifyContent: 'center', gap: spacing.lg },
  title: {
    fontSize: fontSizes.xxl,
    fontWeight: '700',
    color: colors.text,
    textAlign: 'center',
  },
  body: {
    fontSize: fontSizes.md,
    color: colors.textMuted,
    textAlign: 'center',
  },
  error: { color: colors.danger, fontSize: fontSizes.sm },
})
