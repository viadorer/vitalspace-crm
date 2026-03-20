'use client'

import { useState, useEffect } from 'react'

import { Topbar } from '@/components/crm/Topbar'
import { Button } from '@/components/ui/Button'
import { Modal } from '@/components/ui/Modal'
import { ProspectTable } from '@/components/crm/ProspectTable'
import { ProspectForm } from '@/components/crm/ProspectForm'
import { ActivityPanel } from '@/components/crm/ActivityPanel'
import { DealForm } from '@/components/crm/DealForm'
import { BulkEmailModal } from '@/components/crm/BulkEmailModal'
import { useProspects } from '@/lib/hooks/useProspects'
import { useDeals } from '@/lib/hooks/useDeals'
import { useCurrentUser } from '@/lib/hooks/useCurrentUser'
import { createClient } from '@/lib/supabase/client'
import type { Prospect, CompanySegment, Deal, Client } from '@/lib/supabase/types'

export default function ProspectsPage() {
  const { prospects, loading, createProspect, updateProspect, deleteProspect } = useProspects()
  const { createDeal } = useDeals()
  const { isSuperAdmin } = useCurrentUser()
  const [segments, setSegments] = useState<CompanySegment[]>([])
  const [clients, setClients] = useState<Client[]>([])
  const [selectedProspect, setSelectedProspect] = useState<Prospect | null>(null)
  const [showNewProspectModal, setShowNewProspectModal] = useState(false)
  const [showNewDealModal, setShowNewDealModal] = useState(false)
  const [showBulkEmailModal, setShowBulkEmailModal] = useState(false)
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  const [converting, setConverting] = useState(false)
  useEffect(() => {
    async function fetchData() {
      const supabase = createClient()
      const [segmentsRes, clientsRes] = await Promise.all([
        supabase.from('company_segments').select('*').order('name'),
        supabase.from('clients').select('*').order('company_name')
      ])
      if (segmentsRes.data) setSegments(segmentsRes.data)
      if (clientsRes.data) setClients(clientsRes.data)
    }
    fetchData()
  }, [])

  async function handleCreateProspect(data: Partial<Prospect>) {
    const result = await createProspect(data)
    if (!result.error) {
      setShowNewProspectModal(false)
    }
  }

  async function handleUpdateProspect(data: Partial<Prospect>) {
    if (selectedProspect) {
      const result = await updateProspect(selectedProspect.id, data)
      if (!result.error) {
        setSelectedProspect(null)
      }
    }
  }

  async function handleCreateDealFromProspect(dealData: Partial<Deal>) {
    if (!selectedProspect) return

    setConverting(true)
    try {
      const supabase = createClient()
      
      const { data: newClient, error: clientError } = await supabase
        .from('clients')
        .insert({
          prospect_id: selectedProspect.id,
          company_name: selectedProspect.company_name,
          ico: selectedProspect.ico,
          dic: selectedProspect.dic,
          segment_id: selectedProspect.segment_id,
          region: selectedProspect.region,
          city: selectedProspect.city,
          address: selectedProspect.address,
          website: selectedProspect.website,
          employees_count_est: selectedProspect.employees_count_est,
          estimated_floor_area_m2: selectedProspect.estimated_floor_area_m2,
          source: selectedProspect.source,
          notes: selectedProspect.notes,
          assigned_user_id: selectedProspect.assigned_user_id,
          type: 'B2B',
          payment_terms_days: 14,
        })
        .select()
        .single()

      if (clientError) throw clientError

      await supabase
        .from('prospects')
        .update({ status: 'converted' })
        .eq('id', selectedProspect.id)

      const result = await createDeal({
        ...dealData,
        client_id: newClient.id,
        prospect_id: selectedProspect.id,
      })

      if (!result.error) {
        setShowNewDealModal(false)
        setSelectedProspect(null)
        alert('Prospect úspěšně převeden na klienta a vytvořen deal!')
      }
    } catch (err) {
      console.error('Chyba při konverzi prospectu:', err)
      alert('Chyba při konverzi prospectu na klienta')
    } finally {
      setConverting(false)
    }
  }

  async function handleDeleteProspect() {
    if (!selectedProspect) return
    if (!confirm(`Opravdu chcete smazat prospect ${selectedProspect.company_name}?`)) return

    const result = await deleteProspect(selectedProspect.id)
    if (!result.error) {
      setSelectedProspect(null)
    } else {
      alert(`Chyba: ${result.error}`)
    }
  }

  if (loading) {
    return (
      <div>
        <Topbar title="Prospekty" />
        <div className="p-8 text-center">Načítání...</div>
      </div>
    )
  }

  return (
    <div>
      <Topbar
        title="Prospekty"
        breadcrumbs={[{ label: 'CRM' }, { label: 'Prospekty' }]}
        actions={
          <Button onClick={() => setShowNewProspectModal(true)}>
            + Nový prospect
          </Button>
        }
      />

      {/* Bulk action toolbar */}
      {selectedIds.size > 0 && (
        <div className="mx-8 mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg flex items-center justify-between">
          <span className="text-sm text-blue-800 font-medium">
            Vybráno: {selectedIds.size} prospektů
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
        <ProspectTable
          prospects={prospects}
          onProspectClick={setSelectedProspect}
          selectedIds={selectedIds}
          onSelectionChange={setSelectedIds}
        />
      </div>

      <Modal
        isOpen={showNewProspectModal}
        onClose={() => setShowNewProspectModal(false)}
        title="Nový prospect"
        size="xl"
      >
        <ProspectForm
          segments={segments}
          onSubmit={handleCreateProspect}
          onCancel={() => setShowNewProspectModal(false)}
        />
      </Modal>

      {selectedProspect && (
        <Modal
          isOpen={!!selectedProspect}
          onClose={() => setSelectedProspect(null)}
          title={selectedProspect.company_name}
          size="xl"
        >
          <ProspectForm
            prospect={selectedProspect}
            segments={segments}
            onSubmit={handleUpdateProspect}
            onCancel={() => setSelectedProspect(null)}
          />
          <div className="mt-4">
            <ActivityPanel entityType="prospect" entityId={selectedProspect.id} />
          </div>
          <div className="mt-4 pt-4 border-t border-gray-200 flex justify-between">
            {isSuperAdmin() && (
              <Button onClick={handleDeleteProspect} variant="secondary">
                Smazat prospect
              </Button>
            )}
            <Button 
              onClick={() => setShowNewDealModal(true)} 
              variant="primary"
              disabled={converting}
              className={!isSuperAdmin() ? 'ml-auto' : ''}
            >
              {converting ? 'Převodím...' : '+ Vytvořit deal (převede na klienta)'}
            </Button>
          </div>
        </Modal>
      )}

      {showNewDealModal && selectedProspect && (
        <Modal
          isOpen={showNewDealModal}
          onClose={() => setShowNewDealModal(false)}
          title={`Nový deal pro ${selectedProspect.company_name}`}
          size="lg"
        >
          <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-sm text-blue-800">
              <strong>Poznámka:</strong> Prospect bude automaticky převeden na klienta při vytvoření dealu.
            </p>
          </div>
          <DealForm
            clients={clients}
            preselectedClientId="__from_prospect__"
            onSubmit={handleCreateDealFromProspect}
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
        entityType="prospect"
        recipients={prospects
          .filter(p => selectedIds.has(p.id))
          .map(p => {
            const contact = (p as any).prospect_contacts?.find((c: any) => c.is_decision_maker) ||
                            (p as any).prospect_contacts?.[0]
            return {
              email: contact?.email || '',
              name: contact ? `${contact.first_name || ''} ${contact.last_name}`.trim() : '',
              company_name: p.company_name,
              prospect_id: p.id,
            }
          })}
        onSendComplete={() => {
          setSelectedIds(new Set())
        }}
      />
    </div>
  )
}
