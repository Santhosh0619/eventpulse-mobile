import { Ionicons } from '@expo/vector-icons'
import type { RouteProp } from '@react-navigation/native'
import { useRoute } from '@react-navigation/native'
import { Image } from 'expo-image'
import { Alert, ScrollView, StyleSheet, Text, View } from 'react-native'

import { MapView, Marker, mapsAvailable } from '@/lib/maps'
import { Badge, Button, EmptyState, Spinner } from '@/components/ui'
import { useAsync } from '@/hooks/useAsync'
import { formatEventRange } from '@/lib/datetime'
import { mediaUrl } from '@/lib/media'
import { eventService } from '@/services/eventService'
import type { HomeStackParamList } from '@/navigation/types'
import { colors, fontSizes, radii, spacing } from '@/theme'

export function EventDetailScreen() {
  const route = useRoute<RouteProp<HomeStackParamList, 'EventDetail'>>()
  const { eventId } = route.params

  const { data, loading, error, reload } = useAsync(
    () =>
      Promise.all([
        eventService.getById(eventId),
        eventService.getMedia(eventId).catch(() => []),
      ]).then(([event, media]) => ({ event, media })),
    [eventId],
  )

  if (loading && !data) {
    return <Spinner fullscreen label="Loading event…" />
  }
  if (error || !data) {
    return (
      <EmptyState
        icon="alert-circle-outline"
        title="Couldn't load event"
        message={error?.message}
        actionLabel="Retry"
        onAction={reload}
      />
    )
  }

  const { event, media } = data
  const location = [
    event.venue_name,
    event.venue_address,
    event.city,
    event.country,
  ]
    .filter(Boolean)
    .join(', ')
  const hasCoords =
    mapsAvailable && event.latitude != null && event.longitude != null
  const cancelled = event.status === 'cancelled'

  return (
    <View style={styles.flex}>
      <ScrollView contentContainerStyle={styles.content}>
        <Image
          source={{ uri: mediaUrl(event.cover_image_url) }}
          style={styles.hero}
          contentFit="cover"
          transition={200}
        />

        <View style={styles.section}>
          <View style={styles.badges}>
            {event.is_featured ? (
              <Badge label="Featured" tone="primary" />
            ) : null}
            {cancelled ? <Badge label="Cancelled" tone="danger" /> : null}
          </View>
          <Text style={styles.title}>{event.title}</Text>

          <View style={styles.metaRow}>
            <Ionicons
              name="calendar-outline"
              size={18}
              color={colors.primary}
            />
            <Text style={styles.meta}>
              {formatEventRange(event.start_datetime, event.end_datetime)}
            </Text>
          </View>
          {location ? (
            <View style={styles.metaRow}>
              <Ionicons
                name="location-outline"
                size={18}
                color={colors.primary}
              />
              <Text style={styles.meta}>{location}</Text>
            </View>
          ) : null}

          {event.tags.length > 0 ? (
            <View style={styles.tags}>
              {event.tags.map((t) => (
                <Badge key={t} label={t} tone="neutral" />
              ))}
            </View>
          ) : null}
        </View>

        {event.description ? (
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>About</Text>
            <Text style={styles.body}>{event.description}</Text>
          </View>
        ) : null}

        {media.length > 0 ? (
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>Gallery</Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.gallery}
            >
              {media.map((m) => (
                <Image
                  key={m.id}
                  source={{ uri: mediaUrl(m.thumbnail_url ?? m.url) }}
                  style={styles.galleryImage}
                  contentFit="cover"
                />
              ))}
            </ScrollView>
          </View>
        ) : null}

        {hasCoords ? (
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>Venue</Text>
            <MapView
              style={styles.map}
              pointerEvents="none"
              initialRegion={{
                latitude: event.latitude as number,
                longitude: event.longitude as number,
                latitudeDelta: 0.02,
                longitudeDelta: 0.02,
              }}
            >
              <Marker
                coordinate={{
                  latitude: event.latitude as number,
                  longitude: event.longitude as number,
                }}
                title={event.venue_name ?? event.title}
              />
            </MapView>
          </View>
        ) : null}
      </ScrollView>

      <View style={styles.footer}>
        <Button
          title={cancelled ? 'Event cancelled' : 'Get tickets'}
          disabled={cancelled}
          onPress={() =>
            Alert.alert(
              'Tickets',
              'Ticket purchase arrives in the next update.',
            )
          }
        />
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: colors.background },
  content: { paddingBottom: spacing.xxl },
  hero: { width: '100%', height: 240, backgroundColor: colors.surfaceAlt },
  section: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
    gap: spacing.sm,
  },
  badges: { flexDirection: 'row', gap: spacing.sm },
  title: { fontSize: fontSizes.xxl, fontWeight: '700', color: colors.text },
  metaRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  meta: { flex: 1, fontSize: fontSizes.md, color: colors.text },
  tags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
    marginTop: spacing.xs,
  },
  sectionLabel: {
    fontSize: fontSizes.sm,
    fontWeight: '700',
    color: colors.textMuted,
    textTransform: 'uppercase',
  },
  body: { fontSize: fontSizes.md, color: colors.text, lineHeight: 24 },
  gallery: { gap: spacing.sm, paddingRight: spacing.lg },
  galleryImage: {
    width: 140,
    height: 100,
    borderRadius: radii.md,
    backgroundColor: colors.surfaceAlt,
  },
  map: { width: '100%', height: 180, borderRadius: radii.md },
  footer: {
    padding: spacing.lg,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    backgroundColor: colors.background,
  },
})
