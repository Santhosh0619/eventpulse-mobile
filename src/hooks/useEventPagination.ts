import { useCallback, useEffect, useRef, useState } from 'react'

import type { Event, Paginated } from '@/types/event'

interface PaginationState {
  items: Event[]
  total: number
  loading: boolean
  loadingMore: boolean
  error: string | null
  loadMore: () => void
  reload: () => void
}

/**
 * Infinite-scroll pagination for event lists. `fetchPage` loads a 1-based page;
 * the hook re-runs page 1 whenever `deps` change.
 *
 * Correctness guarantees:
 * - A generation token (bumped on every reset) makes stale in-flight `loadMore`
 *   responses get dropped — so changing filters mid-load can't append
 *   wrong-filter results onto the fresh list.
 * - Appends are de-duplicated by id, preventing duplicate React keys when the
 *   backend returns overlapping items across pages.
 */
export function useEventPagination(
  fetchPage: (page: number) => Promise<Paginated<Event>>,
  deps: readonly unknown[] = [],
): PaginationState {
  const [items, setItems] = useState<Event[]>([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [loading, setLoading] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [nonce, setNonce] = useState(0)
  const genRef = useRef(0)

  const reload = useCallback(() => setNonce((n) => n + 1), [])

  // Load (or reload) page 1 whenever deps change.
  useEffect(() => {
    const gen = ++genRef.current
    setLoading(true)
    setError(null)
    fetchPage(1)
      .then((res) => {
        if (gen !== genRef.current) return
        setItems(res.items)
        setTotal(res.total)
        setPage(1)
      })
      .catch((e) => {
        if (gen === genRef.current) {
          setError((e as { message?: string }).message ?? 'Failed to load')
        }
      })
      .finally(() => {
        if (gen === genRef.current) setLoading(false)
      })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [nonce, ...deps])

  const loadMore = useCallback(() => {
    if (loadingMore || loading || items.length >= total) return
    const gen = genRef.current
    const next = page + 1
    setLoadingMore(true)
    fetchPage(next)
      .then((res) => {
        // Drop the result if a reset (filter change) happened meanwhile.
        if (gen !== genRef.current) return
        setItems((prev) => {
          const seen = new Set(prev.map((e) => e.id))
          return [...prev, ...res.items.filter((e) => !seen.has(e.id))]
        })
        setPage(next)
      })
      .catch(() => {})
      .finally(() => setLoadingMore(false))
  }, [loadingMore, loading, items.length, total, page, fetchPage])

  return { items, total, loading, loadingMore, error, loadMore, reload }
}
