import type { RouteProp } from '@react-navigation/native'
import { useRoute } from '@react-navigation/native'
import { StyleSheet, Text, View } from 'react-native'

import {
  Avatar,
  Badge,
  type BadgeTone,
  Card,
  EmptyState,
  Screen,
  Spinner,
} from '@/components/ui'
import { useAsync } from '@/hooks/useAsync'
import { orgService } from '@/services/orgService'
import type { Member, OrgRole } from '@/types/organization'
import type { ProfileStackParamList } from '@/navigation/types'
import { colors, fontSizes, spacing } from '@/theme'

const ROLE_TONE: Record<OrgRole, BadgeTone> = {
  owner: 'primary',
  admin: 'info',
  member: 'neutral',
}

export function OrgDetailScreen() {
  const route = useRoute<RouteProp<ProfileStackParamList, 'OrgDetail'>>()
  const { orgId } = route.params

  const { data, loading, error, reload } = useAsync(
    () =>
      Promise.all([orgService.get(orgId), orgService.listMembers(orgId)]).then(
        ([org, members]) => ({ org, members }),
      ),
    [orgId],
  )

  if (loading && !data) {
    return <Spinner fullscreen label="Loading…" />
  }

  if (error || !data) {
    return (
      <Screen>
        <EmptyState
          icon="alert-circle-outline"
          title="Couldn't load organization"
          message={error?.message}
          actionLabel="Retry"
          onAction={reload}
        />
      </Screen>
    )
  }

  const { org, members } = data
  const activeMembers = members.filter(
    (m) => m.invitation_status === 'accepted',
  )
  const pending = members.filter((m) => m.invitation_status === 'pending')

  return (
    <Screen scroll>
      <View style={styles.header}>
        <Avatar uri={org.logo_url} name={org.name} size={72} />
        <Text style={styles.name}>{org.name}</Text>
        {org.is_verified ? <Badge label="Verified" tone="success" /> : null}
      </View>

      {org.description ? (
        <Card>
          <Text style={styles.sectionLabel}>About</Text>
          <Text style={styles.body}>{org.description}</Text>
        </Card>
      ) : null}

      <Card>
        <Text style={styles.sectionLabel}>Contact</Text>
        <Text style={styles.body}>{org.contact_email}</Text>
        {org.website ? <Text style={styles.link}>{org.website}</Text> : null}
      </Card>

      <Card>
        <Text style={styles.sectionLabel}>
          Members ({activeMembers.length})
        </Text>
        {activeMembers.map((m) => (
          <MemberRow key={m.id} member={m} />
        ))}
        {pending.length > 0 ? (
          <>
            <Text style={[styles.sectionLabel, styles.pendingLabel]}>
              Pending invitations ({pending.length})
            </Text>
            {pending.map((m) => (
              <MemberRow key={m.id} member={m} pending />
            ))}
          </>
        ) : null}
      </Card>
    </Screen>
  )
}

function MemberRow({ member, pending }: { member: Member; pending?: boolean }) {
  const label = pending
    ? (member.invited_email ?? 'Invited member')
    : (member.user_id ?? 'Member')
  return (
    <View style={styles.memberRow}>
      <Text style={styles.memberName} numberOfLines={1}>
        {pending ? member.invited_email : label}
      </Text>
      <Badge label={member.role} tone={ROLE_TONE[member.role]} />
    </View>
  )
}

const styles = StyleSheet.create({
  header: { alignItems: 'center', gap: spacing.sm, marginBottom: spacing.lg },
  name: { fontSize: fontSizes.xl, fontWeight: '700', color: colors.text },
  sectionLabel: {
    fontSize: fontSizes.sm,
    fontWeight: '700',
    color: colors.textMuted,
    marginBottom: spacing.sm,
    textTransform: 'uppercase',
  },
  pendingLabel: { marginTop: spacing.lg },
  body: { fontSize: fontSizes.md, color: colors.text, lineHeight: 22 },
  link: {
    fontSize: fontSizes.md,
    color: colors.primary,
    marginTop: spacing.xs,
  },
  memberRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing.sm,
    gap: spacing.md,
  },
  memberName: { flex: 1, fontSize: fontSizes.md, color: colors.text },
})
