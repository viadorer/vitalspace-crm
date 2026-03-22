'use client'

import { useCallback, useRef } from 'react'
import useSWR from 'swr'
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

async function supabaseFetcher<T>(table: string, select: string, orderBy?: string, orderAscending?: boolean): Promise<T[]> {
  const supabase = createClient()
  let query = supabase.from(table).select(select)

  if (orderBy) {
    query = query.order(orderBy, { ascending: orderAscending ?? false })
  }

  const { data, error } = await query
  if (error) throw error
  return (data as unknown as T[]) || []
}

export function useCrudResource<T extends { id: string }>(config: CrudConfig<T>): CrudResult<T> {
  const msgs = { ...DEFAULT_MESSAGES, ...config.errorMessages }
  const configRef = useRef(config)
  configRef.current = config

  const swrKey = `crud:${config.table}:${config.select}:${config.orderBy || ''}:${config.orderAscending ?? false}`

  const { data: items, error: swrError, isLoading, mutate } = useSWR<T[]>(
    swrKey,
    () => supabaseFetcher<T>(
      configRef.current.table,
      configRef.current.select,
      configRef.current.orderBy,
      configRef.current.orderAscending
    ),
    {
      revalidateOnFocus: false,
      dedupingInterval: 5000,
    }
  )

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
      // Revalidate to get relations
      await mutate()
      return { data: data as T, error: null }
    } catch (err) {
      return { data: null, error: extractError(err, msgs.create) }
    }
  }, [mutate, msgs.create])

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
      // Revalidate to get relations
      await mutate()
      return { data: data as T, error: null }
    } catch (err) {
      return { data: null, error: extractError(err, msgs.update) }
    }
  }, [mutate, msgs.update])

  const remove = useCallback(async (id: string) => {
    const supabase = createClient()
    try {
      const { error: deleteError } = await supabase
        .from(configRef.current.table)
        .delete()
        .eq('id', id)

      if (deleteError) throw deleteError
      // Optimistic update: remove from local cache
      await mutate(
        (current) => current?.filter(item => item.id !== id),
        { revalidate: false }
      )
      return { error: null }
    } catch (err) {
      return { error: extractError(err, msgs.delete) }
    }
  }, [mutate, msgs.delete])

  const refetch = useCallback(async () => {
    await mutate()
  }, [mutate])

  // setItems compat — mutate local cache without revalidation
  const setItems = useCallback(((updater: T[] | ((prev: T[]) => T[])) => {
    mutate(
      (current) => {
        if (typeof updater === 'function') {
          return (updater as (prev: T[]) => T[])(current || [])
        }
        return updater
      },
      { revalidate: false }
    )
  }) as React.Dispatch<React.SetStateAction<T[]>>, [mutate])

  return {
    items: items || [],
    loading: isLoading,
    error: swrError ? extractError(swrError, msgs.fetch) : null,
    create,
    update,
    remove,
    refetch,
    setItems,
  }
}
