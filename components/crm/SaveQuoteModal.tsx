'use client'

import { useState } from 'react'
import { useToast } from '@/components/ui/ToastProvider'
import { Modal } from '@/components/ui/Modal'
import { saveQuoteDocument } from '@/lib/utils/saveQuoteDocument'
import type { Client } from '@/lib/supabase/types'
import type { QuoteItem } from '@/components/crm/QuoteCalculator'

import { SaveOptionPicker } from './save-quote/SaveOptionPicker'
import { SaveAsClientForm } from './save-quote/SaveAsClientForm'
import { SaveAsProspectForm } from './save-quote/SaveAsProspectForm'
import { ExportPdfForm, type ExportData } from './save-quote/ExportPdfForm'

interface SaveQuoteModalProps {
  isOpen: boolean
  onClose: () => void
  clients: Client[]
  quoteItems: QuoteItem[]
  quoteTotal: number
  onSaveAsProspect: (prospectData: {
    company_name: string
    contact_person: string
    email: string
    phone: string
  }) => Promise<void>
  onSaveAsDeal: (clientId: string, title: string) => Promise<void>
}

type SaveOption = 'client' | 'prospect' | 'export'

const INITIAL_EXPORT_DATA: ExportData = {
  companyName: '',
  address: '',
  city: '',
  postalCode: '',
  ico: '',
  dic: '',
  contactPerson: '',
  email: '',
  phone: '',
  validityDays: 30,
  paymentTerms: '14 dnů od vystavení faktury',
  deliveryTerms: 'Dle dohody, obvykle 2–4 týdny od potvrzení objednávky',
  notes: '',
}

export function SaveQuoteModal({
  isOpen,
  onClose,
  clients,
  quoteItems,
  quoteTotal,
  onSaveAsProspect,
  onSaveAsDeal,
}: SaveQuoteModalProps) {
  const [selectedOption, setSelectedOption] = useState<SaveOption | null>(null)
  const [loading, setLoading] = useState(false)
  const { toast } = useToast()

  // Client form state
  const [selectedClientId, setSelectedClientId] = useState('')
  const [dealTitle, setDealTitle] = useState('')

  // Prospect form state
  const [prospectData, setProspectData] = useState({
    company_name: '',
    contact_person: '',
    email: '',
    phone: '',
  })

  // Export form state
  const [exportData, setExportData] = useState<ExportData>(INITIAL_EXPORT_DATA)

  function prefillExportFromClient(clientId: string) {
    const client = clients.find(c => c.id === clientId)
    if (client) {
      setExportData(prev => ({
        ...prev,
        companyName: client.company_name || '',
        address: client.address || '',
        city: client.city || '',
        postalCode: '',
        ico: client.ico || '',
        dic: client.dic || '',
        email: client.email || '',
        phone: client.phone || '',
      }))
    }
  }

  async function handleExportPdf() {
    if (!exportData.companyName) {
      toast.warning('Vyplňte alespoň název firmy')
      return
    }

    setLoading(true)
    try {
      const supabase = (await import('@/lib/supabase/client')).createClient()

      // Najdi nebo vytvoř klienta
      let clientId = ''
      const matchedClient = clients.find(
        (c) => c.company_name === exportData.companyName || (exportData.ico && c.ico === exportData.ico)
      )

      if (matchedClient) {
        clientId = matchedClient.id
      } else {
        const { data: newClient, error: clientError } = await supabase
          .from('clients')
          .insert({
            company_name: exportData.companyName,
            address: exportData.address || null,
            city: exportData.city || null,
            postal_code: exportData.postalCode || null,
            ico: exportData.ico || null,
            dic: exportData.dic || null,
            email: exportData.email || null,
            phone: exportData.phone || null,
            contact_person: exportData.contactPerson || null,
            type: 'B2B',
            region: 'Plzeňský kraj',
          })
          .select()
          .single()

        if (clientError) throw clientError
        clientId = newClient.id
      }

      // Vytvoř deal
      const { data: deal, error: dealError } = await supabase
        .from('deals')
        .insert({
          client_id: clientId,
          title: `Nabídka – ${exportData.companyName}`,
          stage: 'lead',
          total_value_czk: quoteTotal,
          final_price_czk: quoteTotal,
          discount_percent: 0,
        })
        .select()
        .single()

      if (dealError) throw new Error(`Chyba při vytváření dealu: ${dealError.message}`)

      // Přidej položky dealu
      const dealItems = quoteItems.map((item) => ({
        deal_id: deal.id,
        product_id: item.product_id || null,
        quantity: item.quantity,
        unit_price_czk: item.unit_price,
        discount_percent: 0,
      }))

      const { error: itemsError } = await supabase.from('deal_items').insert(dealItems)
      if (itemsError) throw new Error(`Chyba při vkládání položek: ${itemsError.message}`)

      // Vygeneruj PDF přes API
      const response = await fetch(`/api/quotes/${deal.id}/pdf`)
      if (!response.ok) throw new Error('Chyba při generování PDF')

      const blob = await response.blob()
      const fileName = `nabidka-${deal.deal_number || deal.id}.pdf`

      // Ulož PDF do databáze
      await saveQuoteDocument({
        blob,
        fileName,
        quoteNumber: deal.deal_number || `CN-${Date.now()}`,
        title: `Nabídka ${deal.deal_number || deal.id} – ${exportData.companyName}`,
        dealId: deal.id,
        clientId,
      })

      // Stáhni PDF
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = fileName
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      window.URL.revokeObjectURL(url)

      toast.success('PDF vygenerováno a uloženo. Deal byl vytvořen.')
      onClose()
    } catch (error) {
      console.error('Chyba při exportu PDF:', error)
      toast.error('Chyba při generování PDF')
    } finally {
      setLoading(false)
    }
  }

  async function handleSave() {
    setLoading(true)
    try {
      if (selectedOption === 'client') {
        if (!selectedClientId || !dealTitle) {
          toast.warning('Vyplňte všechna pole')
          return
        }
        await onSaveAsDeal(selectedClientId, dealTitle)
      } else if (selectedOption === 'prospect') {
        if (!prospectData.company_name || !prospectData.email) {
          toast.warning('Vyplňte alespoň název firmy a email')
          return
        }
        await onSaveAsProspect(prospectData)
      }
      onClose()
    } catch (error) {
      console.error('Chyba při ukládání:', error)
      toast.error('Chyba při ukládání nabídky')
    } finally {
      setLoading(false)
    }
  }

  function renderContent() {
    if (!selectedOption) {
      return <SaveOptionPicker onSelect={setSelectedOption} />
    }

    const goBack = () => setSelectedOption(null)

    switch (selectedOption) {
      case 'client':
        return (
          <SaveAsClientForm
            clients={clients}
            selectedClientId={selectedClientId}
            dealTitle={dealTitle}
            loading={loading}
            onClientChange={setSelectedClientId}
            onTitleChange={setDealTitle}
            onBack={goBack}
            onClose={onClose}
            onSave={handleSave}
          />
        )
      case 'prospect':
        return (
          <SaveAsProspectForm
            data={prospectData}
            loading={loading}
            onChange={setProspectData}
            onBack={goBack}
            onClose={onClose}
            onSave={handleSave}
          />
        )
      case 'export':
        return (
          <ExportPdfForm
            data={exportData}
            clients={clients}
            onChange={setExportData}
            onPrefillFromClient={prefillExportFromClient}
            onBack={goBack}
            onClose={onClose}
            onExport={handleExportPdf}
          />
        )
    }
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Uložit cenovou nabídku">
      <div className="space-y-6">
        {renderContent()}
      </div>
    </Modal>
  )
}
