'use client'

import { QuoteCalculator } from '@/components/crm/QuoteCalculator'
import { SaveQuoteModal } from '@/components/crm/SaveQuoteModal'
import { useProducts } from '@/lib/hooks/useProducts'
import { useClients } from '@/lib/hooks/useClients'
import { useQuoteActions } from '@/lib/hooks/useQuoteActions'
import { Topbar } from '@/components/crm/Topbar'

export default function CalculatorClient() {
  const { products, loading } = useProducts()
  const { clients } = useClients()
  const {
    quoteItems,
    quoteTotal,
    showSaveModal,
    openSaveModal,
    closeSaveModal,
    saveAsProspect,
    saveAsDeal,
  } = useQuoteActions()

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
            <>
              <QuoteCalculator
                products={products}
                onSaveQuote={openSaveModal}
              />

              <SaveQuoteModal
                isOpen={showSaveModal}
                onClose={closeSaveModal}
                clients={clients}
                quoteItems={quoteItems}
                quoteTotal={quoteTotal}
                onSaveAsProspect={saveAsProspect}
                onSaveAsDeal={saveAsDeal}
              />
            </>
          )}
        </div>
      </div>
    </div>
  )
}
