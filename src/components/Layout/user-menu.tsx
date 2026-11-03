import { useState } from 'react'
import { createPortal } from 'react-dom'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { ChevronDown, Loader2, LogOut, ShieldAlert } from 'lucide-react'

import brandMark from '@/assets/brand/pakargaming-mark.webp'
import { Dialog, DialogContent, DialogDescription, DialogTitle } from '@/components/ui/dialog'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { authStorage, useAuthUser } from '@/lib/auth'
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

        <PopoverContent
          align='end'
          sideOffset={8}
          className='z-[60] w-64 overflow-hidden rounded-xl border-slate-200 p-0 shadow-xl'
          onOpenAutoFocus={(e) => e.preventDefault()}
          // Handing over to the logout dialog: returning focus to the avatar would pull it out of the dialog.
          onCloseAutoFocus={(e) => {
            if (confirmLogout) e.preventDefault()
          }}
        >
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

      <LogoutDialog
        open={confirmLogout}
        onOpenChange={setConfirmLogout}
        name={name}
        email={user?.email}
        roleLabel={t(`sidebar.roles.${roleKey}`, { defaultValue: roleKey })}
      />
    </>
  )
}

interface LogoutDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  name: string
  email?: string
  roleLabel: string
}

/** Fade-out before the reload, so leaving reads as a transition into the login page. */
const LEAVE_FADE_MS = 350

function LogoutDialog({ open, onOpenChange, name, email, roleLabel }: LogoutDialogProps) {
  const { t } = useTranslation('common')
  const [leaving, setLeaving] = useState(false)

  const signOut = async () => {
    if (leaving) return
    setLeaving(true)
    // The fade covers the app while the server clears the cookie; the full reload then drops
    // every cached query, so nothing from this session survives into the next sign-in.
    await Promise.all([
      authStorage.clearToken(),
      new Promise((resolve) => setTimeout(resolve, LEAVE_FADE_MS)),
    ])
    window.location.replace('/login')
  }

  return (
    <>
      <Dialog open={open} onOpenChange={(next) => !leaving && onOpenChange(next)}>
        <DialogContent
          showCloseButton={false}
          className='gap-0 overflow-hidden rounded-xl border-slate-200 bg-white p-0 shadow-2xl sm:max-w-md'
        >
          <div className='h-1 bg-linear-to-r from-brand-purple to-brand-cyan' aria-hidden />
          <div className='space-y-6 p-6 sm:p-7'>
            <div className='flex items-start gap-4'>
              <span className='grid size-12 shrink-0 place-items-center bg-linear-to-br from-rose-500 to-brand-purple text-white hud-clip-sm'>
                <LogOut className='size-5' aria-hidden />
              </span>
              <div className='min-w-0 space-y-1'>
                <p className='font-display text-[11px] font-semibold uppercase tracking-[0.3em] text-brand-purple'>
                  {t('sidebar.logoutEyebrow')}
                </p>
                <DialogTitle className='font-display text-2xl font-bold leading-tight tracking-tight text-slate-900'>
                  {t('sidebar.confirmLogoutTitle')}
                </DialogTitle>
                <DialogDescription className='text-sm leading-relaxed text-slate-500'>
                  {t('sidebar.confirmLogoutDescription')}
                </DialogDescription>
              </div>
            </div>

            <div className='flex items-center gap-3 border-l-[3px] border-brand-cyan bg-slate-50 px-3.5 py-3'>
              <span className='grid size-9 shrink-0 place-items-center bg-linear-to-br from-brand-purple to-brand-cyan font-display text-sm font-bold uppercase text-white hud-clip-sm'>
                {name.charAt(0)}
              </span>
              <div className='min-w-0'>
                <p className='font-display text-[10px] font-semibold uppercase tracking-[0.2em] text-slate-400'>
                  {t('sidebar.signedInAs')}
                </p>
                <p className='truncate text-sm font-semibold text-slate-900'>{email ?? name}</p>
              </div>
              <span className='ml-auto shrink-0 font-display text-[10px] font-semibold uppercase tracking-[0.2em] text-brand-purple'>
                {roleLabel}
              </span>
            </div>

            {/* Cancel comes first in the DOM so it, not the destructive action, gets the initial focus. */}
            <div className='flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-between'>
              <button
                type='button'
                onClick={() => onOpenChange(false)}
                disabled={leaving}
                className='inline-flex h-10 items-center justify-center rounded-md px-3 text-sm font-medium text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-purple/40 disabled:opacity-50'
              >
                {t('sidebar.cancel')}
              </button>
              <button
                type='button'
                onClick={signOut}
                disabled={leaving}
                className='inline-flex h-12 w-full items-center justify-center gap-2 bg-rose-600 font-display text-sm font-bold uppercase tracking-[0.2em] text-white hud-clip-sm transition-[background-color,transform,opacity] duration-300 hover:bg-rose-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-white/90 active:scale-[0.985] disabled:opacity-70 sm:w-auto sm:min-w-52 sm:px-6'
              >
                {leaving ? (
                  <Loader2 className='size-4 animate-spin' aria-hidden />
                ) : (
                  <LogOut className='size-4' aria-hidden />
                )}
                {leaving ? t('sidebar.loggingOut') : t('sidebar.logout')}
              </button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Portalled: the navbar's backdrop-filter would otherwise trap a fixed overlay inside it. */}
      {leaving &&
        createPortal(
          <div
            role='status'
            aria-live='polite'
            className='fixed inset-0 z-[100] grid place-items-center bg-[#f6f4f9] animate-in fade-in duration-300 ease-hud'
          >
            <div className='flex flex-col items-center gap-4'>
              <span className='relative grid size-14 place-items-center' aria-hidden>
                <span className='absolute inset-0 rounded-full border-2 border-slate-200' />
                <span className='absolute inset-0 animate-spin rounded-full border-2 border-transparent border-r-brand-cyan border-t-brand-purple' />
                <img src={brandMark} alt='' className='h-6 w-auto' />
              </span>
              <p className='font-display text-[11px] font-semibold uppercase tracking-[0.3em] text-slate-500'>
                {t('sidebar.loggingOut')}
              </p>
            </div>
          </div>,
          document.body
        )}
    </>
  )
}
