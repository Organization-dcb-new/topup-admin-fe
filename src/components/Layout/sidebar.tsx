import { sidebarMenus, type SidebarMenu } from '@/constants/sidebar-menu'
import { SIDEBAR_I18N_KEY_BY_TEXT } from '@/i18n/sidebar-label-keys'
import { Button } from '@/components/ui/button'
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
import { logout, useAuthUser } from '@/lib/auth'
import { cn } from '@/lib/utils'
import { ChevronDown, ChevronLeft, LogOut, X } from 'lucide-react'
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
          'fixed inset-0 z-40 bg-black/60 backdrop-blur-xs md:hidden transition-opacity duration-300',
          mobileOpen ? 'opacity-100 block' : 'opacity-0 hidden',
        )}
        onClick={onCloseMobile}
        aria-hidden
      />

      <aside
        className={cn(
          'z-50 flex min-h-0 flex-col overflow-hidden border-r border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-950 transition-[width,transform] duration-300 ease-out',
          'max-md:fixed max-md:inset-y-0 max-md:left-0 max-md:max-h-[100dvh]',
          'w-64 max-md:max-w-[min(100vw-1rem,16rem)]',
          railCollapsed && 'md:w-20',
          mobileOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0',
          'md:sticky md:top-0 md:h-screen md:max-h-screen md:shrink-0 md:self-start md:max-w-none',
        )}
      >
        <div
          className={cn(
            'relative flex h-14 shrink-0 items-center border-b border-slate-200 dark:border-zinc-800 md:h-16',
            railCollapsed ? 'justify-center px-2 md:px-1' : 'justify-between px-4',
          )}
        >
          {!railCollapsed && (
            <span className='min-w-0 truncate font-extrabold tracking-tight text-base md:text-lg text-slate-900 dark:text-white px-1'>
              Pakar<span className='bg-linear-to-r from-primary to-indigo-500 bg-clip-text text-transparent'>Gaming</span>
            </span>
          )}

          <Button
            type='button'
            variant='ghost'
            size='icon'
            onClick={onToggleCollapse}
            className={cn(
              'hidden shrink-0 cursor-pointer md:flex h-8 w-8 hover:bg-slate-200 dark:hover:bg-zinc-800',
              railCollapsed && 'absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2',
            )}
            aria-label={railCollapsed ? t('sidebar.expandRail') : t('sidebar.collapseRail')}
          >
            <ChevronLeft
              className={cn('h-4 w-4 transition-transform', railCollapsed && 'rotate-180')}
              aria-hidden
            />
          </Button>

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
          className={cn(
            'min-h-0 flex-1 space-y-4 overflow-y-auto overflow-x-hidden overscroll-y-contain py-4 custom-scrollbar',
            railCollapsed ? 'px-2 md:px-1.5' : 'px-3',
          )}
        >
          {filteredMenus.map((section, idx) => (
            <div
              key={idx}
              className={cn(
                railCollapsed && idx > 0 && 'border-t border-slate-200 dark:border-zinc-900 pt-3 md:border-t md:pt-3',
              )}
            >
              {!railCollapsed && section.title && (
                <p className='mb-2.5 px-3 text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500'>
                  {tr(section.title)}
                </p>
              )}
              <div className='flex flex-col gap-1'>
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
            'shrink-0 border-t border-slate-200 dark:border-zinc-800 space-y-3 bg-slate-100/50 dark:bg-zinc-950/50',
            railCollapsed ? 'p-2' : 'p-3.5',
          )}
        >
          <SidebarHealthIndicator collapsed={railCollapsed} />

          {railCollapsed ? (
            <Button
              type='button'
              variant='outline'
              size='icon'
              className='mx-auto h-10 w-10 shrink-0 font-bold text-xs select-none border-slate-200 dark:border-zinc-800'
              onClick={() => i18n.changeLanguage(isIdLocale ? 'en' : 'id')}
              title={t('sidebar.languageToggleAria')}
            >
              {isIdLocale ? 'ID' : 'EN'}
            </Button>
          ) : (
            <div className='relative flex items-center p-1 rounded-xl bg-slate-200/50 dark:bg-zinc-900/60 border border-slate-200 dark:border-zinc-800/80 w-full overflow-hidden h-10'>
              <div
                className={cn(
                  'absolute top-1 bottom-1 w-[calc(50%-4px)] rounded-lg bg-white dark:bg-zinc-800 shadow-sm transition-transform duration-300 ease-out',
                  isIdLocale ? 'translate-x-0' : 'translate-x-[calc(100%+8px)]'
                )}
              />
              <button
                type='button'
                onClick={() => i18n.changeLanguage('id')}
                className={cn(
                  'relative z-10 flex-1 text-center text-xs font-bold select-none transition-colors duration-200',
                  isIdLocale ? 'text-primary dark:text-white' : 'text-slate-500 dark:text-slate-400'
                )}
              >
                ID
              </button>
              <button
                type='button'
                onClick={() => i18n.changeLanguage('en')}
                className={cn(
                  'relative z-10 flex-1 text-center text-xs font-bold select-none transition-colors duration-200',
                  !isIdLocale ? 'text-primary dark:text-white' : 'text-slate-500 dark:text-slate-400'
                )}
              >
                EN
              </button>
            </div>
          )}

          <Button
            type='button'
            variant='outline'
            className={cn(
              'cursor-pointer gap-2 font-semibold shadow-xs border-slate-200 dark:border-zinc-800 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950/20 dark:hover:text-red-400 hover:border-red-200 dark:hover:border-red-900/50',
              railCollapsed
                ? 'mx-auto h-10 w-10 shrink-0 justify-center rounded-xl p-0 md:flex'
                : 'h-10 w-full justify-start rounded-xl',
            )}
            onClick={() => setOpenLogoutModal(true)}
            aria-label={t('sidebar.logoutAria')}
            title={railCollapsed ? t('sidebar.logout') : undefined}
          >
            <LogOut className='h-4 w-4 shrink-0' aria-hidden />
            {!railCollapsed && <span>{t('sidebar.logout')}</span>}
          </Button>
        </div>
      </aside>

      <Dialog open={openLogoutModal} onOpenChange={setOpenLogoutModal}>
        <DialogContent className='rounded-2xl sm:max-w-md border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-950'>
          <DialogHeader>
            <DialogTitle className='font-extrabold text-slate-900 dark:text-white'>{t('sidebar.confirmLogoutTitle')}</DialogTitle>
            <DialogDescription className='text-slate-500 dark:text-slate-400'>{t('sidebar.confirmLogoutDescription')}</DialogDescription>
          </DialogHeader>
          <DialogFooter className='gap-2 sm:gap-0'>
            <Button
              type='button'
              variant='outline'
              className='rounded-xl border-slate-200 dark:border-zinc-800'
              onClick={() => setOpenLogoutModal(false)}
            >
              {t('sidebar.cancel')}
            </Button>
            <Button
              type='button'
              variant='destructive'
              className='rounded-xl bg-red-600 hover:bg-red-700 text-white'
              onClick={async () => {
                await logout()
                setOpenLogoutModal(false)
              }}
            >
              {t('sidebar.logout')}
            </Button>
          </DialogFooter>
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
            className={cn(
              'mx-auto flex h-10 w-10 shrink-0 items-center justify-center rounded-xl transition-all duration-200',
              isChildActive
                ? 'bg-primary text-primary-foreground shadow-md shadow-primary/25 scale-105'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-200/60 dark:hover:bg-zinc-900/60 hover:text-slate-950 dark:hover:text-white',
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
          className='z-[60] w-56 p-2 rounded-xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 shadow-lg'
          onOpenAutoFocus={(e) => e.preventDefault()}
        >
          <p className='border-b border-slate-100 dark:border-zinc-900 px-2 pb-2 text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider'>
            {tr(menu.label)}
          </p>
          <div className='mt-1.5 flex flex-col gap-1'>
            {menu.children?.map((child) => (
              <NavLink
                key={child.label}
                to={child.path!}
                onClick={onNavigate}
                className={({ isActive }) =>
                  cn(
                    'rounded-lg px-2.5 py-2 text-xs transition-all duration-200',
                    isActive
                      ? 'bg-primary/10 font-bold text-primary dark:text-primary-foreground'
                      : 'text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-zinc-900 hover:text-slate-950 dark:hover:text-white',
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
      <div className='space-y-1'>
        <button
          type='button'
          onClick={() => setIsOpen(!isOpen)}
          className={cn(
            'flex w-full cursor-pointer items-center justify-between rounded-xl px-3 py-2 text-sm transition-all duration-200 hover:bg-slate-200/50 dark:hover:bg-zinc-900/50',
            isChildActive ? 'font-semibold text-primary dark:text-primary-foreground bg-primary/5 dark:bg-primary/10' : 'text-slate-700 dark:text-slate-300 hover:translate-x-0.5',
          )}
          aria-expanded={isOpen}
        >
          <div className='flex min-w-0 items-center gap-3'>
            <menu.icon className={cn('h-4.5 w-4.5 shrink-0 transition-transform duration-200', isChildActive ? 'text-primary' : 'text-slate-500 dark:text-slate-400')} aria-hidden />
            <span className='truncate'>{tr(menu.label)}</span>
          </div>
          <ChevronDown className={cn('h-3.5 w-3.5 shrink-0 transition-transform duration-355 text-slate-400 dark:text-slate-500', isOpen && 'rotate-180')} />
        </button>
        {isOpen && (
          <div className='relative ml-5 pl-3 border-l border-slate-200 dark:border-zinc-800/80 space-y-1 py-1'>
            {menu.children?.map((child) => (
              <NavLink
                key={child.label}
                to={child.path!}
                onClick={onNavigate}
                className={({ isActive }) =>
                  cn(
                    'block rounded-lg py-1.5 pl-4 pr-2 text-xs transition-all duration-200',
                    isActive
                      ? 'font-bold text-primary dark:text-primary-foreground bg-primary/8 dark:bg-primary/15'
                      : 'text-slate-500 dark:text-slate-400 hover:bg-slate-200/40 dark:hover:bg-zinc-900/40 hover:text-slate-900 dark:hover:text-white hover:translate-x-0.5',
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
          'relative flex items-center transition-all duration-200',
          collapsed
            ? 'mx-auto h-10 w-10 shrink-0 justify-center rounded-xl p-0'
            : 'w-full gap-3 px-3 py-2 rounded-xl text-sm',
          isActive
            ? 'bg-primary text-primary-foreground shadow-md shadow-primary/25 font-semibold scale-102'
            : 'text-slate-700 dark:text-slate-300 hover:bg-slate-200/50 dark:hover:bg-zinc-900/50 hover:text-slate-950 dark:hover:text-white hover:translate-x-0.5',
        )
      }
    >
      <menu.icon className='h-4.5 w-4.5 shrink-0' aria-hidden />
      {!collapsed && <span className='min-w-0 truncate'>{tr(menu.label)}</span>}
    </NavLink>
  )
}

