import type { ColumnDef } from '@tanstack/react-table'
import { Badge } from '@/components/ui/badge'
import type { Payment } from '@/types/transaction'
import { Link } from 'react-router-dom'

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
        status === 'SUCCESS' ? 'default' : status === 'PENDING' ? 'outline' : 'destructive'

      return <Badge variant={variant}>{status}</Badge>
    },
  },
  {
    accessorKey: 'created_at',
    header: 'Created At',
    cell: ({ row }) => {
      const raw = row.original.created_at

      const iso = raw.replace(' WIB', '').replace(' ', 'T').replace(' +0700', '+07:00')

      const date = new Date(iso)

      return date.toLocaleString('id-ID', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
      })
    },
  },
]
