import { useCallback, useEffect, useState } from 'react'

import type { ApiError } from '@/services/api'

interface AsyncState<T> {
  data: T | null
  loading: boolean
  error: ApiError | null
  /** Re-run the async function (e.g. pull-to-refresh / retry). */
  reload: () => void
}

/**
 * Run an async function on mount and expose its {data, loading, error} plus a
 * `reload`. Guards against setState-after-unmount and ignores stale results
 * when `reload` is called while a previous run is in flight.
 *
 * `deps` controls re-execution like a useEffect dependency array.
 */
export function useAsync<T>(
  fn: () => Promise<T>,
  deps: readonly unknown[] = [],
): AsyncState<T> {
  const [data, setData] = useState<T | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<ApiError | null>(null)
  const [nonce, setNonce] = useState(0)

  const reload = useCallback(() => setNonce((n) => n + 1), [])

  useEffect(() => {
    let ignore = false
    setLoading(true)
    setError(null)
    fn()
      .then((result) => {
        if (!ignore) setData(result)
      })
      .catch((e) => {
        if (!ignore) setError(e as ApiError)
      })
      .finally(() => {
        if (!ignore) setLoading(false)
      })
    return () => {
      ignore = true
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [nonce, ...deps])

  return { data, loading, error, reload }
}
