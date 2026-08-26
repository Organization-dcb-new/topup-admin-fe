import type { ColumnDef } from '@tanstack/react-table'
import type { TFunction } from 'i18next'
import { Link } from 'react-router-dom'
import { Badge } from '@/components/ui/badge'
import { formatBackendDateTime } from '@/lib/backend-datetime'
import { formatCurrency } from '@/lib/format'
import { cn } from '@/lib/utils'
import type { Payment } from '@/types/transaction'

/** Warna per status; `default` menjaga status tak dikenal tetap terbaca. */
const statusClass = (status: Payment['status']) => {
  switch (status) {
    case 'PAID':
      return 'border-emerald-500/20 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300'
    case 'PROCESSING':
      return 'border-blue-500/20 bg-blue-500/10 text-blue-700 dark:text-blue-300'
    case 'PENDING':
      return 'border-amber-500/20 bg-amber-500/10 text-amber-700 dark:text-amber-300'
    case 'FAILED':
    case 'EXPIRED':
      return 'border-rose-500/20 bg-rose-500/10 text-rose-700 dark:text-rose-300'
    default:
      return 'border-border bg-muted text-muted-foreground'
  }
}

const dotClass = (status: Payment['status']) => {
  switch (status) {
    case 'PAID':
      return 'bg-emerald-500'
    case 'PROCESSING':
      return 'bg-blue-500 motion-safe:animate-pulse'
    case 'PENDING':
      return 'bg-amber-500 motion-safe:animate-pulse'
    case 'FAILED':
    case 'EXPIRED':
      return 'bg-rose-500'
    default:
      return 'bg-muted-foreground'
  }
}

export const getReferralTransactionColumns = (t: TFunction): ColumnDef<Payment>[] => [
  {
    accessorKey: 'payment_number',
    header: t('referralPage.detail.table.paymentNo'),
    cell: ({ row }) => (
      <Link
        to={`/transactions/${row.original.id}`}
        className='font-mono text-xs font-semibold text-primary hover:underline'
      >
        {row.original.payment_number}
      </Link>
    ),
  },
  {
    accessorKey: 'order_id',
    header: t('referralPage.detail.table.orderId'),
    meta: { headerClassName: 'hidden md:table-cell', cellClassName: 'hidden md:table-cell' },
    cell: ({ row }) => (
      <span
        className='block max-w-[120px] truncate font-mono text-xs text-muted-foreground'
        title={row.original.order_id}
      >
        {row.original.order_id}
      </span>
    ),
  },
  {
    accessorKey: 'amount',
    header: () => <span className='block text-right'>{t('referralPage.detail.table.amount')}</span>,
    cell: ({ row }) => (
      <span className='block text-right font-bold tabular-nums text-foreground'>
        {formatCurrency(row.original.amount)}
      </span>
    ),
  },
  {
    accessorKey: 'payment_channel',
    header: t('referralPage.detail.table.channel'),
    meta: { headerClassName: 'hidden lg:table-cell', cellClassName: 'hidden lg:table-cell' },
    cell: ({ row }) => (
      <span className='rounded border border-border bg-muted px-2 py-0.5 text-xs font-bold uppercase tracking-wider text-muted-foreground'>
        {row.original.payment_channel}
      </span>
    ),
  },
  {
    accessorKey: 'status',
    header: t('referralPage.detail.table.status'),
    cell: ({ row }) => {
      const status = row.original.status
      return (
        <Badge
          variant='outline'
          className={cn('gap-1.5 text-[10px] font-bold', statusClass(status))}
        >
          <span className={cn('h-1.5 w-1.5 shrink-0 rounded-full', dotClass(status))} aria-hidden />
          {status}
        </Badge>
      )
    },
  },
  {
    accessorKey: 'created_at',
    header: t('referralPage.detail.table.date'),
    meta: { headerClassName: 'hidden md:table-cell', cellClassName: 'hidden md:table-cell' },
    cell: ({ row }) => (
      <span className='whitespace-nowrap text-xs tabular-nums text-muted-foreground'>
        {formatBackendDateTime(row.original.created_at)}
      </span>
    ),
  },
]
