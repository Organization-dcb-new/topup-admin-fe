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
  dev: 'bg-cyan-50 text-cyan-700 ring-cyan-200',
  admin: 'bg-purple-50 text-brand-purple ring-purple-200',
  noc: 'bg-amber-50 text-amber-700 ring-amber-200',
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
            className='flex h-10 items-center gap-2.5 rounded-full py-0.5 pl-0.5 pr-2 transition-colors hover:bg-slate-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-purple/40 sm:pr-3'
          >
            <span className='relative grid size-9 place-items-center rounded-full bg-linear-to-br from-brand-purple to-brand-cyan font-display text-sm font-bold uppercase text-white'>
              {name.charAt(0)}
              {needs2fa && (
                <span className='absolute -right-0.5 -top-0.5 size-2.5 rounded-full bg-amber-400 ring-2 ring-white' aria-hidden />
              )}
            </span>
            <span className='hidden max-w-36 truncate text-sm font-semibold text-slate-800 sm:block'>
              {name}
            </span>
            <ChevronDown
              className={cn('hidden size-4 text-slate-400 transition-transform duration-300 ease-hud sm:block', open && 'rotate-180')}
              aria-hidden
            />
          </button>
        </PopoverTrigger>

        <PopoverContent align='end' sideOffset={8} className='z-[60] w-64 rounded-xl border-slate-200 p-0 shadow-xl'>
          <div className='flex items-center gap-3 px-4 py-3'>
            <span className='grid size-10 shrink-0 place-items-center rounded-full bg-linear-to-br from-brand-purple to-brand-cyan font-display text-base font-bold uppercase text-white'>
              {name.charAt(0)}
            </span>
            <div className='min-w-0'>
              <p className='truncate text-sm font-semibold text-slate-900'>{name}</p>
              {user?.email && <p className='truncate text-xs text-slate-500'>{user.email}</p>}
              <span
                className={cn(
                  'mt-1 inline-block rounded px-1.5 py-px font-display text-[10px] font-bold uppercase tracking-wider ring-1',
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
              className='mx-2 mb-2 flex items-start gap-2.5 rounded-lg bg-amber-50 px-3 py-2.5 text-amber-800 transition-colors hover:bg-amber-100'
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
              className='flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-sm font-medium text-rose-600 transition-colors hover:bg-rose-50'
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
