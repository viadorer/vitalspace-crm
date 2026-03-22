'use client'

import { useState, useCallback } from 'react'
import type { AppUser, AppRole } from '@/lib/supabase/types'

export interface UserFormData {
  email: string
  password: string
  full_name: string
  role: AppRole
  phone: string
}

const EMPTY_FORM: UserFormData = {
  email: '',
  password: '',
  full_name: '',
  role: 'consultant',
  phone: '',
}

interface UseUserFormOptions {
  createUser: (data: { email: string; password: string; full_name: string; role: AppRole; phone?: string }) => Promise<{ error: string | null }>
  updateUser: (id: string, data: { full_name: string; role: AppRole; phone?: string }) => Promise<{ error: string | null }>
}

export function useUserForm({ createUser, updateUser }: UseUserFormOptions) {
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [editingUser, setEditingUser] = useState<AppUser | null>(null)
  const [formData, setFormData] = useState<UserFormData>(EMPTY_FORM)
  const [formError, setFormError] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)

  const openCreateModal = useCallback(() => {
    setFormData(EMPTY_FORM)
    setFormError(null)
    setShowCreateModal(true)
  }, [])

  const openEditModal = useCallback((user: AppUser) => {
    setEditingUser(user)
    setFormData({
      email: user.email,
      password: '',
      full_name: user.full_name,
      role: user.role,
      phone: user.phone || '',
    })
    setFormError(null)
  }, [])

  const closeCreateModal = useCallback(() => setShowCreateModal(false), [])
  const closeEditModal = useCallback(() => setEditingUser(null), [])

  const updateField = useCallback(<K extends keyof UserFormData>(key: K, value: UserFormData[K]) => {
    setFormData(prev => ({ ...prev, [key]: value }))
  }, [])

  const handleCreate = useCallback(async () => {
    if (!formData.email || !formData.password || !formData.full_name) {
      setFormError('Vyplňte email, heslo a jméno')
      return
    }
    if (formData.password.length < 6) {
      setFormError('Heslo musí mít alespoň 6 znaků')
      return
    }

    setSaving(true)
    const result = await createUser({
      email: formData.email,
      password: formData.password,
      full_name: formData.full_name,
      role: formData.role,
      phone: formData.phone || undefined,
    })

    if (result.error) {
      setFormError(result.error)
    } else {
      setShowCreateModal(false)
    }
    setSaving(false)
  }, [formData, createUser])

  const handleUpdate = useCallback(async () => {
    if (!editingUser) return
    if (!formData.full_name) {
      setFormError('Jméno je povinné')
      return
    }

    setSaving(true)
    const result = await updateUser(editingUser.id, {
      full_name: formData.full_name,
      role: formData.role,
      phone: formData.phone || undefined,
    })

    if (result.error) {
      setFormError(result.error)
    } else {
      setEditingUser(null)
    }
    setSaving(false)
  }, [editingUser, formData, updateUser])

  return {
    showCreateModal,
    editingUser,
    formData,
    formError,
    saving,
    openCreateModal,
    openEditModal,
    closeCreateModal,
    closeEditModal,
    updateField,
    handleCreate,
    handleUpdate,
  }
}
