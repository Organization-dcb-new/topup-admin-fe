import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'

import { useAuthUser } from '@/lib/auth'
import { Navbar } from './navbar'
import { Sidebar } from './sidebar'

const COLLAPSED_STORAGE_KEY = 'pg_sidebar_collapsed'

function getStoredCollapsed(): boolean {
  try {
    return localStorage.getItem(COLLAPSED_STORAGE_KEY) === '1'
  } catch {
    return false
  }
}

export function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [collapsed, setCollapsed] = useState(getStoredCollapsed)
  const [mobileOpen, setMobileOpen] = useState(false)
  const navigate = useNavigate()

  const { isMfaRequired, isAuthenticated, isLoading } = useAuthUser()

  useEffect(() => {
    if (!isLoading) {
      if (!isAuthenticated && !isMfaRequired) {
        navigate('/login', { replace: true })
      } else if (isMfaRequired) {
        navigate('/verify-otp', { replace: true })
      }
    }
  }, [isAuthenticated, isMfaRequired, isLoading, navigate])

  const toggleCollapse = () => {
    setCollapsed((prev) => {
      const next = !prev
      try {
        localStorage.setItem(COLLAPSED_STORAGE_KEY, next ? '1' : '0')
      } catch {
        /* ignore */
      }
      return next
    })
  }

  if (isLoading || (!isAuthenticated && !isMfaRequired) || isMfaRequired) return null

  return (
    <div className='flex min-h-dvh bg-muted/30'>
      <Sidebar
        collapsed={collapsed}
        mobileOpen={mobileOpen}
        onToggleCollapse={toggleCollapse}
        onCloseMobile={() => setMobileOpen(false)}
      />

      <div className='flex min-h-dvh min-w-0 flex-1 flex-col'>
        <Navbar onOpenMobile={() => setMobileOpen(true)} />
        <main className='min-w-0 flex-1 p-4 md:p-6'>{children}</main>
      </div>
    </div>
  )
}
