'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/Button'
import { formatCurrency, formatDate } from '@/lib/utils/format'
import { logAuditEvent } from '@/lib/hooks/useAuditLog'
import { Calendar, Edit2, Package } from 'lucide-react'
import { Section, InfoRow, type DealSectionProps } from './shared'

export function DealFinancialsSection({ dealId, data, onRefresh, expanded, onToggle }: DealSectionProps & { expanded: boolean; onToggle: () => void }) {
  const { deal } = data
  const [editingDiscount, setEditingDiscount] = useState(false)
  const [discountValue, setDiscountValue] = useState(deal.discount_percent || 0)
  const [saving, setSaving] = useState(false)

  async function handleSaveDiscount() {
    setSaving(true)
    const supabase = createClient()
    const newFinalPrice = Math.round(deal.total_value_czk * (1 - discountValue / 100) * 100) / 100

    await supabase.from('deals').update({
      discount_percent: discountValue,
      final_price_czk: newFinalPrice,
    }).eq('id', dealId)

    await logAuditEvent({
      action: 'update',
      entityType: 'deal',
      entityId: dealId,
      changes: {
        discount_percent: { old: deal.discount_percent, new: discountValue },
        final_price_czk: { old: deal.final_price_czk, new: newFinalPrice },
      },
    })

    setEditingDiscount(false)
    setSaving(false)
    await onRefresh()
  }

  return (
    <Section
      title="Finanční přehled"
      icon={<Package className="w-4 h-4" />}
      expanded={expanded}
      onToggle={onToggle}
    >
      <div className="grid grid-cols-2 gap-4">
        <InfoRow label="Hardware" value={formatCurrency(deal.total_hardware_czk)} />
        <InfoRow label="Montáž" value={formatCurrency(deal.total_installation_czk)} />
        <InfoRow label="Služby" value={formatCurrency(deal.total_service_czk)} />
        <InfoRow label="Celkem bez slevy" value={formatCurrency(deal.total_value_czk)} />

        {editingDiscount ? (
          <div className="col-span-2 flex items-center gap-2">
            <span className="text-xs text-gray-500">Sleva:</span>
            <input
              type="number"
              min="0"
              max="100"
              step="0.5"
              value={discountValue}
              onChange={(e) => setDiscountValue(Number(e.target.value))}
              className="w-20 px-2 py-1 border border-gray-200 rounded text-sm"
            />
            <span className="text-sm">%</span>
            <Button onClick={handleSaveDiscount} disabled={saving}>
              {saving ? '...' : 'Uložit'}
            </Button>
            <Button variant="secondary" onClick={() => setEditingDiscount(false)}>Zrušit</Button>
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <InfoRow label="Sleva" value={`${deal.discount_percent || 0} %`} />
            <button onClick={() => { setDiscountValue(deal.discount_percent || 0); setEditingDiscount(true) }} className="p-0.5 text-gray-400 hover:text-blue-600">
              <Edit2 className="w-3 h-3" />
            </button>
          </div>
        )}

        <InfoRow label="Finální cena" value={formatCurrency(deal.final_price_czk)} bold />
      </div>

      <div className="border-t border-gray-100 mt-4 pt-4 grid grid-cols-2 gap-4">
        {deal.estimated_close_date && (
          <InfoRow label="Očekávané uzavření" value={formatDate(deal.estimated_close_date)} icon={<Calendar className="w-3.5 h-3.5 text-gray-400" />} />
        )}
        {deal.estimated_installation_date && (
          <InfoRow label="Plánovaná montáž" value={formatDate(deal.estimated_installation_date)} icon={<Calendar className="w-3.5 h-3.5 text-gray-400" />} />
        )}
        {deal.installation_deadline && (
          <InfoRow label="Deadline montáže" value={formatDate(deal.installation_deadline)} icon={<Calendar className="w-3.5 h-3.5 text-gray-400" />} />
        )}
        <InfoRow label="Vytvořeno" value={formatDate(deal.created_at)} />
        {deal.closed_at && <InfoRow label="Uzavřeno" value={formatDate(deal.closed_at)} />}
        {deal.lost_reason && (
          <div className="col-span-2 bg-red-50 rounded-lg p-3">
            <span className="text-sm font-medium text-red-700">Důvod ztráty: </span>
            <span className="text-sm text-red-600">{deal.lost_reason}</span>
          </div>
        )}
      </div>
    </Section>
  )
}
