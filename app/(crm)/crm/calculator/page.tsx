'use client'

import { QuoteCalculator } from '@/components/crm/QuoteCalculator'
import { useProducts } from '@/lib/hooks/useProducts'
import { Topbar } from '@/components/crm/Topbar'

export default function CalculatorPage() {
  const { products, loading } = useProducts()

  return (
    <div className="flex-1 overflow-auto">
      <Topbar title="Cenová kalkulačka" />
      <div className="p-8">
        <div className="max-w-5xl mx-auto">
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Cenová nabídka</h2>
            <p className="text-gray-600 mt-1">
              Vytvořte cenovou nabídku výběrem produktů a množství
            </p>
          </div>

          {loading ? (
            <div className="text-center py-12">
              <div className="text-gray-500">Načítání produktů...</div>
            </div>
          ) : (
            <QuoteCalculator products={products} />
          )}
        </div>
      </div>
    </div>
  )
}
