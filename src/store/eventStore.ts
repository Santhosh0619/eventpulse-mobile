import { create } from 'zustand'

/**
 * Lightweight client-side event UI state (search query, active filters). Event
 * data itself is fetched per-screen via eventService; this only holds the
 * discovery filters that several screens share. Populated in Phase 4.
 */
export interface EventFilters {
  search: string
  categoryId: string | null
  startDate: string | null
  endDate: string | null
}

interface EventState {
  filters: EventFilters
  setFilters: (patch: Partial<EventFilters>) => void
  resetFilters: () => void
}

const EMPTY_FILTERS: EventFilters = {
  search: '',
  categoryId: null,
  startDate: null,
  endDate: null,
}

export const useEventStore = create<EventState>((set) => ({
  filters: EMPTY_FILTERS,
  setFilters: (patch) => set((s) => ({ filters: { ...s.filters, ...patch } })),
  resetFilters: () => set({ filters: EMPTY_FILTERS }),
}))
