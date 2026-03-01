'use client'

import { useState, FormEvent } from 'react'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { Button } from '@/components/ui/Button'
import type { Product } from '@/lib/supabase/types'

interface ProductFormProps {
  product?: Product
  onSubmit: (data: Partial<Product>) => Promise<void>
  onCancel: () => void
}

export function ProductForm({ product, onSubmit, onCancel }: ProductFormProps) {
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    sku: product?.sku || '',
    name: product?.name || '',
    category: product?.category || 'nastropni',
    ozone_output_gh: product?.ozone_output_gh || null,
    coverage_m3_max: product?.coverage_m3_max || null,
    dimensions: product?.dimensions || '',
    weight_kg: product?.weight_kg || null,
    power_consumption_w: product?.power_consumption_w || null,
    description: product?.description || '',
    base_price_czk: product?.base_price_czk || 0,
    vat_rate: product?.vat_rate || 21,
    purchase_price_czk: product?.purchase_price_czk || 0,
    quantity_discounts: product?.quantity_discounts || [],
    installation_required: product?.installation_required || false,
    installation_price_czk: product?.installation_price_czk || 0,
    warranty_months: product?.warranty_months || 24,
    is_active: product?.is_active !== undefined ? product.is_active : true,
  })
  const [newDiscount, setNewDiscount] = useState({ min_quantity: 5, discount_percent: 5 })

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
          label="SKU"
          value={formData.sku}
          onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
          required
          placeholder="VC-CLEAN-UP-20"
        />

        <Input
          label="Název produktu"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          required
        />
      </div>

      <Select
        label="Kategorie"
        value={formData.category}
        onChange={(e) => setFormData({ ...formData, category: e.target.value as any })}
        options={[
          { value: 'nastropni', label: 'Nástropní' },
          { value: 'mobilni', label: 'Mobilní' },
          { value: 'box', label: 'Box' },
          { value: 'prislusenstvi', label: 'Příslušenství' },
          { value: 'sluzba', label: 'Služba' },
        ]}
      />

      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700">Popis</label>
        <textarea
          value={formData.description || ''}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          rows={3}
        />
      </div>

      <div className="grid grid-cols-3 gap-4">
        <Input
          type="number"
          step="0.1"
          label="Výkon ozónu (g/h)"
          value={formData.ozone_output_gh || ''}
          onChange={(e) => setFormData({ ...formData, ozone_output_gh: e.target.value ? Number(e.target.value) : null })}
        />

        <Input
          type="number"
          step="1"
          label="Max. pokrytí (m³)"
          value={formData.coverage_m3_max || ''}
          onChange={(e) => setFormData({ ...formData, coverage_m3_max: e.target.value ? Number(e.target.value) : null })}
        />

        <Input
          type="number"
          step="0.1"
          label="Hmotnost (kg)"
          value={formData.weight_kg || ''}
          onChange={(e) => setFormData({ ...formData, weight_kg: e.target.value ? Number(e.target.value) : null })}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <Input
          label="Rozměry"
          value={formData.dimensions || ''}
          onChange={(e) => setFormData({ ...formData, dimensions: e.target.value })}
          placeholder="595x595x150 mm"
        />

        <Input
          type="number"
          label="Příkon (W)"
          value={formData.power_consumption_w || ''}
          onChange={(e) => setFormData({ ...formData, power_consumption_w: e.target.value ? Number(e.target.value) : null })}
        />
      </div>

      <div className="grid grid-cols-3 gap-4">
        <Input
          type="number"
          step="0.01"
          label="Nákupní cena bez DPH (Kč)"
          value={formData.purchase_price_czk}
          onChange={(e) => setFormData({ ...formData, purchase_price_czk: Number(e.target.value) })}
        />

        <Input
          type="number"
          step="0.01"
          label="Prodejní cena bez DPH (Kč)"
          value={formData.base_price_czk}
          onChange={(e) => setFormData({ ...formData, base_price_czk: Number(e.target.value) })}
          required
        />

        <Select
          label="Sazba DPH (%)"
          value={formData.vat_rate}
          onChange={(e) => setFormData({ ...formData, vat_rate: Number(e.target.value) })}
          options={[
            { value: 21, label: '21% (standardní)' },
            { value: 15, label: '15% (snížená 1)' },
            { value: 12, label: '12% (snížená 2)' },
            { value: 0, label: '0% (osvobozeno)' },
          ]}
        />
      </div>

      <div className="border rounded-lg p-4">
        <h3 className="text-sm font-medium text-gray-700 mb-3">Množstevní slevy</h3>
        
        {formData.quantity_discounts.length > 0 && (
          <div className="space-y-2 mb-3">
            {formData.quantity_discounts.map((discount, index) => (
              <div key={index} className="flex items-center justify-between bg-gray-50 p-2 rounded">
                <span className="text-sm">
                  Od {discount.min_quantity} ks: <strong>{discount.discount_percent}% sleva</strong>
                </span>
                <button
                  type="button"
                  onClick={() => {
                    const updated = formData.quantity_discounts.filter((_, i) => i !== index)
                    setFormData({ ...formData, quantity_discounts: updated })
                  }}
                  className="text-red-600 hover:text-red-800 text-sm"
                >
                  Odstranit
                </button>
              </div>
            ))}
          </div>
        )}

        <div className="flex gap-2">
          <Input
            type="number"
            label="Min. množství"
            value={newDiscount.min_quantity}
            onChange={(e) => setNewDiscount({ ...newDiscount, min_quantity: Number(e.target.value) })}
            min="1"
          />
          <Input
            type="number"
            step="0.1"
            label="Sleva (%)"
            value={newDiscount.discount_percent}
            onChange={(e) => setNewDiscount({ ...newDiscount, discount_percent: Number(e.target.value) })}
            min="0"
            max="100"
          />
          <div className="flex items-end">
            <Button
              type="button"
              variant="secondary"
              onClick={() => {
                const updated = [...formData.quantity_discounts, newDiscount].sort((a, b) => a.min_quantity - b.min_quantity)
                setFormData({ ...formData, quantity_discounts: updated })
                setNewDiscount({ min_quantity: 5, discount_percent: 5 })
              }}
            >
              + Přidat slevu
            </Button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Cena s DPH</label>
          <div className="text-2xl font-bold text-blue-600">
            {(formData.base_price_czk * (1 + formData.vat_rate / 100)).toFixed(2)} Kč
          </div>
        </div>

        <Input
          type="number"
          label="Záruka (měsíce)"
          value={formData.warranty_months}
          onChange={(e) => setFormData({ ...formData, warranty_months: Number(e.target.value) })}
        />
      </div>

      <div className="flex items-center space-x-4">
        <label className="flex items-center space-x-2">
          <input
            type="checkbox"
            checked={formData.installation_required}
            onChange={(e) => setFormData({ ...formData, installation_required: e.target.checked })}
            className="rounded border-gray-300"
          />
          <span className="text-sm text-gray-700">Vyžaduje instalaci</span>
        </label>

        {formData.installation_required && (
          <Input
            type="number"
            step="0.01"
            label="Cena instalace (Kč)"
            value={formData.installation_price_czk}
            onChange={(e) => setFormData({ ...formData, installation_price_czk: Number(e.target.value) })}
          />
        )}
      </div>

      <div className="flex items-center space-x-2">
        <input
          type="checkbox"
          checked={formData.is_active}
          onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
          className="rounded border-gray-300"
        />
        <span className="text-sm text-gray-700">Aktivní produkt</span>
      </div>

      <div className="flex justify-end space-x-3 pt-4">
        <Button type="button" variant="secondary" onClick={onCancel}>
          Zrušit
        </Button>
        <Button type="submit" disabled={loading}>
          {loading ? 'Ukládání...' : product ? 'Uložit změny' : 'Vytvořit produkt'}
        </Button>
      </div>
    </form>
  )
}
