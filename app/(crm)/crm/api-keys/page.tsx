'use client'

import { Topbar } from '@/components/crm/Topbar'
import { useCurrentUser } from '@/lib/hooks/useCurrentUser'
import { useState, useEffect, useCallback } from 'react'
import { Key, Plus, Copy, Check, XCircle, CheckCircle } from 'lucide-react'

interface ApiKeyRecord {
  id: string
  name: string
  permissions: string[]
  is_active: boolean
  created_at: string
  last_used_at: string | null
}

const PERMISSION_LABELS: Record<string, string> = {
  'prospects:read': 'Číst prospekty',
  'prospects:write': 'Upravovat prospekty',
  'callresult:write': 'Zapisovat výsledky hovorů',
}

export default function ApiKeysPage() {
  const { loading, isSuperAdmin } = useCurrentUser()
  const [keys, setKeys] = useState<ApiKeyRecord[]>([])
  const [loadingKeys, setLoadingKeys] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [newKeyName, setNewKeyName] = useState('')
  const [newKeyPerms, setNewKeyPerms] = useState<string[]>(['prospects:read', 'callresult:write'])
  const [generatedKey, setGeneratedKey] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchKeys = useCallback(async () => {
    try {
      const res = await fetch('/api/callcenter/api-keys')
      if (res.ok) {
        setKeys(await res.json())
      }
    } catch {
      // ignore
    } finally {
      setLoadingKeys(false)
    }
  }, [])

  useEffect(() => {
    if (!loading && isSuperAdmin()) {
      fetchKeys()
    }
  }, [loading, isSuperAdmin, fetchKeys])

  async function handleGenerate() {
    if (!newKeyName.trim()) {
      setError('Zadejte název klíče')
      return
    }
    setSubmitting(true)
    setError(null)

    try {
      const res = await fetch('/api/callcenter/api-keys', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newKeyName.trim(),
          permissions: newKeyPerms,
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.error || 'Chyba při generování klíče')
        return
      }

      setGeneratedKey(data.api_key)
      setNewKeyName('')
      fetchKeys()
    } catch {
      setError('Chyba při komunikaci se serverem')
    } finally {
      setSubmitting(false)
    }
  }

  function handleCopy() {
    if (generatedKey) {
      navigator.clipboard.writeText(generatedKey)
      setCopied(true)
      setTimeout(() => setCopied(false), 3000)
    }
  }

  function togglePerm(perm: string) {
    setNewKeyPerms(prev =>
      prev.includes(perm) ? prev.filter(p => p !== perm) : [...prev, perm]
    )
  }

  if (loading) {
    return (
      <div>
        <Topbar title="API klíče" />
        <div className="p-8 text-center text-gray-500">Načítání...</div>
      </div>
    )
  }

  if (!isSuperAdmin()) {
    return (
      <div>
        <Topbar title="API klíče" />
        <div className="p-8 text-center">
          <div className="text-red-600 font-medium">Přístup odepřen</div>
          <p className="text-gray-500 mt-2">Tato stránka je dostupná pouze pro Super Admina.</p>
        </div>
      </div>
    )
  }

  return (
    <div>
      <Topbar
        title="API klíče"
        breadcrumbs={[{ label: 'CRM' }, { label: 'API klíče' }]}
      />
      <div className="p-8 max-w-4xl">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">Callcenter API klíče</h2>
            <p className="text-sm text-gray-500">
              API klíče pro propojení s externím callcentrem (webnabidky.cz)
            </p>
          </div>
          <button
            onClick={() => { setShowForm(true); setGeneratedKey(null); setError(null) }}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus className="w-4 h-4" />
            Nový klíč
          </button>
        </div>

        {/* Generated key alert */}
        {generatedKey && (
          <div className="mb-6 p-4 bg-amber-50 border border-amber-200 rounded-lg">
            <div className="flex items-start gap-3">
              <Key className="w-5 h-5 text-amber-600 mt-0.5 shrink-0" />
              <div className="flex-1">
                <p className="font-medium text-amber-800">Nový API klíč vygenerován</p>
                <p className="text-sm text-amber-700 mt-1">
                  Tento klíč se zobrazí pouze jednou. Zkopírujte si ho a uložte bezpečně.
                </p>
                <div className="mt-3 flex items-center gap-2">
                  <code className="flex-1 px-3 py-2 bg-white border border-amber-300 rounded text-sm font-mono break-all">
                    {generatedKey}
                  </code>
                  <button
                    onClick={handleCopy}
                    className="shrink-0 px-3 py-2 bg-amber-600 text-white rounded hover:bg-amber-700 transition-colors"
                  >
                    {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* New key form */}
        {showForm && !generatedKey && (
          <div className="mb-6 p-4 bg-gray-50 border border-gray-200 rounded-lg">
            <h3 className="font-medium text-gray-900 mb-4">Vygenerovat nový API klíč</h3>

            {error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded text-sm text-red-700">
                {error}
              </div>
            )}

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Název</label>
                <input
                  type="text"
                  value={newKeyName}
                  onChange={(e) => setNewKeyName(e.target.value)}
                  placeholder="např. webnabidky.cz production"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Oprávnění</label>
                <div className="space-y-2">
                  {Object.entries(PERMISSION_LABELS).map(([perm, label]) => (
                    <label key={perm} className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={newKeyPerms.includes(perm)}
                        onChange={() => togglePerm(perm)}
                        className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="text-sm text-gray-700">{label}</span>
                      <code className="text-xs text-gray-400">{perm}</code>
                    </label>
                  ))}
                </div>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={handleGenerate}
                  disabled={submitting}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
                >
                  {submitting ? 'Generuji...' : 'Vygenerovat'}
                </button>
                <button
                  onClick={() => { setShowForm(false); setError(null) }}
                  className="px-4 py-2 text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300 transition-colors"
                >
                  Zrušit
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Keys table */}
        <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">Název</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">Oprávnění</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">Stav</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">Vytvořeno</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">Poslední použití</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {loadingKeys ? (
                <tr>
                  <td colSpan={5} className="px-4 py-8 text-center text-gray-500">Načítání...</td>
                </tr>
              ) : keys.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-4 py-8 text-center text-gray-500">
                    Zatím žádné API klíče. Klikněte na "Nový klíč" pro vytvoření.
                  </td>
                </tr>
              ) : (
                keys.map((key) => (
                  <tr key={key.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <Key className="w-4 h-4 text-gray-400" />
                        <span className="text-sm font-medium text-gray-900">{key.name}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex flex-wrap gap-1">
                        {key.permissions.map((p) => (
                          <span
                            key={p}
                            className="px-2 py-0.5 bg-blue-50 text-blue-700 text-xs rounded-full"
                          >
                            {p}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      {key.is_active ? (
                        <span className="flex items-center gap-1 text-green-600 text-sm">
                          <CheckCircle className="w-4 h-4" /> Aktivní
                        </span>
                      ) : (
                        <span className="flex items-center gap-1 text-red-500 text-sm">
                          <XCircle className="w-4 h-4" /> Neaktivní
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-500">
                      {new Date(key.created_at).toLocaleDateString('cs-CZ')}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-500">
                      {key.last_used_at
                        ? new Date(key.last_used_at).toLocaleDateString('cs-CZ', {
                            hour: '2-digit',
                            minute: '2-digit',
                          })
                        : 'Nikdy'}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
