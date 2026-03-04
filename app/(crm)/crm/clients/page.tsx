'use client'

import { useState, useEffect } from 'react'

import { Topbar } from '@/components/crm/Topbar'
import { Button } from '@/components/ui/Button'
import { Modal } from '@/components/ui/Modal'
import { ClientTable } from '@/components/crm/ClientTable'
import { ClientForm } from '@/components/crm/ClientForm'
import { ActivityPanel } from '@/components/crm/ActivityPanel'
import { DealForm } from '@/components/crm/DealForm'
import { useClients } from '@/lib/hooks/useClients'
import { useDeals } from '@/lib/hooks/useDeals'
import { useCurrentUser } from '@/lib/hooks/useCurrentUser'
import { createClient } from '@/lib/supabase/client'
import type { Client, CompanySegment, Deal } from '@/lib/supabase/types'

export default function ClientsPage() {
  const { clients, loading, createClient: addClient, updateClient, deleteClient } = useClients()
  const { createDeal } = useDeals()
  const { isSuperAdmin } = useCurrentUser()
  const [selectedClient, setSelectedClient] = useState<Client | null>(null)
  const [editingClient, setEditingClient] = useState<Client | null>(null)
  const [showNewClientModal, setShowNewClientModal] = useState(false)
  const [showNewDealModal, setShowNewDealModal] = useState(false)
  const [segments, setSegments] = useState<CompanySegment[]>([])
  useEffect(() => {
    async function fetchSegments() {
      const supabase = createClient()
      const { data } = await supabase.from('company_segments').select('*').order('name')
      if (data) setSegments(data)
    }
    fetchSegments()
  }, [])

  async function handleCreateClient(data: Partial<Client>) {
    const result = await addClient(data)
    if (!result.error) {
      setShowNewClientModal(false)
    }
  }

  async function handleUpdateClient(data: Partial<Client>) {
    if (editingClient) {
      const result = await updateClient(editingClient.id, data)
      if (!result.error) {
        setEditingClient(null)
        setSelectedClient(null)
      }
    }
  }

  async function handleCreateDeal(data: Partial<Deal>) {
    const result = await createDeal(data)
    if (!result.error) {
      setShowNewDealModal(false)
      setEditingClient(null)
      setSelectedClient(null)
    }
  }

  async function handleDeleteClient() {
    if (!editingClient) return
    if (!confirm(`Opravdu chcete smazat klienta ${editingClient.company_name}?`)) return

    const result = await deleteClient(editingClient.id)
    if (!result.error) {
      setEditingClient(null)
      setSelectedClient(null)
    } else {
      alert(`Chyba: ${result.error}`)
    }
  }

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
          <Button onClick={() => setShowNewClientModal(true)}>
            + Nový klient
          </Button>
        }
      />

      <div className="p-8">
        <ClientTable
          clients={clients}
          onClientClick={(client) => {
            setSelectedClient(client)
            setEditingClient(client)
          }}
        />
      </div>

      <Modal
        isOpen={showNewClientModal}
        onClose={() => setShowNewClientModal(false)}
        title="Nový klient"
        size="xl"
      >
        <ClientForm
          segments={segments}
          onSubmit={handleCreateClient}
          onCancel={() => setShowNewClientModal(false)}
        />
      </Modal>

      {editingClient && (
        <Modal
          isOpen={!!editingClient}
          onClose={() => {
            setEditingClient(null)
            setSelectedClient(null)
          }}
          title={editingClient.company_name}
          size="xl"
        >
          <ClientForm
            client={editingClient}
            segments={segments}
            onSubmit={handleUpdateClient}
            onCancel={() => {
              setEditingClient(null)
              setSelectedClient(null)
            }}
          />
          {/* Seznam dealů klienta */}
          {editingClient.deals && editingClient.deals.length > 0 && (
            <div className="mt-4 pt-4 border-t border-gray-200">
              <h3 className="text-sm font-semibold text-gray-900 mb-3">
                Dealy ({editingClient.deals.length})
              </h3>
              <div className="space-y-2">
                {editingClient.deals.map((deal: any) => (
                  <div
                    key={deal.id}
                    onClick={() => window.location.href = `/crm/pipeline?deal=${deal.id}`}
                    className="p-3 bg-gray-50 rounded-lg hover:bg-gray-100 cursor-pointer transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-900">{deal.title}</p>
                        <p className="text-xs text-gray-500 mt-1">
                          Stage: <span className="capitalize">{deal.stage}</span>
                        </p>
                      </div>
                      <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="mt-4">
            <ActivityPanel entityType="client" entityId={editingClient.id} />
          </div>
          <div className="mt-4 pt-4 border-t border-gray-200 flex justify-between">
            {isSuperAdmin() && (
              <Button onClick={handleDeleteClient} variant="secondary">
                Smazat klienta
              </Button>
            )}
            <Button onClick={() => setShowNewDealModal(true)} variant="primary" className={!isSuperAdmin() ? 'ml-auto' : ''}>
              + Vytvořit deal
            </Button>
          </div>
        </Modal>
      )}

      {showNewDealModal && editingClient && (
        <Modal
          isOpen={showNewDealModal}
          onClose={() => setShowNewDealModal(false)}
          title={`Nový deal pro ${editingClient.company_name}`}
          size="lg"
        >
          <DealForm
            clients={clients}
            onSubmit={handleCreateDeal}
            onCancel={() => setShowNewDealModal(false)}
          />
        </Modal>
      )}
    </div>
  )
}
