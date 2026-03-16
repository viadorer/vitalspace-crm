'use client'

import { useState } from 'react'
import { Topbar } from '@/components/crm/Topbar'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { DocumentModal } from '@/components/crm/DocumentModal'
import { useDocuments } from '@/lib/hooks/useDocuments'
import {
  Plus,
  FileText,
  Presentation,
  Phone,
  FileSignature,
  ScrollText,
  Pencil,
  Trash2,
  Download,
  ExternalLink,
  Search,
} from 'lucide-react'
import type { CrmDocument, DocumentCategory } from '@/lib/supabase/types'

const CATEGORY_CONFIG: Record<DocumentCategory, { label: string; icon: typeof FileText; color: string }> = {
  document: { label: 'Dokument', icon: FileText, color: 'bg-blue-100 text-blue-700' },
  presentation: { label: 'Prezentace', icon: Presentation, color: 'bg-purple-100 text-purple-700' },
  callscript: { label: 'Call script', icon: Phone, color: 'bg-green-100 text-green-700' },
  offer_template: { label: 'Šablona nabídky', icon: ScrollText, color: 'bg-amber-100 text-amber-700' },
  contract: { label: 'Smlouva', icon: FileSignature, color: 'bg-red-100 text-red-700' },
}

const CATEGORY_TABS: { value: DocumentCategory | 'all'; label: string }[] = [
  { value: 'all', label: 'Vše' },
  { value: 'document', label: 'Dokumenty' },
  { value: 'presentation', label: 'Prezentace' },
  { value: 'callscript', label: 'Call scripty' },
  { value: 'offer_template', label: 'Šablony nabídek' },
  { value: 'contract', label: 'Smlouvy' },
]

function formatFileSize(bytes: number | null): string {
  if (!bytes) return '—'
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / 1024 / 1024).toFixed(2)} MB`
}

export default function DocumentsPage() {
  const { documents, loading, uploadDocument, updateDocument, deleteDocument, getPublicUrl } = useDocuments()
  const [search, setSearch] = useState('')
  const [activeTab, setActiveTab] = useState<DocumentCategory | 'all'>('all')
  const [showModal, setShowModal] = useState(false)
  const [editingDocument, setEditingDocument] = useState<CrmDocument | null>(null)

  const filteredDocuments = documents.filter(doc => {
    const matchesSearch =
      doc.title.toLowerCase().includes(search.toLowerCase()) ||
      doc.description?.toLowerCase().includes(search.toLowerCase()) ||
      doc.tags?.some(t => t.toLowerCase().includes(search.toLowerCase()))
    const matchesCategory = activeTab === 'all' || doc.category === activeTab
    return matchesSearch && matchesCategory
  })

  function handleCreate() {
    setEditingDocument(null)
    setShowModal(true)
  }

  function handleEdit(doc: CrmDocument) {
    setEditingDocument(doc)
    setShowModal(true)
  }

  async function handleDelete(doc: CrmDocument) {
    if (!confirm(`Opravdu smazat "${doc.title}"?`)) return
    await deleteDocument(doc.id)
  }

  if (loading) {
    return (
      <div>
        <Topbar title="Dokumenty a prezentace" />
        <div className="p-8">
          <div className="space-y-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="bg-white rounded-xl border border-gray-200 p-5 animate-pulse">
                <div className="h-5 bg-gray-200 rounded w-48 mb-2" />
                <div className="h-4 bg-gray-200 rounded w-96" />
              </div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div>
      <Topbar
        title="Dokumenty a prezentace"
        breadcrumbs={[{ label: 'CRM' }, { label: 'Dokumenty' }]}
      />

      <div className="p-8">
        <div className="flex items-center justify-between mb-6">
          <div className="flex-1 max-w-md">
            <Input
              placeholder="Hledat dokument..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <Button onClick={handleCreate}>
            <Plus className="w-4 h-4 mr-1" />
            Nahrát dokument
          </Button>
        </div>

        <div className="flex gap-1 mb-6 bg-gray-100 rounded-lg p-1 overflow-x-auto">
          {CATEGORY_TABS.map((tab) => (
            <button
              key={tab.value}
              onClick={() => setActiveTab(tab.value)}
              className={`px-3 py-1.5 text-sm font-medium rounded-md whitespace-nowrap transition-colors ${
                activeTab === tab.value
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {filteredDocuments.length === 0 ? (
          <div className="text-center py-16 text-gray-500">
            <FileText className="w-12 h-12 mx-auto mb-3 text-gray-300" />
            <p className="font-medium">
              {search ? 'Žádné dokumenty odpovídající hledání' : 'Zatím žádné dokumenty'}
            </p>
            <p className="text-sm mt-1">
              {!search && 'Klikněte na "Nahrát dokument" pro přidání PDF'}
            </p>
          </div>
        ) : (
          <div className="grid gap-3">
            {filteredDocuments.map((doc) => {
              const catConfig = CATEGORY_CONFIG[doc.category] || { label: doc.category, icon: FileText, color: 'bg-gray-100 text-gray-600' }
              const CatIcon = catConfig.icon
              const publicUrl = getPublicUrl(doc.file_path)

              return (
                <div
                  key={doc.id}
                  className="bg-white rounded-xl border border-gray-200 p-5 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start gap-4">
                    <div className={`p-2.5 rounded-lg ${catConfig.color}`}>
                      <CatIcon className="w-5 h-5" />
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-gray-900 truncate">{doc.title}</h3>
                          {doc.description && (
                            <p className="text-sm text-gray-500 mt-0.5 line-clamp-2">{doc.description}</p>
                          )}
                        </div>

                        <div className="flex gap-1 flex-shrink-0">
                          <a
                            href={publicUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-1.5 text-gray-400 hover:text-blue-600 rounded-lg hover:bg-gray-100"
                            title="Otevřít"
                          >
                            <ExternalLink className="w-4 h-4" />
                          </a>
                          <a
                            href={publicUrl}
                            download={doc.file_name}
                            className="p-1.5 text-gray-400 hover:text-green-600 rounded-lg hover:bg-gray-100"
                            title="Stáhnout"
                          >
                            <Download className="w-4 h-4" />
                          </a>
                          <button
                            onClick={() => handleEdit(doc)}
                            className="p-1.5 text-gray-400 hover:text-blue-600 rounded-lg hover:bg-gray-100"
                            title="Upravit"
                          >
                            <Pencil className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(doc)}
                            className="p-1.5 text-gray-400 hover:text-red-600 rounded-lg hover:bg-gray-100"
                            title="Smazat"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>

                      <div className="flex flex-wrap items-center gap-3 mt-3 text-xs text-gray-500">
                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded font-medium ${catConfig.color}`}>
                          {catConfig.label}
                        </span>
                        <span>{doc.file_name}</span>
                        <span>{formatFileSize(doc.file_size)}</span>
                        {doc.page_count && <span>{doc.page_count} stran</span>}
                        <span>{new Date(doc.created_at).toLocaleDateString('cs-CZ')}</span>
                      </div>

                      {doc.tags && doc.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-2">
                          {doc.tags.map((tag, i) => (
                            <span
                              key={i}
                              className="inline-block bg-gray-100 text-gray-600 text-xs px-2 py-0.5 rounded"
                            >
                              {tag}
                            </span>
                          ))}
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
          Celkem {filteredDocuments.length} dokumentů
        </div>
      </div>

      <DocumentModal
        isOpen={showModal}
        onClose={() => {
          setShowModal(false)
          setEditingDocument(null)
        }}
        onUpload={uploadDocument}
        onUpdate={updateDocument}
        document={editingDocument}
      />
    </div>
  )
}
