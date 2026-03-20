'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/Button'
import { formatCurrency } from '@/lib/utils/format'
import { logAuditEvent } from '@/lib/hooks/useAuditLog'
import { recalculateDealTotals } from '@/lib/utils/recalculateDealTotals'
import { ClipboardList, FileDown, Plus, Save, Trash2, X } from 'lucide-react'
import { Section, type DealSectionProps } from './shared'
import type { Product } from '@/lib/supabase/types'

export function DealItemsSection({ dealId, data, onRefresh, expanded, onToggle }: DealSectionProps & { expanded: boolean; onToggle: () => void }) {
  const { items } = data
  const [products, setProducts] = useState<Product[]>([])
  const [showAdd, setShowAdd] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [generatingPdf, setGeneratingPdf] = useState(false)

  // Add form
  const [newItem, setNewItem] = useState({ product_id: '', quantity: 1, target_room: '' })

  // Edit form
  const [editForm, setEditForm] = useState({ quantity: 1, unit_price_czk: 0, discount_percent: 0, target_room: '' })
  const [savingEdit, setSavingEdit] = useState(false)

  useEffect(() => {
    if (expanded && products.length === 0) {
      loadProducts()
    }
  }, [expanded])

  async function loadProducts() {
    const supabase = createClient()
    const { data } = await supabase.from('products').select('*').eq('is_active', true).order('name')
    if (data) setProducts(data as Product[])
  }

  async function handleAddItem() {
    if (!newItem.product_id) return
    const product = products.find(p => p.id === newItem.product_id)
    if (!product) return

    const supabase = createClient()
    const unitPrice = product.base_price_czk
    const lineTotal = unitPrice * newItem.quantity

    const { data: created, error } = await supabase.from('deal_items').insert({
      deal_id: dealId,
      product_id: newItem.product_id,
      quantity: newItem.quantity,
      unit_price_czk: unitPrice,
      discount_percent: 0,
      target_room: newItem.target_room || null,
      sort_order: items.length,
    }).select().single()

    if (!error && created) {
      await logAuditEvent({
        action: 'create',
        entityType: 'deal_item',
        entityId: created.id,
        metadata: { deal_id: dealId, product: product.name, quantity: newItem.quantity },
      })
      await recalculateDealTotals(dealId)
      setNewItem({ product_id: '', quantity: 1, target_room: '' })
      setShowAdd(false)
      await onRefresh()
    }
  }

  function startEdit(item: any) {
    setEditingId(item.id)
    setEditForm({
      quantity: item.quantity,
      unit_price_czk: item.unit_price_czk,
      discount_percent: item.discount_percent || 0,
      target_room: item.target_room || '',
    })
  }

  async function handleSaveEdit(itemId: string) {
    setSavingEdit(true)
    const supabase = createClient()
    const discountMultiplier = 1 - editForm.discount_percent / 100
    const lineTotal = Math.round(editForm.unit_price_czk * editForm.quantity * discountMultiplier * 100) / 100

    await supabase.from('deal_items').update({
      quantity: editForm.quantity,
      unit_price_czk: editForm.unit_price_czk,
      discount_percent: editForm.discount_percent,
      target_room: editForm.target_room || null,
    }).eq('id', itemId)

    await logAuditEvent({
      action: 'update',
      entityType: 'deal_item',
      entityId: itemId,
      metadata: { deal_id: dealId },
    })

    await recalculateDealTotals(dealId)
    setEditingId(null)
    setSavingEdit(false)
    await onRefresh()
  }

  async function handleDeleteItem(itemId: string, productName: string) {
    if (!confirm(`Smazat položku "${productName}"?`)) return
    const supabase = createClient()
    await supabase.from('deal_items').delete().eq('id', itemId)

    await logAuditEvent({
      action: 'delete',
      entityType: 'deal_item',
      entityId: itemId,
      metadata: { deal_id: dealId, product: productName },
    })

    await recalculateDealTotals(dealId)
    await onRefresh()
  }

  async function handleGeneratePdf() {
    setGeneratingPdf(true)
    try {
      const res = await fetch(`/api/quotes/${dealId}/pdf`)
      if (res.ok) {
        const blob = await res.blob()
        const { saveQuoteDocument } = await import('@/lib/utils/saveQuoteDocument')
        await saveQuoteDocument({
          blob,
          fileName: `nabidka-${data.deal.deal_number || dealId}.pdf`,
          quoteNumber: data.deal.deal_number || '',
          title: `Nabídka ${data.deal.deal_number}`,
          dealId,
          clientId: data.deal.client_id || undefined,
        })
        await onRefresh()
      }
    } catch (err) {
      console.error('PDF generation error:', err)
    } finally {
      setGeneratingPdf(false)
    }
  }

  return (
    <Section
      title={`Položky nabídky (${items.length})`}
      icon={<ClipboardList className="w-4 h-4" />}
      expanded={expanded}
      onToggle={onToggle}
      actions={
        <div className="flex gap-1">
          <button
            onClick={handleGeneratePdf}
            disabled={generatingPdf}
            className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium text-green-600 hover:bg-green-50 rounded"
          >
            <FileDown className="w-3.5 h-3.5" />
            {generatingPdf ? 'Generuji...' : 'PDF'}
          </button>
          <button
            onClick={() => setShowAdd(true)}
            className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium text-blue-600 hover:bg-blue-50 rounded"
          >
            <Plus className="w-3.5 h-3.5" /> Přidat
          </button>
        </div>
      }
    >
      {/* Add item form */}
      {showAdd && (
        <div className="bg-blue-50 rounded-lg p-3 mb-3 space-y-2">
          <div className="flex gap-2">
            <select
              value={newItem.product_id}
              onChange={(e) => setNewItem({ ...newItem, product_id: e.target.value })}
              className="flex-1 px-2 py-1.5 border border-gray-200 rounded-lg text-sm"
            >
              <option value="">-- Vyberte produkt --</option>
              {products.map((p) => (
                <option key={p.id} value={p.id}>{p.name} ({formatCurrency(p.base_price_czk)})</option>
              ))}
            </select>
            <input
              type="number"
              min="1"
              value={newItem.quantity}
              onChange={(e) => setNewItem({ ...newItem, quantity: parseInt(e.target.value) || 1 })}
              className="w-16 px-2 py-1.5 border border-gray-200 rounded-lg text-sm"
              placeholder="Ks"
            />
            <input
              type="text"
              value={newItem.target_room}
              onChange={(e) => setNewItem({ ...newItem, target_room: e.target.value })}
              className="w-32 px-2 py-1.5 border border-gray-200 rounded-lg text-sm"
              placeholder="Místnost"
            />
          </div>
          <div className="flex gap-2">
            <Button onClick={handleAddItem} disabled={!newItem.product_id}>Přidat</Button>
            <Button variant="secondary" onClick={() => setShowAdd(false)}>Zrušit</Button>
          </div>
        </div>
      )}

      {items.length === 0 ? (
        <p className="text-sm text-gray-500">Žádné položky</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100">
                <th className="text-left py-2 pr-4 font-medium text-gray-600">Produkt</th>
                <th className="text-left py-2 pr-4 font-medium text-gray-600">Místnost</th>
                <th className="text-right py-2 pr-4 font-medium text-gray-600">Ks</th>
                <th className="text-right py-2 pr-4 font-medium text-gray-600">Cena/ks</th>
                <th className="text-right py-2 pr-4 font-medium text-gray-600">Sleva</th>
                <th className="text-right py-2 pr-4 font-medium text-gray-600">Celkem</th>
                <th className="w-16"></th>
              </tr>
            </thead>
            <tbody>
              {items.map((item) => (
                editingId === item.id ? (
                  <tr key={item.id} className="border-b border-gray-50 bg-blue-50">
                    <td className="py-2 pr-4">
                      <div className="font-medium text-gray-900">{item.product?.name || '–'}</div>
                    </td>
                    <td className="py-2 pr-4">
                      <input type="text" value={editForm.target_room} onChange={(e) => setEditForm({ ...editForm, target_room: e.target.value })} className="w-full px-2 py-1 border rounded text-sm" />
                    </td>
                    <td className="py-2 pr-4">
                      <input type="number" min="1" value={editForm.quantity} onChange={(e) => setEditForm({ ...editForm, quantity: parseInt(e.target.value) || 1 })} className="w-16 px-2 py-1 border rounded text-sm text-right" />
                    </td>
                    <td className="py-2 pr-4">
                      <input type="number" min="0" value={editForm.unit_price_czk} onChange={(e) => setEditForm({ ...editForm, unit_price_czk: Number(e.target.value) })} className="w-24 px-2 py-1 border rounded text-sm text-right" />
                    </td>
                    <td className="py-2 pr-4">
                      <input type="number" min="0" max="100" value={editForm.discount_percent} onChange={(e) => setEditForm({ ...editForm, discount_percent: Number(e.target.value) })} className="w-16 px-2 py-1 border rounded text-sm text-right" />
                    </td>
                    <td className="py-2 pr-4 text-right text-sm text-gray-500">
                      {formatCurrency(Math.round(editForm.unit_price_czk * editForm.quantity * (1 - editForm.discount_percent / 100) * 100) / 100)}
                    </td>
                    <td className="py-2 text-right">
                      <div className="flex gap-1 justify-end">
                        <button onClick={() => handleSaveEdit(item.id)} disabled={savingEdit} className="p-1 text-green-600 hover:bg-green-50 rounded">
                          <Save className="w-3.5 h-3.5" />
                        </button>
                        <button onClick={() => setEditingId(null)} className="p-1 text-gray-400 hover:bg-gray-100 rounded">
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ) : (
                  <tr key={item.id} className="border-b border-gray-50 hover:bg-gray-50 cursor-pointer group" onClick={() => startEdit(item)}>
                    <td className="py-2 pr-4">
                      <div className="font-medium text-gray-900">{item.product?.name || '–'}</div>
                      {item.product?.sku && <div className="text-xs text-gray-400 font-mono">{item.product.sku}</div>}
                      {item.installation_notes && <div className="text-xs text-gray-500 mt-0.5">{item.installation_notes}</div>}
                    </td>
                    <td className="py-2 pr-4 text-gray-600">{item.target_room || '–'}</td>
                    <td className="py-2 pr-4 text-right text-gray-900">{item.quantity}</td>
                    <td className="py-2 pr-4 text-right text-gray-900">{formatCurrency(item.unit_price_czk)}</td>
                    <td className="py-2 pr-4 text-right text-gray-600">{item.discount_percent > 0 ? `${item.discount_percent}%` : '–'}</td>
                    <td className="py-2 pr-4 text-right font-medium text-gray-900">{formatCurrency(item.line_total_czk)}</td>
                    <td className="py-2 text-right">
                      <button
                        onClick={(e) => { e.stopPropagation(); handleDeleteItem(item.id, item.product?.name || '') }}
                        className="p-1 text-gray-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                )
              ))}
            </tbody>
          </table>
        </div>
      )}
    </Section>
  )
}
