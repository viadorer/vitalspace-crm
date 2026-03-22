'use client'

import { useCallback } from 'react'
import useSWR from 'swr'
import type { EmailSequence } from '@/lib/supabase/sequence-types'

const fetcher = (url: string) => fetch(url).then(r => r.json())

export function useSequences() {
  const { data, error, isLoading, mutate } = useSWR<EmailSequence[]>(
    '/api/sequences',
    fetcher,
    { revalidateOnFocus: false, dedupingInterval: 5000 }
  )

  const createSequence = useCallback(async (seq: Partial<EmailSequence>) => {
    const res = await fetch('/api/sequences', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(seq),
    })
    const data = await res.json()
    if (!res.ok) return { data: null, error: data.error }
    await mutate()
    return { data, error: null }
  }, [mutate])

  const updateSequence = useCallback(async (id: string, updates: Partial<EmailSequence>) => {
    const res = await fetch(`/api/sequences/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates),
    })
    const data = await res.json()
    if (!res.ok) return { data: null, error: data.error }
    await mutate()
    return { data, error: null }
  }, [mutate])

  const deleteSequence = useCallback(async (id: string) => {
    const res = await fetch(`/api/sequences/${id}`, { method: 'DELETE' })
    if (!res.ok) {
      const data = await res.json()
      return { error: data.error }
    }
    await mutate()
    return { error: null }
  }, [mutate])

  return {
    sequences: data || [],
    loading: isLoading,
    error: error?.message || null,
    createSequence,
    updateSequence,
    deleteSequence,
    refetch: () => mutate(),
  }
}
