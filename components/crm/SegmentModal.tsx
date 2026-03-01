'use client'

import { useState, useEffect, FormEvent } from 'react'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { Modal } from '@/components/ui/Modal'
import { Plus, X } from 'lucide-react'
import type { CompanySegment } from '@/lib/supabase/types'

interface SegmentModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: (data: Partial<CompanySegment>) => Promise<{ error: string | null }>
  segment?: CompanySegment | null
}

interface FormData {
  name: string
  target_pain_point: string
  recommended_approach: string
  recommended_products: string[]
  average_deal_min_czk: number | null
  average_deal_max_czk: number | null
  closing_time_months_min: number | null
  closing_time_months_max: number | null
  decision_makers: string[]
  key_arguments: string[]
  success_stories: string[]
  objections_handling: Record<string, string>
}

const EMPTY_FORM: FormData = {
  name: '',
  target_pain_point: '',
  recommended_approach: '',
  recommended_products: [],
  average_deal_min_czk: null,
  average_deal_max_czk: null,
  closing_time_months_min: null,
  closing_time_months_max: null,
  decision_makers: [],
  key_arguments: [],
  success_stories: [],
  objections_handling: {},
}

export function SegmentModal({ isOpen, onClose, onSave, segment }: SegmentModalProps) {
  const [formData, setFormData] = useState<FormData>(EMPTY_FORM)
  const [saving, setSaving] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)

  const [newProduct, setNewProduct] = useState('')
  const [newDecisionMaker, setNewDecisionMaker] = useState('')
  const [newArgument, setNewArgument] = useState('')
  const [newStory, setNewStory] = useState('')
  const [newObjection, setNewObjection] = useState('')
  const [newResponse, setNewResponse] = useState('')

  useEffect(() => {
    if (segment) {
      setFormData({
        name: segment.name,
        target_pain_point: segment.target_pain_point || '',
        recommended_approach: segment.recommended_approach || '',
        recommended_products: segment.recommended_products || [],
        average_deal_min_czk: segment.average_deal_min_czk,
        average_deal_max_czk: segment.average_deal_max_czk,
        closing_time_months_min: segment.closing_time_months_min,
        closing_time_months_max: segment.closing_time_months_max,
        decision_makers: segment.decision_makers || [],
        key_arguments: segment.key_arguments || [],
        success_stories: segment.success_stories || [],
        objections_handling: (segment.objections_handling as Record<string, string>) || {},
      })
    } else {
      setFormData(EMPTY_FORM)
    }
    setFormError(null)
  }, [segment, isOpen])

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    if (!formData.name.trim()) {
      setFormError('Název segmentu je povinný')
      return
    }
    setSaving(true)
    setFormError(null)

    const payload: Partial<CompanySegment> = {
      name: formData.name.trim(),
      target_pain_point: formData.target_pain_point || null,
      recommended_approach: formData.recommended_approach || null,
      recommended_products: formData.recommended_products.length > 0 ? formData.recommended_products : null,
      average_deal_min_czk: formData.average_deal_min_czk,
      average_deal_max_czk: formData.average_deal_max_czk,
      closing_time_months_min: formData.closing_time_months_min,
      closing_time_months_max: formData.closing_time_months_max,
      decision_makers: formData.decision_makers.length > 0 ? formData.decision_makers : null,
      key_arguments: formData.key_arguments.length > 0 ? formData.key_arguments : null,
      success_stories: formData.success_stories.length > 0 ? formData.success_stories : null,
      objections_handling: Object.keys(formData.objections_handling).length > 0 ? formData.objections_handling : null,
    }

    const result = await onSave(payload)
    setSaving(false)
    if (result.error) {
      setFormError(result.error)
    } else {
      onClose()
    }
  }

  function addToArray(key: 'recommended_products' | 'decision_makers' | 'key_arguments' | 'success_stories', value: string, clearFn: (v: string) => void) {
    if (!value.trim()) return
    setFormData(prev => ({
      ...prev,
      [key]: [...prev[key], value.trim()],
    }))
    clearFn('')
  }

  function removeFromArray(key: 'recommended_products' | 'decision_makers' | 'key_arguments' | 'success_stories', index: number) {
    setFormData(prev => ({
      ...prev,
      [key]: prev[key].filter((_, i) => i !== index),
    }))
  }

  function addObjection() {
    if (!newObjection.trim() || !newResponse.trim()) return
    setFormData(prev => ({
      ...prev,
      objections_handling: {
        ...prev.objections_handling,
        [newObjection.trim()]: newResponse.trim(),
      },
    }))
    setNewObjection('')
    setNewResponse('')
  }

  function removeObjection(key: string) {
    setFormData(prev => {
      const updated = { ...prev.objections_handling }
      delete updated[key]
      return { ...prev, objections_handling: updated }
    })
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={segment ? 'Upravit segment' : 'Nový segment'}>
      <form onSubmit={handleSubmit} className="space-y-5 max-h-[70vh] overflow-y-auto pr-1">
        {formError && (
          <div className="bg-red-50 text-red-700 px-4 py-2 rounded-lg text-sm">{formError}</div>
        )}

        <Input
          label="Název segmentu"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          required
        />

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Pain Point</label>
          <textarea
            value={formData.target_pain_point}
            onChange={(e) => setFormData({ ...formData, target_pain_point: e.target.value })}
            className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            rows={2}
            placeholder="Jaký problém segment řeší..."
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Doporučený přístup</label>
          <textarea
            value={formData.recommended_approach}
            onChange={(e) => setFormData({ ...formData, recommended_approach: e.target.value })}
            className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            rows={2}
            placeholder="Jak oslovit tento segment..."
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <Input
            type="number"
            label="Min. deal (Kč)"
            value={formData.average_deal_min_czk ?? ''}
            onChange={(e) => setFormData({ ...formData, average_deal_min_czk: e.target.value ? Number(e.target.value) : null })}
            min="0"
          />
          <Input
            type="number"
            label="Max. deal (Kč)"
            value={formData.average_deal_max_czk ?? ''}
            onChange={(e) => setFormData({ ...formData, average_deal_max_czk: e.target.value ? Number(e.target.value) : null })}
            min="0"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <Input
            type="number"
            label="Min. uzavření (měsíce)"
            value={formData.closing_time_months_min ?? ''}
            onChange={(e) => setFormData({ ...formData, closing_time_months_min: e.target.value ? Number(e.target.value) : null })}
            min="0"
          />
          <Input
            type="number"
            label="Max. uzavření (měsíce)"
            value={formData.closing_time_months_max ?? ''}
            onChange={(e) => setFormData({ ...formData, closing_time_months_max: e.target.value ? Number(e.target.value) : null })}
            min="0"
          />
        </div>

        {/* Doporučené produkty */}
        <ArrayField
          label="Doporučené produkty"
          items={formData.recommended_products}
          inputValue={newProduct}
          onInputChange={setNewProduct}
          onAdd={() => addToArray('recommended_products', newProduct, setNewProduct)}
          onRemove={(i) => removeFromArray('recommended_products', i)}
          placeholder="Název produktu"
        />

        {/* Decision makers */}
        <ArrayField
          label="Decision makers"
          items={formData.decision_makers}
          inputValue={newDecisionMaker}
          onInputChange={setNewDecisionMaker}
          onAdd={() => addToArray('decision_makers', newDecisionMaker, setNewDecisionMaker)}
          onRemove={(i) => removeFromArray('decision_makers', i)}
          placeholder="Role / pozice"
        />

        {/* Klíčové argumenty */}
        <ArrayField
          label="Klíčové argumenty"
          items={formData.key_arguments}
          inputValue={newArgument}
          onInputChange={setNewArgument}
          onAdd={() => addToArray('key_arguments', newArgument, setNewArgument)}
          onRemove={(i) => removeFromArray('key_arguments', i)}
          placeholder="Argument pro prodej"
        />

        {/* Success stories */}
        <ArrayField
          label="Success stories"
          items={formData.success_stories}
          inputValue={newStory}
          onInputChange={setNewStory}
          onAdd={() => addToArray('success_stories', newStory, setNewStory)}
          onRemove={(i) => removeFromArray('success_stories', i)}
          placeholder="Úspěšný příběh"
        />

        {/* Námitky a odpovědi */}
        <div className="border-t border-gray-100 pt-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">Námitky a odpovědi</label>
          {Object.entries(formData.objections_handling).map(([objection, response]) => (
            <div key={objection} className="flex items-start gap-2 mb-2 bg-gray-50 rounded-lg p-2">
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium text-gray-700 truncate">&quot;{objection}&quot;</p>
                <p className="text-xs text-gray-500 truncate">→ {response}</p>
              </div>
              <button
                type="button"
                onClick={() => removeObjection(objection)}
                className="p-1 text-gray-400 hover:text-red-500 flex-shrink-0"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
          <div className="space-y-2">
            <input
              type="text"
              value={newObjection}
              onChange={(e) => setNewObjection(e.target.value)}
              placeholder="Námitka..."
              className="w-full px-3 py-1.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <input
              type="text"
              value={newResponse}
              onChange={(e) => setNewResponse(e.target.value)}
              placeholder="Odpověď..."
              className="w-full px-3 py-1.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addObjection() } }}
            />
            <button
              type="button"
              onClick={addObjection}
              className="text-xs text-blue-600 hover:text-blue-700 font-medium"
            >
              + Přidat námitku
            </button>
          </div>
        </div>

        <div className="flex gap-3 pt-3 border-t border-gray-100">
          <Button type="submit" disabled={saving}>
            {saving ? 'Ukládání...' : segment ? 'Uložit změny' : 'Vytvořit segment'}
          </Button>
          <Button type="button" variant="secondary" onClick={onClose}>
            Zrušit
          </Button>
        </div>
      </form>
    </Modal>
  )
}

interface ArrayFieldProps {
  label: string
  items: string[]
  inputValue: string
  onInputChange: (value: string) => void
  onAdd: () => void
  onRemove: (index: number) => void
  placeholder: string
}

function ArrayField({ label, items, inputValue, onInputChange, onAdd, onRemove, placeholder }: ArrayFieldProps) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">{label}</label>
      {items.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mb-2">
          {items.map((item, i) => (
            <span
              key={i}
              className="inline-flex items-center gap-1 bg-blue-50 text-blue-700 text-xs font-medium px-2 py-1 rounded"
            >
              {item}
              <button
                type="button"
                onClick={() => onRemove(i)}
                className="text-blue-400 hover:text-blue-600"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          ))}
        </div>
      )}
      <div className="flex gap-2">
        <input
          type="text"
          value={inputValue}
          onChange={(e) => onInputChange(e.target.value)}
          placeholder={placeholder}
          className="flex-1 px-3 py-1.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); onAdd() } }}
        />
        <button
          type="button"
          onClick={onAdd}
          className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg"
        >
          <Plus className="w-4 h-4" />
        </button>
      </div>
    </div>
  )
}
