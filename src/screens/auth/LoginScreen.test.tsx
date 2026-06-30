import {
  fireEvent,
  render,
  screen,
  waitFor,
} from '@testing-library/react-native'

import { LoginScreen } from '@/screens/auth/LoginScreen'
import { authService } from '@/services/authService'

const mockNavigate = jest.fn()
jest.mock('@react-navigation/native', () => ({
  useNavigation: () => ({ navigate: mockNavigate, goBack: jest.fn() }),
}))

jest.mock('@/services/authService', () => ({
  authService: { login: jest.fn() },
}))

const mockLogin = authService.login as jest.Mock

describe('LoginScreen', () => {
  beforeEach(() => jest.clearAllMocks())

  it('shows validation errors when submitting empty', async () => {
    render(<LoginScreen />)
    fireEvent.press(screen.getByText('Sign in'))

    expect(await screen.findByText('Email is required')).toBeTruthy()
    expect(screen.getByText('Password is required')).toBeTruthy()
    expect(mockLogin).not.toHaveBeenCalled()
  })

  it('calls authService.login with trimmed credentials on valid submit', async () => {
    mockLogin.mockResolvedValueOnce({})
    render(<LoginScreen />)

    fireEvent.changeText(
      screen.getByPlaceholderText('you@example.com'),
      '  user@example.com  ',
    )
    fireEvent.changeText(
      screen.getByPlaceholderText('Your password'),
      'secret12',
    )
    fireEvent.press(screen.getByText('Sign in'))

    await waitFor(() =>
      expect(mockLogin).toHaveBeenCalledWith('user@example.com', 'secret12'),
    )
  })

  it('surfaces the API error message on failure', async () => {
    mockLogin.mockRejectedValueOnce({
      status: 401,
      message: 'Invalid credentials',
    })
    render(<LoginScreen />)

    fireEvent.changeText(
      screen.getByPlaceholderText('you@example.com'),
      'user@example.com',
    )
    fireEvent.changeText(
      screen.getByPlaceholderText('Your password'),
      'secret12',
    )
    fireEvent.press(screen.getByText('Sign in'))

    expect(await screen.findByText('Invalid credentials')).toBeTruthy()
  })

  it('navigates to Register and ForgotPassword', () => {
    render(<LoginScreen />)
    fireEvent.press(screen.getByText('Create an account'))
    expect(mockNavigate).toHaveBeenCalledWith('Register')
    fireEvent.press(screen.getByText('Forgot password?'))
    expect(mockNavigate).toHaveBeenCalledWith('ForgotPassword')
  })
})
