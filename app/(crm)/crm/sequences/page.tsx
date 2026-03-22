'use client'

import { Topbar } from '@/components/crm/Topbar'
import { SequenceManager } from '@/components/crm/SequenceManager'
import { useCurrentUser } from '@/lib/hooks/useCurrentUser'

export default function SequencesPage() {
  const { loading, isSuperAdmin } = useCurrentUser()

  if (loading) {
    return (
      <div>
        <Topbar title="Email sekvence" />
        <div className="p-8 text-center text-gray-500">Načítání...</div>
      </div>
    )
  }

  if (!isSuperAdmin()) {
    return (
      <div>
        <Topbar title="Email sekvence" />
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
        title="Email sekvence"
        breadcrumbs={[{ label: 'CRM' }, { label: 'Sekvence' }]}
      />
      <div className="p-8">
        <SequenceManager />
      </div>
    </div>
  )
}
