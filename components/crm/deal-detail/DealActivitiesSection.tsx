'use client'

import { useState, FormEvent } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/Button'
import { formatDate, formatDateTime } from '@/lib/utils/format'
import { logAuditEvent } from '@/lib/hooks/useAuditLog'
import {
  CheckCircle2, Circle, Edit2, FileText, MessageSquarePlus, Save, Trash2, X,
} from 'lucide-react'
import { Section, ACTIVITY_TYPE_LABELS, ACTIVITY_TYPES, type DealSectionProps } from './shared'

export function DealActivitiesSection({ dealId, data, onRefresh, expanded, onToggle }: DealSectionProps & { expanded: boolean; onToggle: () => void }) {
  const { activities } = data
  const [showAdd, setShowAdd] = useState(false)
  const [newActivity, setNewActivity] = useState({ type: 'note', subject: '', body: '' })
  const [savingAdd, setSavingAdd] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editForm, setEditForm] = useState({ type: '', subject: '', body: '' })
  const [savingEdit, setSavingEdit] = useState(false)

  async function handleAdd(e: FormEvent) {
    e.preventDefault()
    if (!newActivity.subject.trim()) return
    setSavingAdd(true)
    const supabase = createClient()
    const { data: userData } = await supabase.auth.getUser()
    const { data: created, error } = await supabase.from('activities').insert({
      entity_type: 'deal',
      entity_id: dealId,
      type: newActivity.type,
      subject: newActivity.subject,
      body: newActivity.body || null,
      created_by: userData?.user?.id || null,
    }).select().single()

    if (!error && created) {
      await logAuditEvent({ action: 'create', entityType: 'deal_activity', entityId: created.id, metadata: { deal_id: dealId, type: newActivity.type, subject: newActivity.subject } })
      setNewActivity({ type: 'note', subject: '', body: '' })
      setShowAdd(false)
      await onRefresh()
    }
    setSavingAdd(false)
  }

  async function handleToggleComplete(activityId: string, currentState: boolean) {
    const supabase = createClient()
    await supabase.from('activities').update({ is_completed: !currentState }).eq('id', activityId)
    await onRefresh()
  }

  function startEdit(activity: any) {
    setEditingId(activity.id)
    setEditForm({ type: activity.type, subject: activity.subject || '', body: activity.body || '' })
  }

  async function handleSaveEdit(activityId: string) {
    setSavingEdit(true)
    const supabase = createClient()
    await supabase.from('activities').update({
      type: editForm.type,
      subject: editForm.subject,
      body: editForm.body || null,
    }).eq('id', activityId)

    await logAuditEvent({ action: 'update', entityType: 'deal_activity', entityId: activityId, metadata: { deal_id: dealId } })
    setEditingId(null)
    setSavingEdit(false)
    await onRefresh()
  }

  async function handleDelete(activityId: string) {
    if (!confirm('Smazat aktivitu?')) return
    const supabase = createClient()
    await supabase.from('activities').delete().eq('id', activityId)
    await logAuditEvent({ action: 'delete', entityType: 'deal_activity', entityId: activityId, metadata: { deal_id: dealId } })
    await onRefresh()
  }

  return (
    <Section
      title={`Aktivity (${activities.length})`}
      icon={<FileText className="w-4 h-4" />}
      expanded={expanded}
      onToggle={onToggle}
    >
      {/* Add form */}
      <div className="mb-3">
        {showAdd ? (
          <form onSubmit={handleAdd} className="bg-blue-50 rounded-lg p-3 space-y-2">
            <div className="flex gap-2">
              <select value={newActivity.type} onChange={(e) => setNewActivity({ ...newActivity, type: e.target.value })} className="px-2 py-1.5 border border-gray-200 rounded-lg text-sm">
                {ACTIVITY_TYPES.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
              </select>
              <input type="text" placeholder="Předmět" value={newActivity.subject} onChange={(e) => setNewActivity({ ...newActivity, subject: e.target.value })} className="flex-1 px-3 py-1.5 border border-gray-200 rounded-lg text-sm" required />
            </div>
            <textarea placeholder="Podrobnosti (volitelné)" value={newActivity.body} onChange={(e) => setNewActivity({ ...newActivity, body: e.target.value })} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm" rows={2} />
            <div className="flex gap-2">
              <Button type="submit" disabled={savingAdd}>{savingAdd ? 'Ukládání...' : 'Přidat'}</Button>
              <Button type="button" variant="secondary" onClick={() => setShowAdd(false)}>Zrušit</Button>
            </div>
          </form>
        ) : (
          <button onClick={() => setShowAdd(true)} className="flex items-center gap-2 text-sm text-blue-600 hover:text-blue-700 font-medium">
            <MessageSquarePlus className="w-4 h-4" /> Přidat aktivitu
          </button>
        )}
      </div>

      {activities.length === 0 ? (
        <p className="text-sm text-gray-500">Žádné aktivity</p>
      ) : (
        <div className="space-y-3">
          {activities.map((activity) => (
            <div key={activity.id} className="flex gap-3 group">
              {/* Toggle complete */}
              <button
                onClick={() => handleToggleComplete(activity.id, activity.is_completed)}
                className="flex-shrink-0 mt-1"
              >
                {activity.is_completed ? (
                  <CheckCircle2 className="w-5 h-5 text-green-500" />
                ) : (
                  <Circle className="w-5 h-5 text-gray-300 hover:text-blue-400" />
                )}
              </button>

              <div className="flex-1 min-w-0">
                {editingId === activity.id ? (
                  <div className="bg-blue-50 rounded-lg p-2 space-y-2">
                    <div className="flex gap-2">
                      <select value={editForm.type} onChange={(e) => setEditForm({ ...editForm, type: e.target.value })} className="px-2 py-1 border border-gray-200 rounded text-sm">
                        {ACTIVITY_TYPES.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
                      </select>
                      <input type="text" value={editForm.subject} onChange={(e) => setEditForm({ ...editForm, subject: e.target.value })} className="flex-1 px-2 py-1 border border-gray-200 rounded text-sm" />
                    </div>
                    <textarea value={editForm.body} onChange={(e) => setEditForm({ ...editForm, body: e.target.value })} className="w-full px-2 py-1 border border-gray-200 rounded text-sm" rows={2} />
                    <div className="flex gap-1">
                      <button onClick={() => handleSaveEdit(activity.id)} disabled={savingEdit} className="p-1 text-green-600 hover:bg-green-50 rounded"><Save className="w-3.5 h-3.5" /></button>
                      <button onClick={() => setEditingId(null)} className="p-1 text-gray-400 hover:bg-gray-100 rounded"><X className="w-3.5 h-3.5" /></button>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-medium text-gray-500">{ACTIVITY_TYPE_LABELS[activity.type] || activity.type}</span>
                      {activity.is_completed && <span className="text-xs text-green-600">✓ Splněno</span>}
                      <span className="text-xs text-gray-400 ml-auto">{formatDateTime(activity.created_at)}</span>
                      {/* Action buttons on hover */}
                      <div className="flex gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onClick={() => startEdit(activity)} className="p-0.5 text-gray-300 hover:text-blue-600"><Edit2 className="w-3 h-3" /></button>
                        <button onClick={() => handleDelete(activity.id)} className="p-0.5 text-gray-300 hover:text-red-500"><Trash2 className="w-3 h-3" /></button>
                      </div>
                    </div>
                    {activity.subject && <p className={`text-sm font-medium ${activity.is_completed ? 'text-gray-400 line-through' : 'text-gray-900'}`}>{activity.subject}</p>}
                    {activity.body && <p className="text-sm text-gray-600 whitespace-pre-wrap">{activity.body}</p>}
                    {activity.due_date && <p className="text-xs text-orange-600 mt-1">Termín: {formatDate(activity.due_date)}</p>}
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </Section>
  )
}
