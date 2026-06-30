import { Ionicons } from '@expo/vector-icons'
import { Pressable, StyleSheet, View } from 'react-native'

import { colors } from '@/theme'

interface RatingStarsProps {
  rating: number
  size?: number
  /** When provided, stars become tappable to set a rating. */
  onChange?: (rating: number) => void
}

const STARS = [1, 2, 3, 4, 5]

/** Five-star rating display, or an interactive picker when `onChange` is set. */
export function RatingStars({ rating, size = 18, onChange }: RatingStarsProps) {
  return (
    <View style={styles.row}>
      {STARS.map((star) => {
        const filled = star <= Math.round(rating)
        const icon = (
          <Ionicons
            name={filled ? 'star' : 'star-outline'}
            size={size}
            color={filled ? colors.warning : colors.border}
          />
        )
        return onChange ? (
          <Pressable
            key={star}
            onPress={() => onChange(star)}
            hitSlop={6}
            accessibilityRole="button"
            accessibilityLabel={`Rate ${star} star${star > 1 ? 's' : ''}`}
            testID={`star-${star}`}
          >
            {icon}
          </Pressable>
        ) : (
          <View key={star}>{icon}</View>
        )
      })}
    </View>
  )
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', gap: 2 },
})
