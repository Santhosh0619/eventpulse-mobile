import {
  fireEvent,
  render,
  screen,
  waitFor,
} from '@testing-library/react-native'

import { PreferencesScreen } from '@/screens/profile/PreferencesScreen'
import { eventService } from '@/services/eventService'
import { userService } from '@/services/userService'
import { useAuthStore } from '@/store/authStore'

const mockGoBack = jest.fn()
jest.mock('@react-navigation/native', () => ({
  useNavigation: () => ({ goBack: mockGoBack }),
}))
jest.mock('@/services/eventService', () => ({
  eventService: { listCategories: jest.fn() },
}))
jest.mock('@/services/userService', () => ({
  userService: { updateMyProfile: jest.fn() },
}))

const mockCategories = eventService.listCategories as jest.Mock
const mockUpdate = userService.updateMyProfile as jest.Mock

function category(id: string, name: string) {
  return {
    id,
    name,
    slug: name.toLowerCase(),
    icon: null,
    description: null,
    sort_order: 0,
    is_active: true,
    created_at: '2026-01-01T00:00:00',
  }
}

describe('PreferencesScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    useAuthStore.getState().clear()
  })

  it('saves selected categories and slider values', async () => {
    mockCategories.mockResolvedValue([
      category('c1', 'Music'),
      category('c2', 'Sports'),
    ])
    mockUpdate.mockResolvedValue({})

    render(<PreferencesScreen />)

    fireEvent.press(await screen.findByText('Music'))
    fireEvent.press(screen.getByText('Save preferences'))

    await waitFor(() => expect(mockUpdate).toHaveBeenCalled())
    const payload = mockUpdate.mock.calls[0][0]
    expect(payload.preferences.categories).toContain('c1')
    expect(typeof payload.preferences.radius_km).toBe('number')
    expect(typeof payload.preferences.max_price).toBe('number')
    await waitFor(() => expect(mockGoBack).toHaveBeenCalled())
  })
})
