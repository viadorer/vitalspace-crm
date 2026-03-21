import { Sidebar } from '@/components/crm/Sidebar'
import { ToastProvider } from '@/components/ui/ToastProvider'

export default function CRMLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <ToastProvider>
      <div className="flex h-screen overflow-hidden">
        <Sidebar />
        <main className="flex-1 overflow-y-auto bg-background">
          {children}
        </main>
      </div>
    </ToastProvider>
  )
}
