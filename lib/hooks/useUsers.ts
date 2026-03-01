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
    const supabase = createClient()
    try {
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: userData.email,
        password: userData.password,
        options: {
          data: { full_name: userData.full_name },
        },
      })

      if (authError) throw authError
      if (!authData.user) throw new Error('Uživatel nebyl vytvořen')

      const { error: updateError } = await supabase
        .from('app_users')
        .update({
          full_name: userData.full_name,
          role: userData.role,
          phone: userData.phone || null,
        })
        .eq('id', authData.user.id)

      if (updateError) throw updateError

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
