'use client'

import { useState } from 'react'
import { Topbar } from '@/components/crm/Topbar'
import { Input } from '@/components/ui/Input'
import { EMAIL_TEMPLATES, type TemplateName } from '@/lib/email/templates'
import { ChevronDown, ChevronRight, Mail, Eye, Copy, Check } from 'lucide-react'

const templateEntries = Object.entries(EMAIL_TEMPLATES) as [TemplateName, typeof EMAIL_TEMPLATES[TemplateName]][]

export default function EmailTemplatesPage() {
  const [search, setSearch] = useState('')
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [copiedId, setCopiedId] = useState<string | null>(null)
  const [previewHtml, setPreviewHtml] = useState<string | null>(null)

  const filtered = templateEntries.filter(([key, tpl]) =>
    tpl.label.toLowerCase().includes(search.toLowerCase()) ||
    tpl.description.toLowerCase().includes(search.toLowerCase()) ||
    key.includes(search.toLowerCase())
  )

  function handlePreview(key: TemplateName) {
    const tpl = EMAIL_TEMPLATES[key]
    const { html } = tpl.build({
      salutation: 'Vážená paní ředitelko / Vážený pane řediteli',
      contact_name: 'Jan Novák',
      company_name: 'Domov pro seniory Praha',
      city: 'Praha',
    })
    setPreviewHtml(html)
  }

  function handleCopyKey(key: string) {
    navigator.clipboard.writeText(key)
    setCopiedId(key)
    setTimeout(() => setCopiedId(null), 2000)
  }

  return (
    <div>
      <Topbar
        title="Email šablony"
        breadcrumbs={[{ label: 'CRM' }, { label: 'Email šablony' }]}
      />

      <div className="p-8">
        <div className="flex items-center justify-between mb-6">
          <div className="flex-1 max-w-md">
            <Input
              placeholder="Hledat šablonu..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div className="text-sm text-gray-500">
            {filtered.length} šablon
          </div>
        </div>

        <div className="space-y-3">
          {filtered.map(([key, tpl]) => {
            const isExpanded = expandedId === key
            return (
              <div
                key={key}
                className="bg-white rounded-xl border border-gray-200 overflow-hidden"
              >
                <div
                  className="flex items-center justify-between p-5 cursor-pointer hover:bg-gray-50 transition-colors"
                  onClick={() => setExpandedId(isExpanded ? null : key)}
                >
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <button className="text-gray-400 flex-shrink-0">
                      {isExpanded ? <ChevronDown className="w-5 h-5" /> : <ChevronRight className="w-5 h-5" />}
                    </button>
                    <Mail className="w-5 h-5 text-blue-500 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-gray-900">{tpl.label}</h3>
                      <p className="text-sm text-gray-500 truncate mt-0.5">{tpl.description}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 ml-4 flex-shrink-0" onClick={(e) => e.stopPropagation()}>
                    <span className="text-xs text-gray-400 font-mono bg-gray-50 px-2 py-1 rounded hidden md:inline">
                      {key}
                    </span>
                    <button
                      onClick={() => handleCopyKey(key)}
                      className="p-1.5 text-gray-400 hover:text-blue-600 rounded-lg hover:bg-gray-100"
                      title="Kopírovat klíč šablony"
                    >
                      {copiedId === key ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
                    </button>
                    <button
                      onClick={() => handlePreview(key)}
                      className="p-1.5 text-gray-400 hover:text-blue-600 rounded-lg hover:bg-gray-100"
                      title="Náhled"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {isExpanded && (
                  <div className="px-5 pb-5 pt-0 border-t border-gray-100">
                    <div className="pt-4 space-y-3">
                      <div>
                        <span className="text-xs font-medium text-gray-500 uppercase">Klíč šablony</span>
                        <p className="text-sm font-mono text-gray-700 mt-1">{key}</p>
                      </div>
                      <div>
                        <span className="text-xs font-medium text-gray-500 uppercase">Popis</span>
                        <p className="text-sm text-gray-700 mt-1">{tpl.description}</p>
                      </div>
                      <div>
                        <span className="text-xs font-medium text-gray-500 uppercase">Proměnné</span>
                        <p className="text-sm text-gray-700 mt-1 font-mono">
                          salutation, contact_name, company_name, city
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )
          })}

          {filtered.length === 0 && (
            <div className="text-center py-12 text-gray-500">
              {search ? 'Žádné šablony odpovídající hledání' : 'Žádné šablony k dispozici.'}
            </div>
          )}
        </div>
      </div>

      {/* Preview modal */}
      {previewHtml && (
        <div
          className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
          onClick={() => setPreviewHtml(null)}
        >
          <div
            className="bg-white rounded-xl max-w-2xl w-full max-h-[85vh] overflow-hidden flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between p-4 border-b border-gray-200">
              <h3 className="font-semibold text-gray-900">Náhled emailu</h3>
              <button
                onClick={() => setPreviewHtml(null)}
                className="text-gray-400 hover:text-gray-600 text-xl leading-none"
              >
                &times;
              </button>
            </div>
            <div className="overflow-y-auto p-6">
              <div dangerouslySetInnerHTML={{ __html: previewHtml }} />
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
