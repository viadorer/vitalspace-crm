'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import type { QuoteItem } from '@/components/crm/QuoteCalculator'

interface ProspectFormData {
  company_name: string
  contact_person: string
  email: string
  phone: string
}

function buildQuoteNotesText(items: QuoteItem[], total: number): string {
  const lines = items.map(
    (item) => `- ${item.product_name} x${item.quantity} = ${item.line_total} Kč`
  )
  return `Cenová nabídka:\n${lines.join('\n')}\n\nCelkem: ${total} Kč`
}

export function useQuoteActions() {
  const [quoteItems, setQuoteItems] = useState<QuoteItem[]>([])
  const [quoteTotal, setQuoteTotal] = useState(0)
  const [showSaveModal, setShowSaveModal] = useState(false)
  const [saving, setSaving] = useState(false)
  const router = useRouter()

  function openSaveModal(items: QuoteItem[], total: number) {
    setQuoteItems(items)
    setQuoteTotal(total)
    setShowSaveModal(true)
  }

  function closeSaveModal() {
    setShowSaveModal(false)
  }

  async function saveAsProspect(formData: ProspectFormData): Promise<void> {
    setSaving(true)
    try {
      const supabase = createClient()
      const { error } = await supabase
        .from('prospects')
        .insert({
          company_name: formData.company_name,
          contact_person: formData.contact_person,
          email: formData.email,
          phone: formData.phone,
          status: 'new',
          region: 'Plzeňský kraj',
          notes: buildQuoteNotesText(quoteItems, quoteTotal),
        })
        .select()
        .single()

      if (error) throw error
      router.push('/crm/prospects')
    } finally {
      setSaving(false)
    }
  }

  async function saveAsDeal(clientId: string, title: string): Promise<void> {
    setSaving(true)
    try {
      const supabase = createClient()
      const { data: deal, error: dealError } = await supabase
        .from('deals')
        .insert({
          client_id: clientId,
          title,
          stage: 'lead',
          total_value_czk: quoteTotal,
          final_price_czk: quoteTotal,
          discount_percent: 0,
        })
        .select()
        .single()

      if (dealError) throw dealError

      const dealItems = quoteItems.map((item) => ({
        deal_id: deal.id,
        product_id: item.product_id,
        quantity: item.quantity,
        unit_price_czk: item.unit_price,
        discount_percent: 0,
      }))

      const { error: itemsError } = await supabase
        .from('deal_items')
        .insert(dealItems)

      if (itemsError) throw itemsError
      router.push('/crm/pipeline')
    } finally {
      setSaving(false)
    }
  }

  return {
    quoteItems,
    quoteTotal,
    showSaveModal,
    saving,
    openSaveModal,
    closeSaveModal,
    saveAsProspect,
    saveAsDeal,
  }
}
