import i18n from '@/i18n'
import type { SummaryItem } from '@/types/summary'
import { cn } from '@/lib/utils'
import type { ColumnDef } from '@tanstack/react-table'
import type { TFunction } from 'i18next'
import { format } from 'date-fns'
import { enUS, id as idLocale } from 'date-fns/locale'

function formatIdr(value: number) {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
  }).format(value)
}

function dateLocale() {
  return i18n.language.startsWith('id') ? idLocale : enUS
}

export function getSummaryColumns(t: TFunction): ColumnDef<SummaryItem>[] {
  return [
    {
      accessorKey: 'time_key',
      header: () => <span className='font-medium'>{t('summaryTable.colTime')}</span>,
      cell: ({ row }) => {
        const raw = row.getValue('time_key') as string
        const date = new Date(raw)
        return (
          <span className='whitespace-nowrap tabular-nums text-sm text-foreground'>
            {format(date, 'dd MMM yyyy, HH:00', { locale: dateLocale() })}
          </span>
        )
      },
    },
    {
      accessorKey: 'total_amount_pg',
      header: () => (
        <span className='block text-right font-medium'>{t('summaryTable.colTotalPg')}</span>
      ),
      cell: ({ row }) => {
        const amount = parseFloat(row.getValue('total_amount_pg') as string)
        return (
          <span className='block text-right tabular-nums text-sm font-medium text-foreground'>
            {formatIdr(amount)}
          </span>
        )
      },
    },
    {
      accessorKey: 'total_amount_provider',
      header: () => (
        <span className='block text-right font-medium'>{t('summaryTable.colModalProvider')}</span>
      ),
      cell: ({ row }) => {
        const amount = parseFloat(row.getValue('total_amount_provider') as string)
        return (
          <span className='block text-right tabular-nums text-sm text-muted-foreground'>
            {formatIdr(amount)}
          </span>
        )
      },
    },
    {
      accessorKey: 'gross_profit',
      header: () => (
        <span className='block text-right font-medium'>{t('summaryTable.colGrossProfit')}</span>
      ),
      cell: ({ row }) => {
        const amount = parseFloat(row.getValue('gross_profit') as string)
        const isNegative = amount < 0
        return (
          <span
            className={cn(
              'block text-right text-sm font-semibold tabular-nums',
              isNegative ? 'text-destructive' : 'text-emerald-600',
            )}
          >
            {formatIdr(amount)}
          </span>
        )
      },
    },
  ]
}
