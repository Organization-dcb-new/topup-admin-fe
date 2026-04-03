import { sidebarMenus, type SidebarMenu } from '@/constants/sidebar-menu'
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
import { NavLink, useLocation } from 'react-router-dom'

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
  const [openLogoutModal, setOpenLogoutModal] = useState(false)
  const isMdUp = useIsMdUp()
  const railCollapsed = collapsed && isMdUp

  const NOC_ALLOWED = ['Dasbor', 'Transaksi', 'Pesanan', 'Ikhtisar']
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
          'fixed inset-0 z-40 bg-black/40 md:hidden',
          mobileOpen ? 'block' : 'hidden',
        )}
        onClick={onCloseMobile}
        aria-hidden
      />

      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-50 flex flex-col border-r bg-white transition-[width,transform] duration-300 ease-out',
          'w-64 max-md:max-w-[min(100vw-1rem,16rem)]',
          railCollapsed && 'md:w-20',
          mobileOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0',
          'md:static md:max-w-none',
        )}
      >
        <div
          className={cn(
            'relative flex h-14 shrink-0 items-center border-b md:h-16',
            railCollapsed ? 'justify-center px-2 md:px-1' : 'justify-between px-3 md:px-4',
          )}
        >
          {!railCollapsed && (
            <span className="min-w-0 truncate font-bold text-base md:text-lg">
              Pakar<span className="text-primary">Gaming</span>
            </span>
          )}

          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={onToggleCollapse}
            className={cn(
              'hidden shrink-0 cursor-pointer md:flex',
              railCollapsed && 'absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2',
            )}
            aria-label={railCollapsed ? 'Perluas menu samping' : 'Ciutkan menu samping'}
          >
            <ChevronLeft
              className={cn('h-4 w-4 transition-transform', railCollapsed && 'rotate-180')}
              aria-hidden
            />
          </Button>

          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="absolute right-2 top-1/2 -translate-y-1/2 md:hidden"
            onClick={onCloseMobile}
            aria-label="Tutup menu"
          >
            <X className="h-4 w-4" aria-hidden />
          </Button>
        </div>

        <nav
          className={cn(
            'min-h-0 flex-1 space-y-3 overflow-y-auto overflow-x-hidden py-3',
            railCollapsed ? 'px-1.5 md:px-1' : 'px-2',
          )}
        >
          {filteredMenus.map((section, idx) => (
            <div
              key={idx}
              className={cn(
                railCollapsed && idx > 0 && 'border-t border-gray-100 pt-3 md:border-t md:pt-3',
              )}
            >
              {!railCollapsed && section.title && (
                <p className="mb-2 px-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  {section.title}
                </p>
              )}
              <div className="flex flex-col gap-1">
                {section.menus.map((menu) => (
                  <NavItem
                    key={menu.label}
                    menu={menu}
                    collapsed={railCollapsed}
                    pathname={pathname}
                    onNavigate={() => onCloseMobile()}
                  />
                ))}
              </div>
            </div>
          ))}
        </nav>

        <div
          className={cn(
            'shrink-0 border-t border-gray-100',
            railCollapsed ? 'p-1.5 md:px-1 md:py-2' : 'p-2',
          )}
        >
          <Button
            type="button"
            variant="outline"
            className={cn(
              'cursor-pointer gap-2 font-normal shadow-sm',
              railCollapsed
                ? 'mx-auto h-10 w-10 shrink-0 justify-center rounded-lg p-0 md:flex'
                : 'h-10 w-full justify-start',
            )}
            onClick={() => setOpenLogoutModal(true)}
            aria-label="Keluar dari akun"
            title={railCollapsed ? 'Keluar' : undefined}
          >
            <LogOut className="h-4 w-4 shrink-0" aria-hidden />
            {!railCollapsed && <span>Keluar</span>}
          </Button>
        </div>
      </aside>

      <Dialog open={openLogoutModal} onOpenChange={setOpenLogoutModal}>
        <DialogContent className="rounded-xl sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Konfirmasi keluar</DialogTitle>
            <DialogDescription>Apakah Anda yakin ingin keluar dari akun?</DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:gap-2">
            <Button
              type="button"
              variant="outline"
              className="rounded-xl"
              onClick={() => setOpenLogoutModal(false)}
            >
              Batal
            </Button>
            <Button
              type="button"
              variant="destructive"
              className="rounded-xl"
              onClick={async () => {
                await logout()
                setOpenLogoutModal(false)
              }}
            >
              Keluar
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
}: {
  menu: SidebarMenu
  collapsed: boolean
  pathname: string
  onNavigate: () => void
}) {
  const hasChildren = !!menu.children?.length
  const isChildActive = menu.children?.some((child) => child.path === pathname)
  const [isOpen, setIsOpen] = useState(isChildActive)

  if (hasChildren && collapsed) {
    return (
      <Popover>
        <PopoverTrigger asChild>
          <button
            type="button"
            className={cn(
              'mx-auto flex h-10 w-10 shrink-0 items-center justify-center rounded-lg transition-colors',
              isChildActive
                ? 'bg-primary text-primary-foreground shadow-sm'
                : 'text-foreground hover:bg-gray-100',
            )}
            aria-haspopup="dialog"
            aria-label={menu.label}
            title={menu.label}
          >
            <menu.icon className="h-4 w-4 shrink-0" aria-hidden />
          </button>
        </PopoverTrigger>
        <PopoverContent
          side="right"
          align="start"
          sideOffset={10}
          className="z-[60] w-56 p-2"
          onOpenAutoFocus={(e) => e.preventDefault()}
        >
          <p className="border-b border-border/60 px-2 pb-2 text-xs font-semibold text-muted-foreground">
            {menu.label}
          </p>
          <div className="mt-1 flex flex-col gap-0.5">
            {menu.children?.map((child) => (
              <NavLink
                key={child.label}
                to={child.path!}
                onClick={onNavigate}
                className={({ isActive }) =>
                  cn(
                    'rounded-md px-2 py-2 text-sm transition-colors',
                    isActive
                      ? 'bg-primary/10 font-medium text-primary'
                      : 'text-foreground hover:bg-muted',
                  )
                }
              >
                {child.label}
              </NavLink>
            ))}
          </div>
        </PopoverContent>
      </Popover>
    )
  }

  if (hasChildren && !collapsed) {
    return (
      <div className="space-y-1">
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className={cn(
            'flex w-full cursor-pointer items-center justify-between rounded-lg px-3 py-2 text-sm transition-colors hover:bg-gray-100',
            isChildActive ? 'font-medium text-primary' : 'text-foreground',
          )}
          aria-expanded={isOpen}
        >
          <div className="flex min-w-0 items-center gap-3">
            <menu.icon className="h-4 w-4 shrink-0" aria-hidden />
            <span className="truncate">{menu.label}</span>
          </div>
          <ChevronDown className={cn('h-3 w-3 shrink-0 transition-transform', isOpen && 'rotate-180')} />
        </button>
        {isOpen && (
          <div className="space-y-0.5 pl-4">
            {menu.children?.map((child) => (
              <NavLink
                key={child.label}
                to={child.path!}
                onClick={onNavigate}
                className={({ isActive }) =>
                  cn(
                    'block rounded-md py-2 pl-6 pr-2 text-xs transition-colors',
                    isActive
                      ? 'font-semibold text-primary'
                      : 'text-muted-foreground hover:bg-gray-50 hover:text-primary',
                  )
                }
              >
                {child.label}
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
      title={collapsed ? menu.label : undefined}
      aria-label={collapsed ? menu.label : undefined}
      className={({ isActive }) =>
        cn(
          'flex items-center rounded-lg text-sm transition-colors',
          collapsed
            ? 'mx-auto h-10 w-10 shrink-0 justify-center p-0'
            : 'w-full gap-3 px-3 py-2',
          isActive
            ? 'bg-primary text-primary-foreground shadow-sm'
            : 'text-foreground hover:bg-gray-100',
        )
      }
    >
      <menu.icon className="h-4 w-4 shrink-0" aria-hidden />
      {!collapsed && <span className="min-w-0 truncate">{menu.label}</span>}
    </NavLink>
  )
}
