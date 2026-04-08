import { useEffect, useState } from 'react'

import { Button } from '@/components/ui/button'
import { useAuthUser } from '@/lib/auth'
import { cn } from '@/lib/utils'
import { Menu } from 'lucide-react'
import { Sidebar } from './sidebar'

export function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [collapsed, setCollapsed] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)

  const { token, isMfaRequired } = useAuthUser()

  useEffect(() => {
    if (!token) {
      window.location.href = '/login'
      return
    }

    if (isMfaRequired) {
      window.location.href = '/verify-otp'
      return
    }
  }, [token, isMfaRequired])

  if (!token || isMfaRequired) return null

  return (
    <div className="flex">
      <Sidebar
        collapsed={collapsed}
        mobileOpen={mobileOpen}
        onToggleCollapse={() => setCollapsed(!collapsed)}
        onCloseMobile={() => setMobileOpen(false)}
      />

      <Button
        type="button"
        variant="outline"
        size="icon"
        className={cn(
          'fixed left-4 top-4 z-30 h-10 w-10 bg-white shadow-md transition-opacity md:hidden',
          mobileOpen && 'pointer-events-none opacity-0',
        )}
        onClick={() => setMobileOpen(true)}
        aria-label="Buka menu navigasi"
      >
        <Menu className="h-5 w-5" aria-hidden />
      </Button>

      <div className="min-h-screen min-w-0 flex-1 bg-gray-50 md:ml-0">
        <main className="p-4 pt-16 md:p-6 md:pt-6">{children}</main>
      </div>
    </div>
  )
}
