'use client'

import { useState, useEffect } from 'react'
import { useSequenceSteps } from '@/lib/hooks/useSequenceSteps'
import { Button } from '@/components/ui/Button'
import { Select } from '@/components/ui/Select'
import { Input } from '@/components/ui/Input'
import { EMAIL_TEMPLATES } from '@/lib/email/templates'
import type { TemplateName } from '@/lib/email/templates'
import {
  Mail,
  Phone,
  Clock,
  Brain,
  Plus,
  Trash2,
  Save,
  ArrowDown,
  Sparkles,
} from 'lucide-react'
import type { SequenceStep, StepActionType } from '@/lib/supabase/sequence-types'

const ACTION_TYPE_OPTIONS = [
  { value: 'email', label: 'Email', icon: Mail, color: 'text-blue-600 bg-blue-50' },
  { value: 'callcenter', label: 'Callcentrum', icon: Phone, color: 'text-green-600 bg-green-50' },
  { value: 'wait_for_event', label: 'Čekání na událost', icon: Clock, color: 'text-amber-600 bg-amber-50' },
  { value: 'ai_decide', label: 'AI rozhodnutí', icon: Brain, color: 'text-purple-600 bg-purple-50' },
]

const TEMPLATE_OPTIONS = Object.entries(EMAIL_TEMPLATES).map(([key, tpl]) => ({
  value: key,
  label: tpl.label,
}))

interface StepDraft {
  action_type: StepActionType
  email_template_name: string
  email_subject_override: string
  use_ai_personalization: boolean
  delay_hours: number
  wait_event_type: 'open' | 'click' | 'call_result' | 'reply'
  wait_timeout_hours: number
  on_event_skip_to_step: number | null
}

const EMPTY_STEP: StepDraft = {
  action_type: 'email',
  email_template_name: 'obecna-nabidka',
  email_subject_override: '',
  use_ai_personalization: false,
  delay_hours: 72,
  wait_event_type: 'open',
  wait_timeout_hours: 168,
  on_event_skip_to_step: null,
}

export function SequenceBuilder({ sequenceId }: { sequenceId: string }) {
  const { steps, loading, saveSteps } = useSequenceSteps(sequenceId)
  const [drafts, setDrafts] = useState<StepDraft[]>([])
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  // Init drafts from loaded steps
  useEffect(() => {
    if (steps.length > 0) {
      setDrafts(steps.map(s => ({
        action_type: s.action_type,
        email_template_name: s.email_template_name || 'obecna-nabidka',
        email_subject_override: s.email_subject_override || '',
        use_ai_personalization: s.use_ai_personalization,
        delay_hours: s.delay_hours,
        wait_event_type: s.wait_event_type || 'open',
        wait_timeout_hours: s.wait_timeout_hours,
        on_event_skip_to_step: s.on_event_skip_to_step,
      })))
    }
  }, [steps])

  function addStep() {
    setDrafts(prev => [...prev, { ...EMPTY_STEP, delay_hours: prev.length === 0 ? 0 : 72 }])
    setSaved(false)
  }

  function removeStep(index: number) {
    setDrafts(prev => prev.filter((_, i) => i !== index))
    setSaved(false)
  }

  function updateStep(index: number, updates: Partial<StepDraft>) {
    setDrafts(prev => prev.map((s, i) => i === index ? { ...s, ...updates } : s))
    setSaved(false)
  }

  async function handleSave() {
    setSaving(true)
    await saveSteps(drafts)
    setSaving(false)
    setSaved(true)
    setTimeout(() => setSaved(false), 3000)
  }

  if (loading) {
    return <div className="text-center text-gray-500 py-8">Načítání kroků...</div>
  }

  return (
    <div className="space-y-4">
      {/* Steps */}
      {drafts.map((draft, index) => {
        const actionInfo = ACTION_TYPE_OPTIONS.find(a => a.value === draft.action_type)
        const Icon = actionInfo?.icon || Mail

        return (
          <div key={index}>
            {index > 0 && (
              <div className="flex items-center justify-center py-2">
                <ArrowDown className="w-4 h-4 text-gray-300" />
                <span className="text-xs text-gray-400 ml-2">
                  čeká {draft.delay_hours}h ({Math.round(draft.delay_hours / 24)}d)
                </span>
              </div>
            )}
            <div className="bg-white border border-gray-200 rounded-lg p-4 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className={`p-1.5 rounded-lg ${actionInfo?.color || 'bg-gray-100'}`}>
                    <Icon className="w-4 h-4" />
                  </div>
                  <span className="text-sm font-medium text-gray-900">
                    Krok {index + 1}
                  </span>
                </div>
                <button
                  onClick={() => removeStep(index)}
                  className="p-1 text-gray-400 hover:text-red-600 rounded"
                  title="Smazat krok"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <Select
                  label="Typ akce"
                  value={draft.action_type}
                  onChange={(e) => updateStep(index, { action_type: e.target.value as StepActionType })}
                  options={ACTION_TYPE_OPTIONS.map(o => ({ value: o.value, label: o.label }))}
                />
                <Input
                  label="Delay (hodiny)"
                  type="number"
                  value={draft.delay_hours}
                  onChange={(e) => updateStep(index, { delay_hours: Number(e.target.value) })}
                  min="0"
                />
              </div>

              {draft.action_type === 'email' && (
                <div className="space-y-3">
                  <Select
                    label="Email šablona"
                    value={draft.email_template_name}
                    onChange={(e) => updateStep(index, { email_template_name: e.target.value })}
                    options={TEMPLATE_OPTIONS}
                  />
                  <Input
                    label="Override předmětu (volitelné)"
                    value={draft.email_subject_override}
                    onChange={(e) => updateStep(index, { email_subject_override: e.target.value })}
                    placeholder="Nechte prázdné pro výchozí předmět šablony"
                  />
                  <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={draft.use_ai_personalization}
                      onChange={(e) => updateStep(index, { use_ai_personalization: e.target.checked })}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <Sparkles className="w-4 h-4 text-purple-500" />
                    AI personalizace (Gemini přizpůsobí email segmentu a firmě)
                  </label>
                </div>
              )}

              {draft.action_type === 'wait_for_event' && (
                <div className="grid grid-cols-2 gap-3">
                  <Select
                    label="Čekat na"
                    value={draft.wait_event_type}
                    onChange={(e) => updateStep(index, { wait_event_type: e.target.value as StepDraft['wait_event_type'] })}
                    options={[
                      { value: 'open', label: 'Otevření emailu' },
                      { value: 'click', label: 'Kliknutí na link' },
                      { value: 'call_result', label: 'Výsledek volání' },
                    ]}
                  />
                  <Input
                    label="Timeout (hodiny)"
                    type="number"
                    value={draft.wait_timeout_hours}
                    onChange={(e) => updateStep(index, { wait_timeout_hours: Number(e.target.value) })}
                    min="1"
                  />
                </div>
              )}

              {draft.action_type === 'callcenter' && (
                <p className="text-xs text-gray-500">
                  Prospect bude automaticky zařazen do callcentrum fronty (Web-nabídky).
                </p>
              )}

              {draft.action_type === 'ai_decide' && (
                <p className="text-xs text-gray-500">
                  Gemini AI analyzuje historii prospekta a rozhodne co dál:
                  další email, callcentrum, počkat, nebo zastavit sekvenci.
                </p>
              )}
            </div>
          </div>
        )
      })}

      {/* Přidat krok */}
      <button
        onClick={addStep}
        className="w-full p-3 border-2 border-dashed border-gray-300 rounded-lg text-sm text-gray-500 hover:border-blue-400 hover:text-blue-600 transition-colors flex items-center justify-center gap-2"
      >
        <Plus className="w-4 h-4" />
        Přidat krok
      </button>

      {/* Uložit */}
      <div className="flex items-center gap-3 pt-2">
        <Button onClick={handleSave} disabled={saving}>
          <Save className="w-4 h-4 mr-2" />
          {saving ? 'Ukládání...' : 'Uložit kroky'}
        </Button>
        {saved && <span className="text-sm text-green-600">Uloženo</span>}
      </div>
    </div>
  )
}
