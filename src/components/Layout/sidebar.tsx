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
import { useEffect, useMemo, useRef, useState, type ReactElement } from 'react'
import { useTranslation } from 'react-i18next'
import { Link, useLocation } from 'react-router-dom'
import { SidebarHealthIndicator } from './SidebarHealthIndicator'

/** Kelas fokus keyboard yang seragam untuk semua item navigasi */
const FOCUS_RING =
  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1 focus-visible:ring-offset-background'

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
  <span
    className={cn(
      'flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-linear-to-br from-indigo-500 to-violet-600 text-[11px] font-black tracking-tight text-white shadow-sm shadow-indigo-500/25',
      className,
    )}
    aria-hidden
  >
    PG
  </span>
)

/** Membungkus anak dengan tooltip hanya saat rail menyempit */
const RailTooltip = ({
  label,
  enabled,
  children,
}: {
  label: string
  enabled: boolean
  children: ReactElement
}) => {
  if (!enabled) return children
  return (
    <Tooltip>
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
    <TooltipProvider>
      <div
        className={cn(
          'fixed inset-0 z-40 bg-foreground/40 backdrop-blur-xs transition-opacity duration-300 motion-reduce:transition-none md:hidden',
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
          'z-50 flex min-h-0 flex-col overflow-hidden border-r border-border bg-background transition-[width,transform] duration-300 ease-out motion-reduce:transition-none',
          'max-md:fixed max-md:inset-y-0 max-md:left-0 max-md:max-h-dvh max-md:shadow-xl',
          'w-64 max-md:max-w-[min(100vw-1rem,16rem)]',
          railCollapsed && 'md:w-20',
          mobileOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0',
          'md:sticky md:top-0 md:h-screen md:max-h-screen md:shrink-0 md:self-start md:max-w-none',
        )}
      >
        <div
          className={cn(
            'relative flex h-14 shrink-0 items-center border-b border-border md:h-16',
            railCollapsed ? 'justify-center px-2' : 'justify-between px-4',
          )}
        >
          {railCollapsed ? (
            <RailTooltip label={t('sidebar.expandRail')} enabled>
              <button
                type='button'
                onClick={onToggleCollapse}
                className={cn(
                  'cursor-pointer rounded-lg transition-transform duration-200 hover:scale-105 active:scale-95 motion-reduce:transition-none motion-reduce:hover:scale-100',
                  FOCUS_RING,
                )}
                aria-label={t('sidebar.expandRail')}
              >
                <Monogram />
              </button>
            </RailTooltip>
          ) : (
            <>
              <div className='flex min-w-0 items-center gap-2.5'>
                <Monogram />
                <span className='min-w-0 truncate text-base font-extrabold tracking-tight text-foreground'>
                  Pakar
                  <span className='bg-linear-to-r from-indigo-500 to-violet-600 bg-clip-text text-transparent'>
                    Gaming
                  </span>
                </span>
              </div>

              <Button
                type='button'
                variant='ghost'
                size='icon'
                onClick={onToggleCollapse}
                className='hidden h-8 w-8 shrink-0 cursor-pointer text-muted-foreground transition-colors duration-200 hover:bg-muted hover:text-foreground md:flex'
                aria-label={t('sidebar.collapseRail')}
              >
                <ChevronLeft className='h-4 w-4' aria-hidden />
              </Button>
            </>
          )}

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

        <nav
          ref={navRef}
          aria-label={t('sidebar.navigationAria')}
          className={cn(
            'custom-scrollbar min-h-0 flex-1 space-y-5 overflow-y-auto overflow-x-hidden overscroll-y-contain py-4',
            railCollapsed ? 'px-2 md:px-1.5' : 'px-3',
          )}
        >
          {filteredMenus.map((section, idx) => (
            <div
              key={section.title ?? idx}
              className={cn(
                railCollapsed && idx > 0 && 'border-t border-border pt-3',
              )}
            >
              {!railCollapsed && section.title && (
                <p className='mb-2 px-3 text-[10px] font-bold uppercase tracking-[0.14em] text-muted-foreground/70'>
                  {tr(section.title)}
                </p>
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

        <div
          className={cn(
            'shrink-0 border-t border-border bg-muted/40',
            railCollapsed ? 'p-2' : 'p-3',
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
  const isOpen = override?.path === pathname ? override.open : !!isChildActive
  const toggleOpen = () => setOverride({ path: pathname, open: !isOpen })

  if (hasChildren && collapsed) {
    return (
      <Popover>
        <RailTooltip label={tr(menu.label)} enabled>
          <PopoverTrigger asChild>
            <button
              type='button'
              data-active={isChildActive || undefined}
              className={cn(
                'mx-auto flex h-10 w-10 shrink-0 cursor-pointer items-center justify-center rounded-xl transition-all duration-200 active:scale-95 motion-reduce:transition-none',
                FOCUS_RING,
                isChildActive
                  ? 'bg-primary/10 text-primary'
                  : 'text-muted-foreground hover:bg-muted hover:text-foreground',
              )}
              aria-haspopup='dialog'
              aria-label={tr(menu.label)}
            >
              <menu.icon className='h-4.5 w-4.5 shrink-0' aria-hidden />
            </button>
          </PopoverTrigger>
        </RailTooltip>
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
                    'rounded-lg px-2.5 py-2 text-xs transition-all duration-200 motion-reduce:transition-none',
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

  if (hasChildren && !collapsed) {
    return (
      <div className='space-y-0.5'>
        <button
          type='button'
          onClick={toggleOpen}
          className={cn(
            'flex w-full cursor-pointer items-center justify-between rounded-lg px-3 py-2 text-sm transition-all duration-200 hover:bg-muted motion-reduce:transition-none',
            FOCUS_RING,
            isChildActive
              ? 'font-semibold text-foreground'
              : 'text-muted-foreground hover:text-foreground',
          )}
          aria-expanded={isOpen}
        >
          <div className='flex min-w-0 items-center gap-3'>
            <menu.icon
              className={cn(
                'h-4.5 w-4.5 shrink-0 transition-colors duration-200',
                isChildActive ? 'text-primary' : 'text-muted-foreground',
              )}
              aria-hidden
            />
            <span className='truncate'>{tr(menu.label)}</span>
          </div>
          <span className='flex shrink-0 items-center gap-1.5'>
            {/* Jejak "kamu di sini" saat grup sengaja ditutup user */}
            {!isOpen && isChildActive && (
              <span className='h-1.5 w-1.5 rounded-full bg-primary' aria-hidden />
            )}
            <ChevronDown
              className={cn(
                'h-3.5 w-3.5 text-muted-foreground/70 transition-transform duration-300 motion-reduce:transition-none',
                isOpen && 'rotate-180',
              )}
              aria-hidden
            />
          </span>
        </button>
        {/* Grid-rows 0fr→1fr: animasi tinggi submenu yang mulus tanpa JS.
            `inert` saat tertutup — clipping CSS saja tidak mengeluarkan isinya
            dari urutan tab maupun pembaca layar. */}
        <div
          inert={!isOpen || undefined}
          className={cn(
            'grid transition-[grid-template-rows] duration-300 ease-out motion-reduce:transition-none',
            isOpen ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]',
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
                      'relative block rounded-lg py-1.5 pl-3 pr-2 text-xs transition-all duration-200 motion-reduce:transition-none',
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
    )
  }

  const isActive = !!menu.path && menu.path === activeMenuPath

  const leaf = (
    <Link
      to={menu.path ?? '#'}
      onClick={onNavigate}
      aria-label={collapsed ? tr(menu.label) : undefined}
      aria-current={isActive ? 'page' : undefined}
      data-active={isActive || undefined}
      className={cn(
        'relative flex items-center transition-all duration-200 active:scale-[0.98] motion-reduce:transition-none',
        FOCUS_RING,
        collapsed
          ? 'mx-auto h-10 w-10 shrink-0 justify-center rounded-xl p-0'
          : 'w-full gap-3 rounded-lg px-3 py-2 text-sm',
        isActive
          ? 'bg-primary/10 font-semibold text-primary'
          : 'text-muted-foreground hover:bg-muted hover:text-foreground',
        !isActive && !collapsed && 'hover:translate-x-0.5 motion-reduce:hover:translate-x-0',
      )}
    >
      {isActive && !collapsed && (
        <span
          className='absolute left-0 top-1/2 h-5 w-0.75 -translate-y-1/2 rounded-full bg-primary'
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
      {!collapsed && <span className='min-w-0 truncate'>{tr(menu.label)}</span>}
    </Link>
  )

  return (
    <RailTooltip label={tr(menu.label)} enabled={collapsed}>
      {leaf}
    </RailTooltip>
  )
}
