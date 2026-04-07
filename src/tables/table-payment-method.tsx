import type { ColumnDef } from '@tanstack/react-table'
import type { PaymentMethod } from '@/types/payment-method'
import { Badge } from '@/components/ui/badge'
import { DeletePaymentMethodModal } from '@/components/PaymentMethod/DeletePaymentMethodModal'
import { EditPaymentMethodModal } from '@/components/PaymentMethod/EditPaymentMethodModal'
const FALLBACK_ICON = 'https://api.dicebear.com/9.x/lorelei/svg'

export const paymentMethodColumns: ColumnDef<PaymentMethod>[] = [
  {
    accessorKey: 'icon_url',
    header: 'Ikon',
    cell: ({ row }) => {
      const src = row.original.icon_url || FALLBACK_ICON
      return (
        <img
          src={src}
          alt={row.original.name ? `Ikon ${row.original.name}` : 'Ikon metode pembayaran'}
          className="h-10 w-10 rounded-md border border-border/80 bg-muted/20 object-contain ring-1 ring-gray-900/5"
          onError={(e) => {
            e.currentTarget.src = '/placeholder.png'
          }}
        />
      )
    },
  },
  {
    accessorKey: 'name',
    header: 'Nama',
    cell: ({ row }) => (
      <div className="max-w-[10rem] font-medium text-gray-900 sm:max-w-xs">{row.original.name}</div>
    ),
  },
  {
    accessorKey: 'code',
    header: 'Kode',
    cell: ({ row }) => (
      <code className="rounded bg-muted/60 px-1.5 py-0.5 font-mono text-xs text-foreground">
        {row.original.code}
      </code>
    ),
  },
  {
    accessorKey: 'provider',
    header: 'Penyedia',
    cell: ({ row }) => (
      <Badge variant="outline" className="font-medium capitalize">
        {row.original.provider}
      </Badge>
    ),
  },
  {
    accessorKey: 'fee_percentage',
    header: 'Biaya %',
    cell: ({ row }) => (
      <span className="tabular-nums text-sm text-foreground">{row.original.fee_percentage}%</span>
    ),
  },
  {
    accessorKey: 'fee_fixed',
    header: 'Biaya tetap',
    cell: ({ row }) => (
      <span className="tabular-nums text-sm text-foreground">
        Rp {row.original.fee_fixed.toLocaleString('id-ID')}
      </span>
    ),
  },
  {
    accessorKey: 'min_amount',
    header: 'Min',
    cell: ({ row }) => (
      <span className="tabular-nums text-sm text-muted-foreground">
        Rp {row.original.min_amount.toLocaleString('id-ID')}
      </span>
    ),
  },
  {
    accessorKey: 'max_amount',
    header: 'Maks',
    cell: ({ row }) => (
      <span className="tabular-nums text-sm text-muted-foreground">
        Rp {row.original.max_amount.toLocaleString('id-ID')}
      </span>
    ),
  },
  {
    accessorKey: 'is_active',
    header: 'Status',
    cell: ({ row }) =>
      row.original.is_active ? (
        <Badge variant="success" className="font-medium">
          Aktif
        </Badge>
      ) : (
        <Badge variant="outline" className="border-border font-medium text-muted-foreground">
          Nonaktif
        </Badge>
      ),
  },
  {
    id: 'actions',
    header: 'Aksi',
    cell: ({ row }) => (
      <div className="flex flex-wrap items-center gap-1">
        <EditPaymentMethodModal paymentMethod={row.original} />
        <DeletePaymentMethodModal id={row.original.id} />
      </div>
    ),
  },
]
