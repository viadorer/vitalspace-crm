'use client'

import { useCallback } from 'react'
import useSWR from 'swr'
import type { ProspectSequenceEnrollment } from '@/lib/supabase/sequence-types'

const fetcher = (url: string) => fetch(url).then(r => r.json())

export function useEnrollments(sequenceId: string | null) {
  const { data, error, isLoading, mutate } = useSWR<ProspectSequenceEnrollment[]>(
    sequenceId ? `/api/sequences/${sequenceId}/enrollments` : null,
    fetcher,
    { revalidateOnFocus: false }
  )

  const enrollProspects = useCallback(async (prospectIds: string[]) => {
    if (!sequenceId) return { error: 'Chybí sequence ID' }
    const res = await fetch(`/api/sequences/${sequenceId}/enrollments`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prospect_ids: prospectIds }),
    })
    const result = await res.json()
    if (!res.ok) return { enrolled: 0, error: result.error }
    await mutate()
    return { enrolled: result.enrolled, error: null }
  }, [sequenceId, mutate])

  const controlEnrollment = useCallback(async (enrollmentId: string, action: 'pause' | 'resume' | 'stop') => {
    if (!sequenceId) return { error: 'Chybí sequence ID' }
    const res = await fetch(`/api/sequences/${sequenceId}/enrollments/${enrollmentId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action }),
    })
    if (!res.ok) {
      const result = await res.json()
      return { error: result.error }
    }
    await mutate()
    return { error: null }
  }, [sequenceId, mutate])

  return {
    enrollments: data || [],
    loading: isLoading,
    error: error?.message || null,
    enrollProspects,
    controlEnrollment,
    refetch: () => mutate(),
  }
}
