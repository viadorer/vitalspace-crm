'use client'

import { Topbar } from '@/components/crm/Topbar'
import { Dashboard } from '@/components/crm/Dashboard'

export default function DashboardPage() {
  return (
    <div>
      <Topbar title="Dashboard" />
      <Dashboard />
    </div>
  )
}
