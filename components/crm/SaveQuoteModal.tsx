'use client'

import { useState } from 'react'
import { Modal } from '@/components/ui/Modal'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { Building2, UserPlus, Download } from 'lucide-react'
import { generateQuotePdf } from '@/lib/utils/generateQuotePdf'
import { saveQuoteDocument } from '@/lib/utils/saveQuoteDocument'
import type { Client } from '@/lib/supabase/types'
import type { QuoteItem } from '@/components/crm/QuoteCalculator'

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

  // Pro klienta
  const [selectedClientId, setSelectedClientId] = useState('')
  const [dealTitle, setDealTitle] = useState('')

  // Pro prospecta
  const [prospectData, setProspectData] = useState({
    company_name: '',
    contact_person: '',
    email: '',
    phone: '',
  })

  // Pro PDF export
  const [exportData, setExportData] = useState({
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
  })

  async function handleExportPdf() {
    if (!exportData.companyName) {
      alert('Vyplňte alespoň název firmy')
      return
    }

    const result = await generateQuotePdf({
      items: quoteItems,
      total: quoteTotal,
      customer: {
        companyName: exportData.companyName,
        address: exportData.address || undefined,
        city: exportData.city || undefined,
        postalCode: exportData.postalCode || undefined,
        ico: exportData.ico || undefined,
        dic: exportData.dic || undefined,
        contactPerson: exportData.contactPerson || undefined,
        email: exportData.email || undefined,
        phone: exportData.phone || undefined,
      },
      validityDays: exportData.validityDays,
      paymentTerms: exportData.paymentTerms,
      deliveryTerms: exportData.deliveryTerms,
      notes: exportData.notes || undefined,
    })

    const matchedClient = clients.find(
      (c) => c.company_name === exportData.companyName || c.ico === exportData.ico
    )

    try {
      await saveQuoteDocument({
        blob: result.blob,
        fileName: result.fileName,
        quoteNumber: result.quoteNumber,
        title: `Nabídka ${result.quoteNumber} – ${exportData.companyName}`,
        clientId: matchedClient?.id,
      })
    } catch (err) {
      console.error('Chyba při ukládání dokumentu:', err)
    }
  }

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

  async function handleSave() {
    setLoading(true)
    try {
      if (selectedOption === 'client') {
        if (!selectedClientId || !dealTitle) {
          alert('Vyplňte všechna pole')
          return
        }
        await onSaveAsDeal(selectedClientId, dealTitle)
      } else if (selectedOption === 'prospect') {
        if (!prospectData.company_name || !prospectData.email) {
          alert('Vyplňte alespoň název firmy a email')
          return
        }
        await onSaveAsProspect(prospectData)
      }
      onClose()
    } catch (error) {
      console.error('Chyba při ukládání:', error)
      alert('Chyba při ukládání nabídky')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Uložit cenovou nabídku">
      <div className="space-y-6">
        {!selectedOption ? (
          <div className="space-y-3">
            <p className="text-sm text-gray-600 mb-4">
              Jak chcete pokračovat s touto nabídkou?
            </p>

            <button
              onClick={() => setSelectedOption('client')}
              className="w-full p-4 border-2 border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-all text-left"
            >
              <div className="flex items-start gap-3">
                <Building2 className="w-6 h-6 text-blue-600 mt-1" />
                <div>
                  <h3 className="font-semibold text-gray-900">Přiřadit existujícímu klientovi</h3>
                  <p className="text-sm text-gray-600 mt-1">
                    Vytvoří obchod (Deal) v pipeline pro vybraného klienta
                  </p>
                </div>
              </div>
            </button>

            <button
              onClick={() => setSelectedOption('prospect')}
              className="w-full p-4 border-2 border-gray-200 rounded-lg hover:border-green-500 hover:bg-green-50 transition-all text-left"
            >
              <div className="flex items-start gap-3">
                <UserPlus className="w-6 h-6 text-green-600 mt-1" />
                <div>
                  <h3 className="font-semibold text-gray-900">Vytvořit nového prospecta</h3>
                  <p className="text-sm text-gray-600 mt-1">
                    Uloží jako nového zájemce s kalkulací v poznámkách
                  </p>
                </div>
              </div>
            </button>

            <button
              onClick={() => setSelectedOption('export')}
              className="w-full p-4 border-2 border-gray-200 rounded-lg hover:border-purple-500 hover:bg-purple-50 transition-all text-left"
            >
              <div className="flex items-start gap-3">
                <Download className="w-6 h-6 text-purple-600 mt-1" />
                <div>
                  <h3 className="font-semibold text-gray-900">Stáhnout jako PDF</h3>
                  <p className="text-sm text-gray-600 mt-1">
                    Exportuje cenovou nabídku s kompletními náležitostmi
                  </p>
                </div>
              </div>
            </button>
          </div>
        ) : selectedOption === 'client' ? (
          <div className="space-y-4">
            <button
              onClick={() => setSelectedOption(null)}
              className="text-sm text-blue-600 hover:underline"
            >
              ← Zpět na výběr
            </button>

            <Select
              label="Vyberte klienta"
              value={selectedClientId}
              onChange={(e) => setSelectedClientId(e.target.value)}
              options={[
                { value: '', label: 'Vyberte klienta' },
                ...clients.map(c => ({ value: c.id, label: c.company_name }))
              ]}
              required
            />

            <Input
              label="Název obchodu"
              value={dealTitle}
              onChange={(e) => setDealTitle(e.target.value)}
              placeholder="např. Instalace Clean Up - Firma XYZ"
              required
            />

            <div className="flex justify-end gap-3 pt-4">
              <Button variant="secondary" onClick={onClose}>
                Zrušit
              </Button>
              <Button onClick={handleSave} disabled={loading}>
                {loading ? 'Ukládání...' : 'Vytvořit obchod'}
              </Button>
            </div>
          </div>
        ) : selectedOption === 'prospect' ? (
          <div className="space-y-4">
            <button
              onClick={() => setSelectedOption(null)}
              className="text-sm text-blue-600 hover:underline"
            >
              ← Zpět na výběr
            </button>

            <Input
              label="Název firmy"
              value={prospectData.company_name}
              onChange={(e) => setProspectData({ ...prospectData, company_name: e.target.value })}
              required
            />

            <Input
              label="Kontaktní osoba"
              value={prospectData.contact_person}
              onChange={(e) => setProspectData({ ...prospectData, contact_person: e.target.value })}
            />

            <Input
              label="Email"
              type="email"
              value={prospectData.email}
              onChange={(e) => setProspectData({ ...prospectData, email: e.target.value })}
              required
            />

            <Input
              label="Telefon"
              value={prospectData.phone}
              onChange={(e) => setProspectData({ ...prospectData, phone: e.target.value })}
            />

            <div className="flex justify-end gap-3 pt-4">
              <Button variant="secondary" onClick={onClose}>
                Zrušit
              </Button>
              <Button onClick={handleSave} disabled={loading}>
                {loading ? 'Ukládání...' : 'Vytvořit prospecta'}
              </Button>
            </div>
          </div>
        ) : selectedOption === 'export' ? (
          <div className="space-y-4">
            <button
              onClick={() => setSelectedOption(null)}
              className="text-sm text-blue-600 hover:underline"
            >
              ← Zpět na výběr
            </button>

            <div className="bg-purple-50 rounded-lg p-3">
              <p className="text-sm text-purple-800 font-medium">Údaje odběratele pro PDF nabídku</p>
              <p className="text-xs text-purple-600 mt-1">Můžete předvyplnit z existujícího klienta</p>
            </div>

            <Select
              label="Předvyplnit z klienta"
              value=""
              onChange={(e) => {
                if (e.target.value) prefillExportFromClient(e.target.value)
              }}
              options={[
                { value: '', label: '— Vyberte klienta pro předvyplnění —' },
                ...clients.map(c => ({ value: c.id, label: c.company_name }))
              ]}
            />

            <div className="border-t pt-4 space-y-3">
              <Input
                label="Název firmy / Jméno *"
                value={exportData.companyName}
                onChange={(e) => setExportData({ ...exportData, companyName: e.target.value })}
                required
              />

              <div className="grid grid-cols-2 gap-3">
                <Input
                  label="IČO"
                  value={exportData.ico}
                  onChange={(e) => setExportData({ ...exportData, ico: e.target.value })}
                  placeholder="12345678"
                />
                <Input
                  label="DIČ"
                  value={exportData.dic}
                  onChange={(e) => setExportData({ ...exportData, dic: e.target.value })}
                  placeholder="CZ12345678"
                />
              </div>

              <Input
                label="Adresa"
                value={exportData.address}
                onChange={(e) => setExportData({ ...exportData, address: e.target.value })}
              />

              <div className="grid grid-cols-2 gap-3">
                <Input
                  label="Město"
                  value={exportData.city}
                  onChange={(e) => setExportData({ ...exportData, city: e.target.value })}
                />
                <Input
                  label="PSČ"
                  value={exportData.postalCode}
                  onChange={(e) => setExportData({ ...exportData, postalCode: e.target.value })}
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <Input
                  label="Kontaktní osoba"
                  value={exportData.contactPerson}
                  onChange={(e) => setExportData({ ...exportData, contactPerson: e.target.value })}
                />
                <Input
                  label="Telefon"
                  value={exportData.phone}
                  onChange={(e) => setExportData({ ...exportData, phone: e.target.value })}
                />
              </div>

              <Input
                label="E-mail"
                type="email"
                value={exportData.email}
                onChange={(e) => setExportData({ ...exportData, email: e.target.value })}
              />
            </div>

            <div className="border-t pt-4 space-y-3">
              <p className="text-sm font-medium text-gray-700">Podmínky nabídky</p>

              <div className="grid grid-cols-3 gap-3">
                <Input
                  label="Platnost (dní)"
                  type="number"
                  value={exportData.validityDays}
                  onChange={(e) => setExportData({ ...exportData, validityDays: Number(e.target.value) })}
                  min="1"
                />
                <div className="col-span-2">
                  <Input
                    label="Platební podmínky"
                    value={exportData.paymentTerms}
                    onChange={(e) => setExportData({ ...exportData, paymentTerms: e.target.value })}
                  />
                </div>
              </div>

              <Input
                label="Dodací podmínky"
                value={exportData.deliveryTerms}
                onChange={(e) => setExportData({ ...exportData, deliveryTerms: e.target.value })}
              />

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Poznámky</label>
                <textarea
                  value={exportData.notes}
                  onChange={(e) => setExportData({ ...exportData, notes: e.target.value })}
                  className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows={3}
                  placeholder="Volitelné poznámky k nabídce..."
                />
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-4">
              <Button variant="secondary" onClick={onClose}>
                Zrušit
              </Button>
              <Button onClick={handleExportPdf}>
                <Download className="w-4 h-4 mr-2" />
                Stáhnout PDF
              </Button>
            </div>
          </div>
        ) : null}
      </div>
    </Modal>
  )
}
