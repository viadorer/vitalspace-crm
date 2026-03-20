'use client'

import { useEffect, useState, useCallback } from 'react'
import Link from 'next/link'
import { Topbar } from '@/components/crm/Topbar'
import { Input } from '@/components/ui/Input'
import { createClient } from '@/lib/supabase/client'
import {
  FileText,
  Download,
  ExternalLink,
  Search,
  Send,
  Calendar,
  Building2,
} from 'lucide-react'

interface QuoteDeal {
  id: string
  deal_number: string | null
  title: string
  stage: string
  final_price_czk: number | null
  total_value_czk: number | null
  created_at: string
  clients: { id: string; company_name: string }[] | null
  prospects: { id: string; company_name: string }[] | null
}

interface QuoteDocument {
  id: string
  title: string
  file_path: string
  file_name: string
  file_size: number | null
  created_at: string
}

interface QuoteRow {
  deal: QuoteDeal
  document: QuoteDocument | null
}

const stageLabels: Record<string, string> = {
  lead: 'Lead',
  proposal_sent: 'Nabídka odeslána',
  negotiation: 'Vyjednávání',
  contract_signed: 'Smlouva',
  technical_audit: 'Technický audit',
  installation: 'Instalace',
  handover: 'Předání',
  closed_won: 'Vyhráno',
  closed_lost: 'Prohráno',
}

const stageColors: Record<string, string> = {
  lead: 'bg-gray-100 text-gray-600',
  proposal_sent: 'bg-blue-100 text-blue-700',
  negotiation: 'bg-amber-100 text-amber-700',
  contract_signed: 'bg-purple-100 text-purple-700',
  technical_audit: 'bg-indigo-100 text-indigo-700',
  installation: 'bg-cyan-100 text-cyan-700',
  handover: 'bg-teal-100 text-teal-700',
  closed_won: 'bg-emerald-100 text-emerald-700',
  closed_lost: 'bg-red-100 text-red-700',
}

function formatPrice(price: number | null): string {
  if (!price) return '—'
  return new Intl.NumberFormat('cs-CZ', {
    style: 'currency',
    currency: 'CZK',
    maximumFractionDigits: 0,
  }).format(price)
}

function formatFileSize(bytes: number | null): string {
  if (!bytes) return ''
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / 1024 / 1024).toFixed(2)} MB`
}

export default function QuotesPage() {
  const [quotes, setQuotes] = useState<QuoteRow[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [sendingEmail, setSendingEmail] = useState<string | null>(null)
  const [toast, setToast] = useState<string | null>(null)

  const fetchQuotes = useCallback(async () => {
    setLoading(true)
    const supabase = createClient()

    // Fetch active deals (exclude archived/closed)
    const { data: deals } = await supabase
      .from('deals')
      .select(`
        id, deal_number, title, stage, final_price_czk, total_value_czk, created_at,
        clients:client_id (id, company_name),
        prospects:prospect_id (id, company_name)
      `)
      .not('stage', 'in', '("closed_won","closed_lost")')
      .order('created_at', { ascending: false })

    if (!deals) {
      setQuotes([])
      setLoading(false)
      return
    }

    // Fetch documents of category 'proposal'
    const { data: docs } = await supabase
      .from('crm_documents')
      .select('id, title, file_path, file_name, file_size, created_at')
      .eq('category', 'proposal')
      .eq('is_active', true)

    // Match documents to deals by title containing deal_number or deal id
    const rows: QuoteRow[] = deals.map((deal) => {
      const doc = docs?.find(
        (d) =>
          (deal.deal_number && d.title.includes(deal.deal_number)) ||
          d.title.includes(deal.id) ||
          d.file_name.includes(deal.id)
      ) || null
      return { deal: deal as unknown as QuoteDeal, document: doc || null }
    })

    setQuotes(rows)
    setLoading(false)
  }, [])

  useEffect(() => {
    fetchQuotes()
  }, [fetchQuotes])

  const filteredQuotes = quotes.filter((q) => {
    if (!search) return true
    const s = search.toLowerCase()
    const companyName = q.deal.clients?.[0]?.company_name || q.deal.prospects?.[0]?.company_name || ''
    return (
      companyName.toLowerCase().includes(s) ||
      q.deal.title.toLowerCase().includes(s) ||
      q.deal.deal_number?.toLowerCase().includes(s)
    )
  })

  function getPublicUrl(filePath: string): string {
    const supabase = createClient()
    const { data } = supabase.storage.from('documents').getPublicUrl(filePath)
    return data.publicUrl
  }

  async function handleSendEmail(quote: QuoteRow) {
    const companyName = quote.deal.clients?.[0]?.company_name || quote.deal.prospects?.[0]?.company_name || ''
    const email = prompt(`Zadejte email pro odeslání nabídky ${quote.deal.deal_number || ''}:`)
    if (!email) return

    setSendingEmail(quote.deal.id)
    try {
      const res = await fetch('/api/email/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'quote',
          to_email: email,
          to_name: '',
          company_name: companyName,
          quote_number: quote.deal.deal_number || quote.deal.id,
        }),
      })

      if (res.ok) {
        setToast('Email odeslán!')
      } else {
        const data = await res.json().catch(() => ({}))
        setToast(data.error || 'Chyba při odesílání')
      }
    } catch {
      setToast('Chyba při komunikaci se serverem')
    } finally {
      setSendingEmail(null)
      setTimeout(() => setToast(null), 3000)
    }
  }

  return (
    <div>
      <Topbar
        title="Nabídky"
        breadcrumbs={[{ label: 'CRM' }, { label: 'Nabídky' }]}
      />

      {/* Toast */}
      {toast && (
        <div className="fixed top-4 right-4 z-50 bg-emerald-600 text-white px-5 py-3 rounded-xl shadow-lg text-sm">
          {toast}
        </div>
      )}

      <div className="p-8">
        <div className="flex items-center justify-between mb-6">
          <div className="flex-1 max-w-md">
            <Input
              placeholder="Hledat nabídku..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <Link
            href="/crm/calculator"
            className="ml-4 px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
          >
            <FileText className="w-4 h-4" />
            Nová nabídka
          </Link>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
          <div className="bg-white rounded-xl border border-gray-200 p-4">
            <div className="text-xs text-gray-400 uppercase">Celkem nabídek</div>
            <div className="text-2xl font-light text-gray-900 mt-1">{quotes.length}</div>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-4">
            <div className="text-xs text-gray-400 uppercase">S PDF</div>
            <div className="text-2xl font-light text-blue-600 mt-1">
              {quotes.filter(q => q.document).length}
            </div>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-4">
            <div className="text-xs text-gray-400 uppercase">Vyhráno</div>
            <div className="text-2xl font-light text-emerald-600 mt-1">
              {quotes.filter(q => q.deal.stage === 'closed_won').length}
            </div>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-4">
            <div className="text-xs text-gray-400 uppercase">Celková hodnota</div>
            <div className="text-2xl font-light text-gray-900 mt-1">
              {formatPrice(quotes.reduce((sum, q) => sum + (q.deal.final_price_czk || 0), 0))}
            </div>
          </div>
        </div>

        {loading ? (
          <div className="space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="bg-white rounded-xl border border-gray-200 p-5 animate-pulse">
                <div className="h-5 bg-gray-200 rounded w-48 mb-2" />
                <div className="h-4 bg-gray-200 rounded w-96" />
              </div>
            ))}
          </div>
        ) : filteredQuotes.length === 0 ? (
          <div className="text-center py-16 text-gray-500">
            <FileText className="w-12 h-12 mx-auto mb-3 text-gray-300" />
            <p className="font-medium">
              {search ? 'Žádné nabídky odpovídající hledání' : 'Zatím žádné nabídky'}
            </p>
            <p className="text-sm mt-1">
              {!search && (
                <Link href="/crm/calculator" className="text-blue-600 hover:underline">
                  Vytvořit první nabídku
                </Link>
              )}
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredQuotes.map(({ deal, document }) => {
              const companyName =
                deal.clients?.[0]?.company_name || deal.prospects?.[0]?.company_name || '—'

              return (
                <div
                  key={deal.id}
                  className="bg-white rounded-xl border border-gray-200 p-5 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start gap-4">
                    <div className={`p-2.5 rounded-lg ${document ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-400'}`}>
                      <FileText className="w-5 h-5" />
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <h3 className="font-semibold text-gray-900 truncate">
                              {deal.deal_number || deal.title}
                            </h3>
                            <span className={`px-2 py-0.5 text-xs rounded-full font-medium ${stageColors[deal.stage] || 'bg-gray-100 text-gray-600'}`}>
                              {stageLabels[deal.stage] || deal.stage}
                            </span>
                          </div>
                          <div className="flex items-center gap-3 mt-1 text-sm text-gray-500">
                            <span className="flex items-center gap-1">
                              <Building2 className="w-3.5 h-3.5" />
                              {companyName}
                            </span>
                            <span className="flex items-center gap-1">
                              <Calendar className="w-3.5 h-3.5" />
                              {new Date(deal.created_at).toLocaleDateString('cs-CZ')}
                            </span>
                            <span className="font-medium text-gray-900">
                              {formatPrice(deal.final_price_czk)}
                            </span>
                          </div>
                        </div>

                        <div className="flex gap-1 flex-shrink-0">
                          {document && (
                            <>
                              <a
                                href={getPublicUrl(document.file_path)}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="p-1.5 text-gray-400 hover:text-blue-600 rounded-lg hover:bg-gray-100"
                                title="Otevřít PDF"
                              >
                                <ExternalLink className="w-4 h-4" />
                              </a>
                              <a
                                href={getPublicUrl(document.file_path)}
                                download={document.file_name}
                                className="p-1.5 text-gray-400 hover:text-green-600 rounded-lg hover:bg-gray-100"
                                title="Stáhnout"
                              >
                                <Download className="w-4 h-4" />
                              </a>
                            </>
                          )}
                          <button
                            onClick={() => handleSendEmail({ deal, document })}
                            disabled={sendingEmail === deal.id}
                            className="p-1.5 text-gray-400 hover:text-emerald-600 rounded-lg hover:bg-gray-100 disabled:opacity-50"
                            title="Odeslat emailem"
                          >
                            <Send className="w-4 h-4" />
                          </button>
                        </div>
                      </div>

                      {document && (
                        <div className="mt-2 text-xs text-gray-400">
                          PDF: {document.file_name} {formatFileSize(document.file_size)}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}

        <div className="mt-4 text-sm text-gray-500">
          Celkem {filteredQuotes.length} nabídek
        </div>
      </div>
    </div>
  )
}
