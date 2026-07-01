import { Ionicons } from '@expo/vector-icons'
import { Image } from 'expo-image'
import { Pressable, StyleSheet, Text, View } from 'react-native'

import { Badge } from '@/components/ui'
import { formatEventDate } from '@/lib/datetime'
import { mediaUrl } from '@/lib/media'
import type { Event } from '@/types/event'
import { colors, fontSizes, radii, spacing } from '@/theme'

interface EventCardProps {
  event: Event
  onPress: (event: Event) => void
  /** Compact horizontal variant for carousels. */
  variant?: 'list' | 'carousel'
  /** Optional AI rationale shown beneath the card details. */
  caption?: string | null
}

export function EventCard({
  event,
  onPress,
  variant = 'list',
  caption,
}: EventCardProps) {
  const carousel = variant === 'carousel'
  const location = [event.venue_name, event.city].filter(Boolean).join(', ')

  return (
    <Pressable
      onPress={() => onPress(event)}
      style={({ pressed }) => [
        styles.card,
        carousel && styles.carouselCard,
        pressed && styles.pressed,
      ]}
    >
      <Image
        source={{ uri: mediaUrl(event.cover_image_url) }}
        style={[styles.image, carousel && styles.carouselImage]}
        contentFit="cover"
        transition={150}
      />
      <View style={styles.body}>
        {event.is_featured ? <Badge label="Featured" tone="primary" /> : null}
        <Text style={styles.title} numberOfLines={2}>
          {event.title}
        </Text>
        <View style={styles.metaRow}>
          <Ionicons
            name="calendar-outline"
            size={14}
            color={colors.textMuted}
          />
          <Text style={styles.meta} numberOfLines={1}>
            {formatEventDate(event.start_datetime)}
          </Text>
        </View>
        {location ? (
          <View style={styles.metaRow}>
            <Ionicons
              name="location-outline"
              size={14}
              color={colors.textMuted}
            />
            <Text style={styles.meta} numberOfLines={1}>
              {location}
            </Text>
          </View>
        ) : null}
        {caption ? (
          <View style={styles.captionRow}>
            <Ionicons name="sparkles" size={13} color={colors.primary} />
            <Text style={styles.caption} numberOfLines={2}>
              {caption}
            </Text>
          </View>
        ) : null}
      </View>
    </Pressable>
  )
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.background,
    borderRadius: radii.lg,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: 'hidden',
  },
  carouselCard: { width: 280, marginRight: spacing.md },
  pressed: { opacity: 0.9 },
  image: { width: '100%', height: 160, backgroundColor: colors.surfaceAlt },
  carouselImage: { height: 150 },
  body: { padding: spacing.md, gap: spacing.xs },
  title: { fontSize: fontSizes.lg, fontWeight: '700', color: colors.text },
  metaRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs },
  meta: { flex: 1, fontSize: fontSizes.sm, color: colors.textMuted },
  captionRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.xs,
    marginTop: spacing.xs,
  },
  caption: {
    flex: 1,
    fontSize: fontSizes.sm,
    fontStyle: 'italic',
    color: colors.primary,
  },
})
