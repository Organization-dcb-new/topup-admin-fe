import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { RefreshCw } from 'lucide-react'

import { AuthAlert } from '@/components/Auth/AuthPanel'
import { Can } from '@/components/Auth/Can'
import { hudEyebrowClass } from '@/components/Auth/hud-styles'
import { DashboardLayout } from '@/components/Layout/dashboard-layout'
import {
  TransactionStopConfirmDialog,
  type TransactionStopConfirm,
} from '@/components/TransactionStop/TransactionStopConfirmDialog'
import { TransactionStopControls, TransactionStopReadOnly } from '@/components/TransactionStop/TransactionStopControls'
import { TransactionStopStatusCard } from '@/components/TransactionStop/TransactionStopStatusCard'
import { PERM } from '@/constants/permissions'
import { useNow } from '@/hooks/useNow'
import { useGetTransactionStop, useUpdateTransactionStop } from '@/hooks/useTransactionStop'

export default function TransactionStopPage() {
  const { t } = useTranslation('common')
  const now = useNow()
  const { data, isLoading, isError, refetch } = useGetTransactionStop()
  const update = useUpdateTransactionStop()
  const [confirm, setConfirm] = useState<TransactionStopConfirm | null>(null)

  const runConfirmed = (target: TransactionStopConfirm) => {
    const close = { onSuccess: () => setConfirm(null) }
    if (target.kind === 'stop') update.mutate({ action: 'stop', payload: target.payload }, close)
    // A missing message keeps the saved one for the next stop; the reopen time is cleared.
    else update.mutate({ action: 'resume', payload: { is_stopped: false } }, close)
  }

  return (
    <DashboardLayout>
      <div className='mx-auto max-w-6xl space-y-6'>
        <header className='space-y-1'>
          <p className={hudEyebrowClass}>{t('transactionStopPage.eyebrow')}</p>
          <h1 className='font-display text-3xl font-bold tracking-tight text-slate-900'>{t('transactionStopPage.title')}</h1>
          <p className='max-w-2xl text-sm leading-relaxed text-slate-500'>{t('transactionStopPage.subtitle')}</p>
        </header>

        {isError && !data && (
          <div className='space-y-3'>
            <AuthAlert>{t('transactionStopPage.loadError')}</AuthAlert>
            <button
              type='button'
              onClick={() => void refetch()}
              className='inline-flex h-9 items-center gap-2 rounded-md border border-slate-200 bg-white px-3 text-sm font-medium text-slate-600 transition-colors hover:text-brand-purple'
            >
              <RefreshCw className='size-4' aria-hidden />
              {t('transactionStopPage.retry')}
            </button>
          </div>
        )}

        {isLoading && (
          <div className='grid gap-5 lg:grid-cols-2' aria-hidden>
            <div className='h-96 animate-pulse bg-slate-200/60 hud-clip' />
            <div className='h-96 animate-pulse bg-slate-200/60 hud-clip' />
          </div>
        )}

        {data && (
          <div className='grid items-stretch gap-5 lg:grid-cols-2'>
            <TransactionStopStatusCard state={data} now={now} />
            <Can permission={PERM.transactionStopUpdate} fallback={<TransactionStopReadOnly />}>
              <TransactionStopControls
                // Start the form again from the server whenever its state changes (a save, a stop,
                // another admin, or the stop lifting at its reopen time).
                key={`${data.is_stopped}-${data.updated_at ?? ''}`}
                state={data}
                pending={update.isPending}
                onStop={(payload) => setConfirm({ kind: 'stop', payload })}
                onSave={(payload) => update.mutate({ action: 'save', payload })}
                onResume={() => setConfirm({ kind: 'resume' })}
              />
            </Can>
          </div>
        )}
      </div>

      <TransactionStopConfirmDialog
        target={confirm}
        onClose={() => setConfirm(null)}
        pending={update.isPending}
        onConfirm={runConfirmed}
      />
    </DashboardLayout>
  )
}
