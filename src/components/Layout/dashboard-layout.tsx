import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'

import { Skeleton } from '@/components/ui/skeleton'
import { useAuthUser } from '@/lib/auth'
import { IdleTimeout } from './IdleTimeout'
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

/** Rangka layout saat sesi masih diverifikasi — mencegah kedipan layar kosong */
function LayoutSkeleton() {
  return (
    <div className='flex min-h-dvh bg-muted/30' aria-hidden>
      <aside className='hidden w-64 shrink-0 flex-col gap-6 border-r border-border bg-background p-4 md:flex'>
        <div className='flex items-center gap-2.5'>
          <Skeleton className='h-8 w-8 rounded-lg' />
          <Skeleton className='h-4 w-28' />
        </div>
        <div className='space-y-2'>
          {Array.from({ length: 8 }).map((_, i) => (
            <Skeleton key={i} className='h-8 w-full rounded-lg' />
          ))}
        </div>
      </aside>
      <div className='flex min-w-0 flex-1 flex-col'>
        <div className='flex h-14 items-center gap-3 border-b border-border bg-background px-4 md:h-16 md:px-6'>
          <Skeleton className='h-4 w-32' />
          <Skeleton className='ml-auto h-8 w-8 rounded-full' />
        </div>
        <div className='space-y-4 p-4 md:p-6'>
          <Skeleton className='h-28 w-full rounded-xl' />
          <Skeleton className='h-64 w-full rounded-xl' />
        </div>
      </div>
    </div>
  )
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

  if (isLoading) return <LayoutSkeleton />
  if (!isAuthenticated || isMfaRequired) return null

  return (
    <div className='flex min-h-dvh bg-muted/30'>
      <IdleTimeout />
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
