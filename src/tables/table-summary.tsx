import type { SummaryItem } from '@/types/summary'
import { cn } from '@/lib/utils'
import type { ColumnDef } from '@tanstack/react-table'
import { format } from 'date-fns'
import { id } from 'date-fns/locale'

function formatIdr(value: number) {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
  }).format(value)
}

export const summaryColumns: ColumnDef<SummaryItem>[] = [
  {
    accessorKey: 'time_key',
    header: () => <span className="font-medium">Waktu (WIB)</span>,
    cell: ({ row }) => {
      const raw = row.getValue('time_key') as string
      const date = new Date(raw)
      return (
        <span className="whitespace-nowrap tabular-nums text-sm text-foreground">
          {format(date, 'dd MMM yyyy, HH:00', { locale: id })}
        </span>
      )
    },
  },
  {
    accessorKey: 'total_amount_pg',
    header: () => (
      <span className="block text-right font-medium">Total masuk (PG)</span>
    ),
    cell: ({ row }) => {
      const amount = parseFloat(row.getValue('total_amount_pg') as string)
      return (
        <span className="block text-right tabular-nums text-sm font-medium text-foreground">
          {formatIdr(amount)}
        </span>
      )
    },
  },
  {
    accessorKey: 'total_amount_provider',
    header: () => (
      <span className="block text-right font-medium">Modal (provider)</span>
    ),
    cell: ({ row }) => {
      const amount = parseFloat(row.getValue('total_amount_provider') as string)
      return (
        <span className="block text-right tabular-nums text-sm text-muted-foreground">
          {formatIdr(amount)}
        </span>
      )
    },
  },
  {
    accessorKey: 'gross_profit',
    header: () => <span className="block text-right font-medium">Laba kotor</span>,
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
