import { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { ChevronDown, LogOut, Menu, ShieldCheck } from 'lucide-react'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { logout, useAuthUser } from '@/lib/auth'
import { resolvePageTitleKey } from '@/lib/title-map'
import { cn } from '@/lib/utils'

interface NavbarProps {
  onOpenMobile: () => void
}

export function Navbar({ onOpenMobile }: NavbarProps) {
  const { pathname } = useLocation()
  const { t, i18n } = useTranslation('common')
  const { user, role } = useAuthUser()
  const [openLogoutModal, setOpenLogoutModal] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const isIdLocale = i18n.language === 'id' || i18n.language.startsWith('id')

  const titleKey = resolvePageTitleKey(pathname) ?? 'notFound'
  const username: string = user?.username ?? ''
  const email: string = user?.email ?? ''
  const initials = username.slice(0, 2).toUpperCase() || 'PG'

  return (
    <>
      <header className='sticky top-0 z-30 flex h-14 shrink-0 items-center gap-2 border-b border-border/80 bg-background/85 px-3 backdrop-blur-md md:h-16 md:gap-3 md:px-6'>
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

        <h1 className='min-w-0 truncate text-base font-semibold tracking-tight text-foreground'>
          {t('pageTitles.' + titleKey)}
        </h1>

        <div className='ml-auto flex shrink-0 items-center gap-2 md:gap-3'>
          <div
            className='relative flex h-8 w-20 items-center rounded-full border border-border/80 bg-muted/60 p-0.5'
            role='group'
            aria-label={t('sidebar.languageToggleAria')}
          >
            <div
              className={cn(
                'absolute inset-y-0.5 w-[calc(50%-2px)] rounded-full bg-background shadow-xs transition-transform duration-300 ease-out',
                isIdLocale ? 'translate-x-0' : 'translate-x-full',
              )}
              aria-hidden
            />
            <button
              type='button'
              onClick={() => i18n.changeLanguage('id')}
              aria-pressed={isIdLocale}
              className={cn(
                'relative z-10 flex-1 cursor-pointer text-center text-[11px] font-bold select-none transition-colors duration-200',
                isIdLocale
                  ? 'text-foreground'
                  : 'text-muted-foreground hover:text-foreground',
              )}
            >
              ID
            </button>
            <button
              type='button'
              onClick={() => i18n.changeLanguage('en')}
              aria-pressed={!isIdLocale}
              className={cn(
                'relative z-10 flex-1 cursor-pointer text-center text-[11px] font-bold select-none transition-colors duration-200',
                !isIdLocale
                  ? 'text-foreground'
                  : 'text-muted-foreground hover:text-foreground',
              )}
            >
              EN
            </button>
          </div>

          <Popover open={menuOpen} onOpenChange={setMenuOpen}>
            <PopoverTrigger asChild>
              <button
                type='button'
                className='flex cursor-pointer items-center gap-2 rounded-full border border-border/80 bg-background py-1 pl-1 pr-2 shadow-xs transition-all duration-200 hover:bg-muted/60 md:pr-3'
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
                    {role && (
                      <Badge
                        variant='secondary'
                        className='h-4.5 shrink-0 px-1.5 text-[10px] font-bold uppercase'
                      >
                        {role}
                      </Badge>
                    )}
                  </div>
                  <p className='truncate text-xs text-muted-foreground'>
                    {email}
                  </p>
                </div>
              </div>

              <div className='my-1.5 border-t border-border/60' aria-hidden />

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

      <Dialog open={openLogoutModal} onOpenChange={setOpenLogoutModal}>
        <DialogContent className='rounded-2xl sm:max-w-md'>
          <DialogHeader>
            <DialogTitle>{t('sidebar.confirmLogoutTitle')}</DialogTitle>
            <DialogDescription>
              {t('sidebar.confirmLogoutDescription')}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className='gap-2 sm:gap-0'>
            <Button
              type='button'
              variant='outline'
              className='rounded-xl'
              onClick={() => setOpenLogoutModal(false)}
            >
              {t('sidebar.cancel')}
            </Button>
            <Button
              type='button'
              variant='destructive'
              className='rounded-xl'
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
