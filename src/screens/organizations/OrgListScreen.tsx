import { useNavigation } from '@react-navigation/native'
import type { StackNavigationProp } from '@react-navigation/stack'
import { useCallback } from 'react'
import {
  FlatList,
  Pressable,
  RefreshControl,
  StyleSheet,
  Text,
  View,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'

import {
  Badge,
  type BadgeTone,
  Card,
  EmptyState,
  Spinner,
} from '@/components/ui'
import { useAsync } from '@/hooks/useAsync'
import { listPerf } from '@/lib/listPerf'
import { orgService } from '@/services/orgService'
import type { OrgRole, OrgWithRole } from '@/types/organization'
import type { ProfileStackParamList } from '@/navigation/types'
import { colors, fontSizes, spacing } from '@/theme'

const ROLE_TONE: Record<OrgRole, BadgeTone> = {
  owner: 'primary',
  admin: 'info',
  member: 'neutral',
}

export function OrgListScreen() {
  const navigation =
    useNavigation<StackNavigationProp<ProfileStackParamList, 'Organizations'>>()
  const { data, loading, error, reload } = useAsync(
    () => orgService.listMine(),
    [],
  )

  const renderItem = useCallback(
    ({ item }: { item: OrgWithRole }) => (
      <Pressable
        onPress={() =>
          navigation.navigate('OrgDetail', { orgId: item.id, name: item.name })
        }
      >
        <Card style={styles.card}>
          <View style={styles.cardHeader}>
            <Text style={styles.orgName}>{item.name}</Text>
            <Badge label={item.my_role} tone={ROLE_TONE[item.my_role]} />
          </View>
          {item.description ? (
            <Text style={styles.orgDesc} numberOfLines={2}>
              {item.description}
            </Text>
          ) : null}
          {item.is_verified ? <Badge label="Verified" tone="success" /> : null}
        </Card>
      </Pressable>
    ),
    [navigation],
  )

  if (loading && !data) {
    return <Spinner fullscreen label="Loading organizations…" />
  }

  if (error) {
    return (
      <SafeAreaView style={styles.safe}>
        <EmptyState
          icon="alert-circle-outline"
          title="Couldn't load organizations"
          message={error.message}
          actionLabel="Retry"
          onAction={reload}
        />
      </SafeAreaView>
    )
  }

  return (
    <SafeAreaView style={styles.safe} edges={['left', 'right']}>
      <FlatList
        {...listPerf}
        data={data ?? []}
        keyExtractor={(o) => o.id}
        renderItem={renderItem}
        contentContainerStyle={styles.list}
        refreshControl={
          <RefreshControl refreshing={loading} onRefresh={reload} />
        }
        ListEmptyComponent={
          <EmptyState
            icon="people-outline"
            title="No organizations yet"
            message="Organizations you create or get invited to will appear here."
          />
        }
      />
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.surface },
  list: { padding: spacing.lg, gap: spacing.md, flexGrow: 1 },
  card: { gap: spacing.sm },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  orgName: {
    flex: 1,
    fontSize: fontSizes.lg,
    fontWeight: '700',
    color: colors.text,
  },
  orgDesc: { fontSize: fontSizes.sm, color: colors.textMuted },
})
