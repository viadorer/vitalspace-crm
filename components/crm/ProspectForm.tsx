'use client'

import { useState, FormEvent } from 'react'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { Button } from '@/components/ui/Button'
import { SegmentInsights } from './SegmentInsights'
import { ContactModal } from './ContactModal'
import { useProspectContacts } from '@/lib/hooks/useProspectContacts'
import { PROSPECT_STATUSES, REGIONS, PRIORITIES } from '@/lib/utils/constants'
import { Plus, User, Mail, Phone, Linkedin, CheckCircle, Pencil, Trash2 } from 'lucide-react'
import type { Prospect, CompanySegment, ProspectContact } from '@/lib/supabase/types'

interface ProspectFormProps {
  prospect?: Prospect
  segments: CompanySegment[]
  onSubmit: (data: Partial<Prospect>) => Promise<void>
  onCancel: () => void
}

export function ProspectForm({ prospect, segments, onSubmit, onCancel }: ProspectFormProps) {
  const [loading, setLoading] = useState(false)
  const [showContactModal, setShowContactModal] = useState(false)
  const [editingContact, setEditingContact] = useState<ProspectContact | null>(null)

  const {
    contacts,
    loading: contactsLoading,
    addContact,
    updateContact,
    deleteContact,
  } = useProspectContacts(prospect?.id || null)

  const [formData, setFormData] = useState({
    company_name: prospect?.company_name || '',
    ico: prospect?.ico || '',
    dic: prospect?.dic || '',
    segment_id: prospect?.segment_id || '',
    region: prospect?.region || 'Plzeňský kraj',
    city: prospect?.city || '',
    address: prospect?.address || '',
    website: prospect?.website || '',
    employees_count_est: prospect?.employees_count_est || null,
    estimated_floor_area_m2: prospect?.estimated_floor_area_m2 || null,
    source: prospect?.source || '',
    priority: prospect?.priority || 3,
    status: prospect?.status || 'not_contacted',
    notes: prospect?.notes || '',
    assigned_consultant: prospect?.assigned_consultant || '',
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
          label="Segment"
          value={formData.segment_id}
          onChange={(e) => setFormData({ ...formData, segment_id: e.target.value })}
          options={[
            { value: '', label: 'Vyberte segment' },
            ...segments.map(s => ({ value: s.id, label: s.name }))
          ]}
        />
      </div>

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
        <Select
          label="Priorita"
          value={formData.priority}
          onChange={(e) => setFormData({ ...formData, priority: Number(e.target.value) })}
          options={PRIORITIES.map(p => ({ value: p.value, label: p.label }))}
        />

        <Select
          label="Stav"
          value={formData.status}
          onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
          options={PROSPECT_STATUSES.map(s => ({ value: s.value, label: s.label }))}
        />

        <Input
          label="Konzultant"
          value={formData.assigned_consultant || ''}
          onChange={(e) => setFormData({ ...formData, assigned_consultant: e.target.value })}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
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
      </div>

      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700">Poznámky</label>
        <textarea
          value={formData.notes || ''}
          onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
          className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          rows={3}
        />
      </div>

      {prospect && (
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
          ) : contacts.length === 0 ? (
            <div className="text-center py-6 text-gray-500">
              <User className="w-10 h-10 mx-auto mb-2 text-gray-400" />
              <p>Žádné kontaktní osoby</p>
            </div>
          ) : (
            <div className="space-y-3">
              {contacts.map((contact) => (
                <div key={contact.id} className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-semibold text-gray-900">
                          {contact.first_name} {contact.last_name}
                        </span>
                        {contact.is_decision_maker && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-green-100 text-green-700 text-xs font-medium rounded">
                            <CheckCircle className="w-3 h-3" />
                            Rozhodovatel
                          </span>
                        )}
                      </div>
                      {contact.position && (
                        <p className="text-sm text-gray-600 mb-2">{contact.position}</p>
                      )}
                      <div className="space-y-1">
                        {contact.email && (
                          <div className="flex items-center gap-2 text-sm text-gray-700">
                            <Mail className="w-3.5 h-3.5 text-gray-400" />
                            <a href={`mailto:${contact.email}`} className="hover:text-blue-600">{contact.email}</a>
                          </div>
                        )}
                        {contact.phone && (
                          <div className="flex items-center gap-2 text-sm text-gray-700">
                            <Phone className="w-3.5 h-3.5 text-gray-400" />
                            <a href={`tel:${contact.phone}`} className="hover:text-blue-600">{contact.phone}</a>
                          </div>
                        )}
                        {contact.linkedin_url && (
                          <div className="flex items-center gap-2 text-sm text-gray-700">
                            <Linkedin className="w-3.5 h-3.5 text-gray-400" />
                            <a href={contact.linkedin_url} target="_blank" rel="noopener noreferrer" className="hover:text-blue-600">LinkedIn profil</a>
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="flex gap-1 ml-3">
                      <button
                        type="button"
                        onClick={() => {
                          setEditingContact(contact)
                          setShowContactModal(true)
                        }}
                        className="p-1.5 text-gray-400 hover:text-blue-600 rounded hover:bg-gray-100"
                        title="Upravit"
                      >
                        <Pencil className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        onClick={async () => {
                          if (confirm('Opravdu chcete smazat tento kontakt?')) {
                            await deleteContact(contact.id)
                          }
                        }}
                        className="p-1.5 text-gray-400 hover:text-red-600 rounded hover:bg-gray-100"
                        title="Smazat"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {prospect && (
        <ContactModal
          isOpen={showContactModal}
          onClose={() => {
            setShowContactModal(false)
            setEditingContact(null)
          }}
          onSave={async (contactData) => {
            if (editingContact) {
              await updateContact(editingContact.id, contactData as Partial<ProspectContact>)
            } else {
              await addContact(contactData as Omit<ProspectContact, 'id' | 'created_at'>)
            }
          }}
          contact={editingContact}
          prospectId={prospect.id}
        />
      )}

      <div className="flex justify-between items-center pt-4">
        {prospect && (
          <Button 
            type="button" 
            variant="primary"
            onClick={async () => {
              if (confirm('Převést tento prospect na klienta?')) {
                try {
                  const response = await fetch(`/api/prospects/${prospect.id}/convert`, {
                    method: 'POST'
                  })
                  const data = await response.json()
                  if (data.success) {
                    alert('Prospect úspěšně převeden na klienta!')
                    window.location.href = `/crm/clients`
                  } else {
                    alert(data.error || 'Chyba při konverzi')
                  }
                } catch (err) {
                  alert('Chyba při konverzi prospectu')
                }
              }
            }}
          >
            → Převést na klienta
          </Button>
        )}
        <div className="flex space-x-3">
          <Button type="button" variant="secondary" onClick={onCancel}>
            Zrušit
          </Button>
          <Button type="submit" disabled={loading}>
            {loading ? 'Ukládání...' : prospect ? 'Uložit změny' : 'Vytvořit prospect'}
          </Button>
        </div>
      </div>
    </form>
  )
}
