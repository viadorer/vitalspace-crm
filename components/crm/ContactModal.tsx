'use client'

import { useState, FormEvent, useEffect } from 'react'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { Modal } from '@/components/ui/Modal'
import { ClientContact } from '@/lib/supabase/types'
import { X } from 'lucide-react'

interface ContactModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: (contact: Omit<ClientContact, 'id' | 'created_at' | 'updated_at'>) => Promise<void>
  contact?: ClientContact | null
  clientId: string
}

export function ContactModal({ isOpen, onClose, onSave, contact, clientId }: ContactModalProps) {
  const [loading, setLoading] = useState(false)
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

  useEffect(() => {
    if (contact) {
      setFormData({
        first_name: contact.first_name || '',
        last_name: contact.last_name,
        position: contact.position || '',
        email: contact.email || '',
        phone: contact.phone || '',
        mobile: contact.mobile || '',
        linkedin_url: contact.linkedin_url || '',
        is_primary: contact.is_primary,
        is_decision_maker: contact.is_decision_maker,
        notes: contact.notes || '',
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
    try {
      await onSave({
        ...formData,
        client_id: clientId,
      } as any)
      onClose()
    } catch (error) {
      console.error('Chyba při ukládání kontaktu:', error)
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
          <Input
            label="Mobil"
            value={formData.mobile}
            onChange={(e) => setFormData({ ...formData, mobile: e.target.value })}
          />
          <Input
            label="LinkedIn URL"
            type="url"
            value={formData.linkedin_url}
            onChange={(e) => setFormData({ ...formData, linkedin_url: e.target.value })}
            placeholder="https://linkedin.com/in/..."
          />
        </div>

        <div className="space-y-3">
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={formData.is_primary}
              onChange={(e) => setFormData({ ...formData, is_primary: e.target.checked })}
              className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
            />
            <span className="text-sm font-medium text-gray-700">Primární kontakt</span>
          </label>

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

        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">Poznámky</label>
          <textarea
            value={formData.notes}
            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
            className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            rows={3}
          />
        </div>

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
