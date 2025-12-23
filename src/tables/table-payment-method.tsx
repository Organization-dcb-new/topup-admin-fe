import type { ColumnDef } from '@tanstack/react-table'
import type { PaymentMethod } from '@/types/payment-method'
import { Badge } from '@/components/ui/badge'

export const paymentMethodColumns: ColumnDef<PaymentMethod>[] = [
  {
    accessorKey: 'full_name',
    header: 'Name',
  },
  {
    accessorKey: 'code',
    header: 'Code',
  },
  {
    accessorKey: 'provider',
    header: 'Provider',
    cell: ({ row }) => <Badge variant="outline">{row.original.provider}</Badge>,
  },
  {
    accessorKey: 'fee_percentage',
    header: 'Fee %',
    cell: ({ row }) => `${row.original.fee_percentage}%`,
  },
  {
    accessorKey: 'fee_fixed',
    header: 'Fee Fixed',
    cell: ({ row }) => `Rp ${row.original.fee_fixed.toLocaleString('id-ID')}`,
  },
  {
    accessorKey: 'min_amount',
    header: 'Min',
    cell: ({ row }) => `Rp ${row.original.min_amount.toLocaleString('id-ID')}`,
  },
  {
    accessorKey: 'max_amount',
    header: 'Max',
    cell: ({ row }) => `Rp ${row.original.max_amount.toLocaleString('id-ID')}`,
  },
  {
    accessorKey: 'is_active',
    header: 'Status',
    cell: ({ row }) => (
      <Badge variant={row.original.is_active ? 'default' : 'secondary'}>
        {row.original.is_active ? 'Active' : 'Inactive'}
      </Badge>
    ),
  },
]
