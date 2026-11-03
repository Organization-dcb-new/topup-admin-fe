import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { ChevronRight } from 'lucide-react'

import { formatBackendDateTime } from '@/lib/backend-datetime'
import { formatCurrency } from '@/lib/format'
import { cn } from '@/lib/utils'
import type { Payment, TransactionRowState } from '@/types/transaction'
import { ChannelChip, CopyValueButton, PaymentStatusChip, ProviderStatusChip } from './TransactionParts'

/** Dense transaction rows; each opens the detail and hands it what only the list knows. */
export function TransactionList({ rows }: { rows: Payment[] }) {
  return (
    <ul className='divide-y divide-slate-100 bg-white hud-clip'>
      {rows.map((row, index) => (
        <TransactionRow key={row.id} row={row} order={index} />
      ))}
    </ul>
  )
}

function TransactionRow({ row, order }: { row: Payment; order: number }) {
  const { t } = useTranslation('common')
  const state: { row: TransactionRowState } = {
    row: { id: row.id, margin: row.margin, status_provider: row.status_provider, app_name: row.app_name },
  }
  const margin = row.margin ?? 0

  return (
    <li
      className='group relative animate-in fade-in duration-300 fill-mode-both'
      style={{ animationDelay: `${Math.min(order, 14) * 18}ms` }}
    >
      {/* Stretched link: the whole row opens the detail, while the copy buttons stay clickable on top. */}
      <Link
        to={`/transactions/${row.id}`}
        state={state}
        aria-label={t('transactionPage.openDetail', { number: row.payment_number || row.id })}
        className='absolute inset-0 z-0 transition-colors hover:bg-brand-purple/[0.03] focus-visible:bg-brand-purple/[0.05] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-brand-purple/40'
      />
      <div className='pointer-events-none relative grid grid-cols-[minmax(0,1fr)_auto] items-center gap-x-4 gap-y-2 px-4 py-3 sm:px-5 lg:grid-cols-[7.5rem_minmax(0,1fr)_8.5rem_10.5rem_7rem_1rem]'>
        <div className='hidden lg:block'>
          <PaymentStatusChip status={row.status} />
        </div>

        <div className='min-w-0'>
          <p className='truncate text-sm font-semibold text-slate-900 transition-colors group-hover:text-brand-purple'>
            {row.app_name || t('transactionPage.row.unknownGame')}
          </p>
          <div className='flex min-w-0 items-center gap-0.5'>
            <span className='truncate font-mono text-xs text-slate-500'>{row.payment_number || row.id}</span>
            <CopyValueButton
              value={row.payment_number || row.id}
              label={t('transactionPage.row.paymentNumber')}
              className='pointer-events-auto relative z-10 size-6 opacity-0 transition-opacity group-hover:opacity-100 focus-visible:opacity-100'
            />
          </div>
        </div>

        <div className='text-right lg:hidden'>
          <p className='text-sm font-bold tabular-nums text-slate-900'>{formatCurrency(row.amount)}</p>
          <PaymentStatusChip status={row.status} className='mt-1' />
        </div>

        <div className='col-span-2 flex min-w-0 flex-wrap items-center gap-x-2 gap-y-1 lg:col-span-1 lg:flex-col lg:items-start lg:gap-1'>
          <ChannelChip channel={row.payment_channel} />
          <span className='lg:hidden'>
            <ProviderStatusChip status={row.status_provider} />
          </span>
          <span className='ml-auto text-xs tabular-nums text-slate-400 lg:hidden'>
            {formatBackendDateTime(row.created_at, 'dd MMM, HH:mm')}
          </span>
          {row.va_number && <span className='hidden truncate font-mono text-[11px] text-slate-400 lg:block'>VA {row.va_number}</span>}
        </div>

        <div className='hidden text-right lg:block'>
          <p className='text-sm font-bold tabular-nums text-slate-900'>{formatCurrency(row.amount)}</p>
          <p className={cn('text-xs tabular-nums', margin < 0 ? 'text-rose-600' : 'text-emerald-600')}>
            {t('transactionPage.row.margin', { value: formatCurrency(margin) })}
          </p>
        </div>

        <div className='hidden text-xs tabular-nums lg:block'>
          <p className='font-semibold text-slate-700'>{formatBackendDateTime(row.created_at, 'HH:mm:ss')}</p>
          <p className='text-slate-400'>{formatBackendDateTime(row.created_at, 'dd MMM yyyy')}</p>
          <div className='mt-1'>
            <ProviderStatusChip status={row.status_provider} />
          </div>
        </div>

        <ChevronRight
          className='hidden size-4 text-slate-300 transition-transform duration-300 ease-hud group-hover:translate-x-0.5 group-hover:text-brand-purple lg:block'
          aria-hidden
        />
      </div>
    </li>
  )
}
