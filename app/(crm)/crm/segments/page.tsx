'use client'

import { useState } from 'react'
import { Topbar } from '@/components/crm/Topbar'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { SegmentModal } from '@/components/crm/SegmentModal'
import { SegmentInsights } from '@/components/crm/SegmentInsights'
import { useSegments } from '@/lib/hooks/useSegments'
import { formatCurrency } from '@/lib/utils/format'
import {
  Plus,
  Pencil,
  Trash2,
  ChevronDown,
  ChevronRight,
  Package,
  Users,
  TrendingUp,
  Clock,
} from 'lucide-react'
import type { CompanySegment } from '@/lib/supabase/types'

export default function SegmentsPage() {
  const { segments, loading, createSegment, updateSegment, deleteSegment } = useSegments()
  const [search, setSearch] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [editingSegment, setEditingSegment] = useState<CompanySegment | null>(null)
  const [expandedId, setExpandedId] = useState<string | null>(null)

  const filteredSegments = segments.filter(s =>
    s.name.toLowerCase().includes(search.toLowerCase()) ||
    s.target_pain_point?.toLowerCase().includes(search.toLowerCase())
  )

  function handleCreate() {
    setEditingSegment(null)
    setShowModal(true)
  }

  function handleEdit(segment: CompanySegment) {
    setEditingSegment(segment)
    setShowModal(true)
  }

  async function handleDelete(segment: CompanySegment) {
    if (!confirm(`Opravdu smazat segment "${segment.name}"?`)) return
    await deleteSegment(segment.id)
  }

  if (loading) {
    return (
      <div>
        <Topbar title="Segmenty" />
        <div className="p-8">
          <div className="space-y-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="bg-white rounded-xl border border-gray-200 p-5 animate-pulse">
                <div className="h-5 bg-gray-200 rounded w-48 mb-2" />
                <div className="h-4 bg-gray-200 rounded w-96" />
              </div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div>
      <Topbar
        title="Segmenty"
        breadcrumbs={[{ label: 'CRM' }, { label: 'Segmenty' }]}
      />

      <div className="p-8">
        <div className="flex items-center justify-between mb-6">
          <div className="flex-1 max-w-md">
            <Input
              placeholder="Hledat segment..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <Button onClick={handleCreate}>
            <Plus className="w-4 h-4 mr-1" />
            Nový segment
          </Button>
        </div>

        <div className="space-y-3">
          {filteredSegments.map((segment) => {
            const isExpanded = expandedId === segment.id
            return (
              <div
                key={segment.id}
                className="bg-white rounded-xl border border-gray-200 overflow-hidden"
              >
                <div
                  className="flex items-center justify-between p-5 cursor-pointer hover:bg-gray-50 transition-colors"
                  onClick={() => setExpandedId(isExpanded ? null : segment.id)}
                >
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <button className="text-gray-400 flex-shrink-0">
                      {isExpanded ? <ChevronDown className="w-5 h-5" /> : <ChevronRight className="w-5 h-5" />}
                    </button>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-gray-900">{segment.name}</h3>
                      {segment.target_pain_point && (
                        <p className="text-sm text-gray-500 truncate mt-0.5">{segment.target_pain_point}</p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-4 ml-4 flex-shrink-0">
                    {segment.recommended_products && segment.recommended_products.length > 0 && (
                      <span className="hidden lg:inline-flex items-center gap-1 text-xs text-blue-600 bg-blue-50 px-2 py-1 rounded">
                        <Package className="w-3 h-3" />
                        {segment.recommended_products.length} produktů
                      </span>
                    )}
                    {segment.decision_makers && segment.decision_makers.length > 0 && (
                      <span className="hidden lg:inline-flex items-center gap-1 text-xs text-purple-600 bg-purple-50 px-2 py-1 rounded">
                        <Users className="w-3 h-3" />
                        {segment.decision_makers.length} DM
                      </span>
                    )}
                    {(segment.average_deal_min_czk || segment.average_deal_max_czk) && (
                      <span className="hidden md:inline-flex items-center gap-1 text-xs text-green-600 bg-green-50 px-2 py-1 rounded">
                        <TrendingUp className="w-3 h-3" />
                        {segment.average_deal_min_czk ? formatCurrency(segment.average_deal_min_czk) : '?'}
                        {' – '}
                        {segment.average_deal_max_czk ? formatCurrency(segment.average_deal_max_czk) : '?'}
                      </span>
                    )}
                    {(segment.closing_time_months_min || segment.closing_time_months_max) && (
                      <span className="hidden md:inline-flex items-center gap-1 text-xs text-amber-600 bg-amber-50 px-2 py-1 rounded">
                        <Clock className="w-3 h-3" />
                        {segment.closing_time_months_min || '?'}–{segment.closing_time_months_max || '?'} měs.
                      </span>
                    )}

                    <div className="flex gap-1" onClick={(e) => e.stopPropagation()}>
                      <button
                        onClick={() => handleEdit(segment)}
                        className="p-1.5 text-gray-400 hover:text-blue-600 rounded-lg hover:bg-gray-100"
                        title="Upravit"
                      >
                        <Pencil className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(segment)}
                        className="p-1.5 text-gray-400 hover:text-red-600 rounded-lg hover:bg-gray-100"
                        title="Smazat"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>

                {isExpanded && (
                  <div className="px-5 pb-5 pt-0 border-t border-gray-100">
                    <div className="pt-4">
                      <SegmentInsights segment={segment} />
                    </div>
                  </div>
                )}
              </div>
            )
          })}

          {filteredSegments.length === 0 && (
            <div className="text-center py-12 text-gray-500">
              {search ? 'Žádné segmenty odpovídající hledání' : 'Žádné segmenty. Klikněte na "Nový segment" pro vytvoření.'}
            </div>
          )}
        </div>

        <div className="mt-4 text-sm text-gray-500">
          Celkem {filteredSegments.length} segmentů
        </div>
      </div>

      <SegmentModal
        isOpen={showModal}
        onClose={() => {
          setShowModal(false)
          setEditingSegment(null)
        }}
        onSave={async (data) => {
          if (editingSegment) {
            return updateSegment(editingSegment.id, data)
          }
          return createSegment(data)
        }}
        segment={editingSegment}
      />
    </div>
  )
}
