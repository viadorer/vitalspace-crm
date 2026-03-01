'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { AppUser, AppRole } from '@/lib/supabase/types'

export function useCurrentUser() {
  const [user, setUser] = useState<AppUser | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchCurrentUser() {
      const supabase = createClient()
      const { data: { user: authUser } } = await supabase.auth.getUser()

      if (!authUser) {
        setLoading(false)
        return
      }

      const { data } = await supabase
        .from('app_users')
        .select('*')
        .eq('id', authUser.id)
        .single()

      if (data) {
        setUser(data as AppUser)
      }
      setLoading(false)
    }

    fetchCurrentUser()
  }, [])

  function hasRole(...roles: AppRole[]): boolean {
    if (!user) return false
    return roles.includes(user.role)
  }

  function isSuperAdmin(): boolean {
    return hasRole('superadmin')
  }

  function canManageUsers(): boolean {
    return hasRole('superadmin')
  }

  function canWrite(): boolean {
    return hasRole('superadmin', 'admin', 'consultant')
  }

  function canRead(): boolean {
    return user !== null && user.is_active
  }

  return {
    user,
    loading,
    hasRole,
    isSuperAdmin,
    canManageUsers,
    canWrite,
    canRead,
  }
}
