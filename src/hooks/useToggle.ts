import { useState, useCallback } from 'react'

/**
 * Hook to manage a boolean toggle state (useful for show/hide password, modals, etc.)
 */
export function useToggle(initialState: boolean = false): [boolean, () => void, (value: boolean) => void] {
  const [state, setState] = useState(initialState)

  const toggle = useCallback(() => {
    setState((prev) => !prev)
  }, [])

  return [state, toggle, setState]
}
