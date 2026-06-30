import { fireEvent, render, screen } from '@testing-library/react-native'

import { EventCard } from '@/components/events/EventCard'
import type { Event } from '@/types/event'

const EVENT: Event = {
  id: 'e1',
  organization_id: 'o1',
  category_id: null,
  title: 'Jazz Night',
  slug: 'jazz-night',
  description: null,
  short_description: null,
  venue_name: 'Blue Room',
  venue_address: null,
  city: 'London',
  country: null,
  latitude: null,
  longitude: null,
  start_datetime: '2026-07-12T19:00:00',
  end_datetime: '2026-07-12T22:00:00',
  timezone: 'UTC',
  status: 'published',
  is_featured: true,
  max_capacity: null,
  cover_image_url: null,
  tags: [],
  created_at: '2026-01-01T00:00:00',
  updated_at: '2026-01-01T00:00:00',
}

describe('EventCard', () => {
  it('renders the title and location and fires onPress with the event', () => {
    const onPress = jest.fn()
    render(<EventCard event={EVENT} onPress={onPress} />)

    expect(screen.getByText('Jazz Night')).toBeTruthy()
    expect(screen.getByText('Blue Room, London')).toBeTruthy()
    expect(screen.getByText('Featured')).toBeTruthy()

    fireEvent.press(screen.getByText('Jazz Night'))
    expect(onPress).toHaveBeenCalledWith(EVENT)
  })
})
