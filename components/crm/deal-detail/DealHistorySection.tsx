'use client'

import { DEAL_STAGES } from '@/lib/utils/constants'
import { formatDateTime } from '@/lib/utils/format'
import { History, ScrollText } from 'lucide-react'
import { Section, AUDIT_ACTION_LABELS, type DealSectionProps } from './shared'

export function DealPipelineHistorySection({ data, expanded, onToggle }: Pick<DealSectionProps, 'data'> & { expanded: boolean; onToggle: () => void }) {
  const { stageHistory } = data

  return (
    <Section
      title={`Historie pipeline (${stageHistory.length})`}
      icon={<History className="w-4 h-4" />}
      expanded={expanded}
      onToggle={onToggle}
    >
      {stageHistory.length === 0 ? (
        <p className="text-sm text-gray-500">Žádné změny</p>
      ) : (
        <div className="space-y-2">
          {stageHistory.map((entry) => {
            const fromLabel = DEAL_STAGES.find((s) => s.value === entry.from_stage)?.label
            const toLabel = DEAL_STAGES.find((s) => s.value === entry.to_stage)?.label
            return (
              <div key={entry.id} className="flex items-center gap-2 text-sm">
                <span className="text-xs text-gray-400 w-28 flex-shrink-0">{formatDateTime(entry.created_at)}</span>
                {fromLabel && (
                  <>
                    <span className="text-gray-600">{fromLabel}</span>
                    <span className="text-gray-400">&rarr;</span>
                  </>
                )}
                <span className="font-medium text-gray-900">{toLabel}</span>
                {entry.changed_by && <span className="text-xs text-gray-400 ml-auto">{entry.changed_by}</span>}
              </div>
            )
          })}
        </div>
      )}
    </Section>
  )
}

export function DealAuditLogSection({ data, expanded, onToggle }: Pick<DealSectionProps, 'data'> & { expanded: boolean; onToggle: () => void }) {
  const { auditLog } = data

  return (
    <Section
      title={`Audit log (${auditLog.length})`}
      icon={<ScrollText className="w-4 h-4" />}
      expanded={expanded}
      onToggle={onToggle}
    >
      {auditLog.length === 0 ? (
        <p className="text-sm text-gray-500">Žádné záznamy</p>
      ) : (
        <div className="space-y-2">
          {auditLog.map((entry) => (
            <div key={entry.id} className="flex items-start gap-2 text-sm py-1 border-b border-gray-50 last:border-0">
              <span className="text-xs text-gray-400 w-28 flex-shrink-0 pt-0.5">
                {formatDateTime(entry.created_at)}
              </span>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="inline-flex px-1.5 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-700">
                    {AUDIT_ACTION_LABELS[entry.action] || entry.action}
                  </span>
                  {entry.user && (
                    <span className="text-xs text-gray-500">{entry.user.full_name}</span>
                  )}
                </div>
                {Object.keys(entry.changes).length > 0 && (
                  <div className="mt-1 text-xs text-gray-500">
                    {Object.entries(entry.changes).map(([field, change]) => (
                      <div key={field}>
                        <span className="font-medium">{field}</span>: {String(change.old || '–')} &rarr; {String(change.new || '–')}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </Section>
  )
}
