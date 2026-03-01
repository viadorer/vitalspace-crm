'use client'

import { useState, FormEvent } from 'react'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { Button } from '@/components/ui/Button'
import { SegmentInsights } from './SegmentInsights'
import { ClientContactsList } from './ClientContactsList'
import { ContactModal } from './ContactModal'
import { useClientContacts } from '@/lib/hooks/useClientContacts'
import { REGIONS } from '@/lib/utils/constants'
import type { Client, CompanySegment, ClientContact } from '@/lib/supabase/types'
import { Plus } from 'lucide-react'

interface ClientFormProps {
  client?: Client
  segments: CompanySegment[]
  onSubmit: (data: Partial<Client>) => Promise<void>
  onCancel: () => void
}

export function ClientForm({ client, segments, onSubmit, onCancel }: ClientFormProps) {
  const [loading, setLoading] = useState(false)
  const [showContactModal, setShowContactModal] = useState(false)
  const [editingContact, setEditingContact] = useState<ClientContact | null>(null)
  
  const {
    contacts,
    loading: contactsLoading,
    addContact,
    updateContact,
    deleteContact,
  } = useClientContacts(client?.id || null)

  const [formData, setFormData] = useState({
    company_name: client?.company_name || '',
    type: client?.type || 'B2B',
    ico: client?.ico || '',
    dic: client?.dic || '',
    contact_person: client?.contact_person || '',
    email: client?.email || '',
    phone: client?.phone || '',
    segment_id: client?.segment_id || '',
    region: client?.region || 'Plzeňský kraj',
    city: client?.city || '',
    address: client?.address || '',
    website: client?.website || '',
    employees_count_est: client?.employees_count_est || null,
    estimated_floor_area_m2: client?.estimated_floor_area_m2 || null,
    source: client?.source || '',
    payment_terms_days: client?.payment_terms_days || 14,
    notes: client?.notes || '',
    assigned_consultant: client?.assigned_consultant || '',
  })

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setLoading(true)
    await onSubmit(formData)
    setLoading(false)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <Input
          label="Název firmy"
          value={formData.company_name}
          onChange={(e) => setFormData({ ...formData, company_name: e.target.value })}
          required
        />

        <Select
          label="Typ"
          value={formData.type}
          onChange={(e) => setFormData({ ...formData, type: e.target.value as any })}
          options={[
            { value: 'B2B', label: 'B2B' },
            { value: 'B2C', label: 'B2C' },
          ]}
        />
      </div>

      <Select
        label="Segment"
        value={formData.segment_id}
        onChange={(e) => setFormData({ ...formData, segment_id: e.target.value })}
        options={[
          { value: '', label: 'Vyberte segment' },
          ...segments.map(s => ({ value: s.id, label: s.name }))
        ]}
      />

      {formData.segment_id && (
        <SegmentInsights 
          segment={segments.find(s => s.id === formData.segment_id) || null} 
        />
      )}

      <div className="grid grid-cols-2 gap-4">
        <Input
          label="IČO"
          value={formData.ico || ''}
          onChange={(e) => setFormData({ ...formData, ico: e.target.value })}
        />

        <Input
          label="DIČ"
          value={formData.dic || ''}
          onChange={(e) => setFormData({ ...formData, dic: e.target.value })}
        />
      </div>

      <div className="grid grid-cols-3 gap-4">
        <Input
          label="Kontaktní osoba"
          value={formData.contact_person || ''}
          onChange={(e) => setFormData({ ...formData, contact_person: e.target.value })}
        />

        <Input
          label="Email"
          type="email"
          value={formData.email || ''}
          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
        />

        <Input
          label="Telefon"
          value={formData.phone || ''}
          onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <Input
          label="Město"
          value={formData.city || ''}
          onChange={(e) => setFormData({ ...formData, city: e.target.value })}
        />

        <Select
          label="Region"
          value={formData.region}
          onChange={(e) => setFormData({ ...formData, region: e.target.value })}
          options={REGIONS.map(r => ({ value: r, label: r }))}
        />
      </div>

      <Input
        label="Adresa"
        value={formData.address || ''}
        onChange={(e) => setFormData({ ...formData, address: e.target.value })}
      />

      <div className="grid grid-cols-2 gap-4">
        <Input
          label="Web"
          type="url"
          value={formData.website || ''}
          onChange={(e) => setFormData({ ...formData, website: e.target.value })}
          placeholder="https://"
        />

        <Input
          label="Zdroj"
          value={formData.source || ''}
          onChange={(e) => setFormData({ ...formData, source: e.target.value })}
          placeholder="LinkedIn, Web, Referral..."
        />
      </div>

      <div className="grid grid-cols-3 gap-4">
        <Input
          type="number"
          label="Odhad počtu zaměstnanců"
          value={formData.employees_count_est || ''}
          onChange={(e) => setFormData({ ...formData, employees_count_est: e.target.value ? Number(e.target.value) : null })}
          min="0"
        />

        <Input
          type="number"
          label="Odhad plochy (m²)"
          value={formData.estimated_floor_area_m2 || ''}
          onChange={(e) => setFormData({ ...formData, estimated_floor_area_m2: e.target.value ? Number(e.target.value) : null })}
          min="0"
        />

        <Input
          type="number"
          label="Platební podmínky (dny)"
          value={formData.payment_terms_days}
          onChange={(e) => setFormData({ ...formData, payment_terms_days: Number(e.target.value) })}
          min="0"
        />
      </div>

      <Input
        label="Konzultant"
        value={formData.assigned_consultant || ''}
        onChange={(e) => setFormData({ ...formData, assigned_consultant: e.target.value })}
      />

      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700">Poznámky</label>
        <textarea
          value={formData.notes || ''}
          onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
          className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          rows={3}
        />
      </div>

      {client && (
        <div className="space-y-3 pt-4 border-t">
          <div className="flex items-center justify-between">
            <label className="block text-sm font-medium text-gray-700">Kontaktní osoby</label>
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={() => {
                setEditingContact(null)
                setShowContactModal(true)
              }}
            >
              <Plus className="w-4 h-4 mr-1" />
              Přidat kontakt
            </Button>
          </div>
          
          {contactsLoading ? (
            <div className="text-center py-4 text-gray-500">Načítání kontaktů...</div>
          ) : (
            <ClientContactsList
              contacts={contacts}
              onEdit={(contact) => {
                setEditingContact(contact)
                setShowContactModal(true)
              }}
              onDelete={async (contactId) => {
                if (confirm('Opravdu chcete smazat tento kontakt?')) {
                  try {
                    await deleteContact(contactId)
                  } catch (error) {
                    alert('Chyba při mazání kontaktu')
                  }
                }
              }}
            />
          )}
        </div>
      )}

      {client && (
        <ContactModal
          isOpen={showContactModal}
          onClose={() => {
            setShowContactModal(false)
            setEditingContact(null)
          }}
          onSave={async (contactData) => {
            try {
              if (editingContact) {
                await updateContact(editingContact.id, contactData)
              } else {
                await addContact(contactData)
              }
            } catch (error) {
              throw error
            }
          }}
          contact={editingContact}
          clientId={client.id}
        />
      )}

      <div className="flex justify-end space-x-3 pt-4">
        <Button type="button" variant="secondary" onClick={onCancel}>
          Zrušit
        </Button>
        <Button type="submit" disabled={loading}>
          {loading ? 'Ukládání...' : client ? 'Uložit změny' : 'Vytvořit klienta'}
        </Button>
      </div>
    </form>
  )
}
