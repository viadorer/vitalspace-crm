'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { CrmDocument, DocumentCategory } from '@/lib/supabase/types'

export function useDocuments(categoryFilter?: DocumentCategory) {
  const [documents, setDocuments] = useState<CrmDocument[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  async function fetchDocuments() {
    try {
      setLoading(true)
      const supabase = createClient()

      let query = supabase
        .from('documents')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: false })

      if (categoryFilter) {
        query = query.eq('category', categoryFilter)
      }

      const { data, error: fetchError } = await query
      if (fetchError) throw fetchError
      setDocuments(data || [])
      setError(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Chyba při načítání dokumentů')
    } finally {
      setLoading(false)
    }
  }

  async function uploadDocument(
    file: File,
    meta: {
      title: string
      description?: string
      category: DocumentCategory
      tags?: string[]
      page_count?: number
    }
  ): Promise<{ data: CrmDocument | null; error: string | null }> {
    try {
      const supabase = createClient()

      const timestamp = Date.now()
      const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_')
      const storagePath = `${meta.category}/${timestamp}_${safeName}`

      const { error: uploadError } = await supabase.storage
        .from('documents')
        .upload(storagePath, file, {
          cacheControl: '3600',
          upsert: false,
        })

      if (uploadError) throw uploadError

      const { data: urlData } = supabase.storage
        .from('documents')
        .getPublicUrl(storagePath)

      const { data, error: insertError } = await supabase
        .from('documents')
        .insert({
          title: meta.title,
          description: meta.description || null,
          category: meta.category,
          file_name: file.name,
          file_path: storagePath,
          file_size: file.size,
          mime_type: file.type || 'application/pdf',
          page_count: meta.page_count || null,
          tags: meta.tags || [],
          uploaded_by: null,
        })
        .select()
        .single()

      if (insertError) throw insertError

      setDocuments(prev => [data, ...prev])
      return { data, error: null }
    } catch (err) {
      return { data: null, error: err instanceof Error ? err.message : 'Chyba při nahrávání dokumentu' }
    }
  }

  async function updateDocument(
    id: string,
    updates: Partial<Pick<CrmDocument, 'title' | 'description' | 'category' | 'tags' | 'page_count'>>
  ): Promise<{ data: CrmDocument | null; error: string | null }> {
    try {
      const supabase = createClient()
      const { data, error: updateError } = await supabase
        .from('documents')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single()

      if (updateError) throw updateError
      setDocuments(prev => prev.map(d => d.id === id ? data : d))
      return { data, error: null }
    } catch (err) {
      return { data: null, error: err instanceof Error ? err.message : 'Chyba při aktualizaci dokumentu' }
    }
  }

  async function deleteDocument(id: string): Promise<{ error: string | null }> {
    try {
      const supabase = createClient()
      const doc = documents.find(d => d.id === id)

      if (doc) {
        await supabase.storage.from('documents').remove([doc.file_path])
      }

      const { error: deleteError } = await supabase
        .from('documents')
        .delete()
        .eq('id', id)

      if (deleteError) throw deleteError
      setDocuments(prev => prev.filter(d => d.id !== id))
      return { error: null }
    } catch (err) {
      return { error: err instanceof Error ? err.message : 'Chyba při mazání dokumentu' }
    }
  }

  function getPublicUrl(filePath: string): string {
    const supabase = createClient()
    const { data } = supabase.storage.from('documents').getPublicUrl(filePath)
    return data.publicUrl
  }

  useEffect(() => {
    fetchDocuments()
  }, [categoryFilter])

  return {
    documents,
    loading,
    error,
    uploadDocument,
    updateDocument,
    deleteDocument,
    getPublicUrl,
    refetch: fetchDocuments,
  }
}
