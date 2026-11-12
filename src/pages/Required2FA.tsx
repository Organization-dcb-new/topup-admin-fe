import { useState } from 'react'
import { Navigate, useNavigate, useSearchParams } from 'react-router-dom'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import { useTranslation } from 'react-i18next'
import { Loader2, LogOut } from 'lucide-react'

import { HandoffStatus, SessionCheck } from '@/components/Auth/AuthPanel'
import Setup2FA from '@/components/Auth/Setup2Fa'
import { clearAuthSession, getSafeRedirect, useAuthUser, withRedirect, type AuthSession } from '@/lib/auth'

/**
 * Mandatory 2FA setup. An admin whose role must use 2FA and has none gets a session that opens only
 * this (the backend answers every other admin route with 403 "Two-factor setup required"). Activating
 * swaps it for a full session, and the admin continues to the page they asked for.
 */
export default function Required2FAPage() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [searchParams] = useSearchParams()
  const redirectTo = getSafeRedirect(searchParams.get('redirect'))
  const { isAuthenticated, isMfaRequired, isMfaSetupRequired, isLoading } = useAuthUser()
  const [handoff, setHandoff] = useState(false)

  const { mutate: leave, isPending: isLeaving } = useMutation({
    mutationFn: () => clearAuthSession(queryClient),
  })

  const activated = (session: AuthSession) => {
    if (session.user && !session.mfa_setup) {
      setHandoff(true)
      return
    }
    // 2FA is on, but the cookie was not upgraded: signing in again gives a full session.
    toast.error(t('authErrors.sessionNotStarted'))
    leave()
  }

  // Only a pending setup belongs here; our own activation leaves through the handoff.
  if (!handoff && !isLoading) {
    if (isAuthenticated) return <Navigate to={redirectTo} replace />
    if (isMfaRequired) return <Navigate to={withRedirect('/verify-otp', redirectTo)} replace />
    if (!isMfaSetupRequired) return <Navigate to={withRedirect('/login', redirectTo)} replace />
  }

  if (isLoading) return <SessionCheck />

  if (handoff) {
    return (
      <HandoffStatus
        variant='granted'
        onDone={() => navigate(redirectTo, { replace: true, viewTransition: true })}
      />
    )
  }

  return (
    <>
      <Setup2FA variant='required' onActivated={activated} />

      <div className='mt-6 flex justify-center border-t border-slate-100 pt-5 text-sm'>
        <button
          type='button'
          onClick={() => leave()}
          disabled={isLeaving}
          className='inline-flex items-center gap-1.5 rounded-sm text-slate-500 transition-colors duration-200 hover:text-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-purple/40 disabled:opacity-50'
        >
          {isLeaving ? (
            <Loader2 className='size-3.5 animate-spin' aria-hidden />
          ) : (
            <LogOut className='size-3.5' aria-hidden />
          )}
          {t('twoFaRequired.logout')}
        </button>
      </div>
    </>
  )
}
