'use client'

import { ChevronDown, ChevronRight } from 'lucide-react'
import type {
  Deal,
  DealItem,
  DealStageHistory,
  DealActivity,
  TechnicalAudit,
  Installation,
  DealDocument,
  AuditLogEntry,
  AppUser,
  Client,
  Prospect,
} from '@/lib/supabase/types'

// ── Data interfaces ──

export interface DealDetailData {
  deal: Deal & { client?: Client; prospect?: Prospect; assigned_user?: AppUser }
  items: DealItem[]
  stageHistory: DealStageHistory[]
  activities: DealActivity[]
  audits: TechnicalAudit[]
  installations: Installation[]
  documents: DealDocument[]
  auditLog: AuditLogEntry[]
  allUsers: AppUser[]
}

export interface DealSectionProps {
  dealId: string
  data: DealDetailData
  onRefresh: () => Promise<void>
  isSuperAdmin: boolean
}

// ── Label maps ──

export const ACTIVITY_TYPE_LABELS: Record<string, string> = {
  note: 'Poznámka',
  call: 'Telefonát',
  email: 'Email',
  meeting: 'Schůzka',
  task: 'Úkol',
  document: 'Dokument',
}

export const ACTIVITY_TYPES = [
  { value: 'note', label: 'Poznámka' },
  { value: 'call', label: 'Telefonát' },
  { value: 'email', label: 'Email' },
  { value: 'meeting', label: 'Schůzka' },
  { value: 'task', label: 'Úkol' },
]

export const INSTALLATION_STATUS_LABELS: Record<string, { label: string; color: string }> = {
  planned: { label: 'Plánováno', color: 'bg-gray-100 text-gray-700' },
  in_progress: { label: 'Probíhá', color: 'bg-blue-100 text-blue-700' },
  completed: { label: 'Dokončeno', color: 'bg-green-100 text-green-700' },
  issue: { label: 'Problém', color: 'bg-red-100 text-red-700' },
}

export const DOC_TYPE_LABELS: Record<string, string> = {
  proposal: 'Nabídka',
  contract: 'Smlouva',
  technical_report: 'Technický report',
  certificate: 'Certifikát',
  invoice: 'Faktura',
  photo: 'Foto',
  other: 'Ostatní',
}

export const AUDIT_ACTION_LABELS: Record<string, string> = {
  create: 'Vytvořeno',
  update: 'Upraveno',
  delete: 'Smazáno',
  assign: 'Přiřazeno',
  stage_change: 'Změna stage',
  activate: 'Aktivováno',
  deactivate: 'Deaktivováno',
}

// ── Reusable UI components ──

export function Section({
  title,
  icon,
  expanded,
  onToggle,
  actions,
  children,
}: {
  title: string
  icon: React.ReactNode
  expanded: boolean
  onToggle: () => void
  actions?: React.ReactNode
  children: React.ReactNode
}) {
  return (
    <div className="border border-gray-200 rounded-lg overflow-hidden">
      <div className="w-full flex items-center gap-2 px-4 py-3 bg-gray-50 hover:bg-gray-100 transition-colors cursor-pointer"
        onClick={onToggle}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onToggle() } }}
      >
        {expanded ? <ChevronDown className="w-4 h-4 text-gray-400" /> : <ChevronRight className="w-4 h-4 text-gray-400" />}
        {icon}
        <span className="font-medium text-sm text-gray-900">{title}</span>
        {actions && (
          <span className="ml-auto" onClick={(e) => e.stopPropagation()}>
            {actions}
          </span>
        )}
      </div>
      {expanded && <div className="px-4 py-3">{children}</div>}
    </div>
  )
}

export function InfoRow({ label, value, icon, bold }: { label: string; value: string; icon?: React.ReactNode; bold?: boolean }) {
  return (
    <div className="flex items-center gap-1.5">
      {icon}
      <span className="text-xs text-gray-500">{label}:</span>
      <span className={`text-sm ${bold ? 'font-semibold text-blue-600' : 'text-gray-900'}`}>{value}</span>
    </div>
  )
}
