'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { Modal } from '@/components/ui/Modal'
import { Badge } from '@/components/ui/Badge'
import { APP_ROLES } from '@/lib/utils/constants'
import { formatDate, formatDateTime } from '@/lib/utils/format'
import { useUsers } from '@/lib/hooks/useUsers'
import { useCurrentUser } from '@/lib/hooks/useCurrentUser'
import {
  Shield,
  UserPlus,
  Pencil,
  ToggleLeft,
  ToggleRight,
  Search,
} from 'lucide-react'
import type { AppUser, AppRole } from '@/lib/supabase/types'

interface UserFormData {
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

export function UserManagement() {
  const { users, loading, createUser, updateUser, toggleUserActive } = useUsers()
  const { user: currentUser } = useCurrentUser()
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [editingUser, setEditingUser] = useState<AppUser | null>(null)
  const [formData, setFormData] = useState<UserFormData>(EMPTY_FORM)
  const [formError, setFormError] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const [search, setSearch] = useState('')
  const [filterRole, setFilterRole] = useState<string>('')
  const [filterActive, setFilterActive] = useState<string>('')

  const filteredUsers = users.filter((u) => {
    const matchesSearch =
      u.full_name.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase())
    const matchesRole = !filterRole || u.role === filterRole
    const matchesActive =
      filterActive === '' ||
      (filterActive === 'active' && u.is_active) ||
      (filterActive === 'inactive' && !u.is_active)
    return matchesSearch && matchesRole && matchesActive
  })

  function openCreateModal() {
    setFormData(EMPTY_FORM)
    setFormError(null)
    setShowCreateModal(true)
  }

  function openEditModal(user: AppUser) {
    setEditingUser(user)
    setFormData({
      email: user.email,
      password: '',
      full_name: user.full_name,
      role: user.role,
      phone: user.phone || '',
    })
    setFormError(null)
  }

  async function handleCreate() {
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
  }

  async function handleUpdate() {
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
  }

  async function handleToggleActive(user: AppUser) {
    if (user.id === currentUser?.id) return
    await toggleUserActive(user.id, !user.is_active)
  }

  function getRoleInfo(role: AppRole) {
    return APP_ROLES.find((r) => r.value === role)
  }

  if (loading) {
    return <div className="p-8 text-center text-gray-500">Načítání uživatelů...</div>
  }

  return (
    <div className="space-y-6">
      {/* Filtry a akce */}
      <div className="flex flex-wrap items-center gap-4">
        <div className="flex-1 min-w-[200px] relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Hledat uživatele..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <Select
          value={filterRole}
          onChange={(e) => setFilterRole(e.target.value)}
          options={[
            { value: '', label: 'Všechny role' },
            ...APP_ROLES.map((r) => ({ value: r.value, label: r.label })),
          ]}
        />
        <Select
          value={filterActive}
          onChange={(e) => setFilterActive(e.target.value)}
          options={[
            { value: '', label: 'Všichni' },
            { value: 'active', label: 'Aktivní' },
            { value: 'inactive', label: 'Neaktivní' },
          ]}
        />
        <Button onClick={openCreateModal}>
          <UserPlus className="w-4 h-4 mr-2" />
          Nový uživatel
        </Button>
      </div>

      {/* Statistiky */}
      <div className="grid grid-cols-5 gap-4">
        {APP_ROLES.map((role) => {
          const count = users.filter((u) => u.role === role.value).length
          return (
            <div
              key={role.value}
              className="bg-white rounded-lg border border-gray-200 p-4 text-center"
            >
              <div className="text-2xl font-bold" style={{ color: role.color }}>
                {count}
              </div>
              <div className="text-xs text-gray-500 mt-1">{role.label}</div>
            </div>
          )
        })}
      </div>

      {/* Tabulka uživatelů */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Uživatel
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Role
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Stav
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Poslední přihlášení
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Vytvořen
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                Akce
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {filteredUsers.map((user) => {
              const roleInfo = getRoleInfo(user.role)
              const isCurrentUser = user.id === currentUser?.id
              return (
                <tr
                  key={user.id}
                  className={`${!user.is_active ? 'bg-gray-50 opacity-60' : ''} hover:bg-gray-50`}
                >
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-gray-200 flex items-center justify-center text-sm font-medium text-gray-600">
                        {user.full_name
                          .split(' ')
                          .map((n) => n[0])
                          .join('')
                          .toUpperCase()
                          .slice(0, 2)}
                      </div>
                      <div>
                        <div className="font-medium text-gray-900">
                          {user.full_name}
                          {isCurrentUser && (
                            <span className="ml-2 text-xs text-blue-600">(vy)</span>
                          )}
                        </div>
                        <div className="text-sm text-gray-500">{user.email}</div>
                        {user.phone && (
                          <div className="text-xs text-gray-400">{user.phone}</div>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium"
                      style={{
                        backgroundColor: roleInfo?.color + '15',
                        color: roleInfo?.color,
                      }}
                    >
                      <Shield className="w-3 h-3" />
                      {roleInfo?.label}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    {user.is_active ? (
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-700">
                        Aktivní
                      </span>
                    ) : (
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-700">
                        Neaktivní
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    {user.last_login_at ? formatDateTime(user.last_login_at) : '–'}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    {formatDate(user.created_at)}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => openEditModal(user)}
                        className="p-1.5 text-gray-400 hover:text-blue-600 rounded-lg hover:bg-blue-50 transition-colors"
                        title="Upravit"
                      >
                        <Pencil className="w-4 h-4" />
                      </button>
                      {!isCurrentUser && (
                        <button
                          onClick={() => handleToggleActive(user)}
                          className={`p-1.5 rounded-lg transition-colors ${
                            user.is_active
                              ? 'text-gray-400 hover:text-red-600 hover:bg-red-50'
                              : 'text-gray-400 hover:text-green-600 hover:bg-green-50'
                          }`}
                          title={user.is_active ? 'Deaktivovat' : 'Aktivovat'}
                        >
                          {user.is_active ? (
                            <ToggleRight className="w-5 h-5" />
                          ) : (
                            <ToggleLeft className="w-5 h-5" />
                          )}
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              )
            })}
            {filteredUsers.length === 0 && (
              <tr>
                <td colSpan={6} className="px-6 py-8 text-center text-gray-500">
                  Žádní uživatelé
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Modal – Nový uživatel */}
      <Modal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        title="Nový uživatel"
        size="lg"
      >
        <div className="space-y-4">
          <Input
            label="Jméno a příjmení"
            value={formData.full_name}
            onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
            required
          />
          <Input
            label="Email"
            type="email"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            required
          />
          <Input
            label="Heslo"
            type="password"
            value={formData.password}
            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            placeholder="Minimálně 6 znaků"
            required
          />
          <Select
            label="Role"
            value={formData.role}
            onChange={(e) =>
              setFormData({ ...formData, role: e.target.value as AppRole })
            }
            options={APP_ROLES.map((r) => ({ value: r.value, label: r.label }))}
          />
          <Input
            label="Telefon"
            value={formData.phone}
            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
          />

          {formError && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
              {formError}
            </div>
          )}

          <div className="flex justify-end gap-3 pt-4">
            <Button variant="secondary" onClick={() => setShowCreateModal(false)}>
              Zrušit
            </Button>
            <Button onClick={handleCreate} disabled={saving}>
              {saving ? 'Vytváření...' : 'Vytvořit uživatele'}
            </Button>
          </div>
        </div>
      </Modal>

      {/* Modal – Editace uživatele */}
      <Modal
        isOpen={!!editingUser}
        onClose={() => setEditingUser(null)}
        title={`Upravit: ${editingUser?.full_name || ''}`}
        size="lg"
      >
        <div className="space-y-4">
          <Input
            label="Jméno a příjmení"
            value={formData.full_name}
            onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
            required
          />
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <div className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-600">
              {editingUser?.email}
            </div>
          </div>
          <Select
            label="Role"
            value={formData.role}
            onChange={(e) =>
              setFormData({ ...formData, role: e.target.value as AppRole })
            }
            options={APP_ROLES.map((r) => ({ value: r.value, label: r.label }))}
          />
          <Input
            label="Telefon"
            value={formData.phone}
            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
          />

          {formError && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
              {formError}
            </div>
          )}

          <div className="flex justify-end gap-3 pt-4">
            <Button variant="secondary" onClick={() => setEditingUser(null)}>
              Zrušit
            </Button>
            <Button onClick={handleUpdate} disabled={saving}>
              {saving ? 'Ukládání...' : 'Uložit změny'}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
