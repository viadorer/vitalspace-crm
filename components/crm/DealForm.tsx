'use client'

import { useState, FormEvent } from 'react'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { Button } from '@/components/ui/Button'
import { DEAL_STAGES } from '@/lib/utils/constants'
import type { Deal, Client } from '@/lib/supabase/types'

interface DealFormProps {
  deal?: Deal
  clients: Client[]
  onSubmit: (data: Partial<Deal>) => Promise<void>
  onCancel: () => void
}

export function DealForm({ deal, clients, onSubmit, onCancel }: DealFormProps) {
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    client_id: deal?.client_id || '',
    title: deal?.title || '',
    description: deal?.description || '',
    stage: deal?.stage || 'lead',
    total_value: deal?.total_value || 0,
    discount_percent: deal?.discount_percent || 0,
    probability: deal?.probability || 50,
    expected_close_date: deal?.expected_close_date || '',
  })

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setLoading(true)
    
    const finalValue = formData.total_value * (1 - formData.discount_percent / 100)
    
    await onSubmit({
      ...formData,
      final_value: finalValue,
    })
    
    setLoading(false)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Select
        label="Klient"
        value={formData.client_id}
        onChange={(e) => setFormData({ ...formData, client_id: e.target.value })}
        options={[
          { value: '', label: 'Vyberte klienta' },
          ...clients.map(c => ({ value: c.id, label: c.company_name }))
        ]}
        required
      />

      <Input
        label="Název dealu"
        value={formData.title}
        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
        placeholder="Např. Sanitace kanceláří - 500 m²"
        required
      />

      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700">Popis</label>
        <textarea
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          rows={3}
          placeholder="Detaily projektu..."
        />
      </div>

      <Select
        label="Stage"
        value={formData.stage}
        onChange={(e) => setFormData({ ...formData, stage: e.target.value as any })}
        options={DEAL_STAGES.map(s => ({ value: s.value, label: s.label }))}
      />

      <div className="grid grid-cols-2 gap-4">
        <Input
          type="number"
          label="Celková hodnota (Kč)"
          value={formData.total_value}
          onChange={(e) => setFormData({ ...formData, total_value: Number(e.target.value) })}
          min="0"
          required
        />

        <Input
          type="number"
          label="Sleva (%)"
          value={formData.discount_percent}
          onChange={(e) => setFormData({ ...formData, discount_percent: Number(e.target.value) })}
          min="0"
          max="100"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <Input
          type="number"
          label="Pravděpodobnost (%)"
          value={formData.probability}
          onChange={(e) => setFormData({ ...formData, probability: Number(e.target.value) })}
          min="0"
          max="100"
        />

        <Input
          type="date"
          label="Očekávané uzavření"
          value={formData.expected_close_date}
          onChange={(e) => setFormData({ ...formData, expected_close_date: e.target.value })}
        />
      </div>

      <div className="flex justify-end space-x-3 pt-4">
        <Button type="button" variant="secondary" onClick={onCancel}>
          Zrušit
        </Button>
        <Button type="submit" disabled={loading}>
          {loading ? 'Ukládání...' : deal ? 'Uložit změny' : 'Vytvořit deal'}
        </Button>
      </div>
    </form>
  )
}
