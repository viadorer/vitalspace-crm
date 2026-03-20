'use client'

import { useState, useEffect, useCallback } from 'react'

/**
 * Like useState, but persists the value to localStorage.
 * SSR-safe: returns defaultValue on server, hydrates from localStorage on client.
 */
export function usePersistedState<T>(key: string, defaultValue: T): [T, (value: T | ((prev: T) => T)) => void] {
  const prefixedKey = `crm_${key}`

  const [state, setState] = useState<T>(() => {
    if (typeof window === 'undefined') return defaultValue
    try {
      const stored = localStorage.getItem(prefixedKey)
      return stored ? JSON.parse(stored) : defaultValue
    } catch {
      return defaultValue
    }
  })

  useEffect(() => {
    try {
      localStorage.setItem(prefixedKey, JSON.stringify(state))
    } catch {
      // localStorage full or unavailable
    }
  }, [prefixedKey, state])

  return [state, setState]
}
