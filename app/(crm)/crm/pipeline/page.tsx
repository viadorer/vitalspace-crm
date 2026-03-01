'use client'

import { useState } from 'react'
import { Topbar } from '@/components/crm/Topbar'
import { Button } from '@/components/ui/Button'
import { Modal } from '@/components/ui/Modal'
import { PipelineBoard } from '@/components/crm/PipelineBoard'
import { DealForm } from '@/components/crm/DealForm'
import { DealDetail } from '@/components/crm/DealDetail'
import { useDeals } from '@/lib/hooks/useDeals'
import { useClients } from '@/lib/hooks/useClients'
import type { Deal, DealStage } from '@/lib/supabase/types'

export default function PipelinePage() {
  const { deals, loading, updateDealStage, createDeal } = useDeals()
  const { clients } = useClients()
  const [selectedDealId, setSelectedDealId] = useState<string | null>(null)
  const [showNewDealModal, setShowNewDealModal] = useState(false)

  const selectedDeal = deals.find((d) => d.id === selectedDealId)

  async function handleStageChange(dealId: string, newStage: DealStage) {
    await updateDealStage(dealId, newStage)
  }

  async function handleCreateDeal(data: Partial<Deal>) {
    const result = await createDeal(data)
    if (!result.error) {
      setShowNewDealModal(false)
    }
  }

  if (loading) {
    return (
      <div>
        <Topbar title="Pipeline" />
        <div className="p-8 text-center">Načítání...</div>
      </div>
    )
  }

  return (
    <div>
      <Topbar
        title="Pipeline"
        actions={
          <Button onClick={() => setShowNewDealModal(true)}>
            + Nový deal
          </Button>
        }
      />

      <div className="p-8">
        <PipelineBoard
          deals={deals}
          onDealClick={(deal) => setSelectedDealId(deal.id)}
          onStageChange={handleStageChange}
        />
      </div>

      <Modal
        isOpen={showNewDealModal}
        onClose={() => setShowNewDealModal(false)}
        title="Nový deal"
        size="lg"
      >
        <DealForm
          clients={clients}
          onSubmit={handleCreateDeal}
          onCancel={() => setShowNewDealModal(false)}
        />
      </Modal>

      {selectedDealId && (
        <Modal
          isOpen={!!selectedDealId}
          onClose={() => setSelectedDealId(null)}
          title={selectedDeal?.title || 'Detail dealu'}
          size="xl"
        >
          <DealDetail
            dealId={selectedDealId}
            onClose={() => setSelectedDealId(null)}
          />
        </Modal>
      )}
    </div>
  )
}
