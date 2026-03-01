'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { LayoutDashboard, Kanban, Users, Building2, Package, Target, LogOut } from 'lucide-react'

const menuItems = [
  { label: 'Dashboard', href: '/crm/dashboard', icon: LayoutDashboard },
  { label: 'Pipeline', href: '/crm/pipeline', icon: Kanban },
  { label: 'Prospekty', href: '/crm/prospects', icon: Target },
  { label: 'Klienti', href: '/crm/clients', icon: Building2 },
  { label: 'Produkty', href: '/crm/products', icon: Package },
  { label: 'Segmenty', href: '/crm/segments', icon: Users },
]

export function Sidebar() {
  const pathname = usePathname()
  const router = useRouter()
  const supabase = createClient()

  async function handleLogout() {
    await supabase.auth.signOut()
    router.push('/auth/login')
    router.refresh()
  }

  return (
    <div className="w-64 bg-white border-r border-border h-screen flex flex-col">
      <div className="p-6 border-b border-border">
        <h1 className="text-2xl font-bold text-gray-900">Vitalspace</h1>
        <p className="text-sm text-gray-500">CRM System</p>
      </div>

      <nav className="flex-1 p-4 space-y-1">
        {menuItems.map((item) => {
          const isActive = pathname === item.href
          const Icon = item.icon
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-4 py-2 rounded-lg transition-colors ${
                isActive
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              <Icon className="w-5 h-5" />
              {item.label}
            </Link>
          )
        })}
      </nav>

      <div className="p-4 border-t border-border">
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-4 py-2 text-left text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <LogOut className="w-5 h-5" />
          Odhlásit se
        </button>
      </div>
    </div>
  )
}
