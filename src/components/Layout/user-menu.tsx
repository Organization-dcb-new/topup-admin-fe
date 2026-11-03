import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { ChevronDown, LogOut, ShieldAlert } from 'lucide-react'

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
import { logout, useAuthUser } from '@/lib/auth'
import { cn } from '@/lib/utils'

const ROLE_BADGE: Record<string, string> = {
  dev: 'bg-cyan-50 text-cyan-700',
  admin: 'bg-purple-50 text-brand-purple',
  noc: 'bg-amber-50 text-amber-700',
}

/** Avatar button in the navbar: who is signed in, a 2FA reminder, and log out. */
export function UserMenu() {
  const { t } = useTranslation('common')
  const { user, role } = useAuthUser()
  const [open, setOpen] = useState(false)
  const [confirmLogout, setConfirmLogout] = useState(false)

  const name: string = user?.username || user?.email?.split('@')[0] || 'Admin'
  const roleKey: string = role ?? 'admin'
  // NOC can't open the 2FA page, so only remind roles that can act on it.
  const needs2fa = roleKey !== 'noc' && user?.two_factor_enabled === false

  return (
    <>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <button
            type='button'
            aria-label={t('sidebar.userMenu')}
            className='flex h-11 items-center gap-2.5 py-1 pl-1 pr-2 hud-clip-sm transition-colors hover:bg-slate-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-brand-purple/40 sm:pr-3'
          >
            {/* The 2FA dot sits outside the clipped tile so the notch doesn't cut it off. */}
            <span className='relative'>
              <span className='grid size-9 place-items-center bg-linear-to-br from-brand-purple to-brand-cyan font-display text-sm font-bold uppercase text-white hud-clip-sm'>
                {name.charAt(0)}
              </span>
              {needs2fa && (
                <span className='absolute -bottom-0.5 -right-0.5 size-2.5 rounded-full bg-amber-400 ring-2 ring-white' aria-hidden />
              )}
            </span>
            <span className='hidden min-w-0 text-left sm:block'>
              <span className='block max-w-36 truncate text-sm font-semibold leading-tight text-slate-800'>{name}</span>
              <span className='block font-display text-[10px] font-semibold uppercase tracking-[0.2em] text-brand-purple'>
                {t(`sidebar.roles.${roleKey}`, { defaultValue: roleKey })}
              </span>
            </span>
            <ChevronDown
              className={cn('hidden size-4 text-slate-400 transition-transform duration-300 ease-hud sm:block', open && 'rotate-180')}
              aria-hidden
            />
          </button>
        </PopoverTrigger>

        <PopoverContent align='end' sideOffset={8} className='z-[60] w-64 overflow-hidden rounded-xl border-slate-200 p-0 shadow-xl'>
          <div className='h-1 bg-linear-to-r from-brand-purple to-brand-cyan' aria-hidden />
          <div className='flex items-center gap-3 px-4 py-3'>
            <span className='grid size-10 shrink-0 place-items-center bg-linear-to-br from-brand-purple to-brand-cyan font-display text-base font-bold uppercase text-white hud-clip-sm'>
              {name.charAt(0)}
            </span>
            <div className='min-w-0'>
              <p className='truncate text-sm font-semibold text-slate-900'>{name}</p>
              {user?.email && <p className='truncate text-xs text-slate-500'>{user.email}</p>}
              <span
                className={cn(
                  'mt-1.5 inline-block px-2 py-0.5 font-display text-[10px] font-bold uppercase tracking-[0.15em] hud-clip-sm',
                  ROLE_BADGE[roleKey] ?? ROLE_BADGE.admin
                )}
              >
                {t(`sidebar.roles.${roleKey}`, { defaultValue: roleKey })}
              </span>
            </div>
          </div>

          {needs2fa && (
            <Link
              to='/2fa-setup'
              onClick={() => setOpen(false)}
              className='mx-2 mb-2 flex items-start gap-2.5 border-l-[3px] border-amber-400 bg-amber-50 px-3 py-2.5 text-amber-800 transition-colors hover:bg-amber-100'
            >
              <ShieldAlert className='mt-0.5 size-4 shrink-0 text-amber-600' aria-hidden />
              <span className='text-xs leading-relaxed'>
                <span className='block font-semibold'>{t('sidebar.twoFaOffTitle')}</span>
                {t('sidebar.enable2fa')}
              </span>
            </Link>
          )}

          <div className='border-t border-slate-100 p-1.5'>
            <button
              type='button'
              onClick={() => {
                setOpen(false)
                setConfirmLogout(true)
              }}
              className='flex w-full items-center gap-2.5 px-2.5 py-2 font-display text-xs font-semibold uppercase tracking-[0.15em] text-rose-600 hud-clip-sm transition-colors hover:bg-rose-50'
            >
              <LogOut className='size-4' aria-hidden />
              {t('sidebar.logout')}
            </button>
          </div>
        </PopoverContent>
      </Popover>

      <Dialog open={confirmLogout} onOpenChange={setConfirmLogout}>
        <DialogContent className='rounded-2xl border border-slate-200 bg-white sm:max-w-md'>
          <DialogHeader>
            <DialogTitle className='font-display text-xl font-bold text-slate-900'>
              {t('sidebar.confirmLogoutTitle')}
            </DialogTitle>
            <DialogDescription className='text-slate-500'>
              {t('sidebar.confirmLogoutDescription')}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className='gap-2 sm:gap-0'>
            <Button
              type='button'
              variant='outline'
              className='rounded-xl border-slate-200'
              onClick={() => setConfirmLogout(false)}
            >
              {t('sidebar.cancel')}
            </Button>
            <Button
              type='button'
              variant='destructive'
              className='gap-2 rounded-xl bg-rose-600 text-white hover:bg-rose-700'
              onClick={async () => {
                await logout()
                setConfirmLogout(false)
              }}
            >
              <LogOut className='size-4' aria-hidden />
              {t('sidebar.logout')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
