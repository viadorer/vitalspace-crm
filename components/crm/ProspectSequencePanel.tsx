'use client'

import { useState, useEffect } from 'react'
import useSWR from 'swr'
import { useToast } from '@/components/ui/ToastProvider'
import { Button } from '@/components/ui/Button'
import { Select } from '@/components/ui/Select'
import { formatDateTime } from '@/lib/utils/format'
import {
  Play,
  Pause,
  Square,
  CheckCircle2,
  AlertCircle,
  Clock,
  Flame,
  ThermometerSun,
  Snowflake,
  TrendingUp,
  Eye,
  MousePointer,
  XCircle,
  ListOrdered,
  Plus,
} from 'lucide-react'
import type {
  ProspectSequenceEnrollment,
  LeadScore,
  LeadCategory,
  EnrollmentStatus,
  EmailSequence,
} from '@/lib/supabase/sequence-types'

const fetcher = (url: string) => fetch(url).then(r => {
  if (!r.ok) throw new Error('Fetch failed')
  return r.json()
})

const STATUS_CONFIG: Record<EnrollmentStatus, { label: string; color: string; icon: React.ReactNode }> = {
  active: { label: 'Aktivní', color: 'bg-green-100 text-green-700', icon: <Play className="w-3 h-3" /> },
  paused: { label: 'Pozastaveno', color: 'bg-yellow-100 text-yellow-700', icon: <Pause className="w-3 h-3" /> },
  completed: { label: 'Dokončeno', color: 'bg-blue-100 text-blue-700', icon: <CheckCircle2 className="w-3 h-3" /> },
  stopped: { label: 'Zastaveno', color: 'bg-red-100 text-red-700', icon: <Square className="w-3 h-3" /> },
  error: { label: 'Chyba', color: 'bg-red-100 text-red-700', icon: <AlertCircle className="w-3 h-3" /> },
}

const CATEGORY_CONFIG: Record<LeadCategory, { label: string; color: string; icon: React.ReactNode }> = {
  hot: { label: 'Hot', color: 'text-red-600 bg-red-50 border-red-200', icon: <Flame className="w-4 h-4" /> },
  warm: { label: 'Warm', color: 'text-orange-600 bg-orange-50 border-orange-200', icon: <ThermometerSun className="w-4 h-4" /> },
  cold: { label: 'Cold', color: 'text-blue-600 bg-blue-50 border-blue-200', icon: <Snowflake className="w-4 h-4" /> },
}

interface Props {
  prospectId: string
}

export function ProspectSequencePanel({ prospectId }: Props) {
  const { toast } = useToast()

  // Lead score
  const { data: score } = useSWR<LeadScore>(
    `/api/lead-scores/${prospectId}`,
    fetcher,
    { revalidateOnFocus: false, onError: () => {} }
  )

  // Sequences list (pro dropdown)
  const { data: sequences } = useSWR<EmailSequence[]>(
    '/api/sequences',
    fetcher,
    { revalidateOnFocus: false, onError: () => {} }
  )

  // Enrollmenty tohoto prospekta
  const [enrollments, setEnrollments] = useState<(ProspectSequenceEnrollment & { sequence_name?: string })[]>([])
  const [loaded, setLoaded] = useState(false)
  const [showEnroll, setShowEnroll] = useState(false)
  const [selectedSequenceId, setSelectedSequenceId] = useState('')
  const [enrolling, setEnrolling] = useState(false)

  useEffect(() => {
    async function load() {
      try {
        const seqRes = await fetch('/api/sequences')
        if (!seqRes.ok) { setLoaded(true); return }
        const seqs = await seqRes.json()
        if (!Array.isArray(seqs)) { setLoaded(true); return }

        const allEnrollments: (ProspectSequenceEnrollment & { sequence_name?: string })[] = []
        for (const seq of seqs) {
          const res = await fetch(`/api/sequences/${seq.id}/enrollments`)
          if (!res.ok) continue
          const enrolls = await res.json()
          if (Array.isArray(enrolls)) {
            for (const e of enrolls) {
              if (e.prospect_id === prospectId) {
                allEnrollments.push({ ...e, sequence_name: seq.name })
              }
            }
          }
        }
        setEnrollments(allEnrollments)
      } catch {
        // API ještě nemusí být ready
      }
      setLoaded(true)
    }
    load()
  }, [prospectId])

  async function handleEnroll() {
    if (!selectedSequenceId) return
    setEnrolling(true)
    try {
      const res = await fetch(`/api/sequences/${selectedSequenceId}/enrollments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prospect_ids: [prospectId] }),
      })
      const result = await res.json()
      if (res.ok) {
        toast.success(`Zařazeno do sekvence (${result.enrolled} prospect)`)
        setShowEnroll(false)
        setSelectedSequenceId('')
        // Reload enrollments
        const seqName = sequences?.find(s => s.id === selectedSequenceId)?.name || 'Sekvence'
        setEnrollments(prev => [...prev, {
          id: 'new',
          prospect_id: prospectId,
          sequence_id: selectedSequenceId,
          current_step_order: 1,
          status: 'active',
          next_execution_at: new Date().toISOString(),
          enrolled_at: new Date().toISOString(),
          last_step_executed_at: null,
          stop_reason: null,
          completed_at: null,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          sequence_name: seqName,
        }])
      } else {
        toast.error(result.error || 'Chyba při zařazování')
      }
    } catch {
      toast.error('Chyba při zařazování do sekvence')
    }
    setEnrolling(false)
  }

  if (!loaded) {
    return (
      <div className="mt-4 pt-4 border-t border-gray-200">
        <div className="text-sm text-gray-400 animate-pulse">Načítání orchestrátoru...</div>
      </div>
    )
  }

  const category = score?.category || 'cold'
  const catConfig = CATEGORY_CONFIG[category]
  const activeSequences = sequences?.filter(s => s.is_active) || []
  const enrolledSequenceIds = new Set(enrollments.map(e => e.sequence_id))
  const availableSequences = activeSequences.filter(s => !enrolledSequenceIds.has(s.id))

  return (
    <div className="mt-4 pt-4 border-t border-gray-200 space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <TrendingUp className="w-4 h-4 text-blue-500" />
          <h3 className="text-sm font-semibold text-gray-900">Orchestrátor</h3>
        </div>
        {availableSequences.length > 0 && (
          <button
            onClick={() => setShowEnroll(!showEnroll)}
            className="flex items-center gap-1 text-xs text-blue-600 hover:text-blue-700"
          >
            <Plus className="w-3 h-3" />
            Zařadit do sekvence
          </button>
        )}
      </div>

      {/* Enroll form */}
      {showEnroll && (
        <div className="p-3 bg-blue-50 rounded-lg border border-blue-200 space-y-3">
          <Select
            label="Vyberte sekvenci"
            value={selectedSequenceId}
            onChange={(e) => setSelectedSequenceId(e.target.value)}
            options={[
              { value: '', label: '— Vyberte sekvenci —' },
              ...availableSequences.map(s => ({ value: s.id, label: s.name })),
            ]}
          />
          <div className="flex gap-2">
            <Button onClick={handleEnroll} disabled={enrolling || !selectedSequenceId}>
              {enrolling ? 'Zařazuji...' : 'Zařadit'}
            </Button>
            <Button variant="secondary" onClick={() => setShowEnroll(false)}>Zrušit</Button>
          </div>
        </div>
      )}

      <div className="grid grid-cols-2 gap-3">
        {/* Lead Score */}
        {score && (
          <div className={`p-3 rounded-lg border ${catConfig.color}`}>
            <div className="flex items-center gap-2">
              {catConfig.icon}
              <span className="text-lg font-bold">{score.total_score}</span>
              <span className="text-xs font-medium uppercase">{catConfig.label}</span>
            </div>
            <div className="mt-2 grid grid-cols-3 gap-1 text-xs text-gray-500">
              <span>Segment: {score.segment_potential_score}</span>
              <span>Priorita: {score.priority_score}</span>
              <span>Kontakty: {score.contact_completeness_score}</span>
              <span>Engage: {score.engagement_score}</span>
              <span>Fresh: {score.recency_score}</span>
              <span>Call: {score.callcenter_score}</span>
            </div>
          </div>
        )}

        {/* Sekvence */}
        <div className="space-y-2">
          {enrollments.length === 0 ? (
            <div className="p-3 rounded-lg bg-gray-50 border border-gray-200 text-sm text-gray-500 flex items-center gap-2">
              <ListOrdered className="w-4 h-4 text-gray-400" />
              Nezařazen v žádné sekvenci
            </div>
          ) : (
            enrollments.map(enrollment => {
              const status = STATUS_CONFIG[enrollment.status]
              return (
                <div key={enrollment.id} className="p-3 rounded-lg bg-gray-50 border border-gray-200">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-900 truncate">
                      {enrollment.sequence_name || 'Sekvence'}
                    </span>
                    <span className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-xs font-medium ${status.color}`}>
                      {status.icon}
                      {status.label}
                    </span>
                  </div>
                  <div className="mt-1 text-xs text-gray-500">
                    Krok {enrollment.current_step_order}
                    {enrollment.next_execution_at && enrollment.status === 'active' && (
                      <span> · Další: {formatDateTime(enrollment.next_execution_at)}</span>
                    )}
                    {enrollment.stop_reason && (
                      <span className="block mt-1 text-gray-400">{enrollment.stop_reason}</span>
                    )}
                  </div>
                </div>
              )
            })
          )}
        </div>
      </div>
    </div>
  )
}
