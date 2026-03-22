'use client'

import { useEnrollments } from '@/lib/hooks/useEnrollments'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { formatDateTime } from '@/lib/utils/format'
import {
  Play,
  Pause,
  Square,
  CheckCircle2,
  AlertCircle,
  Clock,
} from 'lucide-react'
import type { EnrollmentStatus } from '@/lib/supabase/sequence-types'

const STATUS_CONFIG: Record<EnrollmentStatus, { label: string; color: string; icon: React.ReactNode }> = {
  active: { label: 'Aktivní', color: 'bg-green-100 text-green-700', icon: <Play className="w-3 h-3" /> },
  paused: { label: 'Pozastaven', color: 'bg-yellow-100 text-yellow-700', icon: <Pause className="w-3 h-3" /> },
  completed: { label: 'Dokončen', color: 'bg-blue-100 text-blue-700', icon: <CheckCircle2 className="w-3 h-3" /> },
  stopped: { label: 'Zastaven', color: 'bg-red-100 text-red-700', icon: <Square className="w-3 h-3" /> },
  error: { label: 'Chyba', color: 'bg-red-100 text-red-700', icon: <AlertCircle className="w-3 h-3" /> },
}

export function SequenceEnrollmentView({ sequenceId }: { sequenceId: string }) {
  const { enrollments, loading, controlEnrollment } = useEnrollments(sequenceId)

  if (loading) {
    return <div className="text-center text-gray-500 py-8">Načítání enrollmentů...</div>
  }

  if (enrollments.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        <Clock className="w-8 h-8 mx-auto mb-2 text-gray-300" />
        <p>Zatím žádní enrollovaní prospekti</p>
        <p className="text-xs mt-1">Přidejte prospekty z seznamu prospektů</p>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Firma</th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Krok</th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Další akce</th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Enrollován</th>
            <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Akce</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200">
          {enrollments.map((enrollment) => {
            const status = STATUS_CONFIG[enrollment.status]
            return (
              <tr key={enrollment.id} className="hover:bg-gray-50">
                <td className="px-4 py-3 text-sm font-medium text-gray-900">
                  {enrollment.prospect?.company_name || '—'}
                </td>
                <td className="px-4 py-3 text-sm text-gray-600">
                  Krok {enrollment.current_step_order}
                </td>
                <td className="px-4 py-3">
                  <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${status.color}`}>
                    {status.icon}
                    {status.label}
                  </span>
                </td>
                <td className="px-4 py-3 text-xs text-gray-500">
                  {enrollment.next_execution_at
                    ? formatDateTime(enrollment.next_execution_at)
                    : enrollment.stop_reason || '—'}
                </td>
                <td className="px-4 py-3 text-xs text-gray-500">
                  {formatDateTime(enrollment.enrolled_at)}
                </td>
                <td className="px-4 py-3 text-right">
                  <div className="flex items-center justify-end gap-1">
                    {enrollment.status === 'active' && (
                      <button
                        onClick={() => controlEnrollment(enrollment.id, 'pause')}
                        className="p-1 text-gray-400 hover:text-yellow-600 rounded"
                        title="Pozastavit"
                      >
                        <Pause className="w-4 h-4" />
                      </button>
                    )}
                    {enrollment.status === 'paused' && (
                      <button
                        onClick={() => controlEnrollment(enrollment.id, 'resume')}
                        className="p-1 text-gray-400 hover:text-green-600 rounded"
                        title="Pokračovat"
                      >
                        <Play className="w-4 h-4" />
                      </button>
                    )}
                    {(enrollment.status === 'active' || enrollment.status === 'paused') && (
                      <button
                        onClick={() => controlEnrollment(enrollment.id, 'stop')}
                        className="p-1 text-gray-400 hover:text-red-600 rounded"
                        title="Zastavit"
                      >
                        <Square className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}
