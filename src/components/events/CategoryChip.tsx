import { Pressable, StyleSheet, Text } from 'react-native'

import type { Category } from '@/types/event'
import { colors, fontSizes, radii, spacing } from '@/theme'

interface CategoryChipProps {
  category: Category
  selected?: boolean
  onPress: (category: Category) => void
}

export function CategoryChip({
  category,
  selected,
  onPress,
}: CategoryChipProps) {
  return (
    <Pressable
      onPress={() => onPress(category)}
      style={[styles.chip, selected && styles.chipSelected]}
    >
      <Text style={[styles.label, selected && styles.labelSelected]}>
        {category.name}
      </Text>
    </Pressable>
  )
}

const styles = StyleSheet.create({
  chip: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: radii.full,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.background,
  },
  chipSelected: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  label: { fontSize: fontSizes.sm, fontWeight: '600', color: colors.text },
  labelSelected: { color: colors.textInverse },
})
