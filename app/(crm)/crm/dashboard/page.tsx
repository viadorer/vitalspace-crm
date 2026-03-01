import { Topbar } from '@/components/crm/Topbar'

export const dynamic = 'force-dynamic'

export default function DashboardPage() {
  return (
    <div>
      <Topbar title="Dashboard" />
      <div className="p-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white p-6 rounded-lg border border-border">
            <div className="text-sm text-gray-500 mb-1">Celková pipeline</div>
            <div className="text-3xl font-bold text-gray-900">0 Kč</div>
          </div>
          <div className="bg-white p-6 rounded-lg border border-border">
            <div className="text-sm text-gray-500 mb-1">Aktivní dealy</div>
            <div className="text-3xl font-bold text-gray-900">0</div>
          </div>
          <div className="bg-white p-6 rounded-lg border border-border">
            <div className="text-sm text-gray-500 mb-1">Konverzní poměr</div>
            <div className="text-3xl font-bold text-gray-900">0%</div>
          </div>
          <div className="bg-white p-6 rounded-lg border border-border">
            <div className="text-sm text-gray-500 mb-1">Průměrný deal</div>
            <div className="text-3xl font-bold text-gray-900">0 Kč</div>
          </div>
        </div>
      </div>
    </div>
  )
}
