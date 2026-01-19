import type { ColumnDef } from '@tanstack/react-table'
import { Badge } from '@/components/ui/badge'
import type { Payment } from '@/types/transaction'
import { Link } from 'react-router-dom'
import { format, isValid } from 'date-fns'
import { id } from 'date-fns/locale'

export function parseBackendDate(raw?: string): Date | null {
  if (!raw) return null

  const cleaned = raw.replace(' WIB', '').replace(/ /, 'T').replace(/ \+/, '+')

  const date = new Date(cleaned)
  return isValid(date) ? date : null
}

export const paymentColumns: ColumnDef<Payment>[] = [
  {
    accessorKey: 'id',
    header: 'Trx ID',
    cell: ({ row }) => (
      <Link
        to={`/transactions/${row.original.id}`}
        className="text-blue-600 hover:underline font-medium"
      >
        {row.original.id}
      </Link>
    ),
  },
  {
    accessorKey: 'payment_number',
    header: 'Payment No',
  },
  {
    accessorKey: 'order_id',
    header: 'Order ID',
  },
  {
    accessorKey: 'amount',
    header: 'Amount',
    cell: ({ row }) => `Rp ${row.original.amount.toLocaleString('id-ID')}`,
  },
  {
    accessorKey: 'payment_channel',
    header: 'Channel',
  },
  {
    accessorKey: 'va_number',
    header: 'VA Number',
    cell: ({ row }) => row.original.va_number || '-',
  },
  {
    accessorKey: 'status',
    header: 'Status',
    cell: ({ row }) => {
      const status = row.original.status

      const variant =
        status === 'PAID' ? 'default' : status === 'PENDING' ? 'outline' : 'destructive'

      return <Badge variant={variant}>{status}</Badge>
    },
  },
  {
    accessorKey: 'created_at',
    header: 'Created At',
    cell: ({ row }) => {
      const date = parseBackendDate(row.original.created_at)

      return date ? format(date, 'dd MMM yyyy, HH:mm:ss', { locale: id }) : '-'
    },
  },
]
