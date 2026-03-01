'use client'

import { Topbar } from '@/components/crm/Topbar'
import { UserManagement } from '@/components/crm/UserManagement'
import { useCurrentUser } from '@/lib/hooks/useCurrentUser'

export default function UsersPage() {
  const { loading, isSuperAdmin } = useCurrentUser()

  if (loading) {
    return (
      <div>
        <Topbar title="Správa uživatelů" />
        <div className="p-8 text-center text-gray-500">Načítání...</div>
      </div>
    )
  }

  if (!isSuperAdmin()) {
    return (
      <div>
        <Topbar title="Správa uživatelů" />
        <div className="p-8 text-center">
          <div className="text-red-600 font-medium">Přístup odepřen</div>
          <p className="text-gray-500 mt-2">
            Tato stránka je dostupná pouze pro Super Admina.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div>
      <Topbar
        title="Správa uživatelů"
        breadcrumbs={[{ label: 'CRM' }, { label: 'Uživatelé' }]}
      />
      <div className="p-8">
        <UserManagement />
      </div>
    </div>
  )
}
