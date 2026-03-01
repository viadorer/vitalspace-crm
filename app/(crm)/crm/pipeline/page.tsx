'use client'

import { useState } from 'react'

export const dynamic = 'force-dynamic'
import { Topbar } from '@/components/crm/Topbar'
import { Button } from '@/components/ui/Button'
import { Modal } from '@/components/ui/Modal'
import { PipelineBoard } from '@/components/crm/PipelineBoard'
import { DealForm } from '@/components/crm/DealForm'
import { useDeals } from '@/lib/hooks/useDeals'
import { useClients } from '@/lib/hooks/useClients'
import type { Deal, DealStage } from '@/lib/supabase/types'

export default function PipelinePage() {
  const { deals, loading, updateDealStage, createDeal } = useDeals()
  const { clients } = useClients()
  const [selectedDeal, setSelectedDeal] = useState<Deal | null>(null)
  const [showNewDealModal, setShowNewDealModal] = useState(false)

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
          onDealClick={setSelectedDeal}
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

      {selectedDeal && (
        <Modal
          isOpen={!!selectedDeal}
          onClose={() => setSelectedDeal(null)}
          title={selectedDeal.title}
          size="xl"
        >
          <div className="space-y-4">
            <div>
              <h3 className="font-medium text-gray-900 mb-2">Detail dealu</h3>
              <p className="text-gray-600">{selectedDeal.description}</p>
            </div>
          </div>
        </Modal>
      )}
    </div>
  )
}
