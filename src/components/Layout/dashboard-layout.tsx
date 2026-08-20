import { useEffect, useState } from 'react'

import { useAuthUser } from '@/lib/auth'
import { cn } from '@/lib/utils'
import { Menu } from 'lucide-react'
import { Sidebar } from './sidebar'

export function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [collapsed, setCollapsed] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)

  const { isMfaRequired, isAuthenticated, isLoading } = useAuthUser()

  useEffect(() => {
    if (!isLoading) {
      if (!isAuthenticated && !isMfaRequired) {
        window.location.href = '/login'
      } else if (isMfaRequired) {
        window.location.href = '/verify-otp'
      }
    }
  }, [isAuthenticated, isMfaRequired, isLoading])

  if (isLoading || (!isAuthenticated && !isMfaRequired) || isMfaRequired) return null
  return (
    <div className='flex'>
      <Sidebar
        collapsed={collapsed}
        mobileOpen={mobileOpen}
        onToggleCollapse={() => setCollapsed(!collapsed)}
        onCloseMobile={() => setMobileOpen(false)}
      />

      <button
        type='button'
        className={cn(
          'nb nb-frame nb-sd-sm nb-press-sm fixed left-4 top-4 z-30 flex h-11 w-11 cursor-pointer items-center justify-center bg-[#ffd84d] md:hidden',
          mobileOpen && 'pointer-events-none opacity-0',
        )}
        onClick={() => setMobileOpen(true)}
        aria-label='Buka menu navigasi'
      >
        <Menu className='h-5 w-5' strokeWidth={3} aria-hidden />
      </button>

      <div className='min-h-screen min-w-0 flex-1 bg-gray-50 md:ml-0'>
        <main className='p-4 pt-16 md:p-6 md:pt-6'>{children}</main>
      </div>
    </div>
  )
}
