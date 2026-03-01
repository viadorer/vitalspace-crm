'use client'

import { useState } from 'react'

export const dynamic = 'force-dynamic'
import { Topbar } from '@/components/crm/Topbar'
import { Button } from '@/components/ui/Button'
import { Modal } from '@/components/ui/Modal'
import { ClientTable } from '@/components/crm/ClientTable'
import { useClients } from '@/lib/hooks/useClients'
import type { Client } from '@/lib/supabase/types'

export default function ClientsPage() {
  const { clients, loading } = useClients()
  const [selectedClient, setSelectedClient] = useState<Client | null>(null)

  if (loading) {
    return (
      <div>
        <Topbar title="Klienti" />
        <div className="p-8 text-center">Načítání...</div>
      </div>
    )
  }

  return (
    <div>
      <Topbar
        title="Klienti"
        breadcrumbs={[{ label: 'CRM' }, { label: 'Klienti' }]}
        actions={
          <Button onClick={() => {}}>
            + Nový klient
          </Button>
        }
      />

      <div className="p-8">
        <ClientTable
          clients={clients}
          onClientClick={setSelectedClient}
        />
      </div>

      {selectedClient && (
        <Modal
          isOpen={!!selectedClient}
          onClose={() => setSelectedClient(null)}
          title={selectedClient.company_name}
          size="xl"
        >
          <div className="space-y-4">
            <div>
              <h3 className="font-medium text-gray-900 mb-2">Kontaktní údaje</h3>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-500">Email:</span>
                  <p className="font-medium">{selectedClient.email || '-'}</p>
                </div>
                <div>
                  <span className="text-gray-500">Telefon:</span>
                  <p className="font-medium">{selectedClient.phone || '-'}</p>
                </div>
                <div>
                  <span className="text-gray-500">Město:</span>
                  <p className="font-medium">{selectedClient.city || '-'}</p>
                </div>
                <div>
                  <span className="text-gray-500">Region:</span>
                  <p className="font-medium">{selectedClient.region}</p>
                </div>
              </div>
            </div>
          </div>
        </Modal>
      )}
    </div>
  )
}
