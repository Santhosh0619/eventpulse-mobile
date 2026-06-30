import {
  fireEvent,
  render,
  screen,
  waitFor,
} from '@testing-library/react-native'

import { NotificationCenterScreen } from '@/screens/notifications/NotificationCenterScreen'
import { notificationService } from '@/services/notificationService'

jest.mock('@/services/notificationService', () => ({
  notificationService: {
    list: jest.fn(),
    markRead: jest.fn(),
    markAllRead: jest.fn(),
  },
}))

const mockList = notificationService.list as jest.Mock
const mockMarkRead = notificationService.markRead as jest.Mock
const mockMarkAll = notificationService.markAllRead as jest.Mock

function notif(id: string, title: string, isRead: boolean) {
  return {
    id,
    user_id: 'u1',
    type: 'order',
    title,
    message: 'msg',
    data: {},
    channel: 'in_app',
    is_read: isRead,
    read_at: null,
    created_at: '2026-01-01T00:00:00',
  }
}

describe('NotificationCenterScreen', () => {
  beforeEach(() => jest.clearAllMocks())

  it('lists notifications and marks one read on tap', async () => {
    mockList.mockResolvedValue([
      notif('1', 'Order confirmed', false),
      notif('2', 'Welcome', true),
    ])
    mockMarkRead.mockResolvedValue(undefined)

    render(<NotificationCenterScreen />)

    fireEvent.press(await screen.findByText('Order confirmed'))
    await waitFor(() => expect(mockMarkRead).toHaveBeenCalledWith('1'))
  })

  it('marks all read', async () => {
    mockList.mockResolvedValue([notif('1', 'Order confirmed', false)])
    mockMarkAll.mockResolvedValue(undefined)

    render(<NotificationCenterScreen />)

    fireEvent.press(await screen.findByText('Mark all read'))
    await waitFor(() => expect(mockMarkAll).toHaveBeenCalled())
  })
})
