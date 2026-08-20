import {
  PaymentStatusTag,
  ProviderStatusTag,
  TransactionCopyCell,
} from '@/components/Transaction/TransactionCells'
import { CopyButton } from '@/components/ui/copy-button'
import i18n from '@/i18n'
import { parseBackendDate } from '@/lib/backend-datetime'
import { cn } from '@/lib/utils'
import type { Payment } from '@/types/transaction'
import type { ColumnDef } from '@tanstack/react-table'
import type { TFunction } from 'i18next'
import { format } from 'date-fns'
import { enUS, id as idLocale } from 'date-fns/locale'
import { ChevronRight } from 'lucide-react'
import { Link } from 'react-router-dom'

function formatIdr(value: number) {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0,
  }).format(value)
}

function dateLocale() {
  return i18n.language.startsWith('id') ? idLocale : enUS
}

export function getPaymentColumns(t: TFunction): ColumnDef<Payment>[] {
  return [
    {
      accessorKey: 'id',
      header: () => (
        <span className='block'>
          {t('transactionTable.colTransactionId')}
          <span className='mt-0.5 block text-[10px] font-bold normal-case tracking-normal text-[#111]/60'>
            {t('transactionTable.colTransactionIdSub')}
          </span>
        </span>
      ),
      cell: ({ row }) => {
        const txId = row.original.id
        return (
          <div className='flex max-w-[min(100%,18rem)] items-center gap-1.5'>
            <Link
              to={`/transactions/${txId}`}
              className='nb-focus group inline-flex min-w-0 flex-1 items-center gap-1 text-left font-bold underline-offset-2'
              title={t('transactionTable.openDetailTitle', { id: txId })}
              aria-label={t('transactionTable.openDetailAria', { id: txId })}
            >
              <span className='min-w-0 select-text truncate font-mono text-xs group-hover:underline'>
                {txId}
              </span>
              <ChevronRight
                className='h-4 w-4 shrink-0 transition-transform group-hover:translate-x-0.5'
                strokeWidth={3}
                aria-hidden
              />
            </Link>
            <CopyButton
              value={txId}
              label={t('transactionTable.copyIdAria')}
              errorLabel={t('transactionTable.copyError')}
              className='h-7 w-7'
            />
          </div>
        )
      },
    },
    {
      accessorKey: 'payment_number',
      header: t('transactionTable.colPayNumber'),
      cell: ({ row }) => <TransactionCopyCell value={row.original.payment_number} t={t} />,
    },
    {
      accessorKey: 'app_name',
      header: t('transactionTable.colApp'),
      cell: ({ row }) => (
        <span
          className='block max-w-[10rem] truncate font-black uppercase tracking-tight'
          title={row.original.app_name}
        >
          {row.original.app_name}
        </span>
      ),
    },
    {
      accessorKey: 'order_id',
      header: t('transactionTable.colOrderId'),
      cell: ({ row }) => <TransactionCopyCell value={row.original.order_id} t={t} />,
    },
    {
      accessorKey: 'amount',
      header: () => <span className='block text-right'>{t('transactionTable.colAmount')}</span>,
      cell: ({ row }) => (
        <span className='block whitespace-nowrap text-right text-sm font-black tabular-nums'>
          {formatIdr(row.original.amount)}
        </span>
      ),
    },
    {
      accessorKey: 'margin',
      header: () => <span className='block text-right'>{t('transactionTable.colMargin')}</span>,
      cell: ({ row }) => {
        const margin = row.original.margin
        return (
          <span className='flex justify-end'>
            <span
              className={cn(
                'whitespace-nowrap px-1 text-sm font-black tabular-nums',
                margin < 0 ? 'bg-[#ff4d3d]' : 'bg-[#c9f24d]',
              )}
            >
              {formatIdr(margin)}
            </span>
          </span>
        )
      },
    },
    {
      accessorKey: 'payment_channel',
      header: t('transactionTable.colChannel'),
      cell: ({ row }) => (
        <span className='nb-frame nb-frame-thin inline-flex items-center whitespace-nowrap bg-white px-2 py-1 text-[10px] font-black uppercase tracking-[0.1em]'>
          {row.original.payment_channel}
        </span>
      ),
    },
    {
      accessorKey: 'va_number',
      header: t('transactionTable.colVa'),
      cell: ({ row }) => {
        const val = row.original.va_number
        return val ? (
          <TransactionCopyCell value={val} t={t} />
        ) : (
          <span className='font-black text-[#111]/70'>—</span>
        )
      },
    },
    {
      accessorKey: 'status',
      header: t('transactionTable.colStatus'),
      cell: ({ row }) => <PaymentStatusTag status={row.original.status} t={t} />,
    },
    {
      accessorKey: 'status_provider',
      header: t('transactionTable.colStatusProvider'),
      cell: ({ row }) => <ProviderStatusTag status={row.original.status_provider} />,
    },
    {
      accessorKey: 'created_at',
      header: t('transactionTable.colCreated'),
      cell: ({ row }) => {
        const date = parseBackendDate(row.original.created_at)
        return (
          <span className='whitespace-nowrap text-xs font-bold tabular-nums'>
            {date ? format(date, 'dd MMM yyyy, HH:mm:ss', { locale: dateLocale() }) : '—'}
          </span>
        )
      },
    },
  ]
}
