'use client'

import { getSegmentRecommendation } from '@/lib/utils/segment-intelligence'
import { formatCurrency } from '@/lib/utils/format'
import { AlertCircle, Target, Package, TrendingUp, Clock, User } from 'lucide-react'

interface SegmentInsightsProps {
  segmentName: string
}

export function SegmentInsights({ segmentName }: SegmentInsightsProps) {
  const intel = getSegmentRecommendation(segmentName)

  if (!intel) {
    return (
      <div className="bg-gray-50 rounded-lg p-4 text-sm text-gray-500">
        Žádné specifické informace pro tento segment
      </div>
    )
  }

  return (
    <div className="bg-blue-50 rounded-lg p-6 space-y-4">
      <div>
        <h3 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-blue-600" />
          Pain Point
        </h3>
        <p className="text-sm text-gray-700">{intel.painPoint}</p>
      </div>

      <div>
        <h3 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
          <Target className="w-4 h-4 text-blue-600" />
          Doporučený přístup
        </h3>
        <p className="text-sm text-gray-700">{intel.approach}</p>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <h4 className="text-xs font-medium text-gray-500 mb-1 flex items-center gap-1">
            <Package className="w-3 h-3" />
            Produkty
          </h4>
          <div className="flex flex-wrap gap-1">
            {intel.recommendedProducts.map((product) => (
              <span
                key={product}
                className="inline-block bg-white px-2 py-1 rounded text-xs font-medium text-blue-700"
              >
                {product}
              </span>
            ))}
          </div>
        </div>

        <div>
          <h4 className="text-xs font-medium text-gray-500 mb-1 flex items-center gap-1">
            <TrendingUp className="w-3 h-3" />
            Průměrný deal
          </h4>
          <p className="text-sm font-semibold text-gray-900">{intel.avgDealSize}</p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <h4 className="text-xs font-medium text-gray-500 mb-1 flex items-center gap-1">
            <Clock className="w-3 h-3" />
            Doba uzavření
          </h4>
          <p className="text-sm text-gray-700">{intel.closingTime}</p>
        </div>

        <div>
          <h4 className="text-xs font-medium text-gray-500 mb-1 flex items-center gap-1">
            <User className="w-3 h-3" />
            Rozhodovatel
          </h4>
          <p className="text-sm text-gray-700">{intel.keyDecisionMaker}</p>
        </div>
      </div>

      <div className="pt-3 border-t border-blue-200">
        <h4 className="text-xs font-medium text-gray-500 mb-1 flex items-center gap-1">
          <Target className="w-3 h-3" />
          Klíčové argumenty
        </h4>
        <p className="text-sm text-gray-700">{intel.bestApproach}</p>
      </div>
    </div>
  )
}
