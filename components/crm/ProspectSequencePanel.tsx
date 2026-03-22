'use client'

import { useState, useEffect } from 'react'
import useSWR from 'swr'
import { formatDateTime } from '@/lib/utils/format'
import {
  Mail,
  Phone,
  Brain,
  Clock,
  Play,
  Pause,
  Square,
  CheckCircle2,
  AlertCircle,
  Flame,
  ThermometerSun,
  Snowflake,
  TrendingUp,
  Eye,
  MousePointer,
  XCircle,
} from 'lucide-react'
import type {
  ProspectSequenceEnrollment,
  EmailEvent,
  LeadScore,
  LeadCategory,
  EnrollmentStatus,
} from '@/lib/supabase/sequence-types'

const fetcher = (url: string) => fetch(url).then(r => r.json())

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

const EVENT_ICONS: Record<string, React.ReactNode> = {
  delivered: <Mail className="w-3 h-3 text-gray-400" />,
  opened: <Eye className="w-3 h-3 text-green-500" />,
  clicked: <MousePointer className="w-3 h-3 text-blue-500" />,
  bounced: <XCircle className="w-3 h-3 text-red-500" />,
  unsubscribed: <XCircle className="w-3 h-3 text-red-500" />,
}

interface Props {
  prospectId: string
}

/**
 * Panel zobrazující stav prospekta v orchestrátoru:
 * - Lead score (hot/warm/cold)
 * - Aktivní sekvence (ve které je, na jakém kroku)
 * - Email engagement timeline (otevření, kliknutí)
 *
 * Zobrazuje se v detailu prospekta pod ActivityPanel.
 */
export function ProspectSequencePanel({ prospectId }: Props) {
  // Lead score
  const { data: score } = useSWR<LeadScore>(
    `/api/lead-scores/${prospectId}`,
    fetcher,
    { revalidateOnFocus: false }
  )

  // Enrollments — hledáme přes všechny sekvence
  const [enrollments, setEnrollments] = useState<(ProspectSequenceEnrollment & { sequence_name?: string })[]>([])
  const [events, setEvents] = useState<EmailEvent[]>([])
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    async function load() {
      try {
        // Načti enrollmenty pro tento prospect
        const enrollRes = await fetch(`/api/sequences?_prospect=${prospectId}`)
        const sequences = await enrollRes.json()

        // Pro každou sekvenci zkontroluj enrollmenty
        const allEnrollments: (ProspectSequenceEnrollment & { sequence_name?: string })[] = []
        for (const seq of (Array.isArray(sequences) ? sequences : [])) {
          const res = await fetch(`/api/sequences/${seq.id}/enrollments`)
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

        // Email events pro tento prospect (přes score endpoint side-load nebo přímo)
        // Pro teď necháváme prázdné — events se zobrazí z enrollmentů
      } catch {
        // Ignoruj chyby
      }
      setLoaded(true)
    }
    load()
  }, [prospectId])

  const hasData = score || enrollments.length > 0

  if (!loaded) {
    return (
      <div className="mt-4 pt-4 border-t border-gray-200">
        <div className="text-sm text-gray-400 animate-pulse">Načítání orchestrátoru...</div>
      </div>
    )
  }

  if (!hasData) {
    return (
      <div className="mt-4 pt-4 border-t border-gray-200">
        <div className="flex items-center gap-2 text-sm text-gray-400">
          <TrendingUp className="w-4 h-4" />
          <span>Orchestrátor: žádná sekvence, žádné skóre</span>
        </div>
      </div>
    )
  }

  const category = score?.category || 'cold'
  const catConfig = CATEGORY_CONFIG[category]

  return (
    <div className="mt-4 pt-4 border-t border-gray-200 space-y-4">
      <div className="flex items-center gap-2">
        <TrendingUp className="w-4 h-4 text-blue-500" />
        <h3 className="text-sm font-semibold text-gray-900">Orchestrátor</h3>
      </div>

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

        {/* Aktivní sekvence */}
        <div className="space-y-2">
          {enrollments.length === 0 ? (
            <div className="p-3 rounded-lg bg-gray-50 border border-gray-200 text-sm text-gray-500">
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
