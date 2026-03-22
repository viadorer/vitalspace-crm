'use client'

import { usePersistedState } from '@/lib/hooks/usePersistedState'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { Modal } from '@/components/ui/Modal'
import { APP_ROLES } from '@/lib/utils/constants'
import { formatDate, formatDateTime } from '@/lib/utils/format'
import { useUsers } from '@/lib/hooks/useUsers'
import { useCurrentUser } from '@/lib/hooks/useCurrentUser'
import { useUserForm } from '@/lib/hooks/useUserForm'
import {
  Shield,
  UserPlus,
  Pencil,
  ToggleLeft,
  ToggleRight,
  Search,
} from 'lucide-react'
import type { AppUser, AppRole } from '@/lib/supabase/types'

function UserRoleStats({ users }: { users: AppUser[] }) {
  return (
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
  )
}

function UserRow({
  user,
  isCurrentUser,
  onEdit,
  onToggleActive,
}: {
  user: AppUser
  isCurrentUser: boolean
  onEdit: (user: AppUser) => void
  onToggleActive: (user: AppUser) => void
}) {
  const roleInfo = APP_ROLES.find((r) => r.value === user.role)

  return (
    <tr className={`${!user.is_active ? 'bg-gray-50 opacity-60' : ''} hover:bg-gray-50`}>
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
            onClick={() => onEdit(user)}
            className="p-1.5 text-gray-400 hover:text-blue-600 rounded-lg hover:bg-blue-50 transition-colors"
            title="Upravit"
          >
            <Pencil className="w-4 h-4" />
          </button>
          {!isCurrentUser && (
            <button
              onClick={() => onToggleActive(user)}
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
}

export function UserManagement() {
  const { users, loading, createUser, updateUser, toggleUserActive } = useUsers()
  const { user: currentUser } = useCurrentUser()
  const [search, setSearch] = usePersistedState('users_search', '')
  const [filterRole, setFilterRole] = usePersistedState('users_role', '')
  const [filterActive, setFilterActive] = usePersistedState('users_active', '')

  const form = useUserForm({ createUser, updateUser })

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

  function handleToggleActive(user: AppUser) {
    if (user.id === currentUser?.id) return
    toggleUserActive(user.id, !user.is_active)
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
        <Button onClick={form.openCreateModal}>
          <UserPlus className="w-4 h-4 mr-2" />
          Nový uživatel
        </Button>
      </div>

      <UserRoleStats users={users} />

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
            {filteredUsers.map((user) => (
              <UserRow
                key={user.id}
                user={user}
                isCurrentUser={user.id === currentUser?.id}
                onEdit={form.openEditModal}
                onToggleActive={handleToggleActive}
              />
            ))}
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
        isOpen={form.showCreateModal}
        onClose={form.closeCreateModal}
        title="Nový uživatel"
        size="lg"
      >
        <div className="space-y-4">
          <Input
            label="Jméno a příjmení"
            value={form.formData.full_name}
            onChange={(e) => form.updateField('full_name', e.target.value)}
            required
          />
          <Input
            label="Email"
            type="email"
            value={form.formData.email}
            onChange={(e) => form.updateField('email', e.target.value)}
            required
          />
          <Input
            label="Heslo"
            type="password"
            value={form.formData.password}
            onChange={(e) => form.updateField('password', e.target.value)}
            placeholder="Minimálně 6 znaků"
            required
          />
          <Select
            label="Role"
            value={form.formData.role}
            onChange={(e) => form.updateField('role', e.target.value as AppRole)}
            options={APP_ROLES.map((r) => ({ value: r.value, label: r.label }))}
          />
          <Input
            label="Telefon"
            value={form.formData.phone}
            onChange={(e) => form.updateField('phone', e.target.value)}
          />

          {form.formError && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
              {form.formError}
            </div>
          )}

          <div className="flex justify-end gap-3 pt-4">
            <Button variant="secondary" onClick={form.closeCreateModal}>
              Zrušit
            </Button>
            <Button onClick={form.handleCreate} disabled={form.saving}>
              {form.saving ? 'Vytváření...' : 'Vytvořit uživatele'}
            </Button>
          </div>
        </div>
      </Modal>

      {/* Modal – Editace uživatele */}
      <Modal
        isOpen={!!form.editingUser}
        onClose={form.closeEditModal}
        title={`Upravit: ${form.editingUser?.full_name || ''}`}
        size="lg"
      >
        <div className="space-y-4">
          <Input
            label="Jméno a příjmení"
            value={form.formData.full_name}
            onChange={(e) => form.updateField('full_name', e.target.value)}
            required
          />
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <div className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-600">
              {form.editingUser?.email}
            </div>
          </div>
          <Select
            label="Role"
            value={form.formData.role}
            onChange={(e) => form.updateField('role', e.target.value as AppRole)}
            options={APP_ROLES.map((r) => ({ value: r.value, label: r.label }))}
          />
          <Input
            label="Telefon"
            value={form.formData.phone}
            onChange={(e) => form.updateField('phone', e.target.value)}
          />

          {form.formError && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
              {form.formError}
            </div>
          )}

          <div className="flex justify-end gap-3 pt-4">
            <Button variant="secondary" onClick={form.closeEditModal}>
              Zrušit
            </Button>
            <Button onClick={form.handleUpdate} disabled={form.saving}>
              {form.saving ? 'Ukládání...' : 'Uložit změny'}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
