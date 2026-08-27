import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'

import { Skeleton } from '@/components/ui/skeleton'
import { cn } from '@/lib/utils'
import { useAuthUser } from '@/lib/auth'
import { ProfileLoadError } from '@/components/Auth/ProfileLoadError'
import { IdleTimeout } from './IdleTimeout'
import { Navbar } from './navbar'
import { Sidebar } from './sidebar'

const COLLAPSED_STORAGE_KEY = 'pg_sidebar_collapsed'

/** Sedikit di atas durasi transisi lebar <aside> (300ms) */
const SHELL_SHIFT_MS = 320

function getStoredCollapsed(): boolean {
  try {
    return localStorage.getItem(COLLAPSED_STORAGE_KEY) === '1'
  } catch {
    return false
  }
}

/** Rangka layout saat sesi masih diverifikasi — mencegah kedipan layar kosong.
 *  Lebarnya ikut preferensi tersimpan; kalau dipatok `w-64`, siapa pun yang
 *  meninggalkan rail dalam keadaan terlipat akan melihat sentakan 256px → 80px
 *  tanpa animasi tiap kali halaman dimuat ulang. */
function LayoutSkeleton({ collapsed }: { collapsed: boolean }) {
  return (
    <div className='flex min-h-dvh bg-muted/30' aria-hidden>
      <aside
        className={cn(
          'hidden shrink-0 flex-col gap-6 border-r border-border bg-background p-4 md:flex',
          collapsed ? 'w-20' : 'w-64',
        )}
      >
        <div className='flex items-center gap-2.5'>
          <Skeleton className='h-8 w-8 rounded-lg' />
          {!collapsed && <Skeleton className='h-4 w-28' />}
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
  const [shifting, setShifting] = useState(false)
  const shiftTimer = useRef<number | null>(null)
  const navigate = useNavigate()

  useEffect(
    () => () => {
      if (shiftTimer.current !== null) window.clearTimeout(shiftTimer.current)
    },
    [],
  )

  const { isMfaRequired, isAuthenticated, isLoading, isError, refetchProfile } =
    useAuthUser()

  useEffect(() => {
    // `isError` menahan redirect: profil yang gagal dimuat belum membuktikan
    // apa pun tentang sesi, dan /login hanya akan memantulkan user balik ke
    // sini begitu request berikutnya berhasil.
    if (!isLoading && !isError) {
      if (!isAuthenticated && !isMfaRequired) {
        navigate('/login', { replace: true })
      } else if (isMfaRequired) {
        navigate('/verify-otp', { replace: true })
      }
    }
  }, [isAuthenticated, isMfaRequired, isLoading, isError, navigate])

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
    // Matikan backdrop-filter selama rail beranimasi. `backdrop-filter`
    // membuang snapshot latarnya tiap kali geometri elemennya berubah, jadi
    // navbar dan header tabel yang lengket diblur ulang di SETIAP frame
    // transisi — biaya GPU terbesar di sini, dan hilangnya tak terlihat
    // selama 300ms di atas lapisan yang sudah 85% legap.
    setShifting(true)
    if (shiftTimer.current !== null) window.clearTimeout(shiftTimer.current)
    shiftTimer.current = window.setTimeout(() => setShifting(false), SHELL_SHIFT_MS)
  }

  if (isLoading) return <LayoutSkeleton collapsed={collapsed} />
  if (isError) return <ProfileLoadError onRetry={refetchProfile} />
  if (!isAuthenticated || isMfaRequired) return null

  return (
    <div
      className='group/shell flex min-h-dvh bg-muted/30'
      data-shell-shift={shifting ? 'on' : undefined}
    >
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
