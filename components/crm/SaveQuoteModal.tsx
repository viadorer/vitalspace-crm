'use client'

import { useState } from 'react'
import { Modal } from '@/components/ui/Modal'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { Building2, UserPlus, Download } from 'lucide-react'
import type { Client } from '@/lib/supabase/types'

interface SaveQuoteModalProps {
  isOpen: boolean
  onClose: () => void
  clients: Client[]
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
              onClick={() => alert('Export PDF bude přidán v další verzi')}
              className="w-full p-4 border-2 border-gray-200 rounded-lg hover:border-purple-500 hover:bg-purple-50 transition-all text-left"
            >
              <div className="flex items-start gap-3">
                <Download className="w-6 h-6 text-purple-600 mt-1" />
                <div>
                  <h3 className="font-semibold text-gray-900">Stáhnout jako PDF</h3>
                  <p className="text-sm text-gray-600 mt-1">
                    Exportuje nabídku do PDF souboru (připravujeme)
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
        ) : null}
      </div>
    </Modal>
  )
}
