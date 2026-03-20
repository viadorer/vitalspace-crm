'use client'

import { useState, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/Button'
import { formatDate } from '@/lib/utils/format'
import { logAuditEvent } from '@/lib/hooks/useAuditLog'
import { Download, FileText, Plus, Trash2, Upload, X } from 'lucide-react'
import { Section, DOC_TYPE_LABELS, type DealSectionProps } from './shared'

const BUCKET_NAME = 'documents'

const DOC_TYPE_OPTIONS = [
  { value: 'proposal', label: 'Nabídka' },
  { value: 'contract', label: 'Smlouva' },
  { value: 'technical_report', label: 'Technický report' },
  { value: 'certificate', label: 'Certifikát' },
  { value: 'invoice', label: 'Faktura' },
  { value: 'photo', label: 'Foto' },
  { value: 'other', label: 'Ostatní' },
]

export function DealDocumentsSection({ dealId, data, onRefresh, expanded, onToggle }: DealSectionProps & { expanded: boolean; onToggle: () => void }) {
  const { documents } = data
  const [showUpload, setShowUpload] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [file, setFile] = useState<File | null>(null)
  const [docTitle, setDocTitle] = useState('')
  const [docType, setDocType] = useState('other')
  const [dragOver, setDragOver] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  function handleFileSelect(selectedFile: File) {
    setFile(selectedFile)
    if (!docTitle) {
      setDocTitle(selectedFile.name.replace(/\.[^.]+$/, ''))
    }
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault()
    setDragOver(false)
    const droppedFile = e.dataTransfer.files[0]
    if (droppedFile) handleFileSelect(droppedFile)
  }

  async function handleUpload() {
    if (!file || !docTitle.trim()) return
    setUploading(true)
    const supabase = createClient()

    const timestamp = Date.now()
    const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_')
    const storagePath = `deals/${dealId}/${timestamp}_${safeName}`

    const { error: uploadError } = await supabase.storage
      .from(BUCKET_NAME)
      .upload(storagePath, file, { cacheControl: '3600', upsert: false })

    if (uploadError) {
      console.error('Upload error:', uploadError)
      setUploading(false)
      return
    }

    const { data: created } = await supabase.from('deal_documents').insert({
      deal_id: dealId,
      doc_type: docType,
      title: docTitle.trim(),
      file_path: storagePath,
      file_size_bytes: file.size,
      mime_type: file.type || 'application/octet-stream',
    }).select().single()

    if (created) {
      await logAuditEvent({ action: 'create', entityType: 'document', entityId: created.id, metadata: { deal_id: dealId, title: docTitle } })
    }

    setFile(null)
    setDocTitle('')
    setDocType('other')
    setShowUpload(false)
    setUploading(false)
    await onRefresh()
  }

  function handleDownload(filePath: string | null, title: string) {
    if (!filePath) return
    const supabase = createClient()
    const { data } = supabase.storage.from(BUCKET_NAME).getPublicUrl(filePath)
    window.open(data.publicUrl, '_blank')
  }

  async function handleDelete(docId: string, filePath: string | null, title: string) {
    if (!confirm(`Smazat dokument "${title}"?`)) return
    const supabase = createClient()

    if (filePath) {
      await supabase.storage.from(BUCKET_NAME).remove([filePath])
    }

    await supabase.from('deal_documents').delete().eq('id', docId)
    await logAuditEvent({ action: 'delete', entityType: 'document', entityId: docId, metadata: { deal_id: dealId, title } })
    await onRefresh()
  }

  return (
    <Section
      title={`Dokumenty (${documents.length})`}
      icon={<FileText className="w-4 h-4" />}
      expanded={expanded}
      onToggle={onToggle}
      actions={
        <button onClick={() => setShowUpload(true)} className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium text-blue-600 hover:bg-blue-50 rounded">
          <Plus className="w-3.5 h-3.5" /> Nahrát
        </button>
      }
    >
      {showUpload && (
        <div className="bg-blue-50 rounded-lg p-3 mb-3 space-y-2">
          <div
            className={`border-2 border-dashed rounded-lg p-4 text-center transition-colors cursor-pointer ${
              dragOver ? 'border-blue-500 bg-blue-100' : file ? 'border-green-300 bg-green-50' : 'border-gray-300 hover:border-gray-400'
            }`}
            onDragOver={(e) => { e.preventDefault(); setDragOver(true) }}
            onDragLeave={() => setDragOver(false)}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
          >
            <input
              ref={fileInputRef}
              type="file"
              className="hidden"
              onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFileSelect(f) }}
            />
            {file ? (
              <div className="flex items-center justify-center gap-2">
                <Upload className="w-4 h-4 text-green-600" />
                <span className="text-sm font-medium text-green-800">{file.name}</span>
                <span className="text-xs text-green-600">({(file.size / 1024 / 1024).toFixed(2)} MB)</span>
                <button type="button" onClick={(e) => { e.stopPropagation(); setFile(null) }} className="p-0.5 text-gray-400 hover:text-red-500">
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              <div>
                <Upload className="w-6 h-6 mx-auto mb-1 text-gray-400" />
                <p className="text-xs text-gray-600">Přetáhněte soubor nebo klikněte</p>
              </div>
            )}
          </div>
          <div className="flex gap-2">
            <input
              type="text"
              value={docTitle}
              onChange={(e) => setDocTitle(e.target.value)}
              placeholder="Název dokumentu"
              className="flex-1 px-2 py-1.5 border border-gray-200 rounded text-sm"
            />
            <select
              value={docType}
              onChange={(e) => setDocType(e.target.value)}
              className="px-2 py-1.5 border border-gray-200 rounded text-sm"
            >
              {DOC_TYPE_OPTIONS.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
            </select>
          </div>
          <div className="flex gap-2">
            <Button onClick={handleUpload} disabled={uploading || !file || !docTitle.trim()}>
              {uploading ? 'Nahrávám...' : 'Nahrát'}
            </Button>
            <Button variant="secondary" onClick={() => { setShowUpload(false); setFile(null); setDocTitle(''); }}>Zrušit</Button>
          </div>
        </div>
      )}

      {documents.length === 0 && !showUpload ? (
        <p className="text-sm text-gray-500">Žádné dokumenty</p>
      ) : (
        <div className="space-y-2">
          {documents.map((doc) => (
            <div key={doc.id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 group">
              <FileText className="w-4 h-4 text-gray-400 flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">{doc.title}</p>
                <div className="flex items-center gap-2 text-xs text-gray-500">
                  <span>{DOC_TYPE_LABELS[doc.doc_type] || doc.doc_type}</span>
                  <span>·</span>
                  <span>{formatDate(doc.created_at)}</span>
                  {doc.file_size_bytes && (
                    <>
                      <span>·</span>
                      <span>{(doc.file_size_bytes / 1024 / 1024).toFixed(1)} MB</span>
                    </>
                  )}
                </div>
              </div>
              <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                {doc.file_path && (
                  <button onClick={() => handleDownload(doc.file_path, doc.title)} className="p-1 text-gray-400 hover:text-blue-600 rounded">
                    <Download className="w-3.5 h-3.5" />
                  </button>
                )}
                <button onClick={() => handleDelete(doc.id, doc.file_path, doc.title)} className="p-1 text-gray-400 hover:text-red-500 rounded">
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </Section>
  )
}
