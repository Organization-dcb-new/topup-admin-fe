import type { ColumnDef } from '@tanstack/react-table'
import { Badge } from '@/components/ui/badge'
import type { Payment } from '@/types/transaction'

export const paymentColumns: ColumnDef<Payment>[] = [
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
    cell: ({ row }) => new Date(row.original.created_at).toLocaleString('id-ID'),
  },
]
