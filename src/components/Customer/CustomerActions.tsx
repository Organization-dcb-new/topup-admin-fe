import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Info, Send, UserRoundCheck, UserRoundPen, UserRoundX } from 'lucide-react'

import { DangerDialog } from '@/components/Auth/DangerDialog'
import { ConfirmActionDialog } from '@/components/Games/ConfirmActionDialog'
import { useCooldown } from '@/hooks/useCooldown'
import { toCustomerError, useSendCustomerPasswordReset, useSetCustomerStatus } from '@/hooks/useCustomer'
import { cn } from '@/lib/utils'
import type { CustomerDetail } from '@/types/customer'
import { CustomerEditDialog } from './CustomerEditDialog'

/** The backend sends one reset email a minute per address. */
const RESET_COOLDOWN_SECONDS = 60

const actionButtonClass =
  'inline-flex h-9 items-center gap-2 bg-white px-3 text-sm font-medium text-slate-600 ring-1 ring-inset ring-slate-200 hud-clip-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-purple/40 disabled:cursor-not-allowed disabled:opacity-50'

/**
 * Edit, activate/deactivate and password reset, each behind a confirmation. Render it only for
 * admins holding customer.update; key it by customer so a cooldown never carries over to another account.
 */
export function CustomerActions({ customer }: { customer: CustomerDetail }) {
  const { t } = useTranslation('common')
  const [editOpen, setEditOpen] = useState(false)
  // The status the admin is about to set; null while no confirmation is open.
  const [statusTarget, setStatusTarget] = useState<boolean | null>(null)
  const [resetOpen, setResetOpen] = useState(false)
  const setStatus = useSetCustomerStatus()
  const sendReset = useSendCustomerPasswordReset()
  const resetCooldown = useCooldown()

  const displayName = customer.name || customer.email
  const resetBlocked = !customer.is_active

  const confirmStatus = () => {
    if (statusTarget === null) return
    setStatus.mutate({ id: customer.id, isActive: statusTarget }, { onSuccess: () => setStatusTarget(null) })
  }

  const confirmReset = () =>
    sendReset.mutate(
      { id: customer.id, email: customer.email },
      {
        onSuccess: () => {
          setResetOpen(false)
          resetCooldown.start(RESET_COOLDOWN_SECONDS)
        },
        onError: (err) => {
          const error = toCustomerError(err)
          // Rate-limited or the account was just deactivated: retrying from this dialog won't help.
          if (error.retryAfter) resetCooldown.start(error.retryAfter)
          if (error.retryAfter || error.status === 409) setResetOpen(false)
        },
      }
    )

  return (
    <div className='space-y-2'>
      <div className='flex flex-wrap gap-2'>
        <button type='button' onClick={() => setEditOpen(true)} className={cn(actionButtonClass, 'hover:text-brand-purple')}>
          <UserRoundPen className='size-4' aria-hidden />
          {t('customerPage.actions.edit')}
        </button>

        {customer.is_active ? (
          <button type='button' onClick={() => setStatusTarget(false)} className={cn(actionButtonClass, 'hover:text-rose-600')}>
            <UserRoundX className='size-4' aria-hidden />
            {t('customerPage.actions.deactivate')}
          </button>
        ) : (
          <button type='button' onClick={() => setStatusTarget(true)} className={cn(actionButtonClass, 'hover:text-emerald-600')}>
            <UserRoundCheck className='size-4' aria-hidden />
            {t('customerPage.actions.activate')}
          </button>
        )}

        <button
          type='button'
          onClick={() => setResetOpen(true)}
          disabled={resetBlocked || resetCooldown.active}
          aria-describedby={resetBlocked ? `reset-hint-${customer.id}` : undefined}
          className={cn(actionButtonClass, 'hover:text-brand-purple disabled:hover:text-slate-600')}
        >
          <Send className='size-4' aria-hidden />
          {resetCooldown.active
            ? t('customerPage.actions.resetCooldown', { seconds: resetCooldown.remaining })
            : t('customerPage.actions.sendReset')}
        </button>
      </div>

      {resetBlocked && (
        <p id={`reset-hint-${customer.id}`} className='flex items-start gap-1.5 text-xs leading-relaxed text-slate-500'>
          <Info className='mt-0.5 size-3.5 shrink-0 text-slate-400' aria-hidden />
          {t('customerPage.actions.resetBlockedHint')}
        </p>
      )}

      <CustomerEditDialog customer={customer} open={editOpen} onOpenChange={setEditOpen} />

      <DangerDialog
        open={statusTarget === false}
        onOpenChange={(open) => !open && setStatusTarget(null)}
        icon={UserRoundX}
        eyebrow={t('customerPage.deactivateConfirm.eyebrow')}
        title={t('customerPage.deactivateConfirm.title', { name: displayName })}
        description={
          <>
            <span className='block'>{t('customerPage.deactivateConfirm.description')}</span>
            <span className='mt-2 block'>{t('customerPage.deactivateConfirm.sessionNote')}</span>
          </>
        }
        confirmLabel={t('customerPage.deactivateConfirm.confirm')}
        cancelLabel={t('customerPage.deactivateConfirm.cancel')}
        pending={setStatus.isPending}
        onConfirm={confirmStatus}
      />

      <ConfirmActionDialog
        open={statusTarget === true}
        onOpenChange={(open) => !open && setStatusTarget(null)}
        icon={UserRoundCheck}
        spinIcon={false}
        eyebrow={t('customerPage.activateConfirm.eyebrow')}
        title={t('customerPage.activateConfirm.title', { name: displayName })}
        description={t('customerPage.activateConfirm.description')}
        confirmLabel={t('customerPage.activateConfirm.confirm')}
        cancelLabel={t('customerPage.activateConfirm.cancel')}
        pendingLabel={t('customerPage.activateConfirm.pending')}
        pending={setStatus.isPending}
        onConfirm={confirmStatus}
      />

      <ConfirmActionDialog
        open={resetOpen}
        onOpenChange={setResetOpen}
        icon={Send}
        spinIcon={false}
        eyebrow={t('customerPage.resetConfirm.eyebrow')}
        title={t('customerPage.resetConfirm.title')}
        description={
          <>
            <span className='block'>{t('customerPage.resetConfirm.description', { email: customer.email })}</span>
            <span className='mt-2 block'>{t('customerPage.resetConfirm.passwordNote')}</span>
            {!customer.has_password && <span className='mt-2 block'>{t('customerPage.resetConfirm.noPasswordNote')}</span>}
          </>
        }
        confirmLabel={t('customerPage.resetConfirm.confirm')}
        cancelLabel={t('customerPage.resetConfirm.cancel')}
        pendingLabel={t('customerPage.resetConfirm.pending')}
        pending={sendReset.isPending}
        onConfirm={confirmReset}
      />
    </div>
  )
}
