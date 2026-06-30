import { fireEvent, render, screen } from '@testing-library/react-native'

import { Button } from '@/components/ui'

describe('Button', () => {
  it('renders its title and fires onPress', () => {
    const onPress = jest.fn()
    render(<Button title="Buy tickets" onPress={onPress} />)

    fireEvent.press(screen.getByText('Buy tickets'))
    expect(onPress).toHaveBeenCalledTimes(1)
  })

  it('does not fire onPress while loading', () => {
    const onPress = jest.fn()
    render(<Button title="Submit" loading onPress={onPress} />)

    // The label is replaced by a spinner while loading.
    expect(screen.queryByText('Submit')).toBeNull()
    expect(onPress).not.toHaveBeenCalled()
  })

  it('is disabled when the disabled prop is set', () => {
    const onPress = jest.fn()
    render(<Button title="Disabled" disabled onPress={onPress} />)

    fireEvent.press(screen.getByText('Disabled'))
    expect(onPress).not.toHaveBeenCalled()
  })
})
