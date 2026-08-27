import logoUrl from '@/assets/logo.png'
import { sidebarMenus, type SidebarMenu } from '@/constants/sidebar-menu'
import { filterMenusByPermission } from '@/lib/sidebar-access'
import { SIDEBAR_I18N_KEY_BY_TEXT } from '@/i18n/sidebar-label-keys'
import { Button } from '@/components/ui/button'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import type { SidebarProps } from '@/types/sidebar'
import { usePermission } from '@/hooks/usePermission'
import { cn } from '@/lib/utils'
import { ChevronDown, ChevronLeft, X } from 'lucide-react'
import {
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
  type ReactElement,
  type ReactNode,
} from 'react'
import { useTranslation } from 'react-i18next'
import { Link, useLocation } from 'react-router-dom'
import { SidebarHealthIndicator } from './SidebarHealthIndicator'

/** Kelas fokus keyboard yang seragam untuk semua item navigasi */
const FOCUS_RING =
  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1 focus-visible:ring-offset-background'

/** Satu jam untuk semua yang ikut bergerak saat rail dilipat: lebar <aside>,
 *  padding, dan jepitan label. Durasi atau kurva yang beda membuat potongan
 *  sidebar mendarat di waktu yang berbeda-beda — itu yang terbaca "patah". */
const RAIL_MOTION = 'duration-300 ease-out motion-reduce:transition-none'

const MD_UP_QUERY = '(min-width: 768px)'

function useSidebarCopy() {
  const { t } = useTranslation('common')
  return (original: string) => {
    const key = SIDEBAR_I18N_KEY_BY_TEXT[original]
    return key ? t(key) : original
  }
}

function useIsMdUp() {
  // Dibaca saat inisialisasi, bukan di useEffect: kalau tidak, rail yang
  // tersimpan collapsed akan melebar dulu lalu menyusut tiap kali navigasi
  const [isMdUp, setIsMdUp] = useState(
    () => typeof window !== 'undefined' && window.matchMedia(MD_UP_QUERY).matches,
  )
  useEffect(() => {
    const mq = window.matchMedia(MD_UP_QUERY)
    const apply = () => setIsMdUp(mq.matches)
    apply()
    mq.addEventListener('change', apply)
    return () => mq.removeEventListener('change', apply)
  }, [])
  return isMdUp
}

/** Path menu terpanjang yang cocok dengan URL — meniru pencocokan NavLink
 *  tapi memastikan hanya SATU item yang ditandai aktif (mis. `/products`
 *  tidak ikut menyala saat berada di `/products/callback-logs`). */
function resolveActiveMenuPath(paths: string[], pathname: string) {
  return (
    paths
      .filter((p) => pathname === p || pathname.startsWith(p + '/'))
      .sort((a, b) => b.length - a.length)[0] ?? null
  )
}

const Monogram = ({ className }: { className?: string }) => (
  <img
    src={logoUrl}
    alt=''
    className={cn('h-8 w-8 shrink-0 object-contain', className)}
    aria-hidden
    draggable={false}
  />
)

/** Teks yang tidak pernah dilepas dari DOM saat rail menyempit: dijepit trek
 *  grid 1fr→0fr lalu dipudarkan, jadi ikut jam yang sama dengan lebar
 *  <aside>. Melepasnya lewat `{!collapsed && ...}` membuat React membuang
 *  node-nya di frame 0 — teks lenyap seketika sementara sidebarnya masih
 *  jalan 300ms lagi. Sengaja `overflow-hidden whitespace-nowrap`, bukan
 *  `truncate`: elipsis dihitung ulang tiap frame saat trek menyempit dan
 *  terbaca seperti teks yang sedang diketik ulang. */
function ClipTrack({
  collapsed,
  className,
  innerClassName,
  children,
}: {
  collapsed: boolean
  className?: string
  innerClassName?: string
  children: ReactNode
}) {
  return (
    <span
      className={cn(
        'grid grid-cols-[1fr] transition-[grid-template-columns,margin,opacity]',
        RAIL_MOTION,
        collapsed && 'md:grid-cols-[0fr] md:opacity-0',
        className,
      )}
    >
      <span className={cn('overflow-hidden whitespace-nowrap', innerClassName)}>
        {children}
      </span>
    </span>
  )
}

/** Tooltip rail. `Tooltip` SELALU dirender supaya tipe elemennya tidak
 *  berubah saat rail dilipat: React tidak pernah merekonsiliasi antar tipe
 *  elemen yang berbeda, jadi versi lama (`if (!enabled) return children`)
 *  membuang lalu membuat ulang <a> tiap item — dan transisi CSS butuh nilai
 *  awal di node yang sama untuk bisa jalan. `enabled` sekarang cuma mengunci
 *  `open` ke false. Sengaja fully controlled: bergonta-ganti antara
 *  controlled dan uncontrolled memicu peringatan Radix. */
const RailTooltip = ({
  label,
  enabled,
  children,
}: {
  label: string
  enabled: boolean
  children: ReactElement
}) => {
  const [open, setOpen] = useState(false)
  return (
    <Tooltip open={enabled && open} onOpenChange={setOpen}>
      <TooltipTrigger asChild>{children}</TooltipTrigger>
      <TooltipContent side='right'>{label}</TooltipContent>
    </Tooltip>
  )
}

export function Sidebar({
  collapsed,
  mobileOpen,
  onToggleCollapse,
  onCloseMobile,
}: SidebarProps) {
  const { pathname } = useLocation()
  const { can } = usePermission()
  const { t } = useTranslation('common')
  const tr = useSidebarCopy()
  const isMdUp = useIsMdUp()
  const railCollapsed = collapsed && isMdUp
  const navRef = useRef<HTMLElement>(null)
  const touchStartX = useRef<number | null>(null)

  const filteredMenus = useMemo(
    () => filterMenusByPermission(sidebarMenus, can),
    [can],
  )

  const activeMenuPath = useMemo(() => {
    const paths = filteredMenus.flatMap((section) =>
      section.menus.flatMap((menu) => [
        ...(menu.path ? [menu.path] : []),
        ...(menu.children ?? []).flatMap((c) => (c.path ? [c.path] : [])),
      ]),
    )
    return resolveActiveMenuPath(paths, pathname)
  }, [filteredMenus, pathname])

  // Menu role dev cukup panjang; pastikan item aktif terlihat tanpa scroll manual
  useEffect(() => {
    navRef.current
      ?.querySelector('[data-active="true"]')
      ?.scrollIntoView({ block: 'nearest' })
  }, [pathname])

  // Drawer mobile yang tertutup tetap ada di DOM (agar bisa dianimasikan),
  // jadi harus dinonaktifkan supaya tidak ikut urutan tab & pembaca layar
  const isDrawerHidden = !isMdUp && !mobileOpen

  return (
    // Tooltip baru boleh muncul setelah rail berhenti bergerak; bawaan 200ms
    // membukanya 100ms sebelum transisi lebar selesai, menempel pada trigger
    // yang masih berjalan.
    <TooltipProvider delayDuration={400}>
      <div
        className={cn(
          'fixed inset-0 z-40 bg-foreground/40 backdrop-blur-xs transition-opacity md:hidden',
          RAIL_MOTION,
          mobileOpen ? 'opacity-100' : 'pointer-events-none opacity-0',
        )}
        onClick={onCloseMobile}
        aria-hidden
      />

      <aside
        inert={isDrawerHidden || undefined}
        // Geser ke kiri untuk menutup drawer di layar sentuh
        onTouchStart={(e) => {
          touchStartX.current = e.touches[0].clientX
        }}
        onTouchEnd={(e) => {
          const startX = touchStartX.current
          touchStartX.current = null
          if (startX === null) return
          if (startX - e.changedTouches[0].clientX > 60) onCloseMobile()
        }}
        className={cn(
          'z-50 flex min-h-0 flex-col overflow-hidden border-r border-border bg-background transition-[width,transform]',
          RAIL_MOTION,
          'max-md:fixed max-md:inset-y-0 max-md:left-0 max-md:max-h-dvh max-md:shadow-xl',
          'w-64 max-md:max-w-[min(100vw-1rem,16rem)]',
          railCollapsed && 'md:w-20',
          mobileOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0',
          'md:sticky md:top-0 md:h-screen md:max-h-screen md:shrink-0 md:self-start md:max-w-none',
        )}
      >
        {/* Header tidak lagi ditukar lewat ternary. Susunannya tetap satu baris
            di kedua mode; hanya padding, jepitan teks, dan `inert` yang
            berubah — jadi logo bergeser monoton mengikuti sisi kiri sidebar,
            bukan melompat ke tengah dulu lalu balik lagi. */}
        <div
          className={cn(
            'relative flex h-14 shrink-0 items-center border-b border-border px-4 transition-[padding] md:h-16',
            RAIL_MOTION,
            railCollapsed && 'md:px-5.75',
          )}
        >
          {/* Logo merangkap tombol "perluas" saat rail. Di mode lebar ia
              `inert` — tak fokusabel, tak diumumkan, tak bisa diklik —
              sehingga tetap hanya ada SATU toggle aktif kapan pun, tanpa
              perlu menukar elemen. */}
          <RailTooltip label={t('sidebar.expandRail')} enabled={railCollapsed}>
            <button
              type='button'
              inert={!railCollapsed || undefined}
              onClick={onToggleCollapse}
              aria-label={t('sidebar.expandRail')}
              className={cn(
                'shrink-0 cursor-pointer rounded-lg transition-transform duration-200 ease-out hover:scale-105 active:scale-95 motion-reduce:transition-none motion-reduce:hover:scale-100 motion-reduce:active:scale-100',
                FOCUS_RING,
              )}
            >
              <Monogram />
            </button>
          </RailTooltip>

          <ClipTrack
            collapsed={railCollapsed}
            className={cn('ml-2.5 min-w-0', railCollapsed && 'md:ml-0')}
            innerClassName='text-base font-extrabold tracking-tight text-foreground'
          >
            Pakar
            <span className='bg-linear-to-r from-indigo-500 to-violet-600 bg-clip-text text-transparent'>
              Gaming
            </span>
          </ClipTrack>

          <ClipTrack collapsed={railCollapsed} className='ml-auto'>
            <Button
              type='button'
              variant='ghost'
              size='icon'
              inert={railCollapsed || undefined}
              onClick={onToggleCollapse}
              className='hidden h-8 w-8 shrink-0 cursor-pointer text-muted-foreground transition-colors duration-200 hover:bg-muted hover:text-foreground md:flex'
              aria-label={t('sidebar.collapseRail')}
            >
              <ChevronLeft className='h-4 w-4' aria-hidden />
            </Button>
          </ClipTrack>

          <Button
            type='button'
            variant='ghost'
            size='icon'
            className='absolute right-2 top-1/2 -translate-y-1/2 md:hidden'
            onClick={onCloseMobile}
            aria-label={t('sidebar.closeMenu')}
          >
            <X className='h-4 w-4' aria-hidden />
          </Button>
        </div>

        {/* Padding nav ikut beranimasi, bukan melompat: <nav> adalah node yang
            bertahan, jadi transisi padding di sini benar-benar jalan dan
            membawa seluruh kolom ikon ke tengah rail. `scrollbar-gutter`
            dipesan karena tinggi isi nav berubah selama transisi (submenu
            ikut menutup) — bar yang muncul/hilang di tengah jalan akan
            menggeser kotak isi dan menata ulang semua item. */}
        <nav
          ref={navRef}
          aria-label={t('sidebar.navigationAria')}
          className={cn(
            'custom-scrollbar min-h-0 flex-1 space-y-2 overflow-y-auto overflow-x-hidden overscroll-y-contain px-3 py-4 [scrollbar-gutter:stable] transition-[padding]',
            RAIL_MOTION,
            railCollapsed && 'md:px-4.5',
          )}
        >
          {filteredMenus.map((section, idx) => (
            <div
              key={section.title ?? idx}
              className={cn(
                'transition-colors',
                RAIL_MOTION,
                // Garis pemisah selalu ada (1px, tidak menggeser layout);
                // hanya warnanya yang beranimasi, jadi tak ada lompatan
                // vertikal saat judul seksi dijepit habis.
                idx > 0 && 'border-t border-transparent pt-3',
                idx > 0 && railCollapsed && 'md:border-border',
              )}
            >
              {section.title && (
                <div
                  className={cn(
                    'grid grid-rows-[1fr] transition-[grid-template-rows,opacity]',
                    RAIL_MOTION,
                    railCollapsed && 'md:grid-rows-[0fr] md:opacity-0',
                  )}
                >
                  <p className='overflow-hidden px-3 pb-2 text-[10px] font-bold uppercase tracking-[0.14em] text-muted-foreground/70'>
                    {tr(section.title)}
                  </p>
                </div>
              )}
              <div className='flex flex-col gap-0.5'>
                {section.menus.map((menu) => (
                  <NavItem
                    key={menu.label}
                    menu={menu}
                    collapsed={railCollapsed}
                    pathname={pathname}
                    activeMenuPath={activeMenuPath}
                    onNavigate={() => onCloseMobile()}
                    tr={tr}
                  />
                ))}
              </div>
            </div>
          ))}
        </nav>

        {/* Padding vertikal dibuat tetap: `p-2` ↔ `p-3` memendekkan footer 8px
            dalam satu frame, dan itu langsung menambah tinggi nav di atasnya —
            gerakan vertikal yang tidak diminta pada gestur horizontal. */}
        <div
          className={cn(
            'shrink-0 border-t border-border bg-muted/40 px-3 py-3 transition-[padding]',
            RAIL_MOTION,
            railCollapsed && 'md:px-4.5',
          )}
        >
          <SidebarHealthIndicator collapsed={railCollapsed} />
        </div>
      </aside>
    </TooltipProvider>
  )
}

function NavItem({
  menu,
  collapsed,
  pathname,
  activeMenuPath,
  onNavigate,
  tr,
}: {
  menu: SidebarMenu
  collapsed: boolean
  pathname: string
  activeMenuPath: string | null
  onNavigate: () => void
  tr: (original: string) => string
}) {
  const hasChildren = !!menu.children?.length
  const isChildActive = menu.children?.some(
    (child) => !!child.path && child.path === activeMenuPath,
  )
  // Default terbuka saat anaknya aktif; toggle manual hanya berlaku untuk
  // pathname saat itu, jadi navigasi berikutnya kembali ke perilaku otomatis
  const [override, setOverride] = useState<{
    path: string
    open: boolean
  } | null>(null)
  const [flyoutOpen, setFlyoutOpen] = useState(false)
  const accordionId = useId()
  const isOpen = override?.path === pathname ? override.open : !!isChildActive
  const toggleOpen = () => setOverride({ path: pathname, open: !isOpen })

  if (hasChildren) {
    // Akordeon hanya hidup di mode lebar, tapi saat rail ia DITUTUP lewat CSS
    // dan bukan dilepas dari DOM — versi lama menukar seluruh subpohon dengan
    // Popover, jadi submenu yang terbuka lenyap dalam satu frame dan semua
    // yang di bawahnya menyentak ke atas.
    const accordionOpen = isOpen && !collapsed
    return (
      <Popover
        open={collapsed && flyoutOpen}
        onOpenChange={(next) => setFlyoutOpen(collapsed && next)}
      >
        <div className='space-y-0.5'>
          <RailTooltip label={tr(menu.label)} enabled={collapsed}>
            <PopoverTrigger asChild>
              <button
                type='button'
                // Saat rail, PopoverTrigger yang membuka flyout — jangan ikut
                // mengubah state akordeon supaya posisinya utuh saat dilebarkan
                onClick={() => {
                  if (!collapsed) toggleOpen()
                }}
                aria-expanded={collapsed ? flyoutOpen : isOpen}
                aria-haspopup={collapsed ? 'dialog' : undefined}
                {...(collapsed ? {} : { 'aria-controls': accordionId })}
                data-active={(collapsed && isChildActive) || undefined}
                className={cn(
                  'flex w-full cursor-pointer items-center rounded-lg px-3 py-2 text-sm transition-[color,background-color,scale] duration-200 ease-out hover:bg-muted active:scale-[0.98] motion-reduce:transition-none motion-reduce:active:scale-100',
                  FOCUS_RING,
                  isChildActive
                    ? 'font-semibold text-foreground'
                    : 'text-muted-foreground hover:text-foreground',
                  collapsed && isChildActive && 'bg-primary/10 text-primary',
                )}
              >
                <menu.icon
                  className={cn(
                    'h-4.5 w-4.5 shrink-0 transition-colors duration-200',
                    isChildActive ? 'text-primary' : 'text-muted-foreground',
                  )}
                  aria-hidden
                />
                <ClipTrack
                  collapsed={collapsed}
                  className={cn('ml-3 min-w-0', collapsed && 'md:ml-0')}
                >
                  {tr(menu.label)}
                </ClipTrack>
                <ClipTrack
                  collapsed={collapsed}
                  className='ml-auto'
                  innerClassName='flex items-center gap-1.5'
                >
                  {/* Jejak "kamu di sini" saat grup sengaja ditutup user */}
                  {!isOpen && isChildActive && (
                    <span
                      className='h-1.5 w-1.5 shrink-0 rounded-full bg-primary'
                      aria-hidden
                    />
                  )}
                  <ChevronDown
                    className={cn(
                      'h-3.5 w-3.5 shrink-0 text-muted-foreground/70 transition-transform',
                      RAIL_MOTION,
                      accordionOpen && 'rotate-180',
                    )}
                    aria-hidden
                  />
                </ClipTrack>
              </button>
            </PopoverTrigger>
          </RailTooltip>

          {/* Grid-rows 0fr→1fr: animasi tinggi submenu yang mulus tanpa JS.
              `inert` saat tertutup — clipping CSS saja tidak mengeluarkan
              isinya dari urutan tab maupun pembaca layar. */}
          <div
            id={accordionId}
            inert={!accordionOpen || undefined}
            className={cn(
              'grid transition-[grid-template-rows]',
              RAIL_MOTION,
              accordionOpen ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]',
            )}
          >
            <div className='overflow-hidden'>
              <div className='relative ml-5.5 space-y-0.5 border-l border-border py-1 pl-3'>
                {menu.children?.map((child) => {
                  const isActive = !!child.path && child.path === activeMenuPath
                  return (
                    <Link
                      key={child.label}
                      to={child.path!}
                      onClick={onNavigate}
                      aria-current={isActive ? 'page' : undefined}
                      className={cn(
                        'relative block rounded-lg py-1.5 pl-3 pr-2 text-xs transition-[color,background-color,translate] duration-200 ease-out motion-reduce:transition-none',
                        FOCUS_RING,
                        isActive
                          ? 'bg-primary/8 font-semibold text-primary'
                          : 'text-muted-foreground hover:translate-x-0.5 hover:bg-muted hover:text-foreground motion-reduce:hover:translate-x-0',
                      )}
                    >
                      {isActive && (
                        <span
                          data-active='true'
                          className='absolute -left-3.25 top-1/2 h-4 w-0.5 -translate-y-1/2 rounded-full bg-primary'
                          aria-hidden
                        />
                      )}
                      {tr(child.label)}
                    </Link>
                  )
                })}
              </div>
            </div>
          </div>
        </div>

        <PopoverContent
          side='right'
          align='start'
          sideOffset={12}
          className='z-60 w-56 rounded-xl p-2 shadow-lg'
          onOpenAutoFocus={(e) => e.preventDefault()}
        >
          <p className='border-b border-border/60 px-2 pb-2 text-[10px] font-bold uppercase tracking-[0.14em] text-muted-foreground'>
            {tr(menu.label)}
          </p>
          <div className='mt-1.5 flex flex-col gap-0.5'>
            {menu.children?.map((child) => {
              const isActive = !!child.path && child.path === activeMenuPath
              return (
                <Link
                  key={child.label}
                  to={child.path!}
                  onClick={onNavigate}
                  aria-current={isActive ? 'page' : undefined}
                  className={cn(
                    'rounded-lg px-2.5 py-2 text-xs transition-colors duration-200 ease-out motion-reduce:transition-none',
                    FOCUS_RING,
                    isActive
                      ? 'bg-primary/10 font-semibold text-primary'
                      : 'text-foreground/70 hover:bg-muted hover:text-foreground',
                  )}
                >
                  {tr(child.label)}
                </Link>
              )
            })}
          </div>
        </PopoverContent>
      </Popover>
    )
  }

  const isActive = !!menu.path && menu.path === activeMenuPath

  // Kotak item sengaja SAMA PERSIS di kedua mode (`w-full px-3 py-2`). Versi
  // lama menukar `w-full` ↔ `h-10 w-10 mx-auto`, dan `height: auto` maupun
  // `margin-inline: auto` tidak bisa diinterpolasi — CSS membaliknya mentah di
  // tengah durasi. Sekarang lebar item hanya mengikuti induknya: layout biasa.
  const leaf = (
    <Link
      to={menu.path ?? '#'}
      onClick={onNavigate}
      aria-current={isActive ? 'page' : undefined}
      data-active={isActive || undefined}
      className={cn(
        'relative flex w-full items-center rounded-lg px-3 py-2 text-sm transition-[color,background-color,scale,translate] duration-200 ease-out active:scale-[0.98] motion-reduce:transition-none motion-reduce:active:scale-100',
        FOCUS_RING,
        isActive
          ? 'bg-primary/10 font-semibold text-primary'
          : 'text-muted-foreground hover:bg-muted hover:text-foreground',
        !isActive &&
          !collapsed &&
          'hover:translate-x-0.5 motion-reduce:hover:translate-x-0',
      )}
    >
      {isActive && (
        <span
          className={cn(
            'absolute left-0 top-1/2 h-5 w-0.75 -translate-y-1/2 rounded-full bg-primary transition-opacity',
            RAIL_MOTION,
            collapsed && 'md:opacity-0',
          )}
          aria-hidden
        />
      )}
      <menu.icon
        className={cn(
          'h-4.5 w-4.5 shrink-0 transition-colors duration-200',
          isActive ? 'text-primary' : 'text-muted-foreground',
        )}
        aria-hidden
      />
      <ClipTrack
        collapsed={collapsed}
        className={cn('ml-3 min-w-0', collapsed && 'md:ml-0')}
      >
        {tr(menu.label)}
      </ClipTrack>
    </Link>
  )

  return (
    <RailTooltip label={tr(menu.label)} enabled={collapsed}>
      {leaf}
    </RailTooltip>
  )
}
