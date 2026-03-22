import { TrendingUp, TrendingDown } from 'lucide-react'

interface KpiCardProps {
  title: string
  value: string
  subtitle?: string
  icon: React.ReactNode
  trend?: { value: string; positive: boolean } | null
  color: string
}

export function KpiCard({ title, value, subtitle, icon, trend, color }: KpiCardProps) {
  return (
    <div className="bg-white p-5 rounded-xl border border-gray-200 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-500">{title}</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{value}</p>
          {subtitle && <p className="text-xs text-gray-400 mt-1">{subtitle}</p>}
          {trend && (
            <div className={`flex items-center gap-1 mt-2 text-xs font-medium ${trend.positive ? 'text-green-600' : 'text-red-500'}`}>
              {trend.positive ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
              {trend.value}
            </div>
          )}
        </div>
        <div className={`p-3 rounded-lg ${color}`}>
          {icon}
        </div>
      </div>
    </div>
  )
}
