import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Send, TriangleAlert } from 'lucide-react'

import { ConfirmActionDialog } from '@/components/Games/ConfirmActionDialog'
import { PERM } from '@/constants/permissions'
import { usePermissions } from '@/hooks/usePermissions'
import { useRetryFulfilment } from '@/hooks/useTransaction'
import type { TransactionDetail } from '@/types/transaction'

/**
 * The buyer paid but the supplier order failed (FULFILMENT_FAILED). Says so, and lets an admin with
 * `transaction.retry` send the order to the supplier again once the cause (balance, mapping) is fixed.
 */
export function TransactionFulfilmentRetry({ detail }: { detail: TransactionDetail }) {
  const { t } = useTranslation('common')
  const { can } = usePermissions()
  const [confirming, setConfirming] = useState(false)
  const retry = useRetryFulfilment(detail.id)
  const number = detail.order?.order_number || detail.payment_number

  return (
    <section
      role='status'
      className='flex flex-col gap-4 border border-rose-200 border-l-[3px] border-l-rose-500 bg-rose-50 px-4 py-4 hud-clip-sm animate-in fade-in slide-in-from-bottom-2 duration-500 ease-hud sm:flex-row sm:items-center sm:justify-between sm:px-5'
    >
      <div className='flex min-w-0 items-start gap-3'>
        <TriangleAlert className='mt-0.5 size-5 shrink-0 text-rose-500' aria-hidden />
        <div className='min-w-0 space-y-1'>
          <p className='text-sm font-semibold text-rose-800'>{t('transactionDetailPage.retryFulfilment.title')}</p>
          <p className='text-sm leading-relaxed text-rose-700'>
            {can(PERM.transactionRetry)
              ? t('transactionDetailPage.retryFulfilment.body')
              : t('transactionDetailPage.retryFulfilment.bodyNoAccess')}
          </p>
        </div>
      </div>

      {can(PERM.transactionRetry) && (
        <button
          type='button'
          onClick={() => setConfirming(true)}
          disabled={retry.isPending}
          className='inline-flex h-10 shrink-0 items-center justify-center gap-2 bg-rose-600 px-4 font-display text-xs font-bold uppercase tracking-[0.18em] text-white hud-clip-sm transition-[background-color,opacity] hover:bg-rose-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-white/90 disabled:opacity-60'
        >
          <Send className='size-4' aria-hidden />
          {t('transactionDetailPage.retryFulfilment.button')}
        </button>
      )}

      <ConfirmActionDialog
        open={confirming}
        onOpenChange={setConfirming}
        icon={Send}
        spinIcon={false}
        eyebrow={t('transactionDetailPage.retryFulfilment.confirmEyebrow')}
        title={t('transactionDetailPage.retryFulfilment.confirmTitle')}
        description={t('transactionDetailPage.retryFulfilment.confirmBody', { number })}
        confirmLabel={t('transactionDetailPage.retryFulfilment.confirm')}
        cancelLabel={t('transactionDetailPage.retryFulfilment.cancel')}
        pendingLabel={t('transactionDetailPage.retryFulfilment.pending')}
        pending={retry.isPending}
        // Closed either way: a 409 means the order is no longer waiting, and the page refreshes to show why.
        onConfirm={() => retry.mutate(undefined, { onSettled: () => setConfirming(false) })}
      />
    </section>
  )
}
