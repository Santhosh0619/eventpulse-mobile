import { Image } from 'expo-image'
import { StyleSheet, Text, View } from 'react-native'

import { mediaUrl } from '@/lib/media'
import { colors, fontSizes } from '@/theme'

interface AvatarProps {
  uri?: string | null
  name?: string
  size?: number
}

/** Circular avatar that falls back to the user's initials when no image is set. */
export function Avatar({ uri, name, size = 64 }: AvatarProps) {
  const resolved = mediaUrl(uri)
  const initials = (name ?? '')
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase())
    .join('')

  const dimension = { width: size, height: size, borderRadius: size / 2 }

  if (resolved) {
    return (
      <Image
        source={{ uri: resolved }}
        style={[styles.image, dimension]}
        contentFit="cover"
        transition={150}
      />
    )
  }

  return (
    <View style={[styles.fallback, dimension]}>
      <Text style={[styles.initials, { fontSize: size * 0.4 }]}>
        {initials || '?'}
      </Text>
    </View>
  )
}

const styles = StyleSheet.create({
  image: { backgroundColor: colors.surfaceAlt },
  fallback: {
    backgroundColor: colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  initials: {
    color: colors.primaryDark,
    fontWeight: '700',
    fontSize: fontSizes.lg,
  },
})
