import { useNavigation } from '@react-navigation/native'
import type { StackNavigationProp } from '@react-navigation/stack'
import { useEffect, useState } from 'react'
import { Alert, StyleSheet, Switch, Text, View } from 'react-native'

import { Avatar, Badge, Button, Card, Screen, Spinner } from '@/components/ui'
import { biometric } from '@/lib/biometric'
import { secureStorage, STORAGE_KEYS } from '@/lib/secureStorage'
import { authService } from '@/services/authService'
import { userService } from '@/services/userService'
import { useAuthStore } from '@/store/authStore'
import type { ProfileStackParamList } from '@/navigation/types'
import { colors, fontSizes, spacing } from '@/theme'

export function ProfileScreen() {
  const navigation =
    useNavigation<StackNavigationProp<ProfileStackParamList, 'ProfileHome'>>()
  const user = useAuthStore((s) => s.user)
  const [loading, setLoading] = useState(!user)
  const [biometricAvailable, setBiometricAvailable] = useState(false)
  const [biometricEnabled, setBiometricEnabled] = useState(false)

  useEffect(() => {
    let ignore = false
    void (async () => {
      try {
        await userService.getMyProfile()
      } catch {
        // The cached user (if any) stays visible; a 401 triggers re-auth.
      } finally {
        if (!ignore) setLoading(false)
      }
    })()
    void biometric.isAvailable().then((v) => {
      if (!ignore) setBiometricAvailable(v)
    })
    void secureStorage.get(STORAGE_KEYS.biometricEnabled).then((v) => {
      if (!ignore) setBiometricEnabled(v === '1')
    })
    return () => {
      ignore = true
    }
  }, [])

  const toggleBiometric = async (next: boolean) => {
    if (next) {
      const ok = await biometric.authenticate('Enable biometric unlock')
      if (!ok) return
      await secureStorage.set(STORAGE_KEYS.biometricEnabled, '1')
      setBiometricEnabled(true)
    } else {
      await secureStorage.remove(STORAGE_KEYS.biometricEnabled)
      setBiometricEnabled(false)
    }
  }

  const confirmLogout = () => {
    Alert.alert('Sign out', 'Are you sure you want to sign out?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Sign out',
        style: 'destructive',
        onPress: () => authService.logout(),
      },
    ])
  }

  if (loading && !user) {
    return <Spinner fullscreen label="Loading profile…" />
  }

  const profile = user?.profile
  const fullName = profile
    ? `${profile.first_name} ${profile.last_name}`.trim()
    : (user?.email ?? '')

  return (
    <Screen scroll>
      <View style={styles.head}>
        <Avatar uri={profile?.avatar_url} name={fullName} size={88} />
        <Text style={styles.name}>{fullName || 'Your profile'}</Text>
        <Text style={styles.email}>{user?.email}</Text>
        <View style={styles.badges}>
          {user?.role ? <Badge label={user.role} tone="primary" /> : null}
          <Badge
            label={user?.is_verified ? 'Verified' : 'Unverified'}
            tone={user?.is_verified ? 'success' : 'warning'}
          />
        </View>
      </View>

      {profile?.bio ? (
        <Card>
          <Text style={styles.sectionLabel}>About</Text>
          <Text style={styles.bio}>{profile.bio}</Text>
        </Card>
      ) : null}

      <Card>
        <Text style={styles.sectionLabel}>Details</Text>
        <Detail label="Phone" value={profile?.phone} />
        <Detail label="City" value={profile?.city} />
        <Detail label="Country" value={profile?.country} />
      </Card>

      {biometricAvailable ? (
        <Card>
          <View style={styles.switchRow}>
            <View style={styles.switchText}>
              <Text style={styles.switchTitle}>Biometric unlock</Text>
              <Text style={styles.switchHint}>
                Require Face ID / fingerprint to open the app.
              </Text>
            </View>
            <Switch
              value={biometricEnabled}
              onValueChange={toggleBiometric}
              trackColor={{ true: colors.primary }}
            />
          </View>
        </Card>
      ) : null}

      <View style={styles.actions}>
        <Button
          title="Edit profile"
          variant="outline"
          onPress={() => navigation.navigate('EditProfile')}
        />
        <Button
          title="My organizations"
          variant="outline"
          onPress={() => navigation.navigate('Organizations')}
        />
        <Button
          title="Staff check-in"
          variant="outline"
          onPress={() => navigation.navigate('QRScanner')}
        />
        <Button title="Sign out" variant="danger" onPress={confirmLogout} />
      </View>
    </Screen>
  )
}

function Detail({ label, value }: { label: string; value?: string | null }) {
  return (
    <View style={styles.detailRow}>
      <Text style={styles.detailLabel}>{label}</Text>
      <Text style={styles.detailValue}>{value || '—'}</Text>
    </View>
  )
}

const styles = StyleSheet.create({
  head: { alignItems: 'center', gap: spacing.sm, marginBottom: spacing.lg },
  name: { fontSize: fontSizes.xl, fontWeight: '700', color: colors.text },
  email: { fontSize: fontSizes.sm, color: colors.textMuted },
  badges: { flexDirection: 'row', gap: spacing.sm, marginTop: spacing.xs },
  sectionLabel: {
    fontSize: fontSizes.sm,
    fontWeight: '700',
    color: colors.textMuted,
    marginBottom: spacing.sm,
    textTransform: 'uppercase',
  },
  bio: { fontSize: fontSizes.md, color: colors.text, lineHeight: 22 },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: spacing.xs,
  },
  detailLabel: { fontSize: fontSizes.md, color: colors.textMuted },
  detailValue: {
    fontSize: fontSizes.md,
    color: colors.text,
    fontWeight: '500',
  },
  switchRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  switchText: { flex: 1 },
  switchTitle: {
    fontSize: fontSizes.md,
    fontWeight: '600',
    color: colors.text,
  },
  switchHint: { fontSize: fontSizes.xs, color: colors.textMuted },
  actions: { gap: spacing.sm, marginTop: spacing.lg },
})
