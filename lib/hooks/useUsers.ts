'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { AppUser, AppRole } from '@/lib/supabase/types'

interface CreateUserData {
  email: string
  password: string
  full_name: string
  role: AppRole
  phone?: string
}

interface UpdateUserData {
  full_name?: string
  role?: AppRole
  permissions?: string[]
  is_active?: boolean
  phone?: string
}

export function useUsers() {
  const [users, setUsers] = useState<AppUser[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  async function fetchUsers() {
    const supabase = createClient()
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('app_users')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error
      setUsers(data as AppUser[])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Chyba při načítání uživatelů')
    } finally {
      setLoading(false)
    }
  }

  async function createUser(userData: CreateUserData) {
    try {
      const res = await fetch('/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData),
      })

      const result = await res.json()
      if (!res.ok) throw new Error(result.error || 'Chyba při vytváření uživatele')

      await fetchUsers()
      return { error: null }
    } catch (err) {
      return {
        error: err instanceof Error ? err.message : 'Chyba při vytváření uživatele',
      }
    }
  }

  async function updateUser(id: string, updates: UpdateUserData) {
    const supabase = createClient()
    try {
      const { error } = await supabase
        .from('app_users')
        .update(updates)
        .eq('id', id)

      if (error) throw error
      await fetchUsers()
      return { error: null }
    } catch (err) {
      return {
        error: err instanceof Error ? err.message : 'Chyba při aktualizaci uživatele',
      }
    }
  }

  async function toggleUserActive(id: string, isActive: boolean) {
    return updateUser(id, { is_active: isActive })
  }

  useEffect(() => {
    fetchUsers()
  }, [])

  return {
    users,
    loading,
    error,
    createUser,
    updateUser,
    toggleUserActive,
    refetch: fetchUsers,
  }
}
