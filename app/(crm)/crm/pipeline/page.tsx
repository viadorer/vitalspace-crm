'use client'

import { useState } from 'react'
import { usePersistedState } from '@/lib/hooks/usePersistedState'
import { Topbar } from '@/components/crm/Topbar'
import { Button } from '@/components/ui/Button'
import { Modal } from '@/components/ui/Modal'
import { PipelineBoard } from '@/components/crm/PipelineBoard'
import { PipelineListView } from '@/components/crm/PipelineListView'
import { DealForm } from '@/components/crm/DealForm'
import { DealDetail } from '@/components/crm/DealDetail'
import { useDeals } from '@/lib/hooks/useDeals'
import { useClients } from '@/lib/hooks/useClients'
import { LayoutGrid, List } from 'lucide-react'
import type { Deal, DealStage } from '@/lib/supabase/types'

type ViewMode = 'board' | 'list'

export default function PipelinePage() {
  const { deals, loading, updateDealStage, createDeal } = useDeals()
  const { clients } = useClients()
  const [selectedDealId, setSelectedDealId] = useState<string | null>(null)
  const [showNewDealModal, setShowNewDealModal] = useState(false)
  const [viewMode, setViewMode] = usePersistedState<ViewMode>('pipeline_view', 'board')

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
          <div className="flex items-center gap-3">
            <div className="flex items-center bg-gray-100 rounded-lg p-0.5">
              <button
                onClick={() => setViewMode('board')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                  viewMode === 'board'
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                <LayoutGrid className="w-4 h-4" />
                Board
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                  viewMode === 'list'
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                <List className="w-4 h-4" />
                Seznam
              </button>
            </div>
            <Button onClick={() => setShowNewDealModal(true)}>
              + Nový deal
            </Button>
          </div>
        }
      />

      <div className="p-8">
        {viewMode === 'board' ? (
          <PipelineBoard
            deals={deals}
            onDealClick={(deal) => setSelectedDealId(deal.id)}
            onStageChange={handleStageChange}
          />
        ) : (
          <PipelineListView
            deals={deals}
            onDealClick={(deal) => setSelectedDealId(deal.id)}
            onStageChange={handleStageChange}
          />
        )}
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
