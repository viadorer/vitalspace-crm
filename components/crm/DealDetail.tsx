'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { DEAL_STAGES } from '@/lib/utils/constants'
import { formatCurrency, formatDate, formatDateTime } from '@/lib/utils/format'
import {
  Building2,
  Calendar,
  ChevronDown,
  ChevronRight,
  ClipboardList,
  FileText,
  History,
  Package,
  Ruler,
  User,
  Wrench,
} from 'lucide-react'
import type {
  Deal,
  DealItem,
  DealStageHistory,
  DealActivity,
  TechnicalAudit,
  Installation,
  DealDocument,
  Client,
} from '@/lib/supabase/types'

interface DealDetailData {
  deal: Deal & { client?: Client }
  items: DealItem[]
  stageHistory: DealStageHistory[]
  activities: DealActivity[]
  audits: TechnicalAudit[]
  installations: Installation[]
  documents: DealDocument[]
}

interface DealDetailProps {
  dealId: string
  onClose: () => void
}

const ACTIVITY_TYPE_LABELS: Record<string, string> = {
  note: 'Poznámka',
  call: 'Telefonát',
  email: 'Email',
  meeting: 'Schůzka',
  task: 'Úkol',
  document: 'Dokument',
}

const INSTALLATION_STATUS_LABELS: Record<string, { label: string; color: string }> = {
  planned: { label: 'Plánováno', color: 'bg-gray-100 text-gray-700' },
  in_progress: { label: 'Probíhá', color: 'bg-blue-100 text-blue-700' },
  completed: { label: 'Dokončeno', color: 'bg-green-100 text-green-700' },
  issue: { label: 'Problém', color: 'bg-red-100 text-red-700' },
}

const DOC_TYPE_LABELS: Record<string, string> = {
  proposal: 'Nabídka',
  contract: 'Smlouva',
  technical_report: 'Technický report',
  certificate: 'Certifikát',
  invoice: 'Faktura',
  photo: 'Foto',
  other: 'Ostatní',
}

export function DealDetail({ dealId, onClose }: DealDetailProps) {
  const [data, setData] = useState<DealDetailData | null>(null)
  const [loading, setLoading] = useState(true)
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    overview: true,
    items: true,
    audits: false,
    installations: false,
    activities: false,
    history: false,
    documents: false,
  })

  useEffect(() => {
    async function fetchDealDetail() {
      const supabase = createClient()

      const [
        { data: deal },
        { data: items },
        { data: stageHistory },
        { data: activities },
        { data: audits },
        { data: installations },
        { data: documents },
      ] = await Promise.all([
        supabase
          .from('deals')
          .select('*, client:clients(*)')
          .eq('id', dealId)
          .single(),
        supabase
          .from('deal_items')
          .select('*, product:products(*)')
          .eq('deal_id', dealId)
          .order('sort_order'),
        supabase
          .from('deal_stage_history')
          .select('*')
          .eq('deal_id', dealId)
          .order('created_at', { ascending: false }),
        supabase
          .from('deal_activities')
          .select('*')
          .eq('deal_id', dealId)
          .order('created_at', { ascending: false }),
        supabase
          .from('technical_audits')
          .select('*, recommended_product:products(*), air_measurements(*)')
          .eq('deal_id', dealId)
          .order('building_name', { ascending: true }),
        supabase
          .from('installations')
          .select('*')
          .eq('deal_id', dealId)
          .order('scheduled_date'),
        supabase
          .from('documents')
          .select('*')
          .eq('deal_id', dealId)
          .order('created_at', { ascending: false }),
      ])

      if (deal) {
        setData({
          deal: deal as Deal & { client?: Client },
          items: (items || []) as DealItem[],
          stageHistory: (stageHistory || []) as DealStageHistory[],
          activities: (activities || []) as DealActivity[],
          audits: (audits || []) as TechnicalAudit[],
          installations: (installations || []) as Installation[],
          documents: (documents || []) as DealDocument[],
        })
      }
      setLoading(false)
    }

    fetchDealDetail()
  }, [dealId])

  function toggleSection(section: string) {
    setExpandedSections((prev) => ({ ...prev, [section]: !prev[section] }))
  }

  if (loading) {
    return (
      <div className="p-8 text-center">
        <div className="text-gray-500">Načítání detailu dealu...</div>
      </div>
    )
  }

  if (!data) {
    return (
      <div className="p-8 text-center">
        <div className="text-red-500">Deal nebyl nalezen</div>
      </div>
    )
  }

  const { deal, items, stageHistory, activities, audits, installations, documents } = data
  const stageInfo = DEAL_STAGES.find((s) => s.value === deal.stage)

  return (
    <div className="space-y-4 max-h-[75vh] overflow-y-auto">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-3 mb-1">
            {deal.deal_number && (
              <span className="text-sm text-gray-500 font-mono">{deal.deal_number}</span>
            )}
            <span
              className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium"
              style={{ backgroundColor: stageInfo?.color + '20', color: stageInfo?.color }}
            >
              {stageInfo?.label}
            </span>
          </div>
          {deal.client && (
            <p className="text-sm text-gray-600 flex items-center gap-1.5 mt-1">
              <Building2 className="w-4 h-4" />
              {deal.client.company_name}
            </p>
          )}
          {deal.assigned_consultant && (
            <p className="text-sm text-gray-500 flex items-center gap-1.5 mt-1">
              <User className="w-4 h-4" />
              {deal.assigned_consultant}
            </p>
          )}
        </div>
        <div className="text-right">
          <div className="text-2xl font-bold text-blue-600">
            {formatCurrency(deal.final_price_czk)}
          </div>
          {deal.discount_percent > 0 && (
            <div className="text-sm text-gray-500">
              Sleva {deal.discount_percent}% z {formatCurrency(deal.total_value_czk)}
            </div>
          )}
        </div>
      </div>

      {/* Přehled – finanční rozpad */}
      <Section
        title="Finanční přehled"
        icon={<Package className="w-4 h-4" />}
        expanded={expandedSections.overview}
        onToggle={() => toggleSection('overview')}
      >
        <div className="grid grid-cols-2 gap-4">
          <InfoRow label="Hardware" value={formatCurrency(deal.total_hardware_czk)} />
          <InfoRow label="Montáž" value={formatCurrency(deal.total_installation_czk)} />
          <InfoRow label="Služby" value={formatCurrency(deal.total_service_czk)} />
          <InfoRow label="Celkem bez slevy" value={formatCurrency(deal.total_value_czk)} />
          {deal.discount_percent > 0 && (
            <InfoRow label="Sleva" value={`${deal.discount_percent} %`} />
          )}
          <InfoRow
            label="Finální cena"
            value={formatCurrency(deal.final_price_czk)}
            bold
          />
        </div>

        <div className="border-t border-gray-100 mt-4 pt-4 grid grid-cols-2 gap-4">
          {deal.estimated_close_date && (
            <InfoRow
              label="Očekávané uzavření"
              value={formatDate(deal.estimated_close_date)}
              icon={<Calendar className="w-3.5 h-3.5 text-gray-400" />}
            />
          )}
          {deal.estimated_installation_date && (
            <InfoRow
              label="Plánovaná montáž"
              value={formatDate(deal.estimated_installation_date)}
              icon={<Calendar className="w-3.5 h-3.5 text-gray-400" />}
            />
          )}
          {deal.installation_deadline && (
            <InfoRow
              label="Deadline montáže"
              value={formatDate(deal.installation_deadline)}
              icon={<Calendar className="w-3.5 h-3.5 text-gray-400" />}
            />
          )}
          <InfoRow label="Vytvořeno" value={formatDate(deal.created_at)} />
          {deal.closed_at && (
            <InfoRow label="Uzavřeno" value={formatDate(deal.closed_at)} />
          )}
          {deal.lost_reason && (
            <div className="col-span-2 bg-red-50 rounded-lg p-3">
              <span className="text-sm font-medium text-red-700">Důvod ztráty: </span>
              <span className="text-sm text-red-600">{deal.lost_reason}</span>
            </div>
          )}
        </div>
      </Section>

      {/* Položky nabídky */}
      <Section
        title={`Položky nabídky (${items.length})`}
        icon={<ClipboardList className="w-4 h-4" />}
        expanded={expandedSections.items}
        onToggle={() => toggleSection('items')}
      >
        {items.length === 0 ? (
          <p className="text-sm text-gray-500">Žádné položky</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="text-left py-2 pr-4 font-medium text-gray-600">Produkt</th>
                  <th className="text-left py-2 pr-4 font-medium text-gray-600">Místnost</th>
                  <th className="text-right py-2 pr-4 font-medium text-gray-600">Ks</th>
                  <th className="text-right py-2 pr-4 font-medium text-gray-600">Cena/ks</th>
                  <th className="text-right py-2 pr-4 font-medium text-gray-600">Sleva</th>
                  <th className="text-right py-2 font-medium text-gray-600">Celkem</th>
                </tr>
              </thead>
              <tbody>
                {items.map((item) => (
                  <tr key={item.id} className="border-b border-gray-50">
                    <td className="py-2 pr-4">
                      <div className="font-medium text-gray-900">
                        {item.product?.name || '–'}
                      </div>
                      {item.product?.sku && (
                        <div className="text-xs text-gray-400 font-mono">{item.product.sku}</div>
                      )}
                      {item.installation_notes && (
                        <div className="text-xs text-gray-500 mt-0.5">
                          {item.installation_notes}
                        </div>
                      )}
                    </td>
                    <td className="py-2 pr-4 text-gray-600">{item.target_room || '–'}</td>
                    <td className="py-2 pr-4 text-right text-gray-900">{item.quantity}</td>
                    <td className="py-2 pr-4 text-right text-gray-900">
                      {formatCurrency(item.unit_price_czk)}
                    </td>
                    <td className="py-2 pr-4 text-right text-gray-600">
                      {item.discount_percent > 0 ? `${item.discount_percent}%` : '–'}
                    </td>
                    <td className="py-2 text-right font-medium text-gray-900">
                      {formatCurrency(item.line_total_czk)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Section>

      {/* Technické audity */}
      <Section
        title={`Technické audity (${audits.length})`}
        icon={<Ruler className="w-4 h-4" />}
        expanded={expandedSections.audits}
        onToggle={() => toggleSection('audits')}
      >
        {audits.length === 0 ? (
          <p className="text-sm text-gray-500">Žádné audity</p>
        ) : (
          <div className="space-y-4">
            {audits.map((audit) => (
              <div key={audit.id} className="bg-gray-50 rounded-lg p-4">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <h4 className="font-medium text-gray-900">
                      {audit.room_name}
                      {audit.room_purpose && (
                        <span className="text-gray-500 font-normal"> – {audit.room_purpose}</span>
                      )}
                    </h4>
                    {(audit.building_name || audit.floor_number !== null) && (
                      <p className="text-xs text-gray-500">
                        {[audit.building_name, audit.floor_number !== null && `${audit.floor_number}. patro`]
                          .filter(Boolean)
                          .join(', ')}
                      </p>
                    )}
                  </div>
                  {audit.audit_date && (
                    <span className="text-xs text-gray-500">{formatDate(audit.audit_date)}</span>
                  )}
                </div>

                <div className="grid grid-cols-3 gap-3 text-sm">
                  {audit.area_m2 && <InfoRow label="Plocha" value={`${audit.area_m2} m²`} />}
                  <InfoRow label="Výška stropu" value={`${audit.ceiling_height_m} m`} />
                  {audit.volume_m3 && <InfoRow label="Objem" value={`${audit.volume_m3} m³`} />}
                  {audit.ceiling_type && <InfoRow label="Strop" value={audit.ceiling_type} />}
                  <InfoRow
                    label="Kazetový podhled"
                    value={audit.has_suspended_ceiling ? 'Ano' : 'Ne'}
                  />
                  <InfoRow label="230V" value={audit.has_230v_nearby ? 'Ano' : 'Ne'} />
                  {audit.ventilation_type && (
                    <InfoRow label="Ventilace" value={audit.ventilation_type} />
                  )}
                  {audit.recommended_product && (
                    <InfoRow
                      label="Doporučení"
                      value={`${audit.recommended_quantity}× ${audit.recommended_product.name}`}
                    />
                  )}
                  {audit.auditor_name && (
                    <InfoRow label="Auditor" value={audit.auditor_name} />
                  )}
                </div>

                {audit.notes && (
                  <p className="text-sm text-gray-600 mt-2 italic">{audit.notes}</p>
                )}

                {audit.air_measurements && audit.air_measurements.length > 0 && (
                  <div className="mt-3 border-t border-gray-200 pt-3">
                    <h5 className="text-xs font-semibold text-gray-500 uppercase mb-2">
                      Měření kvality vzduchu
                    </h5>
                    <div className="grid grid-cols-2 gap-2">
                      {audit.air_measurements.map((m) => (
                        <div key={m.id} className="bg-white rounded p-2 text-xs">
                          <span className="font-medium text-gray-700 uppercase">
                            {m.measurement_type}
                          </span>
                          <div className="flex gap-3 mt-1">
                            {m.value_before !== null && (
                              <span className="text-red-600">
                                Před: {m.value_before} {m.unit}
                              </span>
                            )}
                            {m.value_after !== null && (
                              <span className="text-green-600">
                                Po: {m.value_after} {m.unit}
                              </span>
                            )}
                            {m.threshold_safe !== null && (
                              <span className="text-gray-400">
                                Limit: {m.threshold_safe} {m.unit}
                              </span>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </Section>

      {/* Instalace */}
      <Section
        title={`Instalace (${installations.length})`}
        icon={<Wrench className="w-4 h-4" />}
        expanded={expandedSections.installations}
        onToggle={() => toggleSection('installations')}
      >
        {installations.length === 0 ? (
          <p className="text-sm text-gray-500">Žádné instalace</p>
        ) : (
          <div className="space-y-3">
            {installations.map((inst) => {
              const statusInfo = INSTALLATION_STATUS_LABELS[inst.status]
              return (
                <div key={inst.id} className="bg-gray-50 rounded-lg p-4">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <div className="flex items-center gap-2">
                        {inst.device_model && (
                          <span className="font-medium text-gray-900">{inst.device_model}</span>
                        )}
                        <span
                          className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${statusInfo.color}`}
                        >
                          {statusInfo.label}
                        </span>
                      </div>
                      {inst.installation_location && (
                        <p className="text-sm text-gray-600">{inst.installation_location}</p>
                      )}
                    </div>
                    {inst.technician_name && (
                      <span className="text-sm text-gray-500">{inst.technician_name}</span>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-3 text-sm">
                    {inst.scheduled_date && (
                      <InfoRow label="Plán" value={formatDate(inst.scheduled_date)} />
                    )}
                    {inst.completed_date && (
                      <InfoRow label="Dokončeno" value={formatDate(inst.completed_date)} />
                    )}
                    {inst.device_serial_number && (
                      <InfoRow label="S/N" value={inst.device_serial_number} />
                    )}
                    <InfoRow
                      label="Bezpečnostní kontrola"
                      value={inst.safety_check_passed ? '✓ OK' : '✗ Neschváleno'}
                    />
                    {inst.ozone_concentration_max !== null && (
                      <InfoRow
                        label="Max O₃"
                        value={`${inst.ozone_concentration_max} µg/m³`}
                      />
                    )}
                    {inst.ozone_decay_minutes !== null && (
                      <InfoRow
                        label="Rozpad O₃"
                        value={`${inst.ozone_decay_minutes} min`}
                      />
                    )}
                  </div>

                  {inst.notes && (
                    <p className="text-sm text-gray-600 mt-2 italic">{inst.notes}</p>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </Section>

      {/* Aktivity */}
      <Section
        title={`Aktivity (${activities.length})`}
        icon={<FileText className="w-4 h-4" />}
        expanded={expandedSections.activities}
        onToggle={() => toggleSection('activities')}
      >
        {activities.length === 0 ? (
          <p className="text-sm text-gray-500">Žádné aktivity</p>
        ) : (
          <div className="space-y-3">
            {activities.map((activity) => (
              <div key={activity.id} className="flex gap-3">
                <div className="flex-shrink-0 mt-1">
                  <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-gray-100 text-xs font-medium text-gray-600">
                    {activity.type.charAt(0).toUpperCase()}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-medium text-gray-500">
                      {ACTIVITY_TYPE_LABELS[activity.type] || activity.type}
                    </span>
                    {activity.is_completed && (
                      <span className="text-xs text-green-600">✓ Splněno</span>
                    )}
                    <span className="text-xs text-gray-400 ml-auto">
                      {formatDateTime(activity.created_at)}
                    </span>
                  </div>
                  {activity.subject && (
                    <p className="text-sm font-medium text-gray-900">{activity.subject}</p>
                  )}
                  {activity.body && (
                    <p className="text-sm text-gray-600 whitespace-pre-wrap">{activity.body}</p>
                  )}
                  {activity.due_date && (
                    <p className="text-xs text-orange-600 mt-1">
                      Termín: {formatDate(activity.due_date)}
                    </p>
                  )}
                  {activity.assigned_to && (
                    <p className="text-xs text-gray-500">Přiřazeno: {activity.assigned_to}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </Section>

      {/* Historie stage */}
      <Section
        title={`Historie pipeline (${stageHistory.length})`}
        icon={<History className="w-4 h-4" />}
        expanded={expandedSections.history}
        onToggle={() => toggleSection('history')}
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
                  <span className="text-xs text-gray-400 w-28 flex-shrink-0">
                    {formatDateTime(entry.created_at)}
                  </span>
                  {fromLabel && (
                    <>
                      <span className="text-gray-600">{fromLabel}</span>
                      <span className="text-gray-400">→</span>
                    </>
                  )}
                  <span className="font-medium text-gray-900">{toLabel}</span>
                  {entry.changed_by && (
                    <span className="text-xs text-gray-400 ml-auto">{entry.changed_by}</span>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </Section>

      {/* Dokumenty */}
      <Section
        title={`Dokumenty (${documents.length})`}
        icon={<FileText className="w-4 h-4" />}
        expanded={expandedSections.documents}
        onToggle={() => toggleSection('documents')}
      >
        {documents.length === 0 ? (
          <p className="text-sm text-gray-500">Žádné dokumenty</p>
        ) : (
          <div className="space-y-2">
            {documents.map((doc) => (
              <div key={doc.id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50">
                <FileText className="w-4 h-4 text-gray-400 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">{doc.title}</p>
                  <div className="flex items-center gap-2 text-xs text-gray-500">
                    <span>{DOC_TYPE_LABELS[doc.doc_type] || doc.doc_type}</span>
                    <span>·</span>
                    <span>{formatDate(doc.created_at)}</span>
                    {doc.created_by && (
                      <>
                        <span>·</span>
                        <span>{doc.created_by}</span>
                      </>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </Section>
    </div>
  )
}

function Section({
  title,
  icon,
  expanded,
  onToggle,
  children,
}: {
  title: string
  icon: React.ReactNode
  expanded: boolean
  onToggle: () => void
  children: React.ReactNode
}) {
  return (
    <div className="border border-gray-200 rounded-lg overflow-hidden">
      <button
        onClick={onToggle}
        className="w-full flex items-center gap-2 px-4 py-3 bg-gray-50 hover:bg-gray-100 transition-colors text-left"
      >
        {expanded ? (
          <ChevronDown className="w-4 h-4 text-gray-400" />
        ) : (
          <ChevronRight className="w-4 h-4 text-gray-400" />
        )}
        {icon}
        <span className="font-medium text-sm text-gray-900">{title}</span>
      </button>
      {expanded && <div className="px-4 py-3">{children}</div>}
    </div>
  )
}

function InfoRow({
  label,
  value,
  icon,
  bold,
}: {
  label: string
  value: string
  icon?: React.ReactNode
  bold?: boolean
}) {
  return (
    <div className="flex items-center gap-1.5">
      {icon}
      <span className="text-xs text-gray-500">{label}:</span>
      <span className={`text-sm ${bold ? 'font-semibold text-blue-600' : 'text-gray-900'}`}>
        {value}
      </span>
    </div>
  )
}
