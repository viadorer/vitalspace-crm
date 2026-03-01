'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/Button'
import { Select } from '@/components/ui/Select'
import { Input } from '@/components/ui/Input'
import { formatCurrency } from '@/lib/utils/format'
import type { Product } from '@/lib/supabase/types'

interface QuoteItem {
  product_id: string
  product_name: string
  quantity: number
  unit_price: number
  line_total: number
}

interface QuoteCalculatorProps {
  products: Product[]
  onSaveQuote?: (items: QuoteItem[], total: number) => void
}

export function QuoteCalculator({ products, onSaveQuote }: QuoteCalculatorProps) {
  const [items, setItems] = useState<QuoteItem[]>([])
  const [selectedProductId, setSelectedProductId] = useState('')
  const [quantity, setQuantity] = useState(1)

  const total = items.reduce((sum, item) => sum + item.line_total, 0)
  const totalOzoneOutput = items.reduce((sum, item) => {
    const product = products.find(p => p.id === item.product_id)
    return sum + (product?.ozone_output_gh || 0) * item.quantity
  }, 0)

  function addItem() {
    const product = products.find(p => p.id === selectedProductId)
    if (!product) return

    const existingItem = items.find(i => i.product_id === selectedProductId)
    if (existingItem) {
      setItems(items.map(i =>
        i.product_id === selectedProductId
          ? { ...i, quantity: i.quantity + quantity, line_total: (i.quantity + quantity) * i.unit_price }
          : i
      ))
    } else {
      setItems([...items, {
        product_id: product.id,
        product_name: product.name,
        quantity,
        unit_price: product.unit_price,
        line_total: quantity * product.unit_price,
      }])
    }

    setSelectedProductId('')
    setQuantity(1)
  }

  function removeItem(productId: string) {
    setItems(items.filter(i => i.product_id !== productId))
  }

  function updateQuantity(productId: string, newQuantity: number) {
    setItems(items.map(i =>
      i.product_id === productId
        ? { ...i, quantity: newQuantity, line_total: newQuantity * i.unit_price }
        : i
    ))
  }

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg border border-border p-6">
        <h3 className="font-semibold text-gray-900 mb-4">Přidat položku</h3>
        <div className="flex gap-4">
          <div className="flex-1">
            <Select
              value={selectedProductId}
              onChange={(e) => setSelectedProductId(e.target.value)}
              options={[
                { value: '', label: 'Vyberte produkt' },
                ...products.map(p => ({ value: p.id, label: `${p.name} - ${formatCurrency(p.unit_price)}` }))
              ]}
            />
          </div>
          <div className="w-32">
            <Input
              type="number"
              value={quantity}
              onChange={(e) => setQuantity(Number(e.target.value))}
              min="1"
            />
          </div>
          <Button onClick={addItem} disabled={!selectedProductId}>
            Přidat
          </Button>
        </div>
      </div>

      {items.length > 0 && (
        <div className="bg-white rounded-lg border border-border overflow-hidden">
          <table className="min-w-full divide-y divide-border">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Produkt
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Počet
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Cena/ks
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Celkem
                </th>
                <th className="px-6 py-3"></th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-border">
              {items.map((item) => (
                <tr key={item.product_id}>
                  <td className="px-6 py-4 text-sm text-gray-900">
                    {item.product_name}
                  </td>
                  <td className="px-6 py-4 text-sm">
                    <Input
                      type="number"
                      value={item.quantity}
                      onChange={(e) => updateQuantity(item.product_id, Number(e.target.value))}
                      min="1"
                      className="w-20"
                    />
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900">
                    {formatCurrency(item.unit_price)}
                  </td>
                  <td className="px-6 py-4 text-sm font-medium text-gray-900">
                    {formatCurrency(item.line_total)}
                  </td>
                  <td className="px-6 py-4 text-sm text-right">
                    <button
                      onClick={() => removeItem(item.product_id)}
                      className="text-red-600 hover:text-red-800"
                    >
                      Smazat
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className="bg-gray-50 px-6 py-4 space-y-2">
            {totalOzoneOutput > 0 && (
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Celkový výkon O₃:</span>
                <span className="font-medium">{totalOzoneOutput} g/h</span>
              </div>
            )}
            <div className="flex justify-between text-lg font-semibold">
              <span>Celková cena:</span>
              <span className="text-blue-600">{formatCurrency(total)}</span>
            </div>
          </div>
        </div>
      )}

      {items.length > 0 && onSaveQuote && (
        <div className="flex justify-end">
          <Button onClick={() => onSaveQuote(items, total)}>
            Uložit jako nabídku
          </Button>
        </div>
      )}
    </div>
  )
}
