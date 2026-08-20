import { useState } from 'react'
import { useLocation } from 'react-router-dom'

import { useDocumentTitle } from '@/hooks/useDocumentTitle'
import { pageTitleMap } from '@/lib/title-map'
import { cn } from '@/lib/utils'
import { Menu } from 'lucide-react'
import { Sidebar } from './sidebar'

export function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [collapsed, setCollapsed] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const { pathname } = useLocation()
  useDocumentTitle(pageTitleMap[pathname])

  /**
   * Tidak ada pengecekan auth di sini. RoleGuard yang menjaga setiap route,
   * dan duplikasinya dulu memakai window.location.href sehingga setiap
   * perpindahan berubah jadi reload dokumen penuh plus layar putih.
   */
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

      <div className='nb nb-surface min-h-screen min-w-0 flex-1 md:ml-0'>
        <main className='p-4 pt-16 md:p-6 md:pt-6'>{children}</main>
      </div>
    </div>
  )
}
