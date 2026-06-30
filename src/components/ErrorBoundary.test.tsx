import { render, screen } from '@testing-library/react-native'
import { Text } from 'react-native'

import { ErrorBoundary } from '@/components/ErrorBoundary'

function Boom(): never {
  throw new Error('kaboom')
}

describe('ErrorBoundary', () => {
  it('renders children when there is no error', () => {
    render(
      <ErrorBoundary>
        <Text>All good</Text>
      </ErrorBoundary>,
    )
    expect(screen.getByText('All good')).toBeTruthy()
  })

  it('renders a fallback when a child throws', () => {
    // Silence the expected React error log for this render.
    const spy = jest.spyOn(console, 'error').mockImplementation(() => {})
    render(
      <ErrorBoundary>
        <Boom />
      </ErrorBoundary>,
    )
    expect(screen.getByText('Something went wrong')).toBeTruthy()
    expect(screen.getByText('Try again')).toBeTruthy()
    spy.mockRestore()
  })
})
