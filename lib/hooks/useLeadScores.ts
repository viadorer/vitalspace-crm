'use client'

import { useCallback } from 'react'
import useSWR from 'swr'
import type { LeadScore } from '@/lib/supabase/sequence-types'

const fetcher = (url: string) => fetch(url).then(r => r.json())

export function useLeadScores(category?: 'hot' | 'warm' | 'cold') {
  const url = category
    ? `/api/lead-scores?category=${category}&limit=50`
    : '/api/lead-scores?limit=50'

  const { data, error, isLoading, mutate } = useSWR<LeadScore[]>(
    url,
    fetcher,
    { revalidateOnFocus: false, dedupingInterval: 10000 }
  )

  const triggerRecompute = useCallback(async () => {
    const res = await fetch('/api/lead-scores', { method: 'POST' })
    const result = await res.json()
    await mutate()
    return result
  }, [mutate])

  return {
    scores: data || [],
    loading: isLoading,
    error: error?.message || null,
    triggerRecompute,
    refetch: () => mutate(),
  }
}
