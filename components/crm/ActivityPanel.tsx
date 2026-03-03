'use client'

import { useState, FormEvent } from 'react'
import { MessageSquarePlus, ChevronDown, ChevronRight, FileText } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { useActivities } from '@/lib/hooks/useActivities'
import { formatDate, formatDateTime } from '@/lib/utils/format'
import type { ActivityEntityType, ActivityType } from '@/lib/supabase/types'

const ACTIVITY_TYPE_LABELS: Record<string, string> = {
  note: 'Poznámka',
  call: 'Telefonát',
  email: 'Email',
  meeting: 'Schůzka',
  task: 'Úkol',
  document: 'Dokument',
}

const ACTIVITY_TYPES = [
  { value: 'note', label: 'Poznámka' },
  { value: 'call', label: 'Telefonát' },
  { value: 'email', label: 'Email' },
  { value: 'meeting', label: 'Schůzka' },
  { value: 'task', label: 'Úkol' },
]

interface ActivityPanelProps {
  entityType: ActivityEntityType
  entityId: string
  defaultExpanded?: boolean
}

export function ActivityPanel({ entityType, entityId, defaultExpanded = true }: ActivityPanelProps) {
  const { activities, loading, addActivity, toggleComplete } = useActivities({ entityType, entityId })
  const [expanded, setExpanded] = useState(defaultExpanded)
  const [showForm, setShowForm] = useState(false)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({ type: 'note' as ActivityType, subject: '', body: '' })

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    if (!form.subject.trim()) return

    setSaving(true)
    try {
      await addActivity({
        type: form.type,
        subject: form.subject,
        body: form.body || undefined,
      })
      setForm({ type: 'note', subject: '', body: '' })
      setShowForm(false)
    } catch {
      // error handled in hook
    }
    setSaving(false)
  }

  return (
    <div className="border border-gray-200 rounded-lg overflow-hidden">
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center gap-2 px-4 py-3 bg-gray-50 hover:bg-gray-100 transition-colors text-left"
      >
        {expanded ? <ChevronDown className="w-4 h-4 text-gray-400" /> : <ChevronRight className="w-4 h-4 text-gray-400" />}
        <FileText className="w-4 h-4" />
        <span className="font-medium text-sm text-gray-900">
          Aktivity ({loading ? '...' : activities.length})
        </span>
      </button>

      {expanded && (
        <div className="px-4 py-3">
          <div className="mb-3">
            {showForm ? (
              <form onSubmit={handleSubmit} className="bg-blue-50 rounded-lg p-3 space-y-2">
                <div className="flex gap-2">
                  <select
                    value={form.type}
                    onChange={(e) => setForm({ ...form, type: e.target.value as ActivityType })}
                    className="px-2 py-1.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {ACTIVITY_TYPES.map((t) => (
                      <option key={t.value} value={t.value}>{t.label}</option>
                    ))}
                  </select>
                  <input
                    type="text"
                    placeholder="Předmět"
                    value={form.subject}
                    onChange={(e) => setForm({ ...form, subject: e.target.value })}
                    className="flex-1 px-3 py-1.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                <textarea
                  placeholder="Podrobnosti (volitelné)"
                  value={form.body}
                  onChange={(e) => setForm({ ...form, body: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows={2}
                />
                <div className="flex gap-2">
                  <Button type="submit" disabled={saving}>
                    {saving ? 'Ukládání...' : 'Přidat'}
                  </Button>
                  <Button type="button" variant="secondary" onClick={() => setShowForm(false)}>
                    Zrušit
                  </Button>
                </div>
              </form>
            ) : (
              <button
                onClick={() => setShowForm(true)}
                className="flex items-center gap-2 text-sm text-blue-600 hover:text-blue-700 font-medium"
              >
                <MessageSquarePlus className="w-4 h-4" />
                Přidat aktivitu
              </button>
            )}
          </div>

          {loading ? (
            <p className="text-sm text-gray-500">Načítání...</p>
          ) : activities.length === 0 ? (
            <p className="text-sm text-gray-500">Žádné aktivity</p>
          ) : (
            <div className="space-y-3">
              {activities.map((activity) => (
                <div key={activity.id} className="flex gap-3">
                  <div className="flex-shrink-0 mt-1">
                    <button
                      onClick={() => toggleComplete(activity.id, activity.is_completed)}
                      className={`inline-flex items-center justify-center w-6 h-6 rounded-full text-xs font-medium transition-colors ${
                        activity.is_completed
                          ? 'bg-green-100 text-green-700 hover:bg-green-200'
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                      title={activity.is_completed ? 'Označit jako nesplněné' : 'Označit jako splněné'}
                    >
                      {activity.is_completed ? '✓' : activity.type.charAt(0).toUpperCase()}
                    </button>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-medium text-gray-500">
                        {ACTIVITY_TYPE_LABELS[activity.type] || activity.type}
                      </span>
                      {activity.is_completed && (
                        <span className="text-xs text-green-600">✓ Splněno</span>
                      )}
                      <span className="text-xs text-gray-400 ml-auto">
                        {formatDateTime(activity.created_at)}
                      </span>
                    </div>
                    {activity.subject && (
                      <p className={`text-sm font-medium ${activity.is_completed ? 'text-gray-400 line-through' : 'text-gray-900'}`}>
                        {activity.subject}
                      </p>
                    )}
                    {activity.body && (
                      <p className="text-sm text-gray-600 whitespace-pre-wrap">{activity.body}</p>
                    )}
                    {activity.due_date && (
                      <p className="text-xs text-orange-600 mt-1">Termín: {formatDate(activity.due_date)}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
