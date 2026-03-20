'use client'

import { useState } from 'react'
import { usePersistedState } from '@/lib/hooks/usePersistedState'
import { DragDropContext, Droppable, Draggable, DropResult } from 'react-beautiful-dnd'
import { DEAL_STAGES } from '@/lib/utils/constants'
import { DealCard } from './DealCard'
import type { Deal, DealStage } from '@/lib/supabase/types'

interface PipelineBoardProps {
  deals: Deal[]
  onDealClick: (deal: Deal) => void
  onStageChange: (dealId: string, newStage: DealStage) => Promise<void>
}

export function PipelineBoard({ deals, onDealClick, onStageChange }: PipelineBoardProps) {
  const [showClosed, setShowClosed] = usePersistedState('pipeline_board_showclosed', false)

  const visibleStages = showClosed
    ? DEAL_STAGES
    : DEAL_STAGES.filter(s => s.value !== 'closed_won' && s.value !== 'closed_lost')

  const dealsByStage = visibleStages.reduce((acc, stage) => {
    acc[stage.value] = deals.filter(d => d.stage === stage.value)
    return acc
  }, {} as Record<string, Deal[]>)

  async function handleDragEnd(result: DropResult) {
    const { destination, source, draggableId } = result

    if (!destination) return
    if (destination.droppableId === source.droppableId && destination.index === source.index) return

    const newStage = destination.droppableId as DealStage
    await onStageChange(draggableId, newStage)
  }

  return (
    <div>
      <div className="mb-4 flex justify-end">
        <button
          onClick={() => setShowClosed(!showClosed)}
          className="text-sm text-gray-600 hover:text-gray-900"
        >
          {showClosed ? 'Skrýt uzavřené' : 'Zobrazit uzavřené'}
        </button>
      </div>

      <DragDropContext onDragEnd={handleDragEnd}>
        <div className="flex gap-4 overflow-x-auto pb-4">
          {visibleStages.map((stage) => (
            <div key={stage.value} className="flex-shrink-0 w-80">
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold text-gray-900">{stage.label}</h3>
                  <span className="text-sm text-gray-500">
                    {dealsByStage[stage.value]?.length || 0}
                  </span>
                </div>

                <Droppable droppableId={stage.value}>
                  {(provided, snapshot) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.droppableProps}
                      className={`space-y-3 min-h-[200px] ${
                        snapshot.isDraggingOver ? 'bg-blue-50 rounded-lg' : ''
                      }`}
                    >
                      {dealsByStage[stage.value]?.map((deal, index) => (
                        <Draggable key={deal.id} draggableId={deal.id} index={index}>
                          {(provided, snapshot) => (
                            <div
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              {...provided.dragHandleProps}
                              style={provided.draggableProps.style}
                            >
                              <DealCard
                                deal={deal}
                                onClick={() => onDealClick(deal)}
                                isDragging={snapshot.isDragging}
                              />
                            </div>
                          )}
                        </Draggable>
                      ))}
                      {provided.placeholder}
                    </div>
                  )}
                </Droppable>
              </div>
            </div>
          ))}
        </div>
      </DragDropContext>
    </div>
  )
}
