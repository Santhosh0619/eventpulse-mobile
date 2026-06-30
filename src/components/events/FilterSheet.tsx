import { useEffect, useState } from 'react'
import { ScrollView, StyleSheet, Text, View } from 'react-native'

import { BottomSheet, Button, Input } from '@/components/ui'
import { CategoryChip } from '@/components/events/CategoryChip'
import type { Category } from '@/types/event'
import type { EventFilters } from '@/store/eventStore'
import { colors, fontSizes, spacing } from '@/theme'

interface FilterSheetProps {
  visible: boolean
  onClose: () => void
  categories: Category[]
  filters: EventFilters
  onApply: (patch: Partial<EventFilters>) => void
  onClear: () => void
}

/** Bottom-sheet filter editor for the Discover screen (category + city). */
export function FilterSheet({
  visible,
  onClose,
  categories,
  filters,
  onApply,
  onClear,
}: FilterSheetProps) {
  const [categoryId, setCategoryId] = useState(filters.categoryId)
  const [city, setCity] = useState(filters.city ?? '')

  // Re-sync the draft whenever the sheet is (re)opened.
  useEffect(() => {
    if (visible) {
      setCategoryId(filters.categoryId)
      setCity(filters.city ?? '')
    }
  }, [visible, filters.categoryId, filters.city])

  const apply = () => {
    onApply({ categoryId, city: city.trim() || null })
    onClose()
  }

  const clear = () => {
    setCategoryId(null)
    setCity('')
    onClear()
    onClose()
  }

  return (
    <BottomSheet visible={visible} onClose={onClose} title="Filters">
      <Text style={styles.label}>Category</Text>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.chips}
      >
        {categories.map((c) => (
          <CategoryChip
            key={c.id}
            category={c}
            selected={categoryId === c.id}
            onPress={() =>
              setCategoryId((prev) => (prev === c.id ? null : c.id))
            }
          />
        ))}
      </ScrollView>

      <View style={styles.field}>
        <Input
          label="City"
          value={city}
          onChangeText={setCity}
          placeholder="Any city"
          autoCapitalize="words"
        />
      </View>

      <View style={styles.actions}>
        <Button title="Apply filters" onPress={apply} />
        <Button title="Clear all" variant="ghost" onPress={clear} />
      </View>
    </BottomSheet>
  )
}

const styles = StyleSheet.create({
  label: {
    fontSize: fontSizes.sm,
    fontWeight: '700',
    color: colors.textMuted,
    textTransform: 'uppercase',
  },
  chips: {
    gap: spacing.sm,
    paddingVertical: spacing.xs,
    paddingRight: spacing.lg,
  },
  field: { marginTop: spacing.sm },
  actions: { gap: spacing.sm, marginTop: spacing.sm },
})
