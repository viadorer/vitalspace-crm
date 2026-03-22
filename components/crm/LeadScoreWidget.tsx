'use client'

import { useState } from 'react'
import { useLeadScores } from '@/lib/hooks/useLeadScores'
import { Flame, ThermometerSun, Snowflake, RefreshCw, TrendingUp } from 'lucide-react'
import type { LeadCategory } from '@/lib/supabase/sequence-types'

const CATEGORY_CONFIG: Record<LeadCategory, { label: string; color: string; icon: React.ReactNode; bgColor: string }> = {
  hot: { label: 'Hot', color: 'text-red-600', icon: <Flame className="w-5 h-5" />, bgColor: 'bg-red-50' },
  warm: { label: 'Warm', color: 'text-orange-600', icon: <ThermometerSun className="w-5 h-5" />, bgColor: 'bg-orange-50' },
  cold: { label: 'Cold', color: 'text-blue-600', icon: <Snowflake className="w-5 h-5" />, bgColor: 'bg-blue-50' },
}

export function LeadScoreWidget() {
  const { scores, loading, triggerRecompute } = useLeadScores()
  const [recomputing, setRecomputing] = useState(false)

  // Count by category
  const hotCount = scores.filter(s => s.category === 'hot').length
  const warmCount = scores.filter(s => s.category === 'warm').length
  const coldCount = scores.filter(s => s.category === 'cold').length
  const topLeads = scores.filter(s => s.category === 'hot').slice(0, 5)

  async function handleRecompute() {
    setRecomputing(true)
    await triggerRecompute()
    setRecomputing(false)
  }

  if (loading) {
    return (
      <div className="bg-white rounded-xl border border-gray-200 p-6 animate-pulse">
        <div className="h-5 bg-gray-200 rounded w-32 mb-4" />
        <div className="h-8 bg-gray-200 rounded w-24" />
      </div>
    )
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-blue-500" />
          <h2 className="text-lg font-semibold text-gray-900">Lead Score</h2>
        </div>
        <button
          onClick={handleRecompute}
          disabled={recomputing}
          className="p-1.5 text-gray-400 hover:text-blue-600 rounded-lg hover:bg-blue-50 transition-colors"
          title="Přepočítat skóre"
        >
          <RefreshCw className={`w-4 h-4 ${recomputing ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {/* Category distribution */}
      <div className="grid grid-cols-3 gap-3 mb-4">
        {(['hot', 'warm', 'cold'] as LeadCategory[]).map(cat => {
          const config = CATEGORY_CONFIG[cat]
          const count = cat === 'hot' ? hotCount : cat === 'warm' ? warmCount : coldCount
          return (
            <div key={cat} className={`p-3 rounded-lg ${config.bgColor} text-center`}>
              <div className={`text-xl font-bold ${config.color}`}>{count}</div>
              <div className="text-xs text-gray-500 flex items-center justify-center gap-1 mt-1">
                {config.icon}
                {config.label}
              </div>
            </div>
          )
        })}
      </div>

      {/* Top hot leads */}
      {topLeads.length > 0 && (
        <div>
          <h3 className="text-xs font-medium text-gray-500 uppercase mb-2">Top Hot leady</h3>
          <div className="space-y-2">
            {topLeads.map(lead => (
              <div key={lead.id} className="flex items-center justify-between py-1">
                <span className="text-sm text-gray-900 truncate flex-1">
                  {lead.prospect?.company_name || '—'}
                </span>
                <span className="text-sm font-bold text-red-600 ml-2">
                  {lead.total_score}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
