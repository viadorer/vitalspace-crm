'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { Product } from '@/lib/supabase/types'

export function useProducts() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  async function fetchProducts() {
    const supabase = createClient()
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('is_active', true)
        .order('name', { ascending: true })

      if (error) throw error
      setProducts(data || [])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Chyba při načítání produktů')
    } finally {
      setLoading(false)
    }
  }

  async function createProduct(product: Partial<Product>) {
    const supabase = createClient()
    try {
      const { data, error } = await supabase
        .from('products')
        .insert([product])
        .select()
        .single()

      if (error) throw error
      await fetchProducts()
      return { data, error: null }
    } catch (err) {
      return { 
        data: null, 
        error: err instanceof Error ? err.message : 'Chyba při vytváření produktu' 
      }
    }
  }

  async function updateProduct(id: string, updates: Partial<Product>) {
    const supabase = createClient()
    try {
      const { data, error } = await supabase
        .from('products')
        .update(updates)
        .eq('id', id)
        .select()
        .single()

      if (error) throw error
      await fetchProducts()
      return { data, error: null }
    } catch (err) {
      return { 
        data: null, 
        error: err instanceof Error ? err.message : 'Chyba při aktualizaci produktu' 
      }
    }
  }

  useEffect(() => {
    fetchProducts()
  }, [])

  return {
    products,
    loading,
    error,
    refetch: fetchProducts,
    createProduct,
    updateProduct,
  }
}
