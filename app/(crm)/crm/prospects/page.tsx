'use client'

import { useState, useEffect } from 'react'

import { Topbar } from '@/components/crm/Topbar'
import { Button } from '@/components/ui/Button'
import { Modal } from '@/components/ui/Modal'
import { ProspectTable } from '@/components/crm/ProspectTable'
import { ProspectForm } from '@/components/crm/ProspectForm'
import { useProspects } from '@/lib/hooks/useProspects'
import { createClient } from '@/lib/supabase/client'
import type { Prospect, CompanySegment } from '@/lib/supabase/types'

export default function ProspectsPage() {
  const { prospects, loading, createProspect, updateProspect } = useProspects()
  const [segments, setSegments] = useState<CompanySegment[]>([])
  const [selectedProspect, setSelectedProspect] = useState<Prospect | null>(null)
  const [showNewProspectModal, setShowNewProspectModal] = useState(false)
  useEffect(() => {
    async function fetchSegments() {
      const supabase = createClient()
      const { data } = await supabase.from('company_segments').select('*').order('name')
      if (data) setSegments(data)
    }
    fetchSegments()
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

      <div className="p-8">
        <ProspectTable
          prospects={prospects}
          onProspectClick={setSelectedProspect}
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
        </Modal>
      )}
    </div>
  )
}
