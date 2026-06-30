import { useNavigation } from '@react-navigation/native'
import type { StackNavigationProp } from '@react-navigation/stack'
import { useMemo } from 'react'
import { StyleSheet, View } from 'react-native'
import MapView, { Marker } from 'react-native-maps'

import { EmptyState, Spinner } from '@/components/ui'
import { useAsync } from '@/hooks/useAsync'
import { eventService } from '@/services/eventService'
import type { Event } from '@/types/event'
import type { DiscoverStackParamList } from '@/navigation/types'
import { colors } from '@/theme'

/** Events plotted on a map. Only events with coordinates are shown. */
export function MapDiscoverScreen() {
  const navigation =
    useNavigation<StackNavigationProp<DiscoverStackParamList, 'MapDiscover'>>()

  const { data, loading, error, reload } = useAsync(
    () => eventService.search({ limit: 100 }).then((r) => r.items),
    [],
  )

  const located = useMemo(
    () => (data ?? []).filter((e) => e.latitude != null && e.longitude != null),
    [data],
  )

  const initialRegion = useMemo(() => {
    const first = located[0]
    return {
      latitude: first?.latitude ?? 0,
      longitude: first?.longitude ?? 0,
      latitudeDelta: 0.4,
      longitudeDelta: 0.4,
    }
  }, [located])

  if (loading && !data) {
    return <Spinner fullscreen label="Loading map…" />
  }
  if (error) {
    return (
      <EmptyState
        icon="alert-circle-outline"
        title="Couldn't load map"
        message={error.message}
        actionLabel="Retry"
        onAction={reload}
      />
    )
  }
  if (located.length === 0) {
    return (
      <EmptyState
        icon="map-outline"
        title="No mappable events"
        message="None of the current events have a location set."
      />
    )
  }

  return (
    <View style={styles.flex}>
      <MapView style={styles.map} initialRegion={initialRegion}>
        {located.map((e: Event) => (
          <Marker
            key={e.id}
            coordinate={{
              latitude: e.latitude as number,
              longitude: e.longitude as number,
            }}
            title={e.title}
            description={e.venue_name ?? e.city ?? undefined}
            onCalloutPress={() =>
              navigation.navigate('EventDetail', {
                eventId: e.id,
                title: e.title,
              })
            }
          />
        ))}
      </MapView>
    </View>
  )
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: colors.background },
  map: { flex: 1 },
})
