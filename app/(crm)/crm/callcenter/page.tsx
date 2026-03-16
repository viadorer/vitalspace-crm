'use client'

import { Topbar } from '@/components/crm/Topbar'
import { useCurrentUser } from '@/lib/hooks/useCurrentUser'
import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Phone, PhoneOff, Clock, CheckCircle, Pause, Play, Users, TrendingUp } from 'lucide-react'

interface ProspectRow {
  id: string
  company_name: string
  city: string
  region: string
  status: string
  priority: number
  callcenter_status: string | null
  callcenter_total_calls: number
  callcenter_last_called_at: string | null
  callcenter_next_contact_at: string | null
}

interface Stats {
  queued: number
  in_progress: number
  completed: number
  paused: number
}

export default function CallcenterPage() {
  const { loading, isSuperAdmin } = useCurrentUser()
  const [prospects, setProspects] = useState<ProspectRow[]>([])
  const [unassigned, setUnassigned] = useState<ProspectRow[]>([])
  const [stats, setStats] = useState<Stats>({ queued: 0, in_progress: 0, completed: 0, paused: 0 })
  const [loadingData, setLoadingData] = useState(true)
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  const [tab, setTab] = useState<'queue' | 'unassigned'>('queue')
  const [assigning, setAssigning] = useState(false)

  const fetchData = useCallback(async () => {
    const supabase = createClient()

    // Prospects v callcentru
    const { data: ccProspects } = await supabase
      .from('prospects')
      .select('id, company_name, city, region, status, priority, callcenter_status, callcenter_total_calls, callcenter_last_called_at, callcenter_next_contact_at')
      .not('callcenter_status', 'is', null)
      .order('priority', { ascending: false })
      .limit(100)

    if (ccProspects) {
      setProspects(ccProspects)
      const s: Stats = { queued: 0, in_progress: 0, completed: 0, paused: 0 }
      ccProspects.forEach(p => {
        if (p.callcenter_status && p.callcenter_status in s) {
          s[p.callcenter_status as keyof Stats]++
        }
      })
      setStats(s)
    }

    // Nezařazení prospekty (k volání)
    const { data: unassignedData } = await supabase
      .from('prospects')
      .select('id, company_name, city, region, status, priority, callcenter_status, callcenter_total_calls, callcenter_last_called_at, callcenter_next_contact_at')
      .is('callcenter_status', null)
      .in('status', ['not_contacted', 'contacted'])
      .order('priority', { ascending: false })
      .limit(100)

    if (unassignedData) setUnassigned(unassignedData)
    setLoadingData(false)
  }, [])

  useEffect(() => {
    if (!loading && isSuperAdmin()) fetchData()
  }, [loading, isSuperAdmin, fetchData])

  async function handleAssign() {
    if (selectedIds.size === 0) return
    setAssigning(true)

    const supabase = createClient()
    const { error } = await supabase
      .from('prospects')
      .update({
        callcenter_status: 'queued',
        callcenter_assigned_at: new Date().toISOString(),
      })
      .in('id', Array.from(selectedIds))

    if (!error) {
      setSelectedIds(new Set())
      fetchData()
    }
    setAssigning(false)
  }

  async function handleStatusChange(id: string, newStatus: string) {
    const supabase = createClient()
    await supabase
      .from('prospects')
      .update({ callcenter_status: newStatus })
      .eq('id', id)
    fetchData()
  }

  function toggleSelect(id: string) {
    setSelectedIds(prev => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  function toggleSelectAll(items: ProspectRow[]) {
    if (selectedIds.size === items.length) {
      setSelectedIds(new Set())
    } else {
      setSelectedIds(new Set(items.map(p => p.id)))
    }
  }

  if (loading) {
    return (
      <div>
        <Topbar title="Callcentrum" />
        <div className="p-8 text-center text-gray-500">Načítání...</div>
      </div>
    )
  }

  if (!isSuperAdmin()) {
    return (
      <div>
        <Topbar title="Callcentrum" />
        <div className="p-8 text-center">
          <div className="text-red-600 font-medium">Přístup odepřen</div>
          <p className="text-gray-500 mt-2">Tato stránka je dostupná pouze pro Super Admina.</p>
        </div>
      </div>
    )
  }

  const priorityColor = (p: number) => {
    if (p >= 4) return 'text-red-600 bg-red-50'
    if (p >= 3) return 'text-amber-600 bg-amber-50'
    return 'text-gray-600 bg-gray-50'
  }

  const statusIcon = (s: string | null) => {
    switch (s) {
      case 'queued': return <Clock className="w-4 h-4 text-blue-500" />
      case 'in_progress': return <Phone className="w-4 h-4 text-amber-500" />
      case 'completed': return <CheckCircle className="w-4 h-4 text-green-500" />
      case 'paused': return <Pause className="w-4 h-4 text-gray-400" />
      default: return null
    }
  }

  const statusLabel = (s: string | null) => {
    switch (s) {
      case 'queued': return 'Ve frontě'
      case 'in_progress': return 'Probíhá'
      case 'completed': return 'Dokončeno'
      case 'paused': return 'Pozastaveno'
      default: return 'Nezařazeno'
    }
  }

  return (
    <div>
      <Topbar
        title="Callcentrum"
        breadcrumbs={[{ label: 'CRM' }, { label: 'Callcentrum' }]}
      />
      <div className="p-8">
        {/* Stats */}
        <div className="grid grid-cols-4 gap-4 mb-6">
          <div className="bg-white border border-gray-200 rounded-lg p-4">
            <div className="flex items-center gap-2 text-blue-600 mb-1">
              <Clock className="w-5 h-5" />
              <span className="text-sm font-medium">Ve frontě</span>
            </div>
            <div className="text-2xl font-bold text-gray-900">{stats.queued}</div>
          </div>
          <div className="bg-white border border-gray-200 rounded-lg p-4">
            <div className="flex items-center gap-2 text-amber-600 mb-1">
              <Phone className="w-5 h-5" />
              <span className="text-sm font-medium">Probíhá</span>
            </div>
            <div className="text-2xl font-bold text-gray-900">{stats.in_progress}</div>
          </div>
          <div className="bg-white border border-gray-200 rounded-lg p-4">
            <div className="flex items-center gap-2 text-green-600 mb-1">
              <CheckCircle className="w-5 h-5" />
              <span className="text-sm font-medium">Dokončeno</span>
            </div>
            <div className="text-2xl font-bold text-gray-900">{stats.completed}</div>
          </div>
          <div className="bg-white border border-gray-200 rounded-lg p-4">
            <div className="flex items-center gap-2 text-gray-500 mb-1">
              <Users className="w-5 h-5" />
              <span className="text-sm font-medium">Nezařazeno</span>
            </div>
            <div className="text-2xl font-bold text-gray-900">{unassigned.length}</div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 mb-4 bg-gray-100 rounded-lg p-1 w-fit">
          <button
            onClick={() => { setTab('queue'); setSelectedIds(new Set()) }}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              tab === 'queue' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Fronta callcentra ({prospects.length})
          </button>
          <button
            onClick={() => { setTab('unassigned'); setSelectedIds(new Set()) }}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              tab === 'unassigned' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Nezařazené prospekty ({unassigned.length})
          </button>
        </div>

        {/* Action bar */}
        {tab === 'unassigned' && selectedIds.size > 0 && (
          <div className="flex items-center gap-3 mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <span className="text-sm text-blue-700">
              Vybráno: <strong>{selectedIds.size}</strong>
            </span>
            <button
              onClick={handleAssign}
              disabled={assigning}
              className="px-3 py-1.5 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center gap-1"
            >
              <Play className="w-3.5 h-3.5" />
              {assigning ? 'Zařazuji...' : 'Zařadit do fronty'}
            </button>
          </div>
        )}

        {/* Table */}
        {loadingData ? (
          <div className="text-center text-gray-500 py-12">Načítání...</div>
        ) : (
          <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  {tab === 'unassigned' && (
                    <th className="px-4 py-3 w-10">
                      <input
                        type="checkbox"
                        checked={selectedIds.size === unassigned.length && unassigned.length > 0}
                        onChange={() => toggleSelectAll(unassigned)}
                        className="w-4 h-4 rounded border-gray-300 text-blue-600"
                      />
                    </th>
                  )}
                  <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">Firma</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">Město</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">Priorita</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">Status</th>
                  {tab === 'queue' && (
                    <>
                      <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">Hovory</th>
                      <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">Další kontakt</th>
                      <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">Akce</th>
                    </>
                  )}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {(tab === 'queue' ? prospects : unassigned).map(p => (
                  <tr key={p.id} className="hover:bg-gray-50">
                    {tab === 'unassigned' && (
                      <td className="px-4 py-3">
                        <input
                          type="checkbox"
                          checked={selectedIds.has(p.id)}
                          onChange={() => toggleSelect(p.id)}
                          className="w-4 h-4 rounded border-gray-300 text-blue-600"
                        />
                      </td>
                    )}
                    <td className="px-4 py-3 text-sm font-medium text-gray-900">{p.company_name}</td>
                    <td className="px-4 py-3 text-sm text-gray-500">{p.city || p.region}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${priorityColor(p.priority)}`}>
                        {p.priority}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="flex items-center gap-1.5 text-sm">
                        {statusIcon(p.callcenter_status)}
                        {statusLabel(p.callcenter_status)}
                      </span>
                    </td>
                    {tab === 'queue' && (
                      <>
                        <td className="px-4 py-3 text-sm text-gray-500">
                          {p.callcenter_total_calls || 0}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-500">
                          {p.callcenter_next_contact_at
                            ? new Date(p.callcenter_next_contact_at).toLocaleDateString('cs-CZ', {
                                day: 'numeric', month: 'numeric', hour: '2-digit', minute: '2-digit'
                              })
                            : '-'}
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex gap-1">
                            {p.callcenter_status === 'paused' ? (
                              <button
                                onClick={() => handleStatusChange(p.id, 'queued')}
                                className="p-1 text-blue-600 hover:bg-blue-50 rounded"
                                title="Obnovit"
                              >
                                <Play className="w-4 h-4" />
                              </button>
                            ) : p.callcenter_status !== 'completed' ? (
                              <button
                                onClick={() => handleStatusChange(p.id, 'paused')}
                                className="p-1 text-gray-400 hover:bg-gray-100 rounded"
                                title="Pozastavit"
                              >
                                <Pause className="w-4 h-4" />
                              </button>
                            ) : null}
                            {p.callcenter_status !== 'completed' && (
                              <button
                                onClick={() => handleStatusChange(p.id, 'completed')}
                                className="p-1 text-green-600 hover:bg-green-50 rounded"
                                title="Dokončit"
                              >
                                <CheckCircle className="w-4 h-4" />
                              </button>
                            )}
                          </div>
                        </td>
                      </>
                    )}
                  </tr>
                ))}
                {(tab === 'queue' ? prospects : unassigned).length === 0 && (
                  <tr>
                    <td colSpan={8} className="px-4 py-8 text-center text-gray-500">
                      {tab === 'queue'
                        ? 'Žádné prospekty ve frontě. Zařaďte je z tabu "Nezařazené prospekty".'
                        : 'Žádné nezařazené prospekty.'}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
