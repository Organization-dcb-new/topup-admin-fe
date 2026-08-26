import { useEffect, useRef, useState } from 'react'
import { copyTextToClipboard } from '@/lib/copy-to-clipboard'
import type { Payment } from '@/types/transaction'
import type { ColumnDef } from '@tanstack/react-table'
import type { TFunction } from 'i18next'
import { formatBackendDateTime } from '@/lib/backend-datetime'
import { formatCurrency } from '@/lib/format'
import { ChevronRight, Copy, Check } from 'lucide-react'
import toast from 'react-hot-toast'
import { useTranslation } from 'react-i18next'
import { Button } from '@/components/ui/button'
import { Link } from 'react-router-dom'
import { TransactionStatusBadge } from '@/components/Transaction/TransactionStatusBadge'

function CopyHoverCell({ value }: { value: string }) {
  const { t } = useTranslation('common')
  const [copied, setCopied] = useState(false)
  const resetTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    return () => {
      if (resetTimerRef.current) clearTimeout(resetTimerRef.current)
    }
  }, [])

  const handleCopy = async (e: React.MouseEvent) => {
    e.stopPropagation()
    try {
      await copyTextToClipboard(value)
    } catch {
      toast.error(t('transactionTable.copyValueError'))
      return
    }
    setCopied(true)
    if (resetTimerRef.current) clearTimeout(resetTimerRef.current)
    resetTimerRef.current = setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className='group flex items-center gap-1.5 min-w-0'>
      <span className='font-mono text-sm truncate text-slate-700 dark:text-slate-300'>{value}</span>
      <Button
        type='button'
        variant='ghost'
        size='icon'
        onClick={(e) => void handleCopy(e)}
        className='h-6 w-6 opacity-0 group-hover:opacity-100 group-focus-within:opacity-100 focus-visible:opacity-100 transition-opacity duration-200 motion-reduce:transition-none hover:bg-slate-100 dark:hover:bg-zinc-800 rounded-md cursor-pointer'
        aria-label={t('transactionTable.copyValueAria', { value })}
      >
        {copied ? (
          <Check className='h-3 w-3 text-success' aria-hidden />
        ) : (
          <Copy className='h-3 w-3 text-slate-400 dark:text-slate-500' aria-hidden />
        )}
      </Button>
    </div>
  )
}

export function getPaymentColumns(
  t: TFunction
): ColumnDef<Payment>[] {
  const copyTransactionId = async (value: string) => {
    try {
      await copyTextToClipboard(value)
    } catch {
      toast.error(t('transactionTable.copyError'))
      return
    }
    toast.success(t('transactionTable.copySuccess'))
  }

  return [
    {
      accessorKey: 'id',
      header: () => (
        <span className='font-medium'>
          {t('transactionTable.colTransactionId')}
          <span className='mt-0.5 block text-[10px] font-normal normal-case tracking-normal text-muted-foreground'>
            {t('transactionTable.colTransactionIdSub')}
          </span>
        </span>
      ),
      cell: ({ row }) => {
        const txId = row.original.id
        return (
          <div className='flex max-w-[min(100%,18rem)] items-center gap-0.5'>
            <Link
              to={`/transactions?tx=${txId}`}
              className='group inline-flex min-w-0 flex-1 items-center gap-1 rounded-md py-0.5 pl-0.5 pr-1 text-left font-medium text-primary transition-colors hover:bg-primary/5 focus-visible:bg-primary/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2'
              title={t('transactionTable.openDetailTitle', { id: txId })}
              aria-label={t('transactionTable.openDetailAria', { id: txId })}
            >
              <span className='min-w-0 select-text truncate font-mono text-sm underline-offset-4 group-hover:underline'>
                {txId}
              </span>
              <ChevronRight
                className='h-4 w-4 shrink-0 text-primary/60 transition-transform motion-reduce:transition-none group-hover:translate-x-0.5 group-hover:text-primary'
                aria-hidden
              />
            </Link>
            <Button
              type='button'
              variant='ghost'
              size='icon'
              className='h-8 w-8 shrink-0 text-muted-foreground hover:text-foreground'
              title={t('transactionTable.copyIdTitle')}
              aria-label={t('transactionTable.copyIdAria')}
              onClick={() => void copyTransactionId(txId)}
            >
              <Copy className='h-3.5 w-3.5' aria-hidden />
            </Button>
          </div>
        )
      },
    },
    {
      accessorKey: 'payment_number',
      header: () => <span className='font-medium'>{t('transactionTable.colPayNumber')}</span>,
      cell: ({ row }) => <CopyHoverCell value={row.original.payment_number} />,
    },
    {
      accessorKey: 'app_name',
      header: () => <span className='font-medium'>{t('transactionTable.colApp')}</span>,
      cell: ({ row }) => (
        <span className='max-w-[10rem] truncate text-sm font-semibold text-slate-700 dark:text-slate-300' title={row.original.app_name}>
          {row.original.app_name}
        </span>
      ),
    },
    {
      accessorKey: 'order_id',
      header: () => <span className='font-medium'>{t('transactionTable.colOrderId')}</span>,
      cell: ({ row }) => <CopyHoverCell value={row.original.order_id} />,
    },
    {
      accessorKey: 'amount',
      header: () => (
        <span className='block text-right font-medium'>{t('transactionTable.colAmount')}</span>
      ),
      cell: ({ row }) => (
        <span className='block text-right text-sm font-bold tabular-nums text-slate-900 dark:text-white'>
          {formatCurrency(row.original.amount)}
        </span>
      ),
    },
    {
      accessorKey: 'margin',
      header: () => (
        <span className='block text-right font-medium'>{t('transactionTable.colMargin')}</span>
      ),
      cell: ({ row }) => (
        <span className='block text-right text-sm font-semibold tabular-nums text-success'>
          {formatCurrency(row.original.margin)}
        </span>
      ),
    },
    {
      accessorKey: 'payment_channel',
      header: () => <span className='font-medium'>{t('transactionTable.colChannel')}</span>,
      cell: ({ row }) => (
        <span className='text-xs font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-slate-100 dark:bg-zinc-900 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-zinc-800'>
          {row.original.payment_channel}
        </span>
      ),
    },
    {
      accessorKey: 'va_number',
      header: () => <span className='font-medium'>{t('transactionTable.colVa')}</span>,
      cell: ({ row }) => {
        const val = row.original.va_number
        return val ? <CopyHoverCell value={val} /> : <span className='text-slate-400 italic'>—</span>
      },
    },
    {
      accessorKey: 'status',
      header: () => <span className='font-medium'>{t('transactionTable.colStatus')}</span>,
      cell: ({ row }) => <TransactionStatusBadge status={row.original.status} />,
    },
    {
      accessorKey: 'status_provider',
      header: () => <span className='font-medium'>{t('transactionTable.colStatusProvider')}</span>,
      cell: ({ row }) => {
        const sp = row.original.status_provider
        if (!sp) return <span className='text-sm text-muted-foreground'>—</span>
        return <TransactionStatusBadge status={sp} />
      },
    },
    {
      accessorKey: 'created_at',
      header: () => <span className='font-medium'>{t('transactionTable.colCreated')}</span>,
      cell: ({ row }) => (
        <span className='whitespace-nowrap text-sm tabular-nums text-muted-foreground'>
          {formatBackendDateTime(row.original.created_at)}
        </span>
      ),
    },
  ]
}
