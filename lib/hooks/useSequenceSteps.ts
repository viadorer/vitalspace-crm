'use client'

import { useCallback } from 'react'
import useSWR from 'swr'
import type { SequenceStep } from '@/lib/supabase/sequence-types'

const fetcher = (url: string) => fetch(url).then(r => r.json())

export function useSequenceSteps(sequenceId: string | null) {
  const { data, error, isLoading, mutate } = useSWR<SequenceStep[]>(
    sequenceId ? `/api/sequences/${sequenceId}/steps` : null,
    fetcher,
    { revalidateOnFocus: false }
  )

  const saveSteps = useCallback(async (steps: Partial<SequenceStep>[]) => {
    if (!sequenceId) return { error: 'Chybí sequence ID' }
    const res = await fetch(`/api/sequences/${sequenceId}/steps`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ steps }),
    })
    const result = await res.json()
    if (!res.ok) return { error: result.error }
    await mutate()
    return { error: null }
  }, [sequenceId, mutate])

  return {
    steps: data || [],
    loading: isLoading,
    error: error?.message || null,
    saveSteps,
    refetch: () => mutate(),
  }
}
