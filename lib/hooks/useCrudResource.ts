'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'
import { cleanNullableFields } from '@/lib/utils/clean-fields'

interface CrudConfig<T> {
  table: string
  select: string
  orderBy?: string
  orderAscending?: boolean
  /** Fields that should be converted from '' to null before insert/update */
  nullableFields?: (keyof T)[]
  errorMessages?: {
    fetch?: string
    create?: string
    update?: string
    delete?: string
  }
}

interface CrudResult<T> {
  items: T[]
  loading: boolean
  error: string | null
  create: (item: Partial<T>) => Promise<{ data: T | null; error: string | null }>
  update: (id: string, updates: Partial<T>) => Promise<{ data: T | null; error: string | null }>
  remove: (id: string) => Promise<{ error: string | null }>
  refetch: () => Promise<void>
  setItems: React.Dispatch<React.SetStateAction<T[]>>
}

const DEFAULT_MESSAGES = {
  fetch: 'Chyba při načítání dat',
  create: 'Chyba při vytváření záznamu',
  update: 'Chyba při aktualizaci záznamu',
  delete: 'Chyba při mazání záznamu',
}

function extractError(err: unknown, fallback: string): string {
  return err instanceof Error ? err.message : fallback
}

export function useCrudResource<T extends { id: string }>(config: CrudConfig<T>): CrudResult<T> {
  const [items, setItems] = useState<T[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const msgs = { ...DEFAULT_MESSAGES, ...config.errorMessages }
  const configRef = useRef(config)
  configRef.current = config

  const fetchItems = useCallback(async () => {
    const supabase = createClient()
    try {
      setLoading(true)
      let query = supabase
        .from(configRef.current.table)
        .select(configRef.current.select)

      if (configRef.current.orderBy) {
        query = query.order(configRef.current.orderBy, {
          ascending: configRef.current.orderAscending ?? false,
        })
      }

      const { data, error: fetchError } = await query

      if (fetchError) throw fetchError
      setItems((data as unknown as T[]) || [])
      setError(null)
    } catch (err) {
      setError(extractError(err, msgs.fetch))
    } finally {
      setLoading(false)
    }
  }, [msgs.fetch])

  const create = useCallback(async (item: Partial<T>) => {
    const supabase = createClient()
    try {
      const cleaned = configRef.current.nullableFields
        ? cleanNullableFields(item, configRef.current.nullableFields)
        : item

      const { data, error: createError } = await supabase
        .from(configRef.current.table)
        .insert([cleaned])
        .select()
        .single()

      if (createError) throw createError
      // Refetch to get relations
      await fetchItems()
      return { data: data as T, error: null }
    } catch (err) {
      return { data: null, error: extractError(err, msgs.create) }
    }
  }, [fetchItems, msgs.create])

  const update = useCallback(async (id: string, updates: Partial<T>) => {
    const supabase = createClient()
    try {
      const cleaned = configRef.current.nullableFields
        ? cleanNullableFields(updates, configRef.current.nullableFields)
        : updates

      const { data, error: updateError } = await supabase
        .from(configRef.current.table)
        .update(cleaned)
        .eq('id', id)
        .select()
        .single()

      if (updateError) throw updateError
      // Refetch to get relations
      await fetchItems()
      return { data: data as T, error: null }
    } catch (err) {
      return { data: null, error: extractError(err, msgs.update) }
    }
  }, [fetchItems, msgs.update])

  const remove = useCallback(async (id: string) => {
    const supabase = createClient()
    try {
      const { error: deleteError } = await supabase
        .from(configRef.current.table)
        .delete()
        .eq('id', id)

      if (deleteError) throw deleteError
      setItems(prev => prev.filter(item => item.id !== id))
      return { error: null }
    } catch (err) {
      return { error: extractError(err, msgs.delete) }
    }
  }, [msgs.delete])

  useEffect(() => {
    fetchItems()
  }, [fetchItems])

  return {
    items,
    loading,
    error,
    create,
    update,
    remove,
    refetch: fetchItems,
    setItems,
  }
}
