import { env } from '@/lib/env'

/**
 * Resolve a possibly-relative media path (e.g. "/uploads/avatars/x.jpg")
 * returned by the backend into an absolute URL the app can load. Absolute URLs
 * are returned unchanged.
 */
export function mediaUrl(path?: string | null): string | undefined {
  if (!path) return undefined
  if (/^https?:\/\//i.test(path)) return path
  return `${env.apiBaseUrl}${path.startsWith('/') ? '' : '/'}${path}`
}
