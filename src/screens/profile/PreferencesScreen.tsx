import { useNavigation } from '@react-navigation/native'
import type { StackNavigationProp } from '@react-navigation/stack'
import Slider from '@react-native-community/slider'
import { useState } from 'react'
import { ScrollView, StyleSheet, Text, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'

import { CategoryChip } from '@/components/events/CategoryChip'
import { Button, Card, Spinner } from '@/components/ui'
import { useAsync } from '@/hooks/useAsync'
import { formatMoney } from '@/lib/money'
import type { ApiError } from '@/services/api'
import { eventService } from '@/services/eventService'
import { userService } from '@/services/userService'
import { useAuthStore } from '@/store/authStore'
import type { ProfileStackParamList } from '@/navigation/types'
import { colors, fontSizes, spacing } from '@/theme'

function num(value: unknown, fallback: number): number {
  return typeof value === 'number' ? value : fallback
}

export function PreferencesScreen() {
  const navigation =
    useNavigation<StackNavigationProp<ProfileStackParamList, 'Preferences'>>()
  const prefs = useAuthStore((s) => s.user?.profile?.preferences) ?? {}

  const { data: categories, loading } = useAsync(
    () => eventService.listCategories().catch(() => []),
    [],
  )

  const [selected, setSelected] = useState<string[]>(
    Array.isArray(prefs.categories) ? (prefs.categories as string[]) : [],
  )
  const [radiusKm, setRadiusKm] = useState(num(prefs.radius_km, 50))
  const [maxPrice, setMaxPrice] = useState(num(prefs.max_price, 5000))
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const toggle = (id: string) =>
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((c) => c !== id) : [...prev, id],
    )

  const save = async () => {
    setSaving(true)
    setError(null)
    try {
      await userService.updateMyProfile({
        preferences: {
          ...prefs,
          categories: selected,
          radius_km: radiusKm,
          max_price: maxPrice,
        },
      })
      navigation.goBack()
    } catch (e) {
      setError((e as ApiError).message ?? 'Could not save preferences.')
      setSaving(false)
    }
  }

  if (loading && !categories) {
    return <Spinner fullscreen label="Loading…" />
  }

  return (
    <SafeAreaView style={styles.safe} edges={['left', 'right', 'bottom']}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.intro}>
          Tell us what you like so we can recommend better events.
        </Text>

        <Card>
          <Text style={styles.label}>Favorite categories</Text>
          <View style={styles.chips}>
            {(categories ?? []).map((c) => (
              <CategoryChip
                key={c.id}
                category={c}
                selected={selected.includes(c.id)}
                onPress={() => toggle(c.id)}
              />
            ))}
          </View>
        </Card>

        <Card>
          <Text style={styles.label}>Distance</Text>
          <Text style={styles.value}>Within {Math.round(radiusKm)} km</Text>
          <Slider
            minimumValue={5}
            maximumValue={200}
            step={5}
            value={radiusKm}
            onValueChange={setRadiusKm}
            minimumTrackTintColor={colors.primary}
            thumbTintColor={colors.primary}
          />
        </Card>

        <Card>
          <Text style={styles.label}>Max ticket price</Text>
          <Text style={styles.value}>Up to {formatMoney(maxPrice, 'INR')}</Text>
          <Slider
            minimumValue={0}
            maximumValue={10000}
            step={100}
            value={maxPrice}
            onValueChange={setMaxPrice}
            minimumTrackTintColor={colors.primary}
            thumbTintColor={colors.primary}
          />
        </Card>

        {error ? <Text style={styles.error}>{error}</Text> : null}
        <Button title="Save preferences" loading={saving} onPress={save} />
      </ScrollView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.surface },
  content: {
    padding: spacing.lg,
    gap: spacing.md,
    backgroundColor: colors.surface,
    flexGrow: 1,
  },
  intro: { fontSize: fontSizes.sm, color: colors.textMuted },
  label: {
    fontSize: fontSizes.sm,
    fontWeight: '700',
    color: colors.textMuted,
    textTransform: 'uppercase',
    marginBottom: spacing.sm,
  },
  value: {
    fontSize: fontSizes.md,
    color: colors.text,
    marginBottom: spacing.xs,
  },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  error: { fontSize: fontSizes.sm, color: colors.danger },
})
