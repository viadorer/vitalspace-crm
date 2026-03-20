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
  preselectedClientId?: string
  onSubmit: (data: Partial<Deal>) => Promise<void>
  onCancel: () => void
}

export function DealForm({ deal, clients, preselectedClientId, onSubmit, onCancel }: DealFormProps) {
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    client_id: preselectedClientId || deal?.client_id || '',
    title: deal?.title || '',
    stage: deal?.stage || 'lead',
    total_value_czk: deal?.total_value_czk || 0,
    discount_percent: deal?.discount_percent || 0,
    estimated_close_date: deal?.estimated_close_date || '',
  })

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setLoading(true)
    
    const finalPriceCzk = formData.total_value_czk * (1 - formData.discount_percent / 100)
    
    await onSubmit({
      ...formData,
      final_price_czk: finalPriceCzk,
    })
    
    setLoading(false)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {preselectedClientId ? (
        <div className="text-sm text-gray-600 bg-gray-50 p-3 rounded-lg">
          <span className="font-medium">Klient:</span>{' '}
          {preselectedClientId === '__from_prospect__'
            ? 'Bude vytvořen automaticky z prospectu'
            : clients.find(c => c.id === preselectedClientId)?.company_name || 'Vybraný klient'}
        </div>
      ) : (
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
      )}

      <Input
        label="Název dealu"
        value={formData.title}
        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
        placeholder="Např. Sanitace kanceláří - 500 m²"
        required
      />

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
          value={formData.total_value_czk}
          onChange={(e) => setFormData({ ...formData, total_value_czk: Number(e.target.value) })}
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

      <Input
        type="date"
        label="Očekávané uzavření"
        value={formData.estimated_close_date}
        onChange={(e) => setFormData({ ...formData, estimated_close_date: e.target.value })}
      />

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
