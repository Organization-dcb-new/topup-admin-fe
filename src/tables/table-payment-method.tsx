import type { ColumnDef } from '@tanstack/react-table'
import type { PaymentMethod } from '@/types/payment-method'
import { Badge } from '@/components/ui/badge'

export const paymentMethodColumns: ColumnDef<PaymentMethod>[] = [
  {
    accessorKey: 'icon_url',
    header: 'Icon',
    cell: ({ row }) => {
      const src = row.original.icon_url || 'https://api.dicebear.com/9.x/lorelei/svg'
      return (
        <img
          src={src}
          alt={row.original.name || 'icon'}
          className="w-10 h-10 rounded object-contain border"
          onError={(e) => {
            e.currentTarget.src = '/placeholder.png'
          }}
        />
      )
    },
  },
  {
    accessorKey: 'name',
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
