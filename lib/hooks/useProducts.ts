'use client'

import { useCallback } from 'react'
import useSWR from 'swr'
import { createClient } from '@/lib/supabase/client'
import type { Product } from '@/lib/supabase/types'

async function fetchProducts(): Promise<Product[]> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .eq('is_active', true)
    .order('name', { ascending: true })

  if (error) throw error
  return (data || []) as Product[]
}

export function useProducts() {
  const { data: products, error: swrError, isLoading, mutate } = useSWR<Product[]>(
    'products:active',
    fetchProducts,
    { revalidateOnFocus: false, dedupingInterval: 10000 }
  )

  const createProduct = useCallback(async (product: Partial<Product>) => {
    const supabase = createClient()
    try {
      const { data, error } = await supabase
        .from('products')
        .insert([product])
        .select()
        .single()

      if (error) throw error
      await mutate()
      return { data, error: null }
    } catch (err) {
      return {
        data: null,
        error: err instanceof Error ? err.message : 'Chyba při vytváření produktu',
      }
    }
  }, [mutate])

  const updateProduct = useCallback(async (id: string, updates: Partial<Product>) => {
    const supabase = createClient()
    try {
      const { data, error } = await supabase
        .from('products')
        .update(updates)
        .eq('id', id)
        .select()
        .single()

      if (error) throw error
      await mutate()
      return { data, error: null }
    } catch (err) {
      return {
        data: null,
        error: err instanceof Error ? err.message : 'Chyba při aktualizaci produktu',
      }
    }
  }, [mutate])

  return {
    products: products || [],
    loading: isLoading,
    error: swrError ? (swrError instanceof Error ? swrError.message : 'Chyba při načítání produktů') : null,
    refetch: () => mutate(),
    createProduct,
    updateProduct,
  }
}
