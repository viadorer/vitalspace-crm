'use client'

import { useState, useEffect } from 'react'
import { usePersistedState } from '@/lib/hooks/usePersistedState'
import { createClient } from '@/lib/supabase/client'
import { useCurrentUser } from '@/lib/hooks/useCurrentUser'
import { fetchAuditLog } from '@/lib/hooks/useAuditLog'
import type { DealDetailData } from './deal-detail/shared'
import type {
  Deal, DealItem, DealStageHistory, DealActivity,
  TechnicalAudit, Installation, DealDocument, AppUser, Client, Prospect,
} from '@/lib/supabase/types'

import { DealHeaderSection } from './deal-detail/DealHeaderSection'
import { DealFinancialsSection } from './deal-detail/DealFinancialsSection'
import { DealItemsSection } from './deal-detail/DealItemsSection'
import { DealAuditsSection } from './deal-detail/DealAuditsSection'
import { DealInstallationsSection } from './deal-detail/DealInstallationsSection'
import { DealActivitiesSection } from './deal-detail/DealActivitiesSection'
import { DealDocumentsSection } from './deal-detail/DealDocumentsSection'
import { DealPipelineHistorySection, DealAuditLogSection } from './deal-detail/DealHistorySection'

interface DealDetailProps {
  dealId: string
  onClose: () => void
}

export function DealDetail({ dealId, onClose }: DealDetailProps) {
  const { isSuperAdmin } = useCurrentUser()
  const [data, setData] = useState<DealDetailData | null>(null)
  const [loading, setLoading] = useState(true)
  const [expandedSections, setExpandedSections] = usePersistedState<Record<string, boolean>>('deal_expanded_sections', {
    financials: true,
    items: true,
    audits: false,
    installations: false,
    activities: true,
    documents: false,
    history: false,
    auditLog: false,
  })

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
      { data: allUsers },
    ] = await Promise.all([
      supabase
        .from('deals')
        .select('*, client:clients(*, client_contacts(*)), prospect:prospects(id, company_name, email), assigned_user:app_users(*)')
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
        .from('activities')
        .select('*')
        .eq('entity_type', 'deal')
        .eq('entity_id', dealId)
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
        .from('crm_documents')
        .select('*')
        .eq('deal_id', dealId)
        .order('created_at', { ascending: false }),
      supabase
        .from('app_users')
        .select('*')
        .eq('is_active', true)
        .order('full_name'),
    ])

    const auditLog = await fetchAuditLog('deal', dealId)

    if (deal) {
      const dealData = deal as Deal & { client?: Client; prospect?: Prospect; assigned_user?: AppUser }
      setData({
        deal: dealData,
        items: (items || []) as DealItem[],
        stageHistory: (stageHistory || []) as DealStageHistory[],
        activities: (activities || []) as DealActivity[],
        audits: (audits || []) as TechnicalAudit[],
        installations: (installations || []) as Installation[],
        documents: (documents || []) as DealDocument[],
        auditLog,
        allUsers: (allUsers || []) as AppUser[],
      })
    }
    setLoading(false)
  }

  useEffect(() => {
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

  const sectionProps = {
    dealId,
    data,
    onRefresh: fetchDealDetail,
    isSuperAdmin: isSuperAdmin(),
  }

  return (
    <div className="space-y-4 max-h-[75vh] overflow-y-auto">
      <DealHeaderSection {...sectionProps} onClose={onClose} />

      <DealFinancialsSection
        {...sectionProps}
        expanded={expandedSections.financials}
        onToggle={() => toggleSection('financials')}
      />

      <DealItemsSection
        {...sectionProps}
        expanded={expandedSections.items}
        onToggle={() => toggleSection('items')}
      />

      <DealAuditsSection
        {...sectionProps}
        expanded={expandedSections.audits}
        onToggle={() => toggleSection('audits')}
      />

      <DealInstallationsSection
        {...sectionProps}
        expanded={expandedSections.installations}
        onToggle={() => toggleSection('installations')}
      />

      <DealActivitiesSection
        {...sectionProps}
        expanded={expandedSections.activities}
        onToggle={() => toggleSection('activities')}
      />

      <DealDocumentsSection
        {...sectionProps}
        expanded={expandedSections.documents}
        onToggle={() => toggleSection('documents')}
      />

      <DealPipelineHistorySection
        data={data}
        expanded={expandedSections.history}
        onToggle={() => toggleSection('history')}
      />

      <DealAuditLogSection
        data={data}
        expanded={expandedSections.auditLog}
        onToggle={() => toggleSection('auditLog')}
      />
    </div>
  )
}
