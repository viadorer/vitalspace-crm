import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'

interface ProspectData {
  company_name: string
  contact_person: string
  email: string
  phone: string
}

interface Props {
  data: ProspectData
  loading: boolean
  onChange: (data: ProspectData) => void
  onBack: () => void
  onClose: () => void
  onSave: () => void
}

export function SaveAsProspectForm({ data, loading, onChange, onBack, onClose, onSave }: Props) {
  function updateField(field: keyof ProspectData, value: string) {
    onChange({ ...data, [field]: value })
  }

  return (
    <div className="space-y-4">
      <button onClick={onBack} className="text-sm text-blue-600 hover:underline">
        ← Zpět na výběr
      </button>

      <Input
        label="Název firmy"
        value={data.company_name}
        onChange={(e) => updateField('company_name', e.target.value)}
        required
      />
      <Input
        label="Kontaktní osoba"
        value={data.contact_person}
        onChange={(e) => updateField('contact_person', e.target.value)}
      />
      <Input
        label="Email"
        type="email"
        value={data.email}
        onChange={(e) => updateField('email', e.target.value)}
        required
      />
      <Input
        label="Telefon"
        value={data.phone}
        onChange={(e) => updateField('phone', e.target.value)}
      />

      <div className="flex justify-end gap-3 pt-4">
        <Button variant="secondary" onClick={onClose}>Zrušit</Button>
        <Button onClick={onSave} disabled={loading}>
          {loading ? 'Ukládání...' : 'Vytvořit prospecta'}
        </Button>
      </div>
    </div>
  )
}
