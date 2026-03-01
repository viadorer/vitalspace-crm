'use client'

import { useState, useEffect, useRef, FormEvent } from 'react'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { Button } from '@/components/ui/Button'
import { Modal } from '@/components/ui/Modal'
import { Upload, X, Plus } from 'lucide-react'
import type { CrmDocument, DocumentCategory } from '@/lib/supabase/types'

const CATEGORY_OPTIONS: { value: DocumentCategory; label: string }[] = [
  { value: 'document', label: 'Dokument' },
  { value: 'presentation', label: 'Prezentace' },
  { value: 'callscript', label: 'Call script' },
  { value: 'offer_template', label: 'Šablona nabídky' },
  { value: 'contract', label: 'Smlouva' },
]

interface DocumentModalProps {
  isOpen: boolean
  onClose: () => void
  onUpload: (
    file: File,
    meta: {
      title: string
      description?: string
      category: DocumentCategory
      tags?: string[]
      page_count?: number
    }
  ) => Promise<{ data: CrmDocument | null; error: string | null }>
  onUpdate?: (
    id: string,
    updates: Partial<Pick<CrmDocument, 'title' | 'description' | 'category' | 'tags' | 'page_count'>>
  ) => Promise<{ data: CrmDocument | null; error: string | null }>
  document?: CrmDocument | null
}

export function DocumentModal({ isOpen, onClose, onUpload, onUpdate, document }: DocumentModalProps) {
  const [saving, setSaving] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)
  const [file, setFile] = useState<File | null>(null)
  const [dragOver, setDragOver] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [category, setCategory] = useState<DocumentCategory>('document')
  const [pageCount, setPageCount] = useState<number | null>(null)
  const [tags, setTags] = useState<string[]>([])
  const [newTag, setNewTag] = useState('')

  const isEditing = Boolean(document)

  useEffect(() => {
    if (document) {
      setTitle(document.title)
      setDescription(document.description || '')
      setCategory(document.category)
      setPageCount(document.page_count)
      setTags(document.tags || [])
      setFile(null)
    } else {
      setTitle('')
      setDescription('')
      setCategory('document')
      setPageCount(null)
      setTags([])
      setFile(null)
    }
    setFormError(null)
    setNewTag('')
  }, [document, isOpen])

  function handleFileSelect(selectedFile: File) {
    if (selectedFile.type !== 'application/pdf') {
      setFormError('Povoleny jsou pouze PDF soubory')
      return
    }
    setFile(selectedFile)
    setFormError(null)
    if (!title) {
      setTitle(selectedFile.name.replace(/\.pdf$/i, ''))
    }
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault()
    setDragOver(false)
    const droppedFile = e.dataTransfer.files[0]
    if (droppedFile) handleFileSelect(droppedFile)
  }

  function addTag() {
    if (!newTag.trim()) return
    if (!tags.includes(newTag.trim())) {
      setTags(prev => [...prev, newTag.trim()])
    }
    setNewTag('')
  }

  function removeTag(index: number) {
    setTags(prev => prev.filter((_, i) => i !== index))
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    if (!title.trim()) {
      setFormError('Název dokumentu je povinný')
      return
    }
    if (!isEditing && !file) {
      setFormError('Vyberte soubor k nahrání')
      return
    }

    setSaving(true)
    setFormError(null)

    try {
      if (isEditing && document && onUpdate) {
        const result = await onUpdate(document.id, {
          title: title.trim(),
          description: description || undefined,
          category,
          tags,
          page_count: pageCount,
        })
        if (result.error) {
          setFormError(result.error)
        } else {
          onClose()
        }
      } else if (file) {
        const result = await onUpload(file, {
          title: title.trim(),
          description: description || undefined,
          category,
          tags,
          page_count: pageCount || undefined,
        })
        if (result.error) {
          setFormError(result.error)
        } else {
          onClose()
        }
      }
    } catch {
      setFormError('Neočekávaná chyba při ukládání')
    } finally {
      setSaving(false)
    }
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={isEditing ? 'Upravit dokument' : 'Nahrát dokument'}>
      <form onSubmit={handleSubmit} className="space-y-4">
        {formError && (
          <div className="bg-red-50 text-red-700 px-4 py-2 rounded-lg text-sm">{formError}</div>
        )}

        {!isEditing && (
          <div
            className={`border-2 border-dashed rounded-xl p-6 text-center transition-colors cursor-pointer ${
              dragOver ? 'border-blue-500 bg-blue-50' : file ? 'border-green-300 bg-green-50' : 'border-gray-300 hover:border-gray-400'
            }`}
            onDragOver={(e) => { e.preventDefault(); setDragOver(true) }}
            onDragLeave={() => setDragOver(false)}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf"
              className="hidden"
              onChange={(e) => {
                const f = e.target.files?.[0]
                if (f) handleFileSelect(f)
              }}
            />
            {file ? (
              <div className="flex items-center justify-center gap-3">
                <Upload className="w-5 h-5 text-green-600" />
                <div>
                  <p className="font-medium text-green-800">{file.name}</p>
                  <p className="text-xs text-green-600">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                </div>
                <button
                  type="button"
                  onClick={(e) => { e.stopPropagation(); setFile(null) }}
                  className="ml-2 p-1 text-gray-400 hover:text-red-500"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div>
                <Upload className="w-8 h-8 mx-auto mb-2 text-gray-400" />
                <p className="text-sm text-gray-600">Přetáhněte PDF sem nebo klikněte pro výběr</p>
                <p className="text-xs text-gray-400 mt-1">Pouze PDF soubory</p>
              </div>
            )}
          </div>
        )}

        <Input
          label="Název"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
        />

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Popis</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            rows={2}
            placeholder="Volitelný popis dokumentu..."
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <Select
            label="Kategorie"
            value={category}
            onChange={(e) => setCategory(e.target.value as DocumentCategory)}
            options={CATEGORY_OPTIONS}
          />
          <Input
            type="number"
            label="Počet stran"
            value={pageCount ?? ''}
            onChange={(e) => setPageCount(e.target.value ? Number(e.target.value) : null)}
            min="1"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Tagy</label>
          {tags.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mb-2">
              {tags.map((tag, i) => (
                <span
                  key={i}
                  className="inline-flex items-center gap-1 bg-blue-50 text-blue-700 text-xs font-medium px-2 py-1 rounded"
                >
                  {tag}
                  <button type="button" onClick={() => removeTag(i)} className="text-blue-400 hover:text-blue-600">
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}
            </div>
          )}
          <div className="flex gap-2">
            <input
              type="text"
              value={newTag}
              onChange={(e) => setNewTag(e.target.value)}
              placeholder="Přidat tag..."
              className="flex-1 px-3 py-1.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addTag() } }}
            />
            <button
              type="button"
              onClick={addTag}
              className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="flex gap-3 pt-3 border-t border-gray-100">
          <Button type="submit" disabled={saving}>
            {saving ? 'Ukládání...' : isEditing ? 'Uložit změny' : 'Nahrát dokument'}
          </Button>
          <Button type="button" variant="secondary" onClick={onClose}>
            Zrušit
          </Button>
        </div>
      </form>
    </Modal>
  )
}
