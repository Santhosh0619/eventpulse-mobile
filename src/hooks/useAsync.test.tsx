import { act, renderHook, waitFor } from '@testing-library/react-native'

import { useAsync } from '@/hooks/useAsync'

describe('useAsync', () => {
  it('resolves data and clears loading', async () => {
    const fn = jest.fn().mockResolvedValue('hello')
    const { result } = renderHook(() => useAsync(fn, []))

    expect(result.current.loading).toBe(true)
    await waitFor(() => expect(result.current.loading).toBe(false))
    expect(result.current.data).toBe('hello')
    expect(result.current.error).toBeNull()
  })

  it('captures errors', async () => {
    const fn = jest.fn().mockRejectedValue({ status: 500, message: 'boom' })
    const { result } = renderHook(() => useAsync(fn, []))

    await waitFor(() => expect(result.current.loading).toBe(false))
    expect(result.current.error).toEqual({ status: 500, message: 'boom' })
    expect(result.current.data).toBeNull()
  })

  it('reload re-runs the async function', async () => {
    const fn = jest.fn().mockResolvedValue('v')
    const { result } = renderHook(() => useAsync(fn, []))

    await waitFor(() => expect(result.current.loading).toBe(false))
    expect(fn).toHaveBeenCalledTimes(1)

    act(() => result.current.reload())
    await waitFor(() => expect(fn).toHaveBeenCalledTimes(2))
  })
})
