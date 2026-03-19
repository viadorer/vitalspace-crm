'use client'

import { useState, useEffect } from 'react'
import { Modal } from '@/components/ui/Modal'
import { Button } from '@/components/ui/Button'
import { Select } from '@/components/ui/Select'
import { Mail, AlertTriangle, CheckCircle, XCircle, Loader2 } from 'lucide-react'

interface Recipient {
  email: string
  name?: string
  company_name: string
  prospect_id?: string
  client_id?: string
}

interface Template {
  name: string
  label: string
  description: string
}

interface BulkEmailModalProps {
  isOpen: boolean
  onClose: () => void
  recipients: Recipient[]
  entityType: 'prospect' | 'client'
  onSendComplete?: () => void
}

interface SendResult {
  email: string
  success: boolean
  error?: string
}

export function BulkEmailModal({ isOpen, onClose, recipients, entityType, onSendComplete }: BulkEmailModalProps) {
  const [templates, setTemplates] = useState<Template[]>([])
  const [selectedTemplate, setSelectedTemplate] = useState('')
  const [sending, setSending] = useState(false)
  const [results, setResults] = useState<SendResult[] | null>(null)
  const [dailyInfo, setDailyInfo] = useState<{ sent_today: number; limit: number; remaining: number } | null>(null)
  const [error, setError] = useState('')

  useEffect(() => {
    if (isOpen) {
      fetchTemplates()
      fetchDailyLimit()
      setResults(null)
      setError('')
      setSelectedTemplate('')
    }
  }, [isOpen])

  async function fetchTemplates() {
    try {
      const res = await fetch('/api/email/templates')
      if (res.ok) {
        const data = await res.json()
        setTemplates(data)
        if (data.length > 0) setSelectedTemplate(data[0].name)
      }
    } catch {
      setError('Nepodařilo se načíst šablony')
    }
  }

  async function fetchDailyLimit() {
    try {
      const res = await fetch('/api/email/bulk-send')
      if (res.ok) {
        setDailyInfo(await res.json())
      }
    } catch {}
  }

  async function handleSend() {
    if (!selectedTemplate) return
    setSending(true)
    setError('')
    setResults(null)

    try {
      const payload = {
        template_name: selectedTemplate,
        convert_prospects: entityType === 'prospect',
        recipients: recipients.map(r => ({
          email: r.email,
          name: r.name,
          variables: {
            salutation: 'Vážená paní ředitelko / Vážený pane řediteli',
            company_name: r.company_name,
            contact_name: r.name || '',
          },
          ...(r.prospect_id ? { prospect_id: r.prospect_id } : {}),
          ...(r.client_id ? { client_id: r.client_id } : {}),
        })),
      }

      const res = await fetch('/api/email/bulk-send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.error || 'Chyba při odesílání')
        return
      }

      setResults(data.results)
      setDailyInfo({
        sent_today: data.sent_today,
        limit: data.limit,
        remaining: data.remaining,
      })

      if (onSendComplete) onSendComplete()
    } catch (err: any) {
      setError(err.message || 'Neočekávaná chyba')
    } finally {
      setSending(false)
    }
  }

  const validRecipients = recipients.filter(r => r.email)
  const invalidRecipients = recipients.filter(r => !r.email)
  const successCount = results?.filter(r => r.success).length || 0
  const errorCount = results?.filter(r => !r.success).length || 0

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Hromadné odeslání emailu" size="xl">
      <div className="space-y-5">
        {/* Daily limit info */}
        {dailyInfo && (
          <div className={`flex items-center gap-2 p-3 rounded-lg text-sm ${
            dailyInfo.remaining < 50 ? 'bg-amber-50 text-amber-800 border border-amber-200' : 'bg-blue-50 text-blue-800 border border-blue-200'
          }`}>
            <Mail className="w-4 h-4 flex-shrink-0" />
            <span>
              Dnes odesláno: <strong>{dailyInfo.sent_today}</strong> / {dailyInfo.limit} |
              Zbývá: <strong>{dailyInfo.remaining}</strong>
            </span>
          </div>
        )}

        {/* Recipients summary */}
        <div>
          <h3 className="text-sm font-semibold text-gray-900 mb-2">
            Příjemci ({validRecipients.length})
          </h3>
          {invalidRecipients.length > 0 && (
            <div className="flex items-center gap-2 p-2 bg-amber-50 border border-amber-200 rounded text-sm text-amber-800 mb-2">
              <AlertTriangle className="w-4 h-4 flex-shrink-0" />
              <span>{invalidRecipients.length} kontaktů bez emailu bude přeskočeno</span>
            </div>
          )}
          <div className="max-h-48 overflow-y-auto border border-gray-200 rounded-lg">
            <table className="min-w-full text-sm">
              <thead className="bg-gray-50 sticky top-0">
                <tr>
                  <th className="px-3 py-2 text-left font-medium text-gray-600">Firma</th>
                  <th className="px-3 py-2 text-left font-medium text-gray-600">Kontakt</th>
                  <th className="px-3 py-2 text-left font-medium text-gray-600">Email</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {recipients.map((r, i) => (
                  <tr key={i} className={!r.email ? 'bg-amber-50/50 text-gray-400' : ''}>
                    <td className="px-3 py-1.5">{r.company_name}</td>
                    <td className="px-3 py-1.5">{r.name || '-'}</td>
                    <td className="px-3 py-1.5">{r.email || '(chybí email)'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Template selection */}
        <div>
          <label className="block text-sm font-semibold text-gray-900 mb-1">Šablona emailu</label>
          <Select
            value={selectedTemplate}
            onChange={(e) => setSelectedTemplate(e.target.value)}
            options={templates.map(t => ({ value: t.name, label: `${t.label}` }))}
          />
          {templates.find(t => t.name === selectedTemplate)?.description && (
            <p className="text-xs text-gray-500 mt-1">
              {templates.find(t => t.name === selectedTemplate)?.description}
            </p>
          )}
        </div>

        {/* Prospect conversion note */}
        {entityType === 'prospect' && !results && (
          <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg text-sm text-emerald-800">
            Po odeslání budou prospekty automaticky převedeny na klienty a vytvoří se deal v pipeline.
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-800">
            <XCircle className="w-4 h-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Results */}
        {results && (
          <div className="space-y-2">
            <div className="flex gap-4 text-sm">
              {successCount > 0 && (
                <span className="flex items-center gap-1 text-green-700">
                  <CheckCircle className="w-4 h-4" /> {successCount} odesláno
                </span>
              )}
              {errorCount > 0 && (
                <span className="flex items-center gap-1 text-red-700">
                  <XCircle className="w-4 h-4" /> {errorCount} selhalo
                </span>
              )}
            </div>
            {errorCount > 0 && (
              <div className="max-h-32 overflow-y-auto text-xs text-red-700 space-y-1">
                {results.filter(r => !r.success).map((r, i) => (
                  <div key={i}>{r.email}: {r.error}</div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Actions */}
        <div className="flex justify-end gap-3 pt-2 border-t border-gray-200">
          <Button variant="secondary" onClick={onClose}>
            {results ? 'Zavřít' : 'Zrušit'}
          </Button>
          {!results && (
            <Button
              variant="primary"
              onClick={handleSend}
              disabled={sending || validRecipients.length === 0 || !selectedTemplate}
            >
              {sending ? (
                <span className="flex items-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Odesílám...
                </span>
              ) : (
                `Odeslat ${validRecipients.length} emailů`
              )}
            </Button>
          )}
        </div>
      </div>
    </Modal>
  )
}
