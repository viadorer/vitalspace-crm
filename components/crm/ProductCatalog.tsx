'use client'

import { formatCurrency } from '@/lib/utils/format'
import type { Product } from '@/lib/supabase/types'

interface ProductCatalogProps {
  products: Product[]
  onProductSelect?: (product: Product) => void
}

export function ProductCatalog({ products, onProductSelect }: ProductCatalogProps) {
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
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {products.map((product) => (
        <div
          key={product.id}
          className="bg-white rounded-lg border border-border p-6 hover:shadow-lg transition-shadow cursor-pointer"
          onClick={() => onProductSelect?.(product)}
        >
          <div className="flex items-start justify-between mb-4">
            <div>
              <span className="text-xs text-gray-500 uppercase tracking-wide">
                {getCategoryLabel(product.category)}
              </span>
              <h3 className="text-lg font-semibold text-gray-900 mt-1">
                {product.name}
              </h3>
            </div>
          </div>

          {product.description && (
            <p className="text-sm text-gray-600 mb-4">{product.description}</p>
          )}

          <div className="space-y-2 mb-4">
            {product.ozone_output_gh && (
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Výkon O₃:</span>
                <span className="font-medium">{product.ozone_output_gh} g/h</span>
              </div>
            )}
            {product.coverage_m3_max && (
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Pokrytí:</span>
                <span className="font-medium">{product.coverage_m3_max} m³</span>
              </div>
            )}
          </div>

          <div className="pt-4 border-t border-border">
            <div className="text-2xl font-bold text-blue-600">
              {formatCurrency(product.base_price_czk)}
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}
