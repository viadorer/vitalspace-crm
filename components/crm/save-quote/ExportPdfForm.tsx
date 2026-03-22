import { Download } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import type { Client } from '@/lib/supabase/types'

export interface ExportData {
  companyName: string
  address: string
  city: string
  postalCode: string
  ico: string
  dic: string
  contactPerson: string
  email: string
  phone: string
  validityDays: number
  paymentTerms: string
  deliveryTerms: string
  notes: string
}

interface Props {
  data: ExportData
  clients: Client[]
  onChange: (data: ExportData) => void
  onPrefillFromClient: (clientId: string) => void
  onBack: () => void
  onClose: () => void
  onExport: () => void
}

export function ExportPdfForm({ data, clients, onChange, onPrefillFromClient, onBack, onClose, onExport }: Props) {
  function updateField<K extends keyof ExportData>(field: K, value: ExportData[K]) {
    onChange({ ...data, [field]: value })
  }

  return (
    <div className="space-y-4">
      <button onClick={onBack} className="text-sm text-blue-600 hover:underline">
        ← Zpět na výběr
      </button>

      <div className="bg-purple-50 rounded-lg p-3">
        <p className="text-sm text-purple-800 font-medium">Údaje odběratele pro PDF nabídku</p>
        <p className="text-xs text-purple-600 mt-1">Můžete předvyplnit z existujícího klienta</p>
      </div>

      <Select
        label="Předvyplnit z klienta"
        value=""
        onChange={(e) => { if (e.target.value) onPrefillFromClient(e.target.value) }}
        options={[
          { value: '', label: '— Vyberte klienta pro předvyplnění —' },
          ...clients.map(c => ({ value: c.id, label: c.company_name })),
        ]}
      />

      <div className="border-t pt-4 space-y-3">
        <Input
          label="Název firmy / Jméno *"
          value={data.companyName}
          onChange={(e) => updateField('companyName', e.target.value)}
          required
        />

        <div className="grid grid-cols-2 gap-3">
          <Input label="IČO" value={data.ico} onChange={(e) => updateField('ico', e.target.value)} placeholder="12345678" />
          <Input label="DIČ" value={data.dic} onChange={(e) => updateField('dic', e.target.value)} placeholder="CZ12345678" />
        </div>

        <Input label="Adresa" value={data.address} onChange={(e) => updateField('address', e.target.value)} />

        <div className="grid grid-cols-2 gap-3">
          <Input label="Město" value={data.city} onChange={(e) => updateField('city', e.target.value)} />
          <Input label="PSČ" value={data.postalCode} onChange={(e) => updateField('postalCode', e.target.value)} />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <Input label="Kontaktní osoba" value={data.contactPerson} onChange={(e) => updateField('contactPerson', e.target.value)} />
          <Input label="Telefon" value={data.phone} onChange={(e) => updateField('phone', e.target.value)} />
        </div>

        <Input label="E-mail" type="email" value={data.email} onChange={(e) => updateField('email', e.target.value)} />
      </div>

      <div className="border-t pt-4 space-y-3">
        <p className="text-sm font-medium text-gray-700">Podmínky nabídky</p>

        <div className="grid grid-cols-3 gap-3">
          <Input
            label="Platnost (dní)"
            type="number"
            value={data.validityDays}
            onChange={(e) => updateField('validityDays', Number(e.target.value))}
            min="1"
          />
          <div className="col-span-2">
            <Input label="Platební podmínky" value={data.paymentTerms} onChange={(e) => updateField('paymentTerms', e.target.value)} />
          </div>
        </div>

        <Input label="Dodací podmínky" value={data.deliveryTerms} onChange={(e) => updateField('deliveryTerms', e.target.value)} />

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Poznámky</label>
          <textarea
            value={data.notes}
            onChange={(e) => updateField('notes', e.target.value)}
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            rows={3}
            placeholder="Volitelné poznámky k nabídce..."
          />
        </div>
      </div>

      <div className="flex justify-end gap-3 pt-4">
        <Button variant="secondary" onClick={onClose}>Zrušit</Button>
        <Button onClick={onExport}>
          <Download className="w-4 h-4 mr-2" />
          Stáhnout PDF
        </Button>
      </div>
    </div>
  )
}
