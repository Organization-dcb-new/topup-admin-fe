import { useEffect, useState, type ReactNode } from 'react'
import { Outlet, useMatches } from 'react-router-dom'
import { useTranslation } from 'react-i18next'

import { useMediaQuery } from '@/hooks/useMediaQuery'
import { useAuthUser } from '@/lib/auth'
import { Navbar } from './navbar'
import { AppShellContext } from './shell-context'
import { Sidebar } from './sidebar'

const COLLAPSED_KEY = 'pg_admin_sidebar_collapsed'

function readCollapsed() {
  try {
    return localStorage.getItem(COLLAPSED_KEY) === '1'
  } catch {
    return false
  }
}

/**
 * Layout route for the dashboard. Mounting the sidebar and navbar once (instead of per page)
 * keeps the collapsed state, open groups and scroll position, and lets animations carry across pages.
 */
export function AppShell() {
  return (
    <AppShellContext.Provider value>
      <AppFrame>
        <Outlet />
      </AppFrame>
    </AppShellContext.Provider>
  )
}

export function AppFrame({ children }: { children: ReactNode }) {
  const { t } = useTranslation()
  const { isAuthenticated } = useAuthUser()
  const isMdUp = useMediaQuery('(min-width: 768px)')
  const routeId = useMatches().at(-1)?.id
  const [collapsed, setCollapsed] = useState(readCollapsed)
  const [mobileOpen, setMobileOpen] = useState(false)

  useEffect(() => {
    if (!mobileOpen) return
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setMobileOpen(false)
    }
    const { overflow } = document.body.style
    document.body.style.overflow = 'hidden'
    window.addEventListener('keydown', onKeyDown)
    return () => {
      document.body.style.overflow = overflow
      window.removeEventListener('keydown', onKeyDown)
    }
  }, [mobileOpen])

  // Guests only ever reach here on the way to a RoleGuard redirect, so skip the chrome.
  if (!isAuthenticated) return <>{children}</>

  // One navbar button: collapses the rail on desktop, opens the drawer on mobile.
  const toggleSidebar = () => {
    if (!isMdUp) return setMobileOpen(true)
    const next = !collapsed
    setCollapsed(next)
    try {
      localStorage.setItem(COLLAPSED_KEY, next ? '1' : '0')
    } catch {
      /* ignore */
    }
  }
  const toggleLabel = !isMdUp
    ? t('sidebar.openMenu')
    : collapsed
      ? t('sidebar.expandRail')
      : t('sidebar.collapseRail')

  return (
    <div className='flex min-h-screen bg-gray-50'>
      <Sidebar
        collapsed={collapsed}
        mobileOpen={mobileOpen}
        onCloseMobile={() => setMobileOpen(false)}
      />

      <div className='flex min-w-0 flex-1 flex-col'>
        <Navbar
          onToggleSidebar={toggleSidebar}
          toggleLabel={toggleLabel}
          sidebarExpanded={isMdUp && !collapsed}
        />
        <main className='flex-1 p-4 md:p-6'>
          {/* Opacity only: a transform here would break `position: fixed` inside pages mid-fade. */}
          <div key={routeId} className='animate-in fade-in duration-300 ease-hud'>
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}
