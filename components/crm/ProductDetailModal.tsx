'use client'

import { Modal } from '@/components/ui/Modal'
import { Button } from '@/components/ui/Button'
import { formatCurrency } from '@/lib/utils/format'
import type { Product } from '@/lib/supabase/types'

interface ProductDetailModalProps {
  product: Product | null
  isOpen: boolean
  onClose: () => void
  onEdit?: (product: Product) => void
}

export function ProductDetailModal({ product, isOpen, onClose, onEdit }: ProductDetailModalProps) {
  if (!product) return null

  const getCategoryLabel = (category: string) => {
    const labels: Record<string, string> = {
      nastropni: 'Nástropní',
      mobilni: 'Mobilní',
      box: 'Box',
      prislusenstvi: 'Příslušenství',
      sluzba: 'Služba',
    }
    return labels[category] || category
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={product.name} size="lg">
      <div className="space-y-6">
        <div>
          <span className="inline-block px-3 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full">
            {getCategoryLabel(product.category)}
          </span>
        </div>

        {product.description && (
          <div>
            <h3 className="text-sm font-medium text-gray-700 mb-2">Popis</h3>
            <p className="text-gray-600">{product.description}</p>
          </div>
        )}

        <div className="grid grid-cols-2 gap-4">
          <div>
            <h3 className="text-sm font-medium text-gray-700 mb-2">SKU</h3>
            <p className="text-gray-900 font-mono">{product.sku}</p>
          </div>

          {product.ozone_output_gh && (
            <div>
              <h3 className="text-sm font-medium text-gray-700 mb-2">Výkon ozónu</h3>
              <p className="text-gray-900">{product.ozone_output_gh} g/h</p>
            </div>
          )}

          {product.coverage_m3_max && (
            <div>
              <h3 className="text-sm font-medium text-gray-700 mb-2">Max. pokrytí</h3>
              <p className="text-gray-900">{product.coverage_m3_max} m³</p>
            </div>
          )}

          {product.dimensions && (
            <div>
              <h3 className="text-sm font-medium text-gray-700 mb-2">Rozměry</h3>
              <p className="text-gray-900">{product.dimensions}</p>
            </div>
          )}

          {product.weight_kg && (
            <div>
              <h3 className="text-sm font-medium text-gray-700 mb-2">Hmotnost</h3>
              <p className="text-gray-900">{product.weight_kg} kg</p>
            </div>
          )}

          {product.power_consumption_w && (
            <div>
              <h3 className="text-sm font-medium text-gray-700 mb-2">Příkon</h3>
              <p className="text-gray-900">{product.power_consumption_w} W</p>
            </div>
          )}
        </div>

        <div className="border-t pt-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <h3 className="text-sm font-medium text-gray-700 mb-2">Základní cena</h3>
              <p className="text-2xl font-bold text-blue-600">
                {formatCurrency(product.base_price_czk)}
              </p>
            </div>

            {product.installation_required && (
              <div>
                <h3 className="text-sm font-medium text-gray-700 mb-2">Instalace</h3>
                <p className="text-xl font-semibold text-gray-900">
                  {formatCurrency(product.installation_price_czk || 0)}
                </p>
              </div>
            )}
          </div>
        </div>

        {product.warranty_months && (
          <div>
            <h3 className="text-sm font-medium text-gray-700 mb-2">Záruka</h3>
            <p className="text-gray-900">{product.warranty_months} měsíců</p>
          </div>
        )}

        <div className="flex justify-end space-x-3 pt-4 border-t">
          <Button variant="secondary" onClick={onClose}>
            Zavřít
          </Button>
          {onEdit && (
            <Button onClick={() => {
              onEdit(product)
              onClose()
            }}>
              Upravit produkt
            </Button>
          )}
        </div>
      </div>
    </Modal>
  )
}
