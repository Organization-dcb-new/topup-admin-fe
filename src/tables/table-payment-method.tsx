import type { ColumnDef } from '@tanstack/react-table'
import type { TFunction } from 'i18next'
import i18n from '@/i18n'
import type { PaymentMethod } from '@/types/payment-method'
import { Badge } from '@/components/ui/badge'
import { DeletePaymentMethodModal } from '@/components/PaymentMethod/DeletePaymentMethodModal'
import { EditPaymentMethodModal } from '@/components/PaymentMethod/EditPaymentMethodModal'
const FALLBACK_ICON = 'https://api.dicebear.com/9.x/lorelei/svg'

export const getPaymentMethodColumns = (t: TFunction): ColumnDef<PaymentMethod>[] => [
  {
    accessorKey: 'icon_url',
    header: t('paymentMethodTable.colIcon'),
    cell: ({ row }) => {
      const src = row.original.icon_url || FALLBACK_ICON
      return (
        <img
          src={src}
          alt={
            row.original.name
              ? t('paymentMethodTable.iconAltName', { name: row.original.name })
              : t('paymentMethodTable.iconAltFallback')
          }
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
    header: t('paymentMethodTable.colName'),
    cell: ({ row }) => (
      <div className="max-w-[10rem] font-medium text-gray-900 sm:max-w-xs">{row.original.name}</div>
    ),
  },
  {
    accessorKey: 'code',
    header: t('paymentMethodTable.colCode'),
    cell: ({ row }) => (
      <code className="rounded bg-muted/60 px-1.5 py-0.5 font-mono text-xs text-foreground">
        {row.original.code}
      </code>
    ),
  },
  {
    accessorKey: 'provider',
    header: t('paymentMethodTable.colProvider'),
    cell: ({ row }) => (
      <Badge variant="outline" className="font-medium capitalize">
        {row.original.provider}
      </Badge>
    ),
  },
  {
    accessorKey: 'fee_percentage',
    header: t('paymentMethodTable.colFeePercent'),
    cell: ({ row }) => (
      <span className="tabular-nums text-sm text-foreground">{row.original.fee_percentage}%</span>
    ),
  },
  {
    accessorKey: 'fee_fixed',
    header: t('paymentMethodTable.colFeeFixed'),
    cell: ({ row }) => (
      <span className="tabular-nums text-sm text-foreground">
        {new Intl.NumberFormat(i18n.language.startsWith('id') ? 'id-ID' : 'en-US', {
          style: 'currency',
          currency: 'IDR',
          maximumFractionDigits: 0,
        }).format(row.original.fee_fixed)}
      </span>
    ),
  },
  {
    accessorKey: 'min_amount',
    header: t('paymentMethodTable.colMin'),
    cell: ({ row }) => (
      <span className="tabular-nums text-sm text-muted-foreground">
        {new Intl.NumberFormat(i18n.language.startsWith('id') ? 'id-ID' : 'en-US', {
          style: 'currency',
          currency: 'IDR',
          maximumFractionDigits: 0,
        }).format(row.original.min_amount)}
      </span>
    ),
  },
  {
    accessorKey: 'max_amount',
    header: t('paymentMethodTable.colMax'),
    cell: ({ row }) => (
      <span className="tabular-nums text-sm text-muted-foreground">
        {new Intl.NumberFormat(i18n.language.startsWith('id') ? 'id-ID' : 'en-US', {
          style: 'currency',
          currency: 'IDR',
          maximumFractionDigits: 0,
        }).format(row.original.max_amount)}
      </span>
    ),
  },
  {
    accessorKey: 'is_active',
    header: t('paymentMethodTable.colStatus'),
    cell: ({ row }) =>
      row.original.is_active ? (
        <Badge variant="success" className="font-medium">
          {t('paymentMethodTable.statusActive')}
        </Badge>
      ) : (
        <Badge variant="outline" className="border-border font-medium text-muted-foreground">
          {t('paymentMethodTable.statusInactive')}
        </Badge>
      ),
  },
  {
    id: 'actions',
    header: t('paymentMethodTable.colActions'),
    cell: ({ row }) => (
      <div className="flex flex-wrap items-center gap-1">
        <EditPaymentMethodModal paymentMethod={row.original} />
        <DeletePaymentMethodModal id={row.original.id} />
      </div>
    ),
  },
]
