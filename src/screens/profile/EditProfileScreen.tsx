import { useNavigation } from '@react-navigation/native'
import type { StackNavigationProp } from '@react-navigation/stack'
import * as ImagePicker from 'expo-image-picker'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { Alert, Pressable, StyleSheet, Text, View } from 'react-native'

import { FormField } from '@/components/forms/FormField'
import { Avatar, Button, Screen } from '@/components/ui'
import type { ApiError } from '@/services/api'
import { userService } from '@/services/userService'
import { useAuthStore } from '@/store/authStore'
import type { ProfileStackParamList } from '@/navigation/types'
import { colors, fontSizes, spacing } from '@/theme'

interface EditForm {
  first_name: string
  last_name: string
  phone: string
  bio: string
  city: string
  country: string
}

export function EditProfileScreen() {
  const navigation =
    useNavigation<StackNavigationProp<ProfileStackParamList, 'EditProfile'>>()
  const user = useAuthStore((s) => s.user)
  const profile = user?.profile

  const { control, handleSubmit } = useForm<EditForm>({
    defaultValues: {
      first_name: profile?.first_name ?? '',
      last_name: profile?.last_name ?? '',
      phone: profile?.phone ?? '',
      bio: profile?.bio ?? '',
      city: profile?.city ?? '',
      country: profile?.country ?? '',
    },
  })
  const [submitting, setSubmitting] = useState(false)
  const [uploadingAvatar, setUploadingAvatar] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)

  const pickAvatar = async () => {
    const perm = await ImagePicker.requestMediaLibraryPermissionsAsync()
    if (!perm.granted) {
      Alert.alert(
        'Permission needed',
        'Allow photo access to change your avatar.',
      )
      return
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.7,
    })
    if (result.canceled || !result.assets[0]) return

    setUploadingAvatar(true)
    try {
      await userService.uploadAvatar(result.assets[0].uri)
    } catch (err) {
      Alert.alert('Upload failed', (err as ApiError).message ?? 'Try again.')
    } finally {
      setUploadingAvatar(false)
    }
  }

  const onSubmit = handleSubmit(async (values) => {
    setSubmitting(true)
    setFormError(null)
    try {
      await userService.updateMyProfile({
        first_name: values.first_name.trim(),
        last_name: values.last_name.trim(),
        phone: values.phone.trim() || null,
        bio: values.bio.trim() || null,
        city: values.city.trim() || null,
        country: values.country.trim() || null,
      })
      navigation.goBack()
    } catch (err) {
      setFormError((err as ApiError).message ?? 'Unable to save changes.')
    } finally {
      setSubmitting(false)
    }
  })

  const fullName =
    `${profile?.first_name ?? ''} ${profile?.last_name ?? ''}`.trim()

  return (
    <Screen scroll>
      <View style={styles.avatarBlock}>
        <Avatar uri={profile?.avatar_url} name={fullName} size={96} />
        <Pressable onPress={pickAvatar} disabled={uploadingAvatar} hitSlop={8}>
          <Text style={styles.changePhoto}>
            {uploadingAvatar ? 'Uploading…' : 'Change photo'}
          </Text>
        </Pressable>
      </View>

      <View style={styles.form}>
        <FormField
          control={control}
          name="first_name"
          label="First name"
          rules={{ required: 'First name is required' }}
        />
        <FormField
          control={control}
          name="last_name"
          label="Last name"
          rules={{ required: 'Last name is required' }}
        />
        <FormField
          control={control}
          name="phone"
          label="Phone"
          keyboardType="phone-pad"
          placeholder="Optional"
        />
        <FormField
          control={control}
          name="city"
          label="City"
          placeholder="Optional"
        />
        <FormField
          control={control}
          name="country"
          label="Country"
          placeholder="Optional"
        />
        <FormField
          control={control}
          name="bio"
          label="Bio"
          placeholder="Tell people a little about yourself"
          multiline
          numberOfLines={4}
          style={styles.bioInput}
        />

        {formError ? <Text style={styles.error}>{formError}</Text> : null}

        <Button title="Save changes" loading={submitting} onPress={onSubmit} />
      </View>
    </Screen>
  )
}

const styles = StyleSheet.create({
  avatarBlock: {
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.lg,
  },
  changePhoto: {
    color: colors.primary,
    fontSize: fontSizes.sm,
    fontWeight: '600',
  },
  form: { gap: spacing.lg },
  bioInput: { minHeight: 96, textAlignVertical: 'top' },
  error: { color: colors.danger, fontSize: fontSizes.sm },
})
