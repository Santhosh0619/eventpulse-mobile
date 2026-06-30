import type { ComponentType } from 'react'
import type { MapMarkerProps, MapViewProps } from 'react-native-maps'

/**
 * Web / no-native-module fallback for maps. The real implementation lives in
 * `maps.native.ts` (Metro resolves it for iOS/Android). `react-native-maps` has
 * no web build, so this file must NOT import it at runtime — a module-scope
 * import would crash the whole bundle on web. Screens check `mapsAvailable`
 * and render a fallback when maps aren't supported.
 *
 * The `react-native-maps` import here is type-only (erased at compile time), so
 * it never reaches the web bundle.
 */
const Unavailable = (): null => null

export const MapView = Unavailable as unknown as ComponentType<MapViewProps>
export const Marker = Unavailable as unknown as ComponentType<MapMarkerProps>
export const mapsAvailable: boolean = false
