import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import type { Client } from '@/lib/supabase/types'

interface Props {
  clients: Client[]
  selectedClientId: string
  dealTitle: string
  loading: boolean
  onClientChange: (id: string) => void
  onTitleChange: (title: string) => void
  onBack: () => void
  onClose: () => void
  onSave: () => void
}

export function SaveAsClientForm({
  clients,
  selectedClientId,
  dealTitle,
  loading,
  onClientChange,
  onTitleChange,
  onBack,
  onClose,
  onSave,
}: Props) {
  return (
    <div className="space-y-4">
      <button onClick={onBack} className="text-sm text-blue-600 hover:underline">
        ← Zpět na výběr
      </button>

      <Select
        label="Vyberte klienta"
        value={selectedClientId}
        onChange={(e) => onClientChange(e.target.value)}
        options={[
          { value: '', label: 'Vyberte klienta' },
          ...clients.map(c => ({ value: c.id, label: c.company_name })),
        ]}
        required
      />

      <Input
        label="Název obchodu"
        value={dealTitle}
        onChange={(e) => onTitleChange(e.target.value)}
        placeholder="např. Instalace Clean Up - Firma XYZ"
        required
      />

      <div className="flex justify-end gap-3 pt-4">
        <Button variant="secondary" onClick={onClose}>Zrušit</Button>
        <Button onClick={onSave} disabled={loading}>
          {loading ? 'Ukládání...' : 'Vytvořit obchod'}
        </Button>
      </div>
    </div>
  )
}
