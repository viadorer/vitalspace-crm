import {
  Activity,
  CheckCircle2,
  XCircle,
  Users,
  ArrowRight,
} from 'lucide-react'
import { formatDateTime } from '@/lib/utils/format'
import type { AuditLogEntry } from '@/lib/supabase/types'

const ACTION_LABELS: Record<string, string> = {
  create: 'vytvořil/a',
  update: 'upravil/a',
  delete: 'smazal/a',
  assign: 'přiřadil/a',
  stage_change: 'posunul/a',
  activate: 'aktivoval/a',
  deactivate: 'deaktivoval/a',
}

const ENTITY_LABELS: Record<string, string> = {
  deal: 'deal',
  prospect: 'prospekt',
  client: 'klienta',
  deal_item: 'položku dealu',
  deal_activity: 'aktivitu',
  technical_audit: 'audit',
  installation: 'instalaci',
  document: 'dokument',
  product: 'produkt',
  app_user: 'uživatele',
}

const ACTION_COLORS: Record<string, string> = {
  create: 'bg-green-100 text-green-600',
  update: 'bg-blue-100 text-blue-600',
  delete: 'bg-red-100 text-red-600',
  assign: 'bg-purple-100 text-purple-600',
  stage_change: 'bg-amber-100 text-amber-600',
  activate: 'bg-emerald-100 text-emerald-600',
  deactivate: 'bg-gray-100 text-gray-600',
}

const ACTION_ICONS: Record<string, React.ReactNode> = {
  create: <CheckCircle2 className="w-3.5 h-3.5" />,
  update: <Activity className="w-3.5 h-3.5" />,
  delete: <XCircle className="w-3.5 h-3.5" />,
  assign: <Users className="w-3.5 h-3.5" />,
  stage_change: <ArrowRight className="w-3.5 h-3.5" />,
  activate: <CheckCircle2 className="w-3.5 h-3.5" />,
  deactivate: <XCircle className="w-3.5 h-3.5" />,
}

interface Props {
  entries: AuditLogEntry[]
}

export function RecentActivityCard({ entries }: Props) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6">
      <div className="flex items-center gap-2 mb-4">
        <Activity className="w-5 h-5 text-blue-500" />
        <h2 className="text-lg font-semibold text-gray-900">Nedávná aktivita</h2>
      </div>
      {entries.length === 0 ? (
        <p className="text-sm text-gray-500">Zatím žádná aktivita</p>
      ) : (
        <div className="space-y-2">
          {entries.map(entry => {
            const actionLabel = ACTION_LABELS[entry.action] || entry.action
            const entityLabel = ENTITY_LABELS[entry.entity_type] || entry.entity_type
            const actionIcon = ACTION_ICONS[entry.action]
            return (
              <div key={entry.id} className="flex items-start gap-3 py-2 border-b border-gray-50 last:border-0">
                <div className="flex-shrink-0 mt-0.5">
                  <span className={`inline-flex items-center justify-center w-7 h-7 rounded-full ${ACTION_COLORS[entry.action] || 'bg-gray-100 text-gray-500'}`}>
                    {actionIcon}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-sm font-medium text-gray-900">{entry.user?.full_name || 'Systém'}</span>
                    <span className="text-sm text-gray-500">{actionLabel}</span>
                    <span className="text-sm text-gray-700 font-medium">{entityLabel}</span>
                  </div>
                  {Object.keys(entry.changes).length > 0 && (
                    <div className="text-xs text-gray-400 mt-0.5">
                      {Object.entries(entry.changes).slice(0, 2).map(([field, change]) => (
                        <span key={field} className="mr-3">
                          {field}: {String(change.old || '–')} → {String(change.new || '–')}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
                <span className="text-xs text-gray-400 flex-shrink-0 whitespace-nowrap">
                  {formatDateTime(entry.created_at)}
                </span>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
