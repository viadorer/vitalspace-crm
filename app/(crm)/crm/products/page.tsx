'use client'

import { useState } from 'react'

export const dynamic = 'force-dynamic'
import { Topbar } from '@/components/crm/Topbar'
import { ProductCatalog } from '@/components/crm/ProductCatalog'
import { QuoteCalculator } from '@/components/crm/QuoteCalculator'
import { useProducts } from '@/lib/hooks/useProducts'

export default function ProductsPage() {
  const { products, loading } = useProducts()
  const [showCalculator, setShowCalculator] = useState(false)

  if (loading) {
    return (
      <div>
        <Topbar title="Produkty" />
        <div className="p-8 text-center">Načítání...</div>
      </div>
    )
  }

  return (
    <div>
      <Topbar
        title="Produkty"
        breadcrumbs={[{ label: 'CRM' }, { label: 'Produkty' }]}
      />

      <div className="p-8">
        <div className="mb-6 flex justify-between items-center">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">
              {showCalculator ? 'Kalkulačka nabídek' : 'Katalog produktů'}
            </h2>
            <p className="text-sm text-gray-600 mt-1">
              {showCalculator
                ? 'Vytvořte cenovou nabídku pro klienta'
                : 'Přehled dostupných produktů a služeb'}
            </p>
          </div>
          <button
            onClick={() => setShowCalculator(!showCalculator)}
            className="text-blue-600 hover:text-blue-700 font-medium"
          >
            {showCalculator ? '← Zpět na katalog' : 'Kalkulačka nabídek →'}
          </button>
        </div>

        {showCalculator ? (
          <QuoteCalculator products={products} />
        ) : (
          <ProductCatalog products={products} />
        )}
      </div>
    </div>
  )
}
