'use client'

import { formatCurrency } from '@/lib/utils/format'
import { AlertCircle, Target, Package, TrendingUp, Clock, User, MessageSquare, Award } from 'lucide-react'
import type { CompanySegment } from '@/lib/supabase/types'

interface SegmentInsightsProps {
  segment: CompanySegment | null
}

export function SegmentInsights({ segment }: SegmentInsightsProps) {
  if (!segment) {
    return (
      <div className="bg-gray-50 rounded-lg p-4 text-sm text-gray-500">
        Žádné specifické informace pro tento segment
      </div>
    )
  }

  const hasObjections = segment.objections_handling && Object.keys(segment.objections_handling).length > 0
  const hasStories = segment.success_stories && segment.success_stories.length > 0

  return (
    <div className="bg-blue-50 rounded-lg p-6 space-y-4">
      {segment.target_pain_point && (
        <div>
          <h3 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-blue-600" />
            Pain Point
          </h3>
          <p className="text-sm text-gray-700">{segment.target_pain_point}</p>
        </div>
      )}

      {segment.recommended_approach && (
        <div>
          <h3 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
            <Target className="w-4 h-4 text-blue-600" />
            Doporučený přístup
          </h3>
          <p className="text-sm text-gray-700">{segment.recommended_approach}</p>
        </div>
      )}

      {segment.recommended_products && segment.recommended_products.length > 0 && (
        <div>
          <h4 className="text-xs font-medium text-gray-500 mb-2 flex items-center gap-1">
            <Package className="w-3 h-3" />
            Doporučené produkty
          </h4>
          <div className="flex flex-wrap gap-1">
            {segment.recommended_products.map((product: string) => (
              <span
                key={product}
                className="inline-block bg-white px-2 py-1 rounded text-xs font-medium text-blue-700"
              >
                {product}
              </span>
            ))}
          </div>
        </div>
      )}

      {hasObjections && (
        <div className="pt-3 border-t border-blue-200">
          <h4 className="text-xs font-medium text-gray-500 mb-2 flex items-center gap-1">
            <MessageSquare className="w-3 h-3" />
            Námitky a odpovědi
          </h4>
          <div className="space-y-2">
            {Object.entries(segment.objections_handling as Record<string, string>).map(([objection, response]) => (
              <div key={objection} className="bg-white rounded p-2">
                <p className="text-xs font-medium text-gray-700">"{objection}"</p>
                <p className="text-xs text-gray-600 mt-1">→ {response}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {hasStories && segment.success_stories && (
        <div className="pt-3 border-t border-blue-200">
          <h4 className="text-xs font-medium text-gray-500 mb-2 flex items-center gap-1">
            <Award className="w-3 h-3" />
            Success Stories
          </h4>
          <ul className="space-y-1">
            {segment.success_stories.map((story: string, index: number) => (
              <li key={index} className="text-xs text-gray-700 flex items-start gap-1">
                <span className="text-green-600 mt-0.5">✓</span>
                <span>{story}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}
