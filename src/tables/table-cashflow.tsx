import { CashflowTypeTag } from '@/components/Cashflow/CashflowTypeTag'
import { CopyButton } from '@/components/ui/copy-button'
import i18n from '@/i18n'
import type { CashflowItem } from '@/types/cashflow'
import type { ColumnDef } from '@tanstack/react-table'
import type { TFunction } from 'i18next'
import { format } from 'date-fns'
import { enUS, id as idLocale } from 'date-fns/locale'
import { ChevronRight, Eye } from 'lucide-react'
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
  return [
    {
      accessorKey: 'created_at',
      header: t('cashflowTable.colDate'),
      cell: ({ row }) => (
        <span className='whitespace-nowrap text-xs font-bold tabular-nums'>
          {format(new Date(row.original.created_at), 'dd MMM yyyy, HH:mm:ss', {
            locale: dateLocale(),
          })}
        </span>
      ),
    },
    {
      accessorKey: 'type',
      header: t('cashflowTable.colType'),
      cell: ({ row }) => <CashflowTypeTag t={t} type={row.original.type} />,
    },
    {
      accessorKey: 'amount',
      header: () => <span className='block text-right'>{t('cashflowTable.colAmount')}</span>,
      cell: ({ row }) => (
        <span className='block whitespace-nowrap text-right text-sm font-black tabular-nums'>
          {formatIdr(row.original.amount)}
        </span>
      ),
    },
    {
      accessorKey: 'notes',
      header: t('cashflowTable.colNotes'),
      cell: ({ row }) => (
        <button
          type='button'
          className='nb-focus block max-w-[14rem] cursor-pointer truncate text-left text-xs font-bold underline-offset-2 hover:underline'
          onClick={() => onViewDetail(row.original)}
          title={row.original.notes}
        >
          {row.original.notes || '—'}
        </button>
      ),
    },
    {
      accessorKey: 'order_id',
      header: t('cashflowTable.colOrderId'),
      cell: ({ row }) => {
        const orderId = row.original.order_id
        if (!orderId) return <span className='font-black text-[#111]/70'>—</span>
        return (
          <div className='flex items-center gap-1.5'>
            <span className='max-w-[8rem] truncate font-mono text-xs font-bold' title={orderId}>
              {orderId}
            </span>
            <CopyButton
              value={orderId}
              label={t('cashflowTable.colOrderId')}
              errorLabel={t('cashflowTable.copyError')}
              className='h-7 w-7'
            />
          </div>
        )
      },
    },
    {
      accessorKey: 'payment_id',
      header: t('cashflowTable.colPaymentId'),
      cell: ({ row }) => {
        const paymentId = row.original.payment_id
        if (!paymentId) return <span className='font-black text-[#111]/70'>—</span>

        return (
          <div className='flex items-center gap-1.5'>
            <Link
              to={`/transactions/${paymentId}`}
              className='nb-focus group inline-flex min-w-0 items-center gap-0.5 font-mono text-xs font-bold underline-offset-2 hover:underline'
            >
              <span className='max-w-[8rem] truncate' title={paymentId}>
                {paymentId}
              </span>
              <ChevronRight
                className='h-3.5 w-3.5 shrink-0 transition-transform group-hover:translate-x-0.5'
                strokeWidth={3}
                aria-hidden
              />
            </Link>
            <CopyButton
              value={paymentId}
              label={t('cashflowTable.colPaymentId')}
              errorLabel={t('cashflowTable.copyError')}
              className='h-7 w-7'
            />
          </div>
        )
      },
    },
    {
      id: 'actions',
      header: () => <span className='block text-right'>{t('cashflowTable.colActions')}</span>,
      cell: ({ row }) => (
        <div className='flex justify-end'>
          <button
            type='button'
            className='nb-frame nb-frame-thin nb-sd-sm nb-press-sm flex h-8 cursor-pointer items-center gap-1.5 bg-[#ffd84d] px-2 text-[10px] font-black uppercase tracking-[0.12em]'
            onClick={() => onViewDetail(row.original)}
          >
            <Eye className='h-3.5 w-3.5 shrink-0' strokeWidth={3} aria-hidden />
            {t('cashflowTable.btnDetail')}
          </button>
        </div>
      ),
    },
  ]
}
