'use client'

import { useState, useEffect } from 'react'

import { Topbar } from '@/components/crm/Topbar'
import { Button } from '@/components/ui/Button'
import { Modal } from '@/components/ui/Modal'
import { ClientTable } from '@/components/crm/ClientTable'
import { ClientForm } from '@/components/crm/ClientForm'
import { useClients } from '@/lib/hooks/useClients'
import { createClient } from '@/lib/supabase/client'
import type { Client, CompanySegment } from '@/lib/supabase/types'

export default function ClientsPage() {
  const { clients, loading, createClient: addClient, updateClient } = useClients()
  const [selectedClient, setSelectedClient] = useState<Client | null>(null)
  const [editingClient, setEditingClient] = useState<Client | null>(null)
  const [showNewClientModal, setShowNewClientModal] = useState(false)
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
        </Modal>
      )}
    </div>
  )
}
