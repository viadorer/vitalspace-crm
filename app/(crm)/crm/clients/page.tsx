'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

import { Topbar } from '@/components/crm/Topbar'
import { Button } from '@/components/ui/Button'
import { Modal } from '@/components/ui/Modal'
import { ClientTable } from '@/components/crm/ClientTable'
import { ClientForm } from '@/components/crm/ClientForm'
import { ActivityPanel } from '@/components/crm/ActivityPanel'
import { DealForm } from '@/components/crm/DealForm'
import { BulkEmailModal } from '@/components/crm/BulkEmailModal'
import { useClients } from '@/lib/hooks/useClients'
import { useDeals } from '@/lib/hooks/useDeals'
import { useCurrentUser } from '@/lib/hooks/useCurrentUser'
import { createClient } from '@/lib/supabase/client'
import type { Client, CompanySegment, Deal } from '@/lib/supabase/types'

export default function ClientsPage() {
  const router = useRouter()
  const { clients, loading, createClient: addClient, updateClient, deleteClient } = useClients()
  const { createDeal } = useDeals()
  const { isSuperAdmin } = useCurrentUser()
  const [selectedClient, setSelectedClient] = useState<Client | null>(null)
  const [editingClient, setEditingClient] = useState<Client | null>(null)
  const [showNewClientModal, setShowNewClientModal] = useState(false)
  const [showNewDealModal, setShowNewDealModal] = useState(false)
  const [showBulkEmailModal, setShowBulkEmailModal] = useState(false)
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
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

      {/* Bulk action toolbar */}
      {selectedIds.size > 0 && (
        <div className="mx-8 mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg flex items-center justify-between">
          <span className="text-sm text-blue-800 font-medium">
            Vybráno: {selectedIds.size} klientů
          </span>
          <div className="flex gap-2">
            <Button variant="secondary" onClick={() => setSelectedIds(new Set())}>
              Zrušit výběr
            </Button>
            <Button variant="primary" onClick={() => setShowBulkEmailModal(true)}>
              Hromadný email
            </Button>
          </div>
        </div>
      )}

      <div className="p-8">
        <ClientTable
          clients={clients}
          onClientClick={(client) => {
            setSelectedClient(client)
            setEditingClient(client)
          }}
          selectedIds={selectedIds}
          onSelectionChange={setSelectedIds}
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
                {editingClient.deals.map((deal: any) => {
                  const stageLabels: Record<string, string> = {
                    lead: 'Lead', technical_audit: 'Technický audit', proposal_sent: 'Nabídka odeslána',
                    negotiation: 'Vyjednávání', contract_signed: 'Smlouva', installation: 'Instalace',
                    handover: 'Předání', closed_won: 'Vyhráno', closed_lost: 'Prohráno',
                  }
                  const stageColors: Record<string, string> = {
                    lead: 'bg-gray-100 text-gray-600', proposal_sent: 'bg-blue-100 text-blue-700',
                    negotiation: 'bg-amber-100 text-amber-700', contract_signed: 'bg-purple-100 text-purple-700',
                    technical_audit: 'bg-indigo-100 text-indigo-700', installation: 'bg-cyan-100 text-cyan-700',
                    handover: 'bg-teal-100 text-teal-700', closed_won: 'bg-emerald-100 text-emerald-700',
                    closed_lost: 'bg-red-100 text-red-700',
                  }
                  return (
                    <div
                      key={deal.id}
                      onClick={() => {
                        setEditingClient(null)
                        setSelectedClient(null)
                        router.push(`/crm/pipeline?deal=${deal.id}`)
                      }}
                      className="p-3 bg-gray-50 rounded-lg hover:bg-blue-50 cursor-pointer transition-colors border border-transparent hover:border-blue-200"
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-gray-900">{deal.title}</p>
                          <span className={`inline-block mt-1 px-2 py-0.5 text-xs rounded-full font-medium ${stageColors[deal.stage] || 'bg-gray-100 text-gray-600'}`}>
                            {stageLabels[deal.stage] || deal.stage}
                          </span>
                        </div>
                        <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )}
          {/* Žádné dealy */}
          {(!editingClient.deals || editingClient.deals.length === 0) && (
            <div className="mt-4 pt-4 border-t border-gray-200">
              <p className="text-sm text-gray-400">Žádné dealy</p>
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
            preselectedClientId={editingClient.id}
            onSubmit={handleCreateDeal}
            onCancel={() => setShowNewDealModal(false)}
          />
        </Modal>
      )}

      <BulkEmailModal
        isOpen={showBulkEmailModal}
        onClose={() => {
          setShowBulkEmailModal(false)
          setSelectedIds(new Set())
        }}
        entityType="client"
        recipients={clients
          .filter(c => selectedIds.has(c.id))
          .map(c => {
            const contact = (c as any).client_contacts?.find((cc: any) => cc.is_primary) ||
                            (c as any).client_contacts?.[0]
            return {
              email: contact?.email || '',
              name: contact ? `${contact.first_name || ''} ${contact.last_name}`.trim() : '',
              company_name: c.company_name,
              client_id: c.id,
            }
          })}
        onSendComplete={() => {
          setSelectedIds(new Set())
        }}
      />
    </div>
  )
}
