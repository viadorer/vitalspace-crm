'use client'

import { useState } from 'react'
import { QuoteCalculator } from '@/components/crm/QuoteCalculator'
import { SaveQuoteModal } from '@/components/crm/SaveQuoteModal'
import { useProducts } from '@/lib/hooks/useProducts'
import { useClients } from '@/lib/hooks/useClients'
import { createClient } from '@/lib/supabase/client'
import { Topbar } from '@/components/crm/Topbar'
import { useRouter } from 'next/navigation'

export default function CalculatorPage() {
  const { products, loading } = useProducts()
  const { clients } = useClients()
  const [showSaveModal, setShowSaveModal] = useState(false)
  const [quoteItems, setQuoteItems] = useState<any[]>([])
  const [quoteTotal, setQuoteTotal] = useState(0)
  const router = useRouter()
  const supabase = createClient()

  async function handleSaveAsProspect(prospectData: any) {
    const notesText = `Cenová nabídka:\n${quoteItems.map(item => 
      `- ${item.product_name} x${item.quantity} = ${item.line_total} Kč`
    ).join('\n')}\n\nCelkem: ${quoteTotal} Kč`

    const { data, error } = await supabase
      .from('prospects')
      .insert({
        company_name: prospectData.company_name,
        contact_person: prospectData.contact_person,
        email: prospectData.email,
        phone: prospectData.phone,
        status: 'new',
        region: 'Plzeňský kraj',
        notes: notesText,
      })
      .select()
      .single()

    if (error) throw error
    alert('Prospect vytvořen!')
    router.push('/crm/prospects')
  }

  async function handleSaveAsDeal(clientId: string, title: string) {
    const { data: deal, error: dealError } = await supabase
      .from('deals')
      .insert({
        client_id: clientId,
        title,
        stage: 'qualification',
        total_value: quoteTotal,
        final_value: quoteTotal,
        probability: 50,
        discount_percent: 0,
      })
      .select()
      .single()

    if (dealError) throw dealError

    const dealItems = quoteItems.map(item => ({
      deal_id: deal.id,
      product_id: item.product_id,
      quantity: item.quantity,
      unit_price: item.unit_price,
      line_total: item.line_total,
    }))

    const { error: itemsError } = await supabase
      .from('deal_items')
      .insert(dealItems)

    if (itemsError) throw itemsError
    alert('Obchod vytvořen!')
    router.push('/crm/pipeline')
  }

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
                onSaveQuote={(items, total) => {
                  setQuoteItems(items)
                  setQuoteTotal(total)
                  setShowSaveModal(true)
                }}
              />
              
              <SaveQuoteModal
                isOpen={showSaveModal}
                onClose={() => setShowSaveModal(false)}
                clients={clients}
                onSaveAsProspect={handleSaveAsProspect}
                onSaveAsDeal={handleSaveAsDeal}
              />
            </>
          )}
        </div>
      </div>
    </div>
  )
}
