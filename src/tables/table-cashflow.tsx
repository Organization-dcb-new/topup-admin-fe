import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import i18n from '@/i18n'
import { copyTextToClipboard } from '@/lib/copy-to-clipboard'
import type { CashflowItem } from '@/types/cashflow'
import type { ColumnDef } from '@tanstack/react-table'
import type { TFunction } from 'i18next'
import { format } from 'date-fns'
import { enUS, id as idLocale } from 'date-fns/locale'
import { Copy, ChevronRight, Eye } from 'lucide-react'
import toast from 'react-hot-toast'
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

export function getCashflowColumns(
  t: TFunction,
  onViewDetail: (item: CashflowItem) => void
): ColumnDef<CashflowItem>[] {
  const copyId = async (value: string) => {
    try {
      await copyTextToClipboard(value)
      toast.success(t('cashflowTable.copySuccess'))
    } catch {
      toast.error(t('cashflowTable.copyError'))
    }
  }

  return [
    {
      accessorKey: 'created_at',
      header: () => <span className='font-medium'>{t('cashflowTable.colDate')}</span>,
      cell: ({ row }) => {
        const raw = row.original.created_at
        const date = new Date(raw)
        return (
          <span className='whitespace-nowrap tabular-nums text-sm text-foreground'>
            {format(date, 'dd MMM yyyy, HH:mm:ss', { locale: dateLocale() })}
          </span>
        )
      },
    },
    {
      accessorKey: 'type',
      header: () => <span className='font-medium'>{t('cashflowTable.colType')}</span>,
      cell: ({ row }) => {
        const type = row.original.type
        if (type === 'PROVIDER') {
          return (
            <Badge
              variant='secondary'
              className='bg-blue-50 text-blue-700 border-blue-200/60 hover:bg-blue-50'
            >
              {t('cashflowFilter.provider')}
            </Badge>
          )
        }
        if (type === 'PAYMENT_GATEWAY') {
          return (
            <Badge
              variant='secondary'
              className='bg-amber-50 text-amber-700 border-amber-200/60 hover:bg-amber-50'
            >
              {t('cashflowFilter.pg')}
            </Badge>
          )
        }
        return (
          <Badge
            variant='secondary'
            className='bg-emerald-50 text-emerald-700 border-emerald-200/60 hover:bg-emerald-50'
          >
            {t('cashflowFilter.revenue')}
          </Badge>
        )
      },
    },
    {
      accessorKey: 'amount',
      header: () => (
        <span className='block text-right font-medium'>{t('cashflowTable.colAmount')}</span>
      ),
      cell: ({ row }) => {
        const amount = row.original.amount
        return (
          <span className='block text-right tabular-nums text-sm font-semibold text-gray-900'>
            {formatIdr(amount)}
          </span>
        )
      },
    },
    {
      accessorKey: 'notes',
      header: () => <span className='font-medium'>{t('cashflowTable.colNotes')}</span>,
      cell: ({ row }) => (
        <span
          className='text-sm text-muted-foreground truncate max-w-[14rem] block cursor-pointer hover:text-primary hover:underline transition-all duration-200'
          onClick={() => onViewDetail(row.original)}
          title={row.original.notes}
        >
          {row.original.notes}
        </span>
      ),
    },
    {
      accessorKey: 'order_id',
      header: () => <span className='font-medium'>{t('cashflowTable.colOrderId')}</span>,
      cell: ({ row }) => {
        const orderId = row.original.order_id
        return (
          <div className='flex items-center gap-1 font-mono text-xs'>
            <span className='truncate max-w-[8rem]' title={orderId}>{orderId}</span>
            <Button
              type='button'
              variant='ghost'
              size='icon'
              className='h-6 w-6 text-muted-foreground hover:text-foreground'
              onClick={() => void copyId(orderId)}
              title={t('cashflowTable.colOrderId')}
            >
              <Copy className='h-3 w-3' aria-hidden />
            </Button>
          </div>
        )
      },
    },
    {
      accessorKey: 'payment_id',
      header: () => <span className='font-medium'>{t('cashflowTable.colPaymentId')}</span>,
      cell: ({ row }) => {
        const paymentId = row.original.payment_id
        if (!paymentId) return <span className='text-muted-foreground'>—</span>

        return (
          <div className='flex items-center gap-1 font-mono text-xs'>
            <Link
              to={`/transactions/${paymentId}`}
              className='group inline-flex items-center gap-0.5 text-primary hover:underline'
            >
              <span className='truncate max-w-[8rem]' title={paymentId}>{paymentId}</span>
              <ChevronRight className='h-3.5 w-3.5 opacity-60 group-hover:translate-x-0.5' />
            </Link>
            <Button
              type='button'
              variant='ghost'
              size='icon'
              className='h-6 w-6 text-muted-foreground hover:text-foreground'
              onClick={() => void copyId(paymentId)}
              title={t('cashflowTable.colPaymentId')}
            >
              <Copy className='h-3 w-3' aria-hidden />
            </Button>
          </div>
        )
      },
    },
    {
      id: 'actions',
      header: () => <span className='font-medium'>{t('cashflowTable.colActions', { defaultValue: 'Aksi' })}</span>,
      cell: ({ row }) => (
        <Button
          type='button'
          variant='ghost'
          size='sm'
          className='h-8 px-2 text-primary hover:text-primary/80 hover:bg-primary/5 flex items-center gap-1 font-medium transition-all duration-200'
          onClick={() => onViewDetail(row.original)}
        >
          <Eye className='h-4 w-4' />
          <span>{t('cashflowTable.btnDetail', { defaultValue: 'Detail' })}</span>
        </Button>
      ),
    },
  ]
}
