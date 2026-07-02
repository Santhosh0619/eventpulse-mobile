import { Ionicons } from '@expo/vector-icons'
import { useNavigation } from '@react-navigation/native'
import type { StackNavigationProp } from '@react-navigation/stack'
import { CameraView, useCameraPermissions } from 'expo-camera'
import * as Haptics from 'expo-haptics'
import { useRef, useState } from 'react'
import { StyleSheet, Text, View } from 'react-native'

import { Button, Screen, Spinner } from '@/components/ui'
import type { ApiError } from '@/services/api'
import { attendeeService } from '@/services/attendeeService'
import type { CheckInResponse } from '@/types/attendee'
import type { ProfileStackParamList } from '@/navigation/types'
import { colors, fontSizes, radii, spacing } from '@/theme'

type ScanResult = {
  ok: boolean
  message: string
  name?: string
  eventId?: string
}

export function QRScannerScreen() {
  const navigation =
    useNavigation<StackNavigationProp<ProfileStackParamList, 'QRScanner'>>()
  const [permission, requestPermission] = useCameraPermissions()
  const [result, setResult] = useState<ScanResult | null>(null)
  // Prevent the camera from firing the same code dozens of times per second.
  const busy = useRef(false)

  const handleScan = async ({ data }: { data: string }) => {
    if (busy.current || result) return
    busy.current = true
    try {
      const res: CheckInResponse = await attendeeService.checkIn(data)
      const name = res.attendee
        ? `${res.attendee.first_name} ${res.attendee.last_name}`.trim()
        : undefined
      await Haptics.notificationAsync(
        res.already_checked_in
          ? Haptics.NotificationFeedbackType.Warning
          : Haptics.NotificationFeedbackType.Success,
      )
      setResult({
        ok: true,
        message: res.already_checked_in ? 'Already checked in' : 'Checked in!',
        name,
        eventId: res.attendee?.event_id,
      })
    } catch (e) {
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error)
      setResult({
        ok: false,
        message: (e as ApiError).message ?? 'Invalid ticket',
      })
    }
  }

  const scanNext = () => {
    setResult(null)
    busy.current = false
  }

  if (!permission) {
    return <Spinner fullscreen label="Loading camera…" />
  }
  if (!permission.granted) {
    return (
      <Screen>
        <View style={styles.center}>
          <Ionicons name="camera-outline" size={64} color={colors.textMuted} />
          <Text style={styles.title}>Camera access needed</Text>
          <Text style={styles.body}>
            Allow camera access to scan attendee ticket QR codes.
          </Text>
          <Button title="Grant access" onPress={requestPermission} />
        </View>
      </Screen>
    )
  }

  return (
    <View style={styles.flex}>
      <CameraView
        style={StyleSheet.absoluteFill}
        facing="back"
        barcodeScannerSettings={{ barcodeTypes: ['qr'] }}
        onBarcodeScanned={result ? undefined : handleScan}
      />

      {!result ? (
        <View style={styles.overlay} pointerEvents="none">
          <View style={styles.reticle} />
          <Text style={styles.scanHint}>Point at a ticket QR code</Text>
        </View>
      ) : (
        <View style={styles.resultSheet}>
          <Ionicons
            name={result.ok ? 'checkmark-circle' : 'close-circle'}
            size={56}
            color={result.ok ? colors.success : colors.danger}
          />
          <Text style={styles.resultMsg}>{result.message}</Text>
          {result.name ? (
            <Text style={styles.resultName}>{result.name}</Text>
          ) : null}
          <Button title="Scan next" onPress={scanNext} />
          {result.eventId ? (
            <Button
              title="View dashboard"
              variant="outline"
              onPress={() =>
                navigation.navigate('CheckInDashboard', {
                  eventId: result.eventId as string,
                })
              }
            />
          ) : null}
        </View>
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: colors.black },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.md,
  },
  title: { fontSize: fontSizes.xl, fontWeight: '700', color: colors.text },
  body: {
    fontSize: fontSizes.md,
    color: colors.textMuted,
    textAlign: 'center',
    paddingHorizontal: spacing.lg,
  },
  overlay: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.lg,
  },
  reticle: {
    width: 240,
    height: 240,
    borderWidth: 3,
    borderColor: colors.textInverse,
    borderRadius: radii.lg,
    backgroundColor: 'transparent',
  },
  scanHint: {
    color: colors.textInverse,
    fontSize: fontSizes.md,
    fontWeight: '600',
  },
  resultSheet: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: colors.background,
    padding: spacing.xl,
    borderTopLeftRadius: radii.xl,
    borderTopRightRadius: radii.xl,
    alignItems: 'center',
    gap: spacing.md,
  },
  resultMsg: { fontSize: fontSizes.xl, fontWeight: '700', color: colors.text },
  resultName: { fontSize: fontSizes.md, color: colors.textMuted },
})
