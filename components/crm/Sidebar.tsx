'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { useCurrentUser } from '@/lib/hooks/useCurrentUser'
import { LayoutDashboard, Kanban, Users, Building2, Package, Target, Shield, Zap, LogOut, Phone, Key, ClipboardList, Mail, ListOrdered } from 'lucide-react'

const menuItems = [
  { label: 'Dashboard', href: '/crm/dashboard', icon: LayoutDashboard },
  { label: 'Pipeline', href: '/crm/pipeline', icon: Kanban },
  { label: 'Prospekty', href: '/crm/prospects', icon: Target },
  { label: 'Klienti', href: '/crm/clients', icon: Building2 },
  { label: 'Produkty', href: '/crm/products', icon: Package },
  { label: 'Nabídky', href: '/crm/quotes', icon: ClipboardList },
  { label: 'Segmenty', href: '/crm/segments', icon: Users },
  { label: 'Email šablony', href: '/crm/email-templates', icon: Mail },
]

export function Sidebar() {
  const pathname = usePathname()
  const router = useRouter()
  const { user, isSuperAdmin } = useCurrentUser()

  async function handleLogout() {
    const supabase = createClient()
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

        {isSuperAdmin() && (
          <>
            <div className="pt-4 pb-2">
              <div className="text-xs font-semibold text-gray-400 uppercase px-4">
                Administrace
              </div>
            </div>
            <Link
              href="/crm/users"
              className={`flex items-center gap-3 px-4 py-2 rounded-lg transition-colors ${
                pathname === '/crm/users'
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              <Shield className="w-5 h-5" />
              Uživatelé
            </Link>
            <Link
              href="/crm/workflows"
              className={`flex items-center gap-3 px-4 py-2 rounded-lg transition-colors ${
                pathname === '/crm/workflows'
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              <Zap className="w-5 h-5" />
              Workflow
            </Link>
            <Link
              href="/crm/sequences"
              className={`flex items-center gap-3 px-4 py-2 rounded-lg transition-colors ${
                pathname === '/crm/sequences'
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              <ListOrdered className="w-5 h-5" />
              Sekvence
            </Link>
            <Link
              href="/crm/callcenter"
              className={`flex items-center gap-3 px-4 py-2 rounded-lg transition-colors ${
                pathname === '/crm/callcenter'
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              <Phone className="w-5 h-5" />
              Callcentrum
            </Link>
            <Link
              href="/crm/api-keys"
              className={`flex items-center gap-3 px-4 py-2 rounded-lg transition-colors ${
                pathname === '/crm/api-keys'
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              <Key className="w-5 h-5" />
              API klíče
            </Link>
          </>
        )}
      </nav>

      <div className="p-4 border-t border-border">
        {user && (
          <div className="px-4 py-2 mb-2">
            <div className="text-sm font-medium text-gray-900 truncate">{user.full_name}</div>
            <div className="text-xs text-gray-500 truncate">{user.email}</div>
          </div>
        )}
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
