'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/Button'
import { formatDate } from '@/lib/utils/format'
import { logAuditEvent } from '@/lib/hooks/useAuditLog'
import { Edit2, Plus, Save, Trash2, Wrench, X } from 'lucide-react'
import { Section, InfoRow, INSTALLATION_STATUS_LABELS, type DealSectionProps } from './shared'

const EMPTY_FORM = {
  device_model: '', installation_location: '', scheduled_date: '',
  technician_name: '', device_serial_number: '', notes: '',
  safety_check_passed: false,
}

const STATUS_OPTIONS = [
  { value: 'planned', label: 'Plánováno' },
  { value: 'in_progress', label: 'Probíhá' },
  { value: 'completed', label: 'Dokončeno' },
  { value: 'issue', label: 'Problém' },
]

export function DealInstallationsSection({ dealId, data, onRefresh, expanded, onToggle }: DealSectionProps & { expanded: boolean; onToggle: () => void }) {
  const { installations } = data
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [form, setForm] = useState(EMPTY_FORM)
  const [saving, setSaving] = useState(false)

  function startEdit(inst: any) {
    setEditingId(inst.id)
    setForm({
      device_model: inst.device_model || '',
      installation_location: inst.installation_location || '',
      scheduled_date: inst.scheduled_date || '',
      technician_name: inst.technician_name || '',
      device_serial_number: inst.device_serial_number || '',
      notes: inst.notes || '',
      safety_check_passed: inst.safety_check_passed || false,
    })
    setShowForm(false)
  }

  async function handleSave() {
    setSaving(true)
    const supabase = createClient()

    const record: Record<string, any> = {
      deal_id: dealId,
      device_model: form.device_model || null,
      installation_location: form.installation_location || null,
      scheduled_date: form.scheduled_date || null,
      technician_name: form.technician_name || null,
      device_serial_number: form.device_serial_number || null,
      notes: form.notes || null,
      safety_check_passed: form.safety_check_passed,
    }

    if (editingId) {
      await supabase.from('installations').update(record).eq('id', editingId)
      await logAuditEvent({ action: 'update', entityType: 'installation', entityId: editingId, metadata: { deal_id: dealId } })
    } else {
      record.status = 'planned'
      const { data: created } = await supabase.from('installations').insert(record).select().single()
      if (created) {
        await logAuditEvent({ action: 'create', entityType: 'installation', entityId: created.id, metadata: { deal_id: dealId, device: form.device_model } })
      }
    }

    setForm(EMPTY_FORM)
    setShowForm(false)
    setEditingId(null)
    setSaving(false)
    await onRefresh()
  }

  async function handleStatusChange(instId: string, newStatus: string) {
    const supabase = createClient()
    const updates: Record<string, any> = { status: newStatus }
    if (newStatus === 'completed') updates.completed_date = new Date().toISOString().split('T')[0]

    await supabase.from('installations').update(updates).eq('id', instId)
    await logAuditEvent({ action: 'update', entityType: 'installation', entityId: instId, changes: { status: { old: '', new: newStatus } } })
    await onRefresh()
  }

  async function handleDelete(instId: string) {
    if (!confirm('Smazat instalaci?')) return
    const supabase = createClient()
    await supabase.from('installations').delete().eq('id', instId)
    await logAuditEvent({ action: 'delete', entityType: 'installation', entityId: instId, metadata: { deal_id: dealId } })
    await onRefresh()
  }

  const formUI = (
    <div className="bg-blue-50 rounded-lg p-3 mb-3 space-y-2">
      <div className="grid grid-cols-2 gap-2">
        <input type="text" value={form.device_model} onChange={(e) => setForm({ ...form, device_model: e.target.value })} placeholder="Model zařízení" className="px-2 py-1.5 border border-gray-200 rounded text-sm" />
        <input type="text" value={form.installation_location} onChange={(e) => setForm({ ...form, installation_location: e.target.value })} placeholder="Místo instalace" className="px-2 py-1.5 border border-gray-200 rounded text-sm" />
      </div>
      <div className="grid grid-cols-3 gap-2">
        <input type="date" value={form.scheduled_date} onChange={(e) => setForm({ ...form, scheduled_date: e.target.value })} className="px-2 py-1.5 border border-gray-200 rounded text-sm" />
        <input type="text" value={form.technician_name} onChange={(e) => setForm({ ...form, technician_name: e.target.value })} placeholder="Technik" className="px-2 py-1.5 border border-gray-200 rounded text-sm" />
        <input type="text" value={form.device_serial_number} onChange={(e) => setForm({ ...form, device_serial_number: e.target.value })} placeholder="S/N" className="px-2 py-1.5 border border-gray-200 rounded text-sm" />
      </div>
      <div className="flex items-center gap-4 text-sm">
        <label className="flex items-center gap-1.5">
          <input type="checkbox" checked={form.safety_check_passed} onChange={(e) => setForm({ ...form, safety_check_passed: e.target.checked })} />
          Bezpečnostní kontrola OK
        </label>
      </div>
      <textarea value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} placeholder="Poznámky" className="w-full px-2 py-1.5 border border-gray-200 rounded text-sm" rows={2} />
      <div className="flex gap-2">
        <Button onClick={handleSave} disabled={saving}>{saving ? 'Ukládání...' : editingId ? 'Uložit' : 'Přidat'}</Button>
        <Button variant="secondary" onClick={() => { setShowForm(false); setEditingId(null); setForm(EMPTY_FORM) }}>Zrušit</Button>
      </div>
    </div>
  )

  return (
    <Section
      title={`Instalace (${installations.length})`}
      icon={<Wrench className="w-4 h-4" />}
      expanded={expanded}
      onToggle={onToggle}
      actions={
        <button onClick={() => { setShowForm(true); setEditingId(null); setForm(EMPTY_FORM) }} className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium text-blue-600 hover:bg-blue-50 rounded">
          <Plus className="w-3.5 h-3.5" /> Přidat
        </button>
      }
    >
      {(showForm || editingId) && formUI}

      {installations.length === 0 && !showForm ? (
        <p className="text-sm text-gray-500">Žádné instalace</p>
      ) : (
        <div className="space-y-3">
          {installations.map((inst) => {
            const statusInfo = INSTALLATION_STATUS_LABELS[inst.status]
            return (
              <div key={inst.id} className="bg-gray-50 rounded-lg p-4 group relative">
                <div className="absolute top-3 right-3 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button onClick={() => startEdit(inst)} className="p-1 text-gray-400 hover:text-blue-600 rounded"><Edit2 className="w-3.5 h-3.5" /></button>
                  <button onClick={() => handleDelete(inst.id)} className="p-1 text-gray-400 hover:text-red-500 rounded"><Trash2 className="w-3.5 h-3.5" /></button>
                </div>
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <div className="flex items-center gap-2">
                      {inst.device_model && <span className="font-medium text-gray-900">{inst.device_model}</span>}
                      <select
                        value={inst.status}
                        onChange={(e) => handleStatusChange(inst.id, e.target.value)}
                        className={`appearance-none text-xs font-medium px-2 py-0.5 rounded-full border-0 cursor-pointer ${statusInfo.color}`}
                      >
                        {STATUS_OPTIONS.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
                      </select>
                    </div>
                    {inst.installation_location && <p className="text-sm text-gray-600">{inst.installation_location}</p>}
                  </div>
                  {inst.technician_name && <span className="text-sm text-gray-500">{inst.technician_name}</span>}
                </div>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  {inst.scheduled_date && <InfoRow label="Plán" value={formatDate(inst.scheduled_date)} />}
                  {inst.completed_date && <InfoRow label="Dokončeno" value={formatDate(inst.completed_date)} />}
                  {inst.device_serial_number && <InfoRow label="S/N" value={inst.device_serial_number} />}
                  <InfoRow label="Bezpečnostní kontrola" value={inst.safety_check_passed ? '✓ OK' : '✗ Neschváleno'} />
                  {inst.ozone_concentration_max !== null && <InfoRow label="Max O₃" value={`${inst.ozone_concentration_max} µg/m³`} />}
                  {inst.ozone_decay_minutes !== null && <InfoRow label="Rozpad O₃" value={`${inst.ozone_decay_minutes} min`} />}
                </div>
                {inst.notes && <p className="text-sm text-gray-600 mt-2 italic">{inst.notes}</p>}
              </div>
            )
          })}
        </div>
      )}
    </Section>
  )
}
