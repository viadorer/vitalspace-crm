'use client'

import { useState, FormEvent, useEffect } from 'react'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { Modal } from '@/components/ui/Modal'
import type { ClientContact, ProspectContact } from '@/lib/supabase/types'
import { X } from 'lucide-react'

type AnyContact = ClientContact | ProspectContact

interface ContactModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: (contact: Record<string, unknown>) => Promise<void>
  contact?: AnyContact | null
  clientId?: string
  prospectId?: string
}

export function ContactModal({ isOpen, onClose, onSave, contact, clientId, prospectId }: ContactModalProps) {
  const [loading, setLoading] = useState(false)
  const [saveError, setSaveError] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    position: '',
    email: '',
    phone: '',
    mobile: '',
    linkedin_url: '',
    is_primary: false,
    is_decision_maker: false,
    notes: '',
  })

  const isClientContact = Boolean(clientId)

  useEffect(() => {
    if (contact) {
      const c = contact as unknown as Record<string, unknown>
      setFormData({
        first_name: contact.first_name || '',
        last_name: contact.last_name,
        position: contact.position || '',
        email: contact.email || '',
        phone: contact.phone || '',
        mobile: (c.mobile as string) || '',
        linkedin_url: contact.linkedin_url || '',
        is_primary: (c.is_primary as boolean) || false,
        is_decision_maker: contact.is_decision_maker,
        notes: (c.notes as string) || '',
      })
    } else {
      setFormData({
        first_name: '',
        last_name: '',
        position: '',
        email: '',
        phone: '',
        mobile: '',
        linkedin_url: '',
        is_primary: false,
        is_decision_maker: false,
        notes: '',
      })
    }
  }, [contact, isOpen])

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setLoading(true)
    setSaveError(null)
    try {
      const payload: Record<string, unknown> = {
        first_name: formData.first_name || null,
        last_name: formData.last_name,
        position: formData.position || null,
        email: formData.email || null,
        phone: formData.phone || null,
        linkedin_url: formData.linkedin_url || null,
        is_decision_maker: formData.is_decision_maker,
      }
      if (clientId) {
        payload.client_id = clientId
        payload.mobile = formData.mobile || null
        payload.is_primary = formData.is_primary
        payload.notes = formData.notes || null
      }
      if (prospectId) {
        payload.prospect_id = prospectId
      }
      await onSave(payload)
      onClose()
    } catch (error) {
      console.error('Chyba při ukládání kontaktu:', error)
      setSaveError(error instanceof Error ? error.message : 'Chyba při ukládání kontaktu')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={contact ? 'Upravit kontakt' : 'Přidat kontakt'}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <Input
            label="Jméno"
            value={formData.first_name}
            onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
          />
          <Input
            label="Příjmení"
            value={formData.last_name}
            onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
            required
          />
        </div>

        <Input
          label="Pozice"
          value={formData.position}
          onChange={(e) => setFormData({ ...formData, position: e.target.value })}
          placeholder="Jednatel, Ředitel, Manažer..."
        />

        <div className="grid grid-cols-2 gap-4">
          <Input
            label="Email"
            type="email"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          />
          <Input
            label="Telefon"
            value={formData.phone}
            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          {isClientContact && (
            <Input
              label="Mobil"
              value={formData.mobile}
              onChange={(e) => setFormData({ ...formData, mobile: e.target.value })}
            />
          )}
          <Input
            label="LinkedIn URL"
            type="url"
            value={formData.linkedin_url}
            onChange={(e) => setFormData({ ...formData, linkedin_url: e.target.value })}
            placeholder="https://linkedin.com/in/..."
          />
        </div>

        <div className="space-y-3">
          {isClientContact && (
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={formData.is_primary}
                onChange={(e) => setFormData({ ...formData, is_primary: e.target.checked })}
                className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
              />
              <span className="text-sm font-medium text-gray-700">Primární kontakt</span>
            </label>
          )}

          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={formData.is_decision_maker}
              onChange={(e) => setFormData({ ...formData, is_decision_maker: e.target.checked })}
              className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
            />
            <span className="text-sm font-medium text-gray-700">Rozhodovatel</span>
          </label>
        </div>

        {isClientContact && (
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">Poznámky</label>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              rows={3}
            />
          </div>
        )}

        {saveError && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-800">
            {saveError}
          </div>
        )}

        <div className="flex justify-end space-x-3 pt-4">
          <Button type="button" variant="secondary" onClick={onClose}>
            Zrušit
          </Button>
          <Button type="submit" disabled={loading}>
            {loading ? 'Ukládání...' : contact ? 'Uložit změny' : 'Přidat kontakt'}
          </Button>
        </div>
      </form>
    </Modal>
  )
}
