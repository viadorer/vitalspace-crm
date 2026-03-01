'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { CompanySegment } from '@/lib/supabase/types'

export function useSegments() {
  const [segments, setSegments] = useState<CompanySegment[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  async function fetchSegments() {
    try {
      setLoading(true)
      const supabase = createClient()
      const { data, error: fetchError } = await supabase
        .from('company_segments')
        .select('*')
        .order('name')

      if (fetchError) throw fetchError
      setSegments(data || [])
      setError(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Chyba při načítání segmentů')
    } finally {
      setLoading(false)
    }
  }

  async function createSegment(segment: Partial<CompanySegment>) {
    try {
      const supabase = createClient()
      const { data, error: insertError } = await supabase
        .from('company_segments')
        .insert(segment)
        .select()
        .single()

      if (insertError) throw insertError
      setSegments(prev => [...prev, data].sort((a, b) => a.name.localeCompare(b.name)))
      return { data, error: null }
    } catch (err) {
      return { data: null, error: err instanceof Error ? err.message : 'Chyba při vytváření segmentu' }
    }
  }

  async function updateSegment(id: string, updates: Partial<CompanySegment>) {
    try {
      const supabase = createClient()
      const { data, error: updateError } = await supabase
        .from('company_segments')
        .update(updates)
        .eq('id', id)
        .select()
        .single()

      if (updateError) throw updateError
      setSegments(prev => prev.map(s => s.id === id ? data : s))
      return { data, error: null }
    } catch (err) {
      return { data: null, error: err instanceof Error ? err.message : 'Chyba při aktualizaci segmentu' }
    }
  }

  async function deleteSegment(id: string) {
    try {
      const supabase = createClient()
      const { error: deleteError } = await supabase
        .from('company_segments')
        .delete()
        .eq('id', id)

      if (deleteError) throw deleteError
      setSegments(prev => prev.filter(s => s.id !== id))
      return { error: null }
    } catch (err) {
      return { error: err instanceof Error ? err.message : 'Chyba při mazání segmentu' }
    }
  }

  useEffect(() => {
    fetchSegments()
  }, [])

  return {
    segments,
    loading,
    error,
    createSegment,
    updateSegment,
    deleteSegment,
    refetch: fetchSegments,
  }
}
