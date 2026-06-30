import { act, renderHook, waitFor } from '@testing-library/react-native'

import { useEventPagination } from '@/hooks/useEventPagination'
import type { Event, Paginated } from '@/types/event'

function evt(id: string): Event {
  return {
    id,
    organization_id: 'o1',
    category_id: null,
    title: `Event ${id}`,
    slug: id,
    description: null,
    short_description: null,
    venue_name: null,
    venue_address: null,
    city: null,
    country: null,
    latitude: null,
    longitude: null,
    start_datetime: '2026-07-12T19:00:00',
    end_datetime: '2026-07-12T22:00:00',
    timezone: 'UTC',
    status: 'published',
    is_featured: false,
    max_capacity: null,
    cover_image_url: null,
    tags: [],
    created_at: '2026-01-01T00:00:00',
    updated_at: '2026-01-01T00:00:00',
  }
}

function pageOf(ids: string[], total: number, page: number): Paginated<Event> {
  return {
    items: ids.map(evt),
    total,
    page,
    limit: 20,
    pages: Math.ceil(total / 20),
  }
}

describe('useEventPagination', () => {
  it('loads page 1 then appends subsequent pages', async () => {
    const fetchPage = jest.fn((page: number) =>
      Promise.resolve(
        page === 1 ? pageOf(['a', 'b'], 4, 1) : pageOf(['c', 'd'], 4, 2),
      ),
    )
    const { result } = renderHook(() => useEventPagination(fetchPage, []))

    await waitFor(() => expect(result.current.loading).toBe(false))
    expect(result.current.items.map((e) => e.id)).toEqual(['a', 'b'])

    act(() => result.current.loadMore())
    await waitFor(() =>
      expect(result.current.items.map((e) => e.id)).toEqual([
        'a',
        'b',
        'c',
        'd',
      ]),
    )
  })

  it('de-duplicates overlapping items across pages', async () => {
    const fetchPage = jest.fn((page: number) =>
      Promise.resolve(
        page === 1 ? pageOf(['a', 'b'], 4, 1) : pageOf(['b', 'c'], 4, 2),
      ),
    )
    const { result } = renderHook(() => useEventPagination(fetchPage, []))
    await waitFor(() => expect(result.current.loading).toBe(false))

    act(() => result.current.loadMore())
    await waitFor(() =>
      // 'b' is not duplicated despite appearing on both pages.
      expect(result.current.items.map((e) => e.id)).toEqual(['a', 'b', 'c']),
    )
  })

  it('does not fetch beyond total', async () => {
    const fetchPage = jest.fn(() => Promise.resolve(pageOf(['a', 'b'], 2, 1)))
    const { result } = renderHook(() => useEventPagination(fetchPage, []))
    await waitFor(() => expect(result.current.loading).toBe(false))

    act(() => result.current.loadMore())
    // items.length (2) >= total (2): loadMore is a no-op, only page 1 fetched.
    expect(fetchPage).toHaveBeenCalledTimes(1)
  })

  it('captures errors from the initial load', async () => {
    const fetchPage = jest.fn(() => Promise.reject({ message: 'boom' }))
    const { result } = renderHook(() => useEventPagination(fetchPage, []))
    await waitFor(() => expect(result.current.loading).toBe(false))
    expect(result.current.error).toBe('boom')
  })
})
