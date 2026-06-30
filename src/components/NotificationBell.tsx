import { Ionicons } from '@expo/vector-icons'
import { Pressable, StyleSheet, Text, View } from 'react-native'

import { useNotificationStore } from '@/store/notificationStore'
import { colors, spacing } from '@/theme'

/** Header bell button showing the unread notification count. */
export function NotificationBell({ onPress }: { onPress: () => void }) {
  const unread = useNotificationStore((s) => s.unreadCount)
  return (
    <Pressable
      onPress={onPress}
      hitSlop={8}
      style={styles.btn}
      accessibilityRole="button"
      accessibilityLabel={`Notifications${unread ? `, ${unread} unread` : ''}`}
    >
      <Ionicons name="notifications-outline" size={22} color={colors.primary} />
      {unread > 0 ? (
        <View style={styles.badge}>
          <Text style={styles.badgeText}>{unread > 99 ? '99+' : unread}</Text>
        </View>
      ) : null}
    </Pressable>
  )
}

const styles = StyleSheet.create({
  btn: { marginRight: spacing.lg, padding: 2 },
  badge: {
    position: 'absolute',
    top: -4,
    right: -6,
    minWidth: 16,
    height: 16,
    borderRadius: 8,
    paddingHorizontal: 3,
    backgroundColor: colors.danger,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeText: { color: colors.textInverse, fontSize: 10, fontWeight: '700' },
})
