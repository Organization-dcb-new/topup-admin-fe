import { sidebarMenus, type SidebarMenu } from '@/constants/sidebar-menu'
import { SIDEBAR_I18N_KEY_BY_TEXT } from '@/i18n/sidebar-label-keys'
import { Button } from '@/components/ui/button'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import type { SidebarProps } from '@/types/sidebar'
import { useAuthUser } from '@/lib/auth'
import { cn } from '@/lib/utils'
import { ChevronDown, ChevronLeft, X } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { NavLink, useLocation } from 'react-router-dom'
import { SidebarHealthIndicator } from './SidebarHealthIndicator'

function useSidebarCopy() {
  const { t } = useTranslation('common')
  return (original: string) => {
    const key = SIDEBAR_I18N_KEY_BY_TEXT[original]
    return key ? t(key) : original
  }
}

function useIsMdUp() {
  const [isMdUp, setIsMdUp] = useState(false)
  useEffect(() => {
    const mq = window.matchMedia('(min-width: 768px)')
    const apply = () => setIsMdUp(mq.matches)
    apply()
    mq.addEventListener('change', apply)
    return () => mq.removeEventListener('change', apply)
  }, [])
  return isMdUp
}

const Monogram = ({ className }: { className?: string }) => (
  <span
    className={cn(
      'flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-linear-to-br from-indigo-500 to-violet-600 text-[11px] font-black tracking-tight text-white shadow-md shadow-indigo-500/30',
      className,
    )}
    aria-hidden
  >
    PG
  </span>
)

export function Sidebar({
  collapsed,
  mobileOpen,
  onToggleCollapse,
  onCloseMobile,
}: SidebarProps) {
  const { pathname } = useLocation()
  const { role } = useAuthUser()
  const { t } = useTranslation('common')
  const tr = useSidebarCopy()
  const isMdUp = useIsMdUp()
  const railCollapsed = collapsed && isMdUp

  const NOC_ALLOWED = ['Dasbor', 'Transaksi', 'Ikhtisar', 'Konten', 'Banner', 'Acara', 'Artikel', 'Inventaris', 'Game', 'Produk', 'Kategori produk', 'Produk anomali', 'Field input']
  const DEV_ONLY_LABELS = ['Pembatas laju', 'Pengguna']

  const filteredMenus = sidebarMenus
    .map((section) => ({
      ...section,
      menus: section.menus
        .filter((menu) => {
          if (role === 'dev') return true
          if (role === 'noc' && !NOC_ALLOWED.includes(menu.label)) return false
          if (DEV_ONLY_LABELS.includes(menu.label)) return false
          return true
        })
        .map((menu) => ({
          ...menu,
          children: menu.children?.filter((child) => {
            if (role === 'dev') return true
            if (role === 'noc' && !NOC_ALLOWED.includes(child.label)) return false
            if (DEV_ONLY_LABELS.includes(child.label)) return false
            return true
          }),
        })),
    }))
    .filter((section) => section.menus.length > 0)

  return (
    <>
      <div
        className={cn(
          'fixed inset-0 z-40 bg-black/60 backdrop-blur-xs transition-opacity duration-300 md:hidden',
          mobileOpen ? 'opacity-100' : 'pointer-events-none opacity-0',
        )}
        onClick={onCloseMobile}
        aria-hidden
      />

      <aside
        className={cn(
          'z-50 flex min-h-0 flex-col overflow-hidden border-r border-white/10 bg-zinc-950 text-zinc-300 transition-[width,transform] duration-300 ease-out',
          'max-md:fixed max-md:inset-y-0 max-md:left-0 max-md:max-h-dvh',
          'w-64 max-md:max-w-[min(100vw-1rem,16rem)]',
          railCollapsed && 'md:w-20',
          mobileOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0',
          'md:sticky md:top-0 md:h-screen md:max-h-screen md:shrink-0 md:self-start md:max-w-none',
        )}
      >
        <div
          className={cn(
            'relative flex h-14 shrink-0 items-center border-b border-white/10 md:h-16',
            railCollapsed ? 'justify-center px-2' : 'justify-between px-4',
          )}
        >
          {railCollapsed ? (
            <button
              type='button'
              onClick={onToggleCollapse}
              className='cursor-pointer rounded-lg transition-transform duration-200 hover:scale-105 active:scale-95'
              aria-label={t('sidebar.expandRail')}
              title={t('sidebar.expandRail')}
            >
              <Monogram />
            </button>
          ) : (
            <>
              <div className='flex min-w-0 items-center gap-2.5'>
                <Monogram />
                <span className='min-w-0 truncate text-base font-extrabold tracking-tight text-white'>
                  Pakar
                  <span className='bg-linear-to-r from-indigo-400 to-violet-400 bg-clip-text text-transparent'>
                    Gaming
                  </span>
                </span>
              </div>

              <Button
                type='button'
                variant='ghost'
                size='icon'
                onClick={onToggleCollapse}
                className='hidden h-8 w-8 shrink-0 cursor-pointer text-zinc-500 transition-colors duration-200 hover:bg-white/10 hover:text-white md:flex'
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
            className='absolute right-2 top-1/2 -translate-y-1/2 text-zinc-400 hover:bg-white/10 hover:text-white md:hidden'
            onClick={onCloseMobile}
            aria-label={t('sidebar.closeMenu')}
          >
            <X className='h-4 w-4' aria-hidden />
          </Button>
        </div>

        <nav
          className={cn(
            'custom-scrollbar min-h-0 flex-1 space-y-5 overflow-y-auto overflow-x-hidden overscroll-y-contain py-4',
            railCollapsed ? 'px-2 md:px-1.5' : 'px-3',
          )}
        >
          {filteredMenus.map((section, idx) => (
            <div
              key={idx}
              className={cn(
                railCollapsed && idx > 0 && 'border-t border-white/10 pt-3',
              )}
            >
              {!railCollapsed && section.title && (
                <p className='mb-2 px-3 text-[10px] font-bold uppercase tracking-[0.14em] text-zinc-600'>
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
            'shrink-0 border-t border-white/10 bg-white/3',
            railCollapsed ? 'p-2' : 'p-3',
          )}
        >
          <SidebarHealthIndicator collapsed={railCollapsed} />
        </div>
      </aside>
    </>
  )
}

function NavItem({
  menu,
  collapsed,
  pathname,
  onNavigate,
  tr,
}: {
  menu: SidebarMenu
  collapsed: boolean
  pathname: string
  onNavigate: () => void
  tr: (original: string) => string
}) {
  const hasChildren = !!menu.children?.length
  const isChildActive = menu.children?.some((child) => child.path === pathname)
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
        <PopoverTrigger asChild>
          <button
            type='button'
            className={cn(
              'mx-auto flex h-10 w-10 shrink-0 cursor-pointer items-center justify-center rounded-xl transition-all duration-200 active:scale-95',
              isChildActive
                ? 'bg-indigo-500/20 text-white shadow-md shadow-indigo-500/20'
                : 'text-zinc-500 hover:bg-white/5 hover:text-white',
            )}
            aria-haspopup='dialog'
            aria-label={tr(menu.label)}
            title={tr(menu.label)}
          >
            <menu.icon className='h-4.5 w-4.5 shrink-0' aria-hidden />
          </button>
        </PopoverTrigger>
        <PopoverContent
          side='right'
          align='start'
          sideOffset={12}
          className='z-60 w-56 rounded-xl border-white/10 bg-zinc-950 p-2 text-zinc-300 shadow-xl'
          onOpenAutoFocus={(e) => e.preventDefault()}
        >
          <p className='border-b border-white/10 px-2 pb-2 text-[10px] font-bold uppercase tracking-[0.14em] text-zinc-600'>
            {tr(menu.label)}
          </p>
          <div className='mt-1.5 flex flex-col gap-0.5'>
            {menu.children?.map((child) => (
              <NavLink
                key={child.label}
                to={child.path!}
                onClick={onNavigate}
                className={({ isActive }) =>
                  cn(
                    'rounded-lg px-2.5 py-2 text-xs transition-all duration-200',
                    isActive
                      ? 'bg-indigo-500/15 font-semibold text-indigo-300'
                      : 'text-zinc-400 hover:bg-white/5 hover:text-white',
                  )
                }
              >
                {tr(child.label)}
              </NavLink>
            ))}
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
            'flex w-full cursor-pointer items-center justify-between rounded-lg px-3 py-2 text-sm transition-all duration-200 hover:bg-white/5',
            isChildActive ? 'font-medium text-white' : 'text-zinc-400 hover:text-white',
          )}
          aria-expanded={isOpen}
        >
          <div className='flex min-w-0 items-center gap-3'>
            <menu.icon
              className={cn(
                'h-4.5 w-4.5 shrink-0 transition-colors duration-200',
                isChildActive ? 'text-indigo-400' : 'text-zinc-500',
              )}
              aria-hidden
            />
            <span className='truncate'>{tr(menu.label)}</span>
          </div>
          <ChevronDown
            className={cn(
              'h-3.5 w-3.5 shrink-0 text-zinc-600 transition-transform duration-300',
              isOpen && 'rotate-180',
            )}
            aria-hidden
          />
        </button>
        {/* Grid-rows 0fr→1fr: animasi tinggi submenu yang mulus tanpa JS */}
        <div
          className={cn(
            'grid transition-[grid-template-rows] duration-300 ease-out',
            isOpen ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]',
          )}
        >
          <div className='overflow-hidden'>
            <div className='relative ml-5.5 space-y-0.5 border-l border-white/10 py-1 pl-3'>
              {menu.children?.map((child) => (
                <NavLink
                  key={child.label}
                  to={child.path!}
                  onClick={onNavigate}
                  tabIndex={isOpen ? undefined : -1}
                  className={({ isActive }) =>
                    cn(
                      'relative block rounded-lg py-1.5 pl-3 pr-2 text-xs transition-all duration-200',
                      isActive
                        ? 'bg-indigo-500/15 font-semibold text-indigo-300'
                        : 'text-zinc-500 hover:translate-x-0.5 hover:bg-white/5 hover:text-white',
                    )
                  }
                >
                  {({ isActive }) => (
                    <>
                      {isActive && (
                        <span
                          className='absolute -left-3.25 top-1/2 h-4 w-0.5 -translate-y-1/2 rounded-full bg-indigo-400'
                          aria-hidden
                        />
                      )}
                      {tr(child.label)}
                    </>
                  )}
                </NavLink>
              ))}
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <NavLink
      to={menu.path ?? '#'}
      onClick={onNavigate}
      title={collapsed ? tr(menu.label) : undefined}
      aria-label={collapsed ? tr(menu.label) : undefined}
      className={({ isActive }) =>
        cn(
          'relative flex items-center transition-all duration-200 active:scale-[0.98]',
          collapsed
            ? 'mx-auto h-10 w-10 shrink-0 justify-center rounded-xl p-0'
            : 'w-full gap-3 rounded-lg px-3 py-2 text-sm',
          isActive
            ? 'bg-indigo-500/15 font-medium text-white shadow-md shadow-indigo-500/10'
            : 'text-zinc-400 hover:bg-white/5 hover:text-white',
          !isActive && !collapsed && 'hover:translate-x-0.5',
        )
      }
    >
      {({ isActive }) => (
        <>
          {isActive && !collapsed && (
            <span
              className='absolute left-0 top-1/2 h-5 w-0.75 -translate-y-1/2 rounded-full bg-indigo-400'
              aria-hidden
            />
          )}
          <menu.icon
            className={cn(
              'h-4.5 w-4.5 shrink-0 transition-colors duration-200',
              isActive ? 'text-indigo-400' : 'text-zinc-500',
            )}
            aria-hidden
          />
          {!collapsed && <span className='min-w-0 truncate'>{tr(menu.label)}</span>}
        </>
      )}
    </NavLink>
  )
}
