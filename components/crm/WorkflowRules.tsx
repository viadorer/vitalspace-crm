'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/Button'
import { Select } from '@/components/ui/Select'
import { Modal } from '@/components/ui/Modal'
import { DEAL_STAGES } from '@/lib/utils/constants'
import {
  Zap,
  Pencil,
  ToggleLeft,
  ToggleRight,
  Plus,
  ArrowRight,
  UserCheck,
  MessageSquare,
} from 'lucide-react'
import type { WorkflowRule, AssignStrategy } from '@/lib/supabase/types'

const ASSIGN_ROLES = [
  { value: '', label: 'Bez přiřazení' },
  { value: 'consultant', label: 'Obchodník' },
  { value: 'technician', label: 'Technik' },
]

const ASSIGN_STRATEGIES = [
  { value: 'keep_current', label: 'Ponechat stávajícího' },
  { value: 'round_robin', label: 'Round-robin (rovnoměrné rozdělení)' },
  { value: 'return_original', label: 'Vrátit původního' },
]

const ACTIVITY_TYPES = [
  { value: '', label: 'Bez aktivity' },
  { value: 'task', label: 'Úkol' },
  { value: 'note', label: 'Poznámka' },
  { value: 'call', label: 'Telefonát' },
  { value: 'email', label: 'Email' },
  { value: 'meeting', label: 'Schůzka' },
]

interface RuleFormData {
  trigger_stage: string
  assign_to_role: string
  assign_strategy: AssignStrategy
  create_activity: boolean
  activity_type: string
  activity_subject: string
  activity_due_days: number
  sort_order: number
}

const EMPTY_FORM: RuleFormData = {
  trigger_stage: 'lead',
  assign_to_role: '',
  assign_strategy: 'keep_current',
  create_activity: false,
  activity_type: '',
  activity_subject: '',
  activity_due_days: 0,
  sort_order: 0,
}

export function WorkflowRules() {
  const [rules, setRules] = useState<WorkflowRule[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editingRule, setEditingRule] = useState<WorkflowRule | null>(null)
  const [formData, setFormData] = useState<RuleFormData>(EMPTY_FORM)
  const [saving, setSaving] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)

  async function fetchRules() {
    const supabase = createClient()
    const { data } = await supabase
      .from('workflow_rules')
      .select('*')
      .order('sort_order')

    setRules((data || []) as WorkflowRule[])
    setLoading(false)
  }

  useEffect(() => {
    fetchRules()
  }, [])

  function openCreate() {
    setEditingRule(null)
    setFormData(EMPTY_FORM)
    setFormError(null)
    setShowModal(true)
  }

  function openEdit(rule: WorkflowRule) {
    setEditingRule(rule)
    setFormData({
      trigger_stage: rule.trigger_stage,
      assign_to_role: rule.assign_to_role || '',
      assign_strategy: rule.assign_strategy,
      create_activity: rule.create_activity,
      activity_type: rule.activity_type || '',
      activity_subject: rule.activity_subject || '',
      activity_due_days: rule.activity_due_days || 0,
      sort_order: rule.sort_order,
    })
    setFormError(null)
    setShowModal(true)
  }

  async function handleSave() {
    setSaving(true)
    setFormError(null)
    const supabase = createClient()

    const payload = {
      trigger_stage: formData.trigger_stage,
      assign_to_role: formData.assign_to_role || null,
      assign_strategy: formData.assign_strategy,
      create_activity: formData.create_activity,
      activity_type: formData.activity_type || null,
      activity_subject: formData.activity_subject || null,
      activity_due_days: formData.activity_due_days || null,
      sort_order: formData.sort_order,
      updated_at: new Date().toISOString(),
    }

    if (editingRule) {
      const { error } = await supabase
        .from('workflow_rules')
        .update(payload)
        .eq('id', editingRule.id)

      if (error) {
        setFormError(error.message)
        setSaving(false)
        return
      }
    } else {
      const { error } = await supabase
        .from('workflow_rules')
        .insert(payload)

      if (error) {
        setFormError(error.message)
        setSaving(false)
        return
      }
    }

    setSaving(false)
    setShowModal(false)
    await fetchRules()
  }

  async function toggleActive(rule: WorkflowRule) {
    const supabase = createClient()
    await supabase
      .from('workflow_rules')
      .update({ is_active: !rule.is_active, updated_at: new Date().toISOString() })
      .eq('id', rule.id)

    await fetchRules()
  }

  const stageLabel = (stage: string) =>
    DEAL_STAGES.find(s => s.value === stage)?.label || stage

  const stageColor = (stage: string) =>
    DEAL_STAGES.find(s => s.value === stage)?.color || '#94a3b8'

  if (loading) {
    return <div className="text-center text-gray-500 py-8">Načítání pravidel...</div>
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <Zap className="w-5 h-5 text-amber-500" />
            Workflow pravidla
          </h2>
          <p className="text-sm text-gray-500 mt-1">
            Automatické akce při změně fáze dealu – přiřazení konzultanta/technika a vytvoření úkolů
          </p>
        </div>
        <Button onClick={openCreate}>
          <Plus className="w-4 h-4 mr-1" />
          Nové pravidlo
        </Button>
      </div>

      <div className="space-y-3">
        {rules.map(rule => (
          <div
            key={rule.id}
            className={`bg-white rounded-xl border p-4 transition-opacity ${
              rule.is_active ? 'border-gray-200' : 'border-gray-100 opacity-50'
            }`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4 flex-1 min-w-0">
                <span
                  className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold flex-shrink-0"
                  style={{ backgroundColor: stageColor(rule.trigger_stage) + '20', color: stageColor(rule.trigger_stage) }}
                >
                  {stageLabel(rule.trigger_stage)}
                </span>

                <ArrowRight className="w-4 h-4 text-gray-300 flex-shrink-0" />

                <div className="flex items-center gap-3 flex-1 min-w-0">
                  {rule.assign_to_role && (
                    <span className="inline-flex items-center gap-1 text-sm text-purple-700 bg-purple-50 px-2 py-0.5 rounded">
                      <UserCheck className="w-3.5 h-3.5" />
                      {rule.assign_to_role === 'consultant' ? 'Obchodník' : 'Technik'}
                      <span className="text-purple-400 text-xs ml-1">
                        ({ASSIGN_STRATEGIES.find(s => s.value === rule.assign_strategy)?.label})
                      </span>
                    </span>
                  )}

                  {rule.create_activity && rule.activity_subject && (
                    <span className="inline-flex items-center gap-1 text-sm text-blue-700 bg-blue-50 px-2 py-0.5 rounded truncate">
                      <MessageSquare className="w-3.5 h-3.5 flex-shrink-0" />
                      <span className="truncate">{rule.activity_subject}</span>
                      {rule.activity_due_days !== null && rule.activity_due_days > 0 && (
                        <span className="text-blue-400 text-xs flex-shrink-0">+{rule.activity_due_days}d</span>
                      )}
                    </span>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-2 flex-shrink-0 ml-4">
                <button
                  onClick={() => openEdit(rule)}
                  className="p-1.5 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100"
                  title="Upravit"
                >
                  <Pencil className="w-4 h-4" />
                </button>
                <button
                  onClick={() => toggleActive(rule)}
                  className={`p-1.5 rounded-lg hover:bg-gray-100 ${
                    rule.is_active ? 'text-green-500 hover:text-green-700' : 'text-gray-300 hover:text-gray-500'
                  }`}
                  title={rule.is_active ? 'Deaktivovat' : 'Aktivovat'}
                >
                  {rule.is_active ? <ToggleRight className="w-5 h-5" /> : <ToggleLeft className="w-5 h-5" />}
                </button>
              </div>
            </div>
          </div>
        ))}

        {rules.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            Žádná pravidla. Klikněte na &quot;Nové pravidlo&quot; pro vytvoření.
          </div>
        )}
      </div>

      {/* Modal pro vytvoření/editaci */}
      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title={editingRule ? 'Upravit pravidlo' : 'Nové pravidlo'}
      >
        <div className="space-y-4">
          {formError && (
            <div className="bg-red-50 text-red-700 px-4 py-2 rounded-lg text-sm">{formError}</div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Trigger – při přechodu na fázi</label>
            <Select
              value={formData.trigger_stage}
              onChange={(e) => setFormData({ ...formData, trigger_stage: e.target.value })}
              options={DEAL_STAGES.map(s => ({ value: s.value, label: s.label }))}
            />
          </div>

          <div className="border-t border-gray-100 pt-4">
            <h3 className="text-sm font-semibold text-gray-700 mb-3">Přiřazení</h3>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs text-gray-500 mb-1">Přiřadit roli</label>
                <Select
                  value={formData.assign_to_role}
                  onChange={(e) => setFormData({ ...formData, assign_to_role: e.target.value })}
                  options={ASSIGN_ROLES}
                />
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">Strategie</label>
                <Select
                  value={formData.assign_strategy}
                  onChange={(e) => setFormData({ ...formData, assign_strategy: e.target.value as AssignStrategy })}
                  options={ASSIGN_STRATEGIES}
                />
              </div>
            </div>
          </div>

          <div className="border-t border-gray-100 pt-4">
            <label className="flex items-center gap-2 mb-3">
              <input
                type="checkbox"
                checked={formData.create_activity}
                onChange={(e) => setFormData({ ...formData, create_activity: e.target.checked })}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="text-sm font-semibold text-gray-700">Vytvořit aktivitu</span>
            </label>

            {formData.create_activity && (
              <div className="space-y-3 pl-6">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">Typ aktivity</label>
                    <Select
                      value={formData.activity_type}
                      onChange={(e) => setFormData({ ...formData, activity_type: e.target.value })}
                      options={ACTIVITY_TYPES.filter(t => t.value !== '')}
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">Splatnost (dny)</label>
                    <input
                      type="number"
                      min={0}
                      value={formData.activity_due_days}
                      onChange={(e) => setFormData({ ...formData, activity_due_days: parseInt(e.target.value) || 0 })}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Předmět aktivity</label>
                  <input
                    type="text"
                    value={formData.activity_subject}
                    onChange={(e) => setFormData({ ...formData, activity_subject: e.target.value })}
                    placeholder="např. Kontaktovat klienta"
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
            )}
          </div>

          <div className="border-t border-gray-100 pt-4">
            <label className="block text-xs text-gray-500 mb-1">Pořadí (nižší = dříve)</label>
            <input
              type="number"
              min={0}
              value={formData.sort_order}
              onChange={(e) => setFormData({ ...formData, sort_order: parseInt(e.target.value) || 0 })}
              className="w-24 px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="flex gap-3 pt-2">
            <Button onClick={handleSave} disabled={saving}>
              {saving ? 'Ukládání...' : editingRule ? 'Uložit změny' : 'Vytvořit pravidlo'}
            </Button>
            <Button variant="secondary" onClick={() => setShowModal(false)}>
              Zrušit
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
