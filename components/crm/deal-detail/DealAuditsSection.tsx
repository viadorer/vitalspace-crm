'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/Button'
import { formatDate } from '@/lib/utils/format'
import { logAuditEvent } from '@/lib/hooks/useAuditLog'
import { Edit2, Plus, Ruler, Save, Trash2, X } from 'lucide-react'
import { Section, InfoRow, type DealSectionProps } from './shared'
import type { Product } from '@/lib/supabase/types'

const EMPTY_FORM = {
  room_name: '', building_name: '', floor_number: '', room_purpose: '',
  area_m2: '', ceiling_height_m: '', has_suspended_ceiling: false,
  ceiling_type: '', has_230v_nearby: true, ventilation_type: '',
  auditor_name: '', audit_date: '', notes: '',
  recommended_product_id: '', recommended_quantity: 1,
}

export function DealAuditsSection({ dealId, data, onRefresh, expanded, onToggle }: DealSectionProps & { expanded: boolean; onToggle: () => void }) {
  const { audits } = data
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [form, setForm] = useState(EMPTY_FORM)
  const [saving, setSaving] = useState(false)
  const [products, setProducts] = useState<Product[]>([])

  useEffect(() => {
    if ((showForm || editingId) && products.length === 0) {
      loadProducts()
    }
  }, [showForm, editingId])

  async function loadProducts() {
    const supabase = createClient()
    const { data } = await supabase.from('products').select('*').eq('is_active', true).order('name')
    if (data) setProducts(data as Product[])
  }

  function startEdit(audit: any) {
    setEditingId(audit.id)
    setForm({
      room_name: audit.room_name || '',
      building_name: audit.building_name || '',
      floor_number: audit.floor_number?.toString() || '',
      room_purpose: audit.room_purpose || '',
      area_m2: audit.area_m2?.toString() || '',
      ceiling_height_m: audit.ceiling_height_m?.toString() || '',
      has_suspended_ceiling: audit.has_suspended_ceiling || false,
      ceiling_type: audit.ceiling_type || '',
      has_230v_nearby: audit.has_230v_nearby ?? true,
      ventilation_type: audit.ventilation_type || '',
      auditor_name: audit.auditor_name || '',
      audit_date: audit.audit_date || '',
      notes: audit.notes || '',
      recommended_product_id: audit.recommended_product_id || '',
      recommended_quantity: audit.recommended_quantity || 1,
    })
    setShowForm(false)
  }

  async function handleSave() {
    if (!form.room_name.trim()) return
    setSaving(true)
    const supabase = createClient()

    const record: Record<string, any> = {
      deal_id: dealId,
      room_name: form.room_name,
      building_name: form.building_name || null,
      floor_number: form.floor_number ? Number(form.floor_number) : null,
      room_purpose: form.room_purpose || null,
      area_m2: form.area_m2 ? Number(form.area_m2) : null,
      ceiling_height_m: form.ceiling_height_m ? Number(form.ceiling_height_m) : null,
      volume_m3: form.area_m2 && form.ceiling_height_m ? Number(form.area_m2) * Number(form.ceiling_height_m) : null,
      has_suspended_ceiling: form.has_suspended_ceiling,
      ceiling_type: form.ceiling_type || null,
      has_230v_nearby: form.has_230v_nearby,
      ventilation_type: form.ventilation_type || null,
      auditor_name: form.auditor_name || null,
      audit_date: form.audit_date || null,
      notes: form.notes || null,
      recommended_product_id: form.recommended_product_id || null,
      recommended_quantity: form.recommended_quantity || null,
    }

    if (editingId) {
      await supabase.from('technical_audits').update(record).eq('id', editingId)
      await logAuditEvent({ action: 'update', entityType: 'technical_audit', entityId: editingId, metadata: { room_name: form.room_name } })
    } else {
      const { data: created } = await supabase.from('technical_audits').insert(record).select().single()
      if (created) {
        await logAuditEvent({ action: 'create', entityType: 'technical_audit', entityId: created.id, metadata: { deal_id: dealId, room_name: form.room_name } })
      }
    }

    setForm(EMPTY_FORM)
    setShowForm(false)
    setEditingId(null)
    setSaving(false)
    await onRefresh()
  }

  async function handleDelete(auditId: string, roomName: string) {
    if (!confirm(`Smazat audit "${roomName}"?`)) return
    const supabase = createClient()
    await supabase.from('technical_audits').delete().eq('id', auditId)
    await logAuditEvent({ action: 'delete', entityType: 'technical_audit', entityId: auditId, metadata: { deal_id: dealId } })
    await onRefresh()
  }

  const formUI = (
    <div className="bg-blue-50 rounded-lg p-3 mb-3 space-y-2">
      <div className="grid grid-cols-3 gap-2">
        <div className="col-span-2">
          <input type="text" value={form.room_name} onChange={(e) => setForm({ ...form, room_name: e.target.value })} placeholder="Název místnosti *" className="w-full px-2 py-1.5 border border-gray-200 rounded text-sm" required />
        </div>
        <input type="text" value={form.room_purpose} onChange={(e) => setForm({ ...form, room_purpose: e.target.value })} placeholder="Účel" className="w-full px-2 py-1.5 border border-gray-200 rounded text-sm" />
      </div>
      <div className="grid grid-cols-4 gap-2">
        <input type="text" value={form.building_name} onChange={(e) => setForm({ ...form, building_name: e.target.value })} placeholder="Budova" className="px-2 py-1.5 border border-gray-200 rounded text-sm" />
        <input type="number" value={form.floor_number} onChange={(e) => setForm({ ...form, floor_number: e.target.value })} placeholder="Patro" className="px-2 py-1.5 border border-gray-200 rounded text-sm" />
        <input type="number" step="0.1" value={form.area_m2} onChange={(e) => setForm({ ...form, area_m2: e.target.value })} placeholder="Plocha m²" className="px-2 py-1.5 border border-gray-200 rounded text-sm" />
        <input type="number" step="0.1" value={form.ceiling_height_m} onChange={(e) => setForm({ ...form, ceiling_height_m: e.target.value })} placeholder="Výška m" className="px-2 py-1.5 border border-gray-200 rounded text-sm" />
      </div>
      <div className="grid grid-cols-3 gap-2">
        <input type="text" value={form.ceiling_type} onChange={(e) => setForm({ ...form, ceiling_type: e.target.value })} placeholder="Typ stropu" className="px-2 py-1.5 border border-gray-200 rounded text-sm" />
        <input type="text" value={form.ventilation_type} onChange={(e) => setForm({ ...form, ventilation_type: e.target.value })} placeholder="Ventilace" className="px-2 py-1.5 border border-gray-200 rounded text-sm" />
        <input type="text" value={form.auditor_name} onChange={(e) => setForm({ ...form, auditor_name: e.target.value })} placeholder="Auditor" className="px-2 py-1.5 border border-gray-200 rounded text-sm" />
      </div>
      <div className="flex items-center gap-4 text-sm">
        <label className="flex items-center gap-1.5">
          <input type="checkbox" checked={form.has_suspended_ceiling} onChange={(e) => setForm({ ...form, has_suspended_ceiling: e.target.checked })} />
          Kazetový podhled
        </label>
        <label className="flex items-center gap-1.5">
          <input type="checkbox" checked={form.has_230v_nearby} onChange={(e) => setForm({ ...form, has_230v_nearby: e.target.checked })} />
          230V poblíž
        </label>
        <input type="date" value={form.audit_date} onChange={(e) => setForm({ ...form, audit_date: e.target.value })} className="px-2 py-1 border border-gray-200 rounded text-sm" />
      </div>
      <div className="flex gap-2">
        <select value={form.recommended_product_id} onChange={(e) => setForm({ ...form, recommended_product_id: e.target.value })} className="flex-1 px-2 py-1.5 border border-gray-200 rounded text-sm">
          <option value="">Doporučený produkt</option>
          {products.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
        </select>
        <input type="number" min="1" value={form.recommended_quantity} onChange={(e) => setForm({ ...form, recommended_quantity: parseInt(e.target.value) || 1 })} className="w-16 px-2 py-1.5 border border-gray-200 rounded text-sm" />
      </div>
      <textarea value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} placeholder="Poznámky" className="w-full px-2 py-1.5 border border-gray-200 rounded text-sm" rows={2} />
      <div className="flex gap-2">
        <Button onClick={handleSave} disabled={saving || !form.room_name.trim()}>
          {saving ? 'Ukládání...' : editingId ? 'Uložit' : 'Přidat'}
        </Button>
        <Button variant="secondary" onClick={() => { setShowForm(false); setEditingId(null); setForm(EMPTY_FORM) }}>Zrušit</Button>
      </div>
    </div>
  )

  return (
    <Section
      title={`Technické audity (${audits.length})`}
      icon={<Ruler className="w-4 h-4" />}
      expanded={expanded}
      onToggle={onToggle}
      actions={
        <button onClick={() => { setShowForm(true); setEditingId(null); setForm(EMPTY_FORM) }} className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium text-blue-600 hover:bg-blue-50 rounded">
          <Plus className="w-3.5 h-3.5" /> Přidat
        </button>
      }
    >
      {(showForm || editingId) && formUI}

      {audits.length === 0 && !showForm ? (
        <p className="text-sm text-gray-500">Žádné audity</p>
      ) : (
        <div className="space-y-4">
          {audits.map((audit) => (
            <div key={audit.id} className="bg-gray-50 rounded-lg p-4 group relative">
              <div className="absolute top-3 right-3 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button onClick={() => startEdit(audit)} className="p-1 text-gray-400 hover:text-blue-600 rounded"><Edit2 className="w-3.5 h-3.5" /></button>
                <button onClick={() => handleDelete(audit.id, audit.room_name || '')} className="p-1 text-gray-400 hover:text-red-500 rounded"><Trash2 className="w-3.5 h-3.5" /></button>
              </div>
              <div className="flex items-start justify-between mb-2">
                <div>
                  <h4 className="font-medium text-gray-900">
                    {audit.room_name}
                    {audit.room_purpose && <span className="text-gray-500 font-normal"> – {audit.room_purpose}</span>}
                  </h4>
                  {(audit.building_name || audit.floor_number !== null) && (
                    <p className="text-xs text-gray-500">
                      {[audit.building_name, audit.floor_number !== null && `${audit.floor_number}. patro`].filter(Boolean).join(', ')}
                    </p>
                  )}
                </div>
                {audit.audit_date && <span className="text-xs text-gray-500">{formatDate(audit.audit_date)}</span>}
              </div>
              <div className="grid grid-cols-3 gap-3 text-sm">
                {audit.area_m2 && <InfoRow label="Plocha" value={`${audit.area_m2} m²`} />}
                <InfoRow label="Výška stropu" value={`${audit.ceiling_height_m} m`} />
                {audit.volume_m3 && <InfoRow label="Objem" value={`${audit.volume_m3} m³`} />}
                {audit.ceiling_type && <InfoRow label="Strop" value={audit.ceiling_type} />}
                <InfoRow label="Kazetový podhled" value={audit.has_suspended_ceiling ? 'Ano' : 'Ne'} />
                <InfoRow label="230V" value={audit.has_230v_nearby ? 'Ano' : 'Ne'} />
                {audit.ventilation_type && <InfoRow label="Ventilace" value={audit.ventilation_type} />}
                {audit.recommended_product && <InfoRow label="Doporučení" value={`${audit.recommended_quantity}× ${audit.recommended_product.name}`} />}
                {audit.auditor_name && <InfoRow label="Auditor" value={audit.auditor_name} />}
              </div>
              {audit.notes && <p className="text-sm text-gray-600 mt-2 italic">{audit.notes}</p>}
              {audit.air_measurements && audit.air_measurements.length > 0 && (
                <div className="mt-3 border-t border-gray-200 pt-3">
                  <h5 className="text-xs font-semibold text-gray-500 uppercase mb-2">Měření kvality vzduchu</h5>
                  <div className="grid grid-cols-2 gap-2">
                    {audit.air_measurements.map((m) => (
                      <div key={m.id} className="bg-white rounded p-2 text-xs">
                        <span className="font-medium text-gray-700 uppercase">{m.measurement_type}</span>
                        <div className="flex gap-3 mt-1">
                          {m.value_before !== null && <span className="text-red-600">Před: {m.value_before} {m.unit}</span>}
                          {m.value_after !== null && <span className="text-green-600">Po: {m.value_after} {m.unit}</span>}
                          {m.threshold_safe !== null && <span className="text-gray-400">Limit: {m.threshold_safe} {m.unit}</span>}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </Section>
  )
}
