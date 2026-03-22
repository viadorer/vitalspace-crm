'use client'

import { useState } from 'react'
import { useSequences } from '@/lib/hooks/useSequences'
import { useSequenceSteps } from '@/lib/hooks/useSequenceSteps'
import { useEnrollments } from '@/lib/hooks/useEnrollments'
import { Button } from '@/components/ui/Button'
import { Modal } from '@/components/ui/Modal'
import { Input } from '@/components/ui/Input'
import { Badge } from '@/components/ui/Badge'
import { SequenceBuilder } from './SequenceBuilder'
import { SequenceEnrollmentView } from './SequenceEnrollmentView'
import {
  Mail,
  Play,
  Pause,
  Plus,
  Settings,
  Users,
  Zap,
  ChevronRight,
} from 'lucide-react'
import type { EmailSequence } from '@/lib/supabase/sequence-types'

export function SequenceManager() {
  const { sequences, loading, createSequence, updateSequence, deleteSequence } = useSequences()
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [showCreate, setShowCreate] = useState(false)
  const [createForm, setCreateForm] = useState({ name: '', description: '' })
  const [saving, setSaving] = useState(false)
  const [view, setView] = useState<'steps' | 'enrollments'>('steps')

  async function handleCreate() {
    if (!createForm.name) return
    setSaving(true)
    await createSequence(createForm)
    setShowCreate(false)
    setCreateForm({ name: '', description: '' })
    setSaving(false)
  }

  async function handleToggleActive(seq: EmailSequence) {
    await updateSequence(seq.id, { is_active: !seq.is_active })
  }

  async function handleDelete(id: string) {
    if (!confirm('Opravdu smazat tuto sekvenci?')) return
    await deleteSequence(id)
    if (selectedId === id) setSelectedId(null)
  }

  if (loading) {
    return <div className="text-center text-gray-500 py-8">Načítání sekvencí...</div>
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">Email sekvence</h2>
          <p className="text-sm text-gray-500 mt-1">
            Automatizované outreach sekvence s email + callcentrum + AI personalizací
          </p>
        </div>
        <Button onClick={() => setShowCreate(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Nová sekvence
        </Button>
      </div>

      {/* Seznam sekvencí */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Levý panel: seznam */}
        <div className="space-y-3">
          {sequences.map((seq) => (
            <button
              key={seq.id}
              onClick={() => setSelectedId(seq.id)}
              className={`w-full text-left p-4 rounded-lg border transition-all ${
                selectedId === seq.id
                  ? 'border-blue-500 bg-blue-50 shadow-sm'
                  : 'border-gray-200 bg-white hover:border-gray-300'
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <Mail className="w-4 h-4 text-blue-600 flex-shrink-0" />
                    <span className="font-medium text-gray-900 truncate">{seq.name}</span>
                  </div>
                  {seq.description && (
                    <p className="text-xs text-gray-500 mt-1 line-clamp-2">{seq.description}</p>
                  )}
                  <div className="flex items-center gap-3 mt-2 text-xs text-gray-500">
                    <span className="flex items-center gap-1">
                      <Zap className="w-3 h-3" />
                      {String((seq as unknown as Record<string, unknown>).step_count || 0)} kroků
                    </span>
                    <span className="flex items-center gap-1">
                      <Users className="w-3 h-3" />
                      {String((seq as unknown as Record<string, unknown>).enrollment_count || 0)} enrollováno
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0 ml-2">
                  <button
                    onClick={(e) => { e.stopPropagation(); handleToggleActive(seq) }}
                    className={`p-1 rounded ${seq.is_active ? 'text-green-600' : 'text-gray-400'}`}
                    title={seq.is_active ? 'Aktivní — klikněte pro deaktivaci' : 'Neaktivní — klikněte pro aktivaci'}
                  >
                    {seq.is_active ? <Play className="w-4 h-4" /> : <Pause className="w-4 h-4" />}
                  </button>
                  <ChevronRight className="w-4 h-4 text-gray-400" />
                </div>
              </div>
            </button>
          ))}

          {sequences.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              <Mail className="w-8 h-8 mx-auto mb-2 text-gray-300" />
              <p>Zatím žádné sekvence</p>
              <p className="text-xs mt-1">Vytvořte první sekvenci pro automatický outreach</p>
            </div>
          )}
        </div>

        {/* Pravý panel: detail sekvence */}
        {selectedId ? (
          <div className="lg:col-span-2 space-y-4">
            {/* Tabs */}
            <div className="flex items-center gap-4 border-b border-gray-200 pb-2">
              <button
                onClick={() => setView('steps')}
                className={`flex items-center gap-1.5 pb-2 text-sm font-medium border-b-2 transition-colors ${
                  view === 'steps' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                <Settings className="w-4 h-4" />
                Kroky sekvence
              </button>
              <button
                onClick={() => setView('enrollments')}
                className={`flex items-center gap-1.5 pb-2 text-sm font-medium border-b-2 transition-colors ${
                  view === 'enrollments' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                <Users className="w-4 h-4" />
                Enrollmenty
              </button>
              <div className="flex-1" />
              <button
                onClick={() => handleDelete(selectedId)}
                className="text-xs text-red-500 hover:text-red-700"
              >
                Smazat sekvenci
              </button>
            </div>

            {view === 'steps' ? (
              <SequenceBuilder sequenceId={selectedId} />
            ) : (
              <SequenceEnrollmentView sequenceId={selectedId} />
            )}
          </div>
        ) : (
          <div className="lg:col-span-2 flex items-center justify-center text-gray-400 py-16">
            <div className="text-center">
              <Mail className="w-12 h-12 mx-auto mb-3 text-gray-300" />
              <p>Vyberte sekvenci pro zobrazení detailu</p>
            </div>
          </div>
        )}
      </div>

      {/* Create Modal */}
      <Modal isOpen={showCreate} onClose={() => setShowCreate(false)} title="Nová email sekvence">
        <div className="space-y-4">
          <Input
            label="Název sekvence"
            value={createForm.name}
            onChange={(e) => setCreateForm({ ...createForm, name: e.target.value })}
            placeholder="např. Obecný B2B outreach"
            required
          />
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Popis</label>
            <textarea
              value={createForm.description}
              onChange={(e) => setCreateForm({ ...createForm, description: e.target.value })}
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              rows={3}
              placeholder="Popis účelu sekvence..."
            />
          </div>
          <div className="flex justify-end gap-3 pt-4">
            <Button variant="secondary" onClick={() => setShowCreate(false)}>Zrušit</Button>
            <Button onClick={handleCreate} disabled={saving || !createForm.name}>
              {saving ? 'Vytváření...' : 'Vytvořit'}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
