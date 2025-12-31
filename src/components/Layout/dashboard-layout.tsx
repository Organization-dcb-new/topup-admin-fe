import { useEffect, useState } from 'react'

import { useAuth } from '@/lib/auth'
import { Sidebar } from './sidebar'
import { Topbar } from './topbar'

export function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [collapsed, setCollapsed] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)

  const { isAuthenticated } = useAuth()

  useEffect(() => {
    if (!isAuthenticated) {
      window.location.href = '/login'
    }
  }, [isAuthenticated])

  if (!isAuthenticated) return null

  return (
    <div className="flex">
      <Sidebar
        collapsed={collapsed}
        mobileOpen={mobileOpen}
        onToggleCollapse={() => setCollapsed(!collapsed)}
        onCloseMobile={() => setMobileOpen(false)}
      />

      <div className="flex-1 min-h-screen bg-gray-50 md:ml-0">
        <Topbar onOpenMobile={() => setMobileOpen(true)} />
        <main className="p-4 md:p-6">{children}</main>
      </div>
    </div>
  )
}
