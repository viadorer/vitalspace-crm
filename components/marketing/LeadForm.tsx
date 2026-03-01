'use client'

import { useState, FormEvent } from 'react'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { Button } from '@/components/ui/Button'
import { REGIONS } from '@/lib/utils/constants'

export function LeadForm() {
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')
  const [formData, setFormData] = useState({
    company_name: '',
    contact_name: '',
    email: '',
    phone: '',
    city: '',
    region: 'Plzeňský kraj',
    message: '',
  })

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const response = await fetch('/api/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...formData, source: 'Web' }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Chyba při odesílání')
      }

      setSuccess(true)
      setFormData({
        company_name: '',
        contact_name: '',
        email: '',
        phone: '',
        city: '',
        region: 'Plzeňský kraj',
        message: '',
      })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Chyba při odesílání poptávky')
    } finally {
      setLoading(false)
    }
  }

  if (success) {
    return (
      <div className="bg-green-50 border border-green-200 rounded-lg p-8 text-center">
        <h3 className="text-2xl font-bold text-gray-900 mb-2">
          Děkujeme za vaši poptávku!
        </h3>
        <p className="text-gray-600">
          Ozveme se vám do 24 hodin.
        </p>
        <button
          onClick={() => setSuccess(false)}
          className="mt-4 text-blue-600 hover:text-blue-700 font-medium"
        >
          Odeslat další poptávku
        </button>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Input
          label="Název firmy *"
          value={formData.company_name}
          onChange={(e) => setFormData({ ...formData, company_name: e.target.value })}
          required
        />

        <Input
          label="Kontaktní osoba *"
          value={formData.contact_name}
          onChange={(e) => setFormData({ ...formData, contact_name: e.target.value })}
          required
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Input
          type="email"
          label="Email *"
          value={formData.email}
          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          required
        />

        <Input
          type="tel"
          label="Telefon"
          value={formData.phone}
          onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Input
          label="Město"
          value={formData.city}
          onChange={(e) => setFormData({ ...formData, city: e.target.value })}
        />

        <Select
          label="Region"
          value={formData.region}
          onChange={(e) => setFormData({ ...formData, region: e.target.value })}
          options={REGIONS.map(r => ({ value: r, label: r }))}
        />
      </div>

      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700">
          Zpráva
        </label>
        <textarea
          value={formData.message}
          onChange={(e) => setFormData({ ...formData, message: e.target.value })}
          className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          rows={4}
          placeholder="Popište vaše potřeby..."
        />
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      <Button type="submit" className="w-full" disabled={loading}>
        {loading ? 'Odesílání...' : 'Odeslat nezávaznou poptávku'}
      </Button>
    </form>
  )
}
