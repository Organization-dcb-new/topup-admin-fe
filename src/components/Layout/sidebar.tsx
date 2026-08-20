import { sidebarMenus, type SidebarMenu } from '@/constants/sidebar-menu'
import { SIDEBAR_I18N_KEY_BY_TEXT } from '@/i18n/sidebar-label-keys'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import type { SidebarProps } from '@/types/sidebar'
import { resolveApiError } from '@/lib/api-error'
import { logout, useAuthUser } from '@/lib/auth'
import { cn } from '@/lib/utils'
import { ChevronDown, ChevronLeft, Loader2, LogOut, X } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useMutation } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import { useTranslation } from 'react-i18next'
import { NavLink, useLocation, useNavigate } from 'react-router-dom'
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

/** Warna aksen bergilir per section supaya tiap blok punya identitas sendiri. */
const SECTION_ACCENTS = ['bg-[#6fe3f5]', 'bg-[#ff9ed2]', 'bg-[#ff9d3d]']

export function Sidebar({
  collapsed,
  mobileOpen,
  onToggleCollapse,
  onCloseMobile,
}: SidebarProps) {
  const { pathname } = useLocation()
  const { role } = useAuthUser()
  const { t, i18n } = useTranslation('common')
  const tr = useSidebarCopy()
  const [openLogoutModal, setOpenLogoutModal] = useState(false)
  const navigate = useNavigate()

  /**
   * Dulu `logout()` menavigasi sendiri lewat window.location.href sehingga
   * memuat ulang seluruh aplikasi, dan kegagalannya ditelan diam-diam.
   */
  const { mutate: doLogout, isPending: isLoggingOut } = useMutation({
    mutationFn: logout,
    onSuccess: () => {
      setOpenLogoutModal(false)
      toast.success(t('sidebar.logoutSuccess'))
      navigate('/login', { replace: true })
    },
    onError: (err) => toast.error(resolveApiError(err, t, 'sidebar.logoutError')),
  })
  const isMdUp = useIsMdUp()
  const railCollapsed = collapsed && isMdUp
  const isIdLocale = i18n.language === 'id' || i18n.language.startsWith('id')

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
          'fixed inset-0 z-40 bg-[#111]/70 md:hidden transition-opacity duration-300',
          mobileOpen ? 'opacity-100 block' : 'opacity-0 hidden',
        )}
        onClick={onCloseMobile}
        aria-hidden
      />

      <aside
        className={cn(
          'nb z-50 flex min-h-0 flex-col overflow-hidden border-r-4 border-[#111] bg-[#f5f1e8] transition-[width,transform] duration-300 ease-out',
          'max-md:fixed max-md:inset-y-0 max-md:left-0 max-md:max-h-[100dvh]',
          'w-64 max-md:max-w-[min(100vw-1rem,16rem)]',
          railCollapsed && 'md:w-20',
          mobileOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0',
          'md:sticky md:top-0 md:h-screen md:max-h-screen md:shrink-0 md:self-start md:max-w-none',
        )}
      >
        <div
          className={cn(
            'relative flex h-14 shrink-0 items-center border-b-4 border-[#111] bg-[#c9f24d] md:h-16',
            railCollapsed ? 'justify-center px-2' : 'justify-between px-3',
          )}
        >
          {!railCollapsed && (
            <span className='flex min-w-0 items-baseline gap-1 text-base font-black uppercase leading-none tracking-tight md:text-lg'>
              Pakar
              <span className='nb-frame nb-frame-thin nb-sd-sm truncate bg-white px-1.5 py-1'>
                Gaming
              </span>
            </span>
          )}

          <button
            type='button'
            onClick={onToggleCollapse}
            className={cn(
              'nb-frame nb-frame-thin nb-sd-sm nb-press-sm hidden h-8 w-8 shrink-0 cursor-pointer items-center justify-center bg-white md:flex',
              railCollapsed && 'absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2',
            )}
            aria-label={railCollapsed ? t('sidebar.expandRail') : t('sidebar.collapseRail')}
          >
            <ChevronLeft
              className={cn('h-4 w-4 transition-transform', railCollapsed && 'rotate-180')}
              strokeWidth={3}
              aria-hidden
            />
          </button>

          <button
            type='button'
            className='nb-frame nb-frame-thin nb-sd-sm nb-press-sm absolute right-3 top-1/2 flex h-8 w-8 -translate-y-1/2 cursor-pointer items-center justify-center bg-[#ff4d3d] md:hidden'
            onClick={onCloseMobile}
            aria-label={t('sidebar.closeMenu')}
          >
            <X className='h-4 w-4' strokeWidth={3} aria-hidden />
          </button>
        </div>

        <nav
          className={cn(
            'nb-nav min-h-0 flex-1 space-y-4 overflow-y-auto overflow-x-hidden overscroll-y-contain py-4',
            railCollapsed ? 'px-2' : 'px-3',
          )}
        >
          {filteredMenus.map((section, idx) => (
            <div
              key={idx}
              className={cn(
                idx > 0 && 'border-t-4 border-[#111] pt-4',
              )}
            >
              {!railCollapsed && section.title && (
                <p
                  className={cn(
                    'nb-frame nb-frame-thin nb-sd-sm mb-3 inline-block px-2 py-0.5 text-[10px] font-black uppercase tracking-[0.18em]',
                    SECTION_ACCENTS[idx % SECTION_ACCENTS.length],
                  )}
                >
                  {tr(section.title)}
                </p>
              )}
              <div className={cn('flex flex-col', railCollapsed ? 'gap-2' : 'gap-1.5')}>
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
            'shrink-0 space-y-3 border-t-4 border-[#111] bg-white',
            railCollapsed ? 'p-2' : 'p-3',
          )}
        >
          <SidebarHealthIndicator collapsed={railCollapsed} />

          {railCollapsed ? (
            <button
              type='button'
              className='nb-frame nb-frame-thin nb-sd-sm nb-press-sm mx-auto flex h-10 w-10 shrink-0 cursor-pointer select-none items-center justify-center bg-[#6fe3f5] text-xs font-black'
              onClick={() => i18n.changeLanguage(isIdLocale ? 'en' : 'id')}
              title={t('sidebar.languageToggleAria')}
              aria-label={t('sidebar.languageToggleAria')}
            >
              {isIdLocale ? 'ID' : 'EN'}
            </button>
          ) : (
            <div
              className='grid grid-cols-2 gap-2'
              role='group'
              aria-label={t('sidebar.languageToggleAria')}
            >
              {(['id', 'en'] as const).map((lang) => {
                const isActive = lang === 'id' ? isIdLocale : !isIdLocale
                return (
                  <button
                    key={lang}
                    type='button'
                    onClick={() => i18n.changeLanguage(lang)}
                    aria-pressed={isActive}
                    className={cn(
                      'nb-frame nb-frame-thin nb-press-sm h-9 cursor-pointer select-none text-xs font-black uppercase tracking-[0.2em]',
                      isActive ? 'nb-sd-sm bg-[#6fe3f5]' : 'bg-white text-[#111]/50',
                    )}
                  >
                    {lang}
                  </button>
                )
              })}
            </div>
          )}

          <button
            type='button'
            className={cn(
              'nb-frame nb-frame-thin nb-sd-sm nb-press-sm flex cursor-pointer items-center bg-[#ff4d3d] font-black uppercase tracking-[0.12em]',
              railCollapsed
                ? 'mx-auto h-10 w-10 shrink-0 justify-center'
                : 'h-10 w-full justify-center gap-2 text-xs',
            )}
            onClick={() => setOpenLogoutModal(true)}
            aria-label={t('sidebar.logoutAria')}
            title={railCollapsed ? t('sidebar.logout') : undefined}
          >
            <LogOut className='h-4 w-4 shrink-0' strokeWidth={3} aria-hidden />
            {!railCollapsed && <span>{t('sidebar.logout')}</span>}
          </button>
        </div>
      </aside>

      <Dialog open={openLogoutModal} onOpenChange={setOpenLogoutModal}>
        <DialogContent
          className='nb nb-frame nb-frame-thick nb-sd-lg gap-0 bg-white p-0 sm:max-w-md'
          showCloseButton={false}
        >
          <div className='flex h-3 w-full border-b-4 border-[#111]' aria-hidden>
            <div className='flex-1 bg-[#c9f24d]' />
            <div className='flex-1 border-l-4 border-[#111] bg-[#6fe3f5]' />
            <div className='flex-1 border-l-4 border-[#111] bg-[#ff9ed2]' />
            <div className='flex-1 border-l-4 border-[#111] bg-[#ff4d3d]' />
          </div>

          <div className='space-y-5 p-6'>
            <DialogHeader className='space-y-2 text-left'>
              <DialogTitle className='text-xl font-black uppercase leading-tight tracking-tight'>
                {t('sidebar.confirmLogoutTitle')}
              </DialogTitle>
              <DialogDescription className='text-sm font-bold text-[#111]/70'>
                {t('sidebar.confirmLogoutDescription')}
              </DialogDescription>
            </DialogHeader>

            <DialogFooter className='gap-2 sm:gap-2'>
              <button
                type='button'
                className='nb-frame nb-frame-thin nb-sd-sm nb-press-sm h-11 cursor-pointer bg-white px-5 text-xs font-black uppercase tracking-[0.14em]'
                onClick={() => setOpenLogoutModal(false)}
              >
                {t('sidebar.cancel')}
              </button>
              <button
                type='button'
                disabled={isLoggingOut}
                className='nb-frame nb-frame-thin nb-sd-sm nb-press-sm flex h-11 cursor-pointer items-center justify-center gap-2 bg-[#ff4d3d] px-5 text-xs font-black uppercase tracking-[0.14em] disabled:cursor-not-allowed disabled:opacity-60'
                onClick={() => doLogout()}
              >
                {isLoggingOut && (
                  <Loader2 className='h-4 w-4 shrink-0 animate-spin' strokeWidth={3} aria-hidden />
                )}
                {isLoggingOut ? t('sidebar.loggingOut') : t('sidebar.logout')}
              </button>
            </DialogFooter>
          </div>
        </DialogContent>
      </Dialog>
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
  const [isOpen, setIsOpen] = useState(isChildActive)

  if (hasChildren && collapsed) {
    return (
      <Popover>
        <PopoverTrigger asChild>
          <button
            type='button'
            data-active={isChildActive ? 'true' : undefined}
            className={cn(
              'nb-item mx-auto flex h-10 w-10 shrink-0 cursor-pointer items-center justify-center',
              isChildActive ? 'bg-[#ffd84d]' : 'bg-transparent hover:bg-white',
            )}
            aria-haspopup='dialog'
            aria-label={tr(menu.label)}
            title={tr(menu.label)}
          >
            <menu.icon className='h-4.5 w-4.5 shrink-0' strokeWidth={2.5} aria-hidden />
          </button>
        </PopoverTrigger>
        <PopoverContent
          side='right'
          align='start'
          sideOffset={14}
          className='nb nb-frame nb-frame-thick nb-sd z-60 w-56 bg-white p-2'
          onOpenAutoFocus={(e) => e.preventDefault()}
        >
          <p className='mb-2 border-b-4 border-[#111] pb-2 text-[10px] font-black uppercase tracking-[0.18em]'>
            {tr(menu.label)}
          </p>
          <div className='flex flex-col gap-1.5'>
            {menu.children?.map((child) => (
              <NavLink
                key={child.label}
                to={child.path!}
                onClick={onNavigate}
                className={({ isActive }) =>
                  cn(
                    'nb-item block truncate px-2.5 py-1.5 text-[11px] font-bold uppercase tracking-wide',
                    isActive ? 'bg-[#ff9ed2] font-black' : 'bg-transparent hover:bg-[#f5f1e8]',
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
      <div>
        <button
          type='button'
          onClick={() => setIsOpen(!isOpen)}
          data-active={isChildActive ? 'true' : undefined}
          className={cn(
            'nb-item flex w-full cursor-pointer items-center justify-between px-2.5 py-2 text-[13px] font-black uppercase tracking-tight',
            isChildActive ? 'bg-[#ffd84d]' : 'bg-transparent hover:bg-white',
          )}
          aria-expanded={isOpen}
        >
          <span className='flex min-w-0 items-center gap-2.5'>
            <menu.icon className='h-4.5 w-4.5 shrink-0' strokeWidth={2.5} aria-hidden />
            <span className='truncate'>{tr(menu.label)}</span>
          </span>
          <span className='nb-frame nb-frame-thin flex h-5 w-5 shrink-0 items-center justify-center bg-white'>
            <ChevronDown
              className={cn('h-3 w-3 transition-transform duration-200', isOpen && 'rotate-180')}
              strokeWidth={3}
              aria-hidden
            />
          </span>
        </button>
        {isOpen && (
          <div className='ml-4 mt-1.5 flex flex-col gap-1.5 border-l-4 border-[#111] py-1 pl-3'>
            {menu.children?.map((child) => (
              <NavLink
                key={child.label}
                to={child.path!}
                onClick={onNavigate}
                className={({ isActive }) =>
                  cn(
                    'nb-item block truncate px-2.5 py-1.5 text-[11px] font-bold uppercase tracking-wide',
                    isActive ? 'bg-[#ff9ed2] font-black' : 'bg-transparent hover:bg-white',
                  )
                }
              >
                {tr(child.label)}
              </NavLink>
            ))}
          </div>
        )}
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
          'nb-item relative flex items-center font-black uppercase tracking-tight',
          collapsed
            ? 'mx-auto h-10 w-10 shrink-0 justify-center'
            : 'w-full gap-2.5 px-2.5 py-2 text-[13px]',
          isActive ? 'bg-[#c9f24d]' : 'bg-transparent hover:bg-white',
        )
      }
    >
      <menu.icon className='h-4.5 w-4.5 shrink-0' strokeWidth={2.5} aria-hidden />
      {!collapsed && <span className='min-w-0 truncate'>{tr(menu.label)}</span>}
    </NavLink>
  )
}
