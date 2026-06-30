import type { RouteProp } from '@react-navigation/native'
import { useRoute } from '@react-navigation/native'
import { parseISO } from 'date-fns'
import { useEffect } from 'react'
import { ScrollView, StyleSheet, Text, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'

import { Card, EmptyState, Spinner } from '@/components/ui'
import { useAsync } from '@/hooks/useAsync'
import { formatTime } from '@/lib/datetime'
import { attendeeService } from '@/services/attendeeService'
import type { Attendee } from '@/types/attendee'
import type { ProfileStackParamList } from '@/navigation/types'
import { colors, fontSizes, spacing } from '@/theme'

export function CheckInDashboardScreen() {
  const route = useRoute<RouteProp<ProfileStackParamList, 'CheckInDashboard'>>()
  const { eventId } = route.params

  const { data, loading, error, reload } = useAsync(
    () =>
      Promise.all([
        attendeeService.getStats(eventId),
        attendeeService.listForEvent(eventId),
      ]).then(([stats, attendees]) => ({ stats, attendees })),
    [eventId],
  )

  // Live-refresh the counters every 5 seconds.
  useEffect(() => {
    const id = setInterval(reload, 5000)
    return () => clearInterval(id)
  }, [reload])

  if (loading && !data) {
    return <Spinner fullscreen label="Loading dashboard…" />
  }
  if (error || !data) {
    return (
      <SafeAreaView style={styles.safe}>
        <EmptyState
          icon="alert-circle-outline"
          title="Couldn't load dashboard"
          message={error?.message}
          actionLabel="Retry"
          onAction={reload}
        />
      </SafeAreaView>
    )
  }

  const { stats, attendees } = data
  const recent = attendees
    .filter((a) => a.check_in_status === 'checked_in' && a.checked_in_at)
    .sort(
      (a, b) =>
        parseISO(b.checked_in_at as string).getTime() -
        parseISO(a.checked_in_at as string).getTime(),
    )
    .slice(0, 20)

  return (
    <SafeAreaView style={styles.safe} edges={['left', 'right', 'bottom']}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.statsRow}>
          <Stat
            label="Checked in"
            value={stats.checked_in}
            tone={colors.success}
          />
          <Stat
            label="Remaining"
            value={stats.not_checked_in}
            tone={colors.warning}
          />
          <Stat label="Total" value={stats.total} tone={colors.text} />
        </View>

        <Card>
          <Text style={styles.rate}>
            {Math.round((stats.check_in_rate ?? 0) * 100)}% checked in
          </Text>
          <View style={styles.barTrack}>
            <View
              style={[
                styles.barFill,
                { width: `${Math.round((stats.check_in_rate ?? 0) * 100)}%` },
              ]}
            />
          </View>
        </Card>

        <Text style={styles.heading}>Recent check-ins</Text>
        {recent.length === 0 ? (
          <Text style={styles.muted}>No check-ins yet.</Text>
        ) : (
          <Card>
            {recent.map((a: Attendee) => (
              <View key={a.id} style={styles.row}>
                <Text style={styles.name} numberOfLines={1}>
                  {`${a.first_name} ${a.last_name}`.trim()}
                </Text>
                <Text style={styles.time}>
                  {a.checked_in_at ? formatTime(a.checked_in_at) : ''}
                </Text>
              </View>
            ))}
          </Card>
        )}
      </ScrollView>
    </SafeAreaView>
  )
}

function Stat({
  label,
  value,
  tone,
}: {
  label: string
  value: number
  tone: string
}) {
  return (
    <Card style={styles.stat}>
      <Text style={[styles.statValue, { color: tone }]}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </Card>
  )
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.surface },
  content: { padding: spacing.lg, gap: spacing.md },
  statsRow: { flexDirection: 'row', gap: spacing.sm },
  stat: { flex: 1, alignItems: 'center', gap: spacing.xs },
  statValue: { fontSize: fontSizes.xxl, fontWeight: '700' },
  statLabel: { fontSize: fontSizes.xs, color: colors.textMuted },
  rate: {
    fontSize: fontSizes.md,
    fontWeight: '700',
    color: colors.text,
    marginBottom: spacing.sm,
  },
  barTrack: {
    height: 10,
    borderRadius: 5,
    backgroundColor: colors.surfaceAlt,
    overflow: 'hidden',
  },
  barFill: { height: 10, borderRadius: 5, backgroundColor: colors.success },
  heading: {
    fontSize: fontSizes.lg,
    fontWeight: '700',
    color: colors.text,
    marginTop: spacing.sm,
  },
  muted: { fontSize: fontSizes.sm, color: colors.textMuted },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  name: { flex: 1, fontSize: fontSizes.md, color: colors.text },
  time: { fontSize: fontSizes.sm, color: colors.textMuted },
})
