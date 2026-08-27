import { useEffect, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import {
  ArrowLeft,
  ChevronDown,
  ChevronRight,
  LogOut,
  Menu,
  Search,
  ShieldCheck,
} from 'lucide-react'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { LanguageSwitch } from '@/components/ui/language-switch'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { CommandPalette } from './CommandPalette'
import { LogoutDialog } from './LogoutDialog'
import { useAuthUser } from '@/lib/auth'
import { usePermission } from '@/hooks/usePermission'
import { canAccessPath } from '@/constants/route-permissions'
import { resolvePageMatch } from '@/lib/title-map'
import { cn } from '@/lib/utils'

interface NavbarProps {
  onOpenMobile: () => void
}

/** Deteksi platform hanya untuk label pintasan (⌘K vs Ctrl K) */
const isMacPlatform = () =>
  typeof navigator !== 'undefined' && /Mac|iPhone|iPad/.test(navigator.platform)

export function Navbar({ onOpenMobile }: NavbarProps) {
  const { pathname } = useLocation()
  const navigate = useNavigate()
  const { t } = useTranslation('common')
  const { user, role, roleName } = useAuthUser()
  // Nama role untuk tampilan. Slug dipakai sebagai cadangan, tapi role custom
  // mengisi slug dengan "custom" — jadi role_name yang benar-benar informatif.
  const roleLabel = roleName || role
  const { can } = usePermission()
  const [openLogoutModal, setOpenLogoutModal] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)
  const [isScrolled, setIsScrolled] = useState(false)

  const match = resolvePageMatch(pathname)
  const titleKey = match?.key ?? 'notFound'
  const username: string = user?.username ?? ''
  const email: string = user?.email ?? ''
  const initials = username.slice(0, 2).toUpperCase() || 'PG'

  // Bayangan baru muncul setelah konten mulai lewat di bawah navbar
  useEffect(() => {
    const onScroll = () => setIsScrolled(window.scrollY > 4)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <>
      <header
        className={cn(
          'sticky top-0 z-30 flex h-14 shrink-0 items-center gap-2 border-b border-border bg-background/85 px-3 backdrop-blur-md transition-shadow duration-200 group-data-[shell-shift=on]/shell:backdrop-blur-none md:h-16 md:gap-3 md:px-6',
          isScrolled && 'shadow-sm',
        )}
      >
        <Button
          type='button'
          variant='ghost'
          size='icon'
          className='shrink-0 md:hidden'
          onClick={onOpenMobile}
          aria-label={t('navbar.openMenu')}
        >
          <Menu className='h-5 w-5' aria-hidden />
        </Button>

        {match?.isDetail && (
          <Button
            type='button'
            variant='ghost'
            size='icon'
            className='hidden h-8 w-8 shrink-0 text-muted-foreground hover:text-foreground md:flex'
            onClick={() => navigate(-1)}
            aria-label={t('navbar.back')}
          >
            <ArrowLeft className='h-4 w-4' aria-hidden />
          </Button>
        )}

        {match?.isDetail ? (
          <div className='flex min-w-0 items-center gap-1.5'>
            <nav
              aria-label={t('navbar.breadcrumbAria')}
              className='min-w-0 shrink'
            >
              <ol className='flex min-w-0 items-center'>
                <li className='min-w-0'>
                  <Link
                    to={match.basePath}
                    className='block truncate text-sm text-muted-foreground transition-colors duration-200 hover:text-foreground'
                  >
                    {t('pageTitles.' + titleKey)}
                  </Link>
                </li>
              </ol>
            </nav>
            <ChevronRight
              className='h-3.5 w-3.5 shrink-0 text-muted-foreground/60'
              aria-hidden
            />
            {/* Judul halaman berada di luar landmark navigasi */}
            <h1 className='min-w-0 truncate text-base font-semibold tracking-tight text-foreground'>
              {match.detailSegment}
            </h1>
          </div>
        ) : (
          <h1 className='min-w-0 truncate text-base font-semibold tracking-tight text-foreground'>
            {t('pageTitles.' + titleKey)}
          </h1>
        )}

        <div className='ml-auto flex shrink-0 items-center gap-2 md:gap-3'>
          <button
            type='button'
            onClick={() => setSearchOpen(true)}
            aria-label={t('commandPalette.title')}
            className='flex h-8 cursor-pointer items-center gap-2 rounded-lg border border-border bg-muted/50 px-2.5 text-sm text-muted-foreground transition-colors duration-200 hover:bg-muted hover:text-foreground'
          >
            <Search className='h-4 w-4 shrink-0' aria-hidden />
            <span className='hidden lg:inline'>{t('commandPalette.trigger')}</span>
            <kbd className='hidden shrink-0 rounded border border-border bg-background px-1.5 py-0.5 font-mono text-[10px] font-medium lg:inline'>
              {isMacPlatform() ? '⌘K' : 'Ctrl K'}
            </kbd>
          </button>

          <LanguageSwitch className='max-sm:hidden' />

          <Popover open={menuOpen} onOpenChange={setMenuOpen}>
            <PopoverTrigger asChild>
              <button
                type='button'
                className='flex cursor-pointer items-center gap-2 rounded-full border border-border bg-background py-1 pl-1 pr-2 shadow-xs transition-all duration-200 hover:bg-muted/60 md:pr-3'
                aria-label={t('navbar.accountMenuAria')}
              >
                <Avatar className='h-7 w-7'>
                  <AvatarFallback className='bg-primary/10 text-[11px] font-bold text-primary'>
                    {initials}
                  </AvatarFallback>
                </Avatar>
                <span className='hidden max-w-28 truncate text-sm font-medium text-foreground sm:block'>
                  {username}
                </span>
                <ChevronDown
                  className={cn(
                    'h-3.5 w-3.5 shrink-0 text-muted-foreground transition-transform duration-200',
                    menuOpen && 'rotate-180',
                  )}
                  aria-hidden
                />
              </button>
            </PopoverTrigger>
            <PopoverContent align='end' sideOffset={8} className='w-64 p-2'>
              <div className='flex items-center gap-3 rounded-lg px-2 py-2'>
                <Avatar className='h-9 w-9'>
                  <AvatarFallback className='bg-primary/10 text-xs font-bold text-primary'>
                    {initials}
                  </AvatarFallback>
                </Avatar>
                <div className='min-w-0'>
                  <div className='flex items-center gap-1.5'>
                    <p className='truncate text-sm font-semibold text-foreground'>
                      {username}
                    </p>
                    {roleLabel && (
                      <Badge
                        variant='secondary'
                        className='h-4.5 shrink-0 px-1.5 text-[10px] font-bold uppercase'
                      >
                        {roleLabel}
                      </Badge>
                    )}
                  </div>
                  <p className='truncate text-xs text-muted-foreground'>
                    {email}
                  </p>
                </div>
              </div>

              <div className='my-1.5 border-t border-border/60' aria-hidden />

              <div className='sm:hidden'>
                <div className='flex items-center justify-between rounded-lg px-2.5 py-2 text-sm text-foreground'>
                  <span>{t('sidebar.languageToggleAria')}</span>
                  <LanguageSwitch />
                </div>
              </div>

              {/* Hanya tampil bila role-nya memang diizinkan guard route ini */}
              {canAccessPath('/2fa-setup', can) && (
                <Link
                  to='/2fa-setup'
                  onClick={() => setMenuOpen(false)}
                  className='flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-sm text-foreground transition-colors duration-200 hover:bg-muted/70'
                >
                  <ShieldCheck
                    className='h-4 w-4 text-muted-foreground'
                    aria-hidden
                  />
                  {t('navbar.accountSecurity')}
                </Link>
              )}
              <button
                type='button'
                onClick={() => {
                  setMenuOpen(false)
                  setOpenLogoutModal(true)
                }}
                className='flex w-full cursor-pointer items-center gap-2.5 rounded-lg px-2.5 py-2 text-sm text-destructive transition-colors duration-200 hover:bg-destructive/10'
              >
                <LogOut className='h-4 w-4' aria-hidden />
                {t('sidebar.logout')}
              </button>
            </PopoverContent>
          </Popover>
        </div>
      </header>

      <CommandPalette open={searchOpen} onOpenChange={setSearchOpen} />

      <LogoutDialog
        open={openLogoutModal}
        onOpenChange={setOpenLogoutModal}
      />
    </>
  )
}
