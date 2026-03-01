'use client'

import { useState, FormEvent } from 'react'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { Button } from '@/components/ui/Button'
import { SegmentInsights } from './SegmentInsights'
import { PROSPECT_STATUSES, REGIONS, PRIORITIES } from '@/lib/utils/constants'
import type { Prospect, CompanySegment } from '@/lib/supabase/types'

interface ProspectFormProps {
  prospect?: Prospect
  segments: CompanySegment[]
  onSubmit: (data: Partial<Prospect>) => Promise<void>
  onCancel: () => void
}

export function ProspectForm({ prospect, segments, onSubmit, onCancel }: ProspectFormProps) {
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    company_name: prospect?.company_name || '',
    ico: prospect?.ico || '',
    dic: prospect?.dic || '',
    segment_id: prospect?.segment_id || '',
    region: prospect?.region || 'Plzeňský kraj',
    city: prospect?.city || '',
    address: prospect?.address || '',
    website: prospect?.website || '',
    employees_count_est: prospect?.employees_count_est || null,
    estimated_floor_area_m2: prospect?.estimated_floor_area_m2 || null,
    source: prospect?.source || '',
    priority: prospect?.priority || 3,
    status: prospect?.status || 'not_contacted',
    notes: prospect?.notes || '',
    assigned_consultant: prospect?.assigned_consultant || '',
  })

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setLoading(true)
    await onSubmit(formData)
    setLoading(false)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <Input
          label="Název firmy"
          value={formData.company_name}
          onChange={(e) => setFormData({ ...formData, company_name: e.target.value })}
          required
        />

        <Select
          label="Segment"
          value={formData.segment_id}
          onChange={(e) => setFormData({ ...formData, segment_id: e.target.value })}
          options={[
            { value: '', label: 'Vyberte segment' },
            ...segments.map(s => ({ value: s.id, label: s.name }))
          ]}
        />
      </div>

      {formData.segment_id && (
        <SegmentInsights 
          segmentName={segments.find(s => s.id === formData.segment_id)?.name || ''} 
        />
      )}

      <div className="grid grid-cols-2 gap-4">
        <Input
          label="IČO"
          value={formData.ico || ''}
          onChange={(e) => setFormData({ ...formData, ico: e.target.value })}
        />

        <Input
          label="DIČ"
          value={formData.dic || ''}
          onChange={(e) => setFormData({ ...formData, dic: e.target.value })}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <Input
          label="Město"
          value={formData.city || ''}
          onChange={(e) => setFormData({ ...formData, city: e.target.value })}
        />

        <Select
          label="Region"
          value={formData.region}
          onChange={(e) => setFormData({ ...formData, region: e.target.value })}
          options={REGIONS.map(r => ({ value: r, label: r }))}
        />
      </div>

      <Input
        label="Adresa"
        value={formData.address || ''}
        onChange={(e) => setFormData({ ...formData, address: e.target.value })}
      />

      <div className="grid grid-cols-2 gap-4">
        <Input
          label="Web"
          type="url"
          value={formData.website || ''}
          onChange={(e) => setFormData({ ...formData, website: e.target.value })}
          placeholder="https://"
        />

        <Input
          label="Zdroj"
          value={formData.source || ''}
          onChange={(e) => setFormData({ ...formData, source: e.target.value })}
          placeholder="LinkedIn, Web, Referral..."
        />
      </div>

      <div className="grid grid-cols-3 gap-4">
        <Select
          label="Priorita"
          value={formData.priority}
          onChange={(e) => setFormData({ ...formData, priority: Number(e.target.value) })}
          options={PRIORITIES.map(p => ({ value: p.value, label: p.label }))}
        />

        <Select
          label="Stav"
          value={formData.status}
          onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
          options={PROSPECT_STATUSES.map(s => ({ value: s.value, label: s.label }))}
        />

        <Input
          label="Konzultant"
          value={formData.assigned_consultant || ''}
          onChange={(e) => setFormData({ ...formData, assigned_consultant: e.target.value })}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <Input
          type="number"
          label="Odhad počtu zaměstnanců"
          value={formData.employees_count_est || ''}
          onChange={(e) => setFormData({ ...formData, employees_count_est: e.target.value ? Number(e.target.value) : null })}
          min="0"
        />

        <Input
          type="number"
          label="Odhad plochy (m²)"
          value={formData.estimated_floor_area_m2 || ''}
          onChange={(e) => setFormData({ ...formData, estimated_floor_area_m2: e.target.value ? Number(e.target.value) : null })}
          min="0"
        />
      </div>

      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700">Poznámky</label>
        <textarea
          value={formData.notes || ''}
          onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
          className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          rows={3}
        />
      </div>

      <div className="flex justify-end space-x-3 pt-4">
        <Button type="button" variant="secondary" onClick={onCancel}>
          Zrušit
        </Button>
        <Button type="submit" disabled={loading}>
          {loading ? 'Ukládání...' : prospect ? 'Uložit změny' : 'Vytvořit prospect'}
        </Button>
      </div>
    </form>
  )
}
