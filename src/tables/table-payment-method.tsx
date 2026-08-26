import type { ColumnDef } from '@tanstack/react-table'
import type { TFunction } from 'i18next'

import type { PaymentMethod } from '@/types/payment-method'
import { Badge } from '@/components/ui/badge'
import { EntityAvatar } from '@/components/ui/entity-avatar'
import { DeletePaymentMethodModal } from '@/components/PaymentMethod/DeletePaymentMethodModal'
import { EditPaymentMethodModal } from '@/components/PaymentMethod/EditPaymentMethodModal'
import { Can } from '@/components/Auth/Can'
import { PERM } from '@/constants/permissions'
import { formatCurrency } from '@/lib/format'

/**
 * Sepuluh kolom dulu memaksa scroll horizontal di layar mana pun. Kolom yang
 * saling berkaitan kini digabung jadi satu sel bertingkat: identitas (ikon,
 * nama, kode), biaya (persen + tetap), dan batas nominal (min–maks).
 */
export const getPaymentMethodColumns = (
  t: TFunction,
): ColumnDef<PaymentMethod>[] => [
  {
    accessorKey: 'name',
    header: t('paymentMethodTable.colMethod'),
    cell: ({ row }) => (
      <div className='flex min-w-0 items-center gap-3'>
        <EntityAvatar
          src={row.original.icon_url}
          alt={
            row.original.name
              ? t('paymentMethodTable.iconAltName', { name: row.original.name })
              : t('paymentMethodTable.iconAltFallback')
          }
        />
        <div className='min-w-0'>
          <span className='block max-w-48 truncate font-medium text-foreground'>
            {row.original.name}
          </span>
          <code className='block max-w-48 truncate font-mono text-xs text-muted-foreground'>
            {row.original.code}
          </code>
        </div>
      </div>
    ),
  },
  {
    accessorKey: 'provider',
    header: t('paymentMethodTable.colProvider'),
    cell: ({ row }) => (
      <div className='min-w-0 space-y-1'>
        <Badge variant='outline' className='font-medium capitalize'>
          {row.original.provider}
        </Badge>
        {row.original.type && (
          <span className='block truncate text-xs capitalize text-muted-foreground'>
            {row.original.type}
          </span>
        )}
      </div>
    ),
  },
  {
    id: 'fee',
    header: t('paymentMethodTable.colFee'),
    cell: ({ row }) => (
      <div className='whitespace-nowrap'>
        <span className='block text-sm tabular-nums text-foreground'>
          {row.original.fee_percentage}%
        </span>
        <span className='block text-xs tabular-nums text-muted-foreground'>
          + {formatCurrency(row.original.fee_fixed)}
        </span>
      </div>
    ),
  },
  {
    id: 'amount_range',
    header: t('paymentMethodTable.colAmountRange'),
    cell: ({ row }) => (
      <span className='block whitespace-nowrap text-sm tabular-nums text-muted-foreground'>
        {/* max_amount 0 berarti tanpa batas; menampilkannya apa adanya
            terbaca sebagai "sampai Rp0" alias metode yang mustahil dipakai */}
        {row.original.max_amount > 0
          ? t('paymentMethodTable.amountRange', {
              min: formatCurrency(row.original.min_amount),
              max: formatCurrency(row.original.max_amount),
            })
          : t('paymentMethodTable.amountFrom', {
              min: formatCurrency(row.original.min_amount),
            })}
      </span>
    ),
  },
  {
    accessorKey: 'is_active',
    header: t('paymentMethodTable.colStatus'),
    cell: ({ row }) =>
      row.original.is_active ? (
        <Badge variant='success' className='font-medium'>
          {t('paymentMethodTable.statusActive')}
        </Badge>
      ) : (
        <Badge
          variant='outline'
          className='border-border font-medium text-muted-foreground'
        >
          {t('paymentMethodTable.statusInactive')}
        </Badge>
      ),
  },
  {
    id: 'actions',
    header: t('paymentMethodTable.colActions'),
    cell: ({ row }) => (
      <div
        className='inline-flex items-center gap-0.5 rounded-lg border border-border bg-muted/30 p-0.5'
        role='group'
        aria-label={t('paymentMethodTable.rowActionsAria', {
          name: row.original.name,
        })}
      >
        <Can perm={PERM.PAYMENT_METHOD_UPDATE}>
          <EditPaymentMethodModal paymentMethod={row.original} />
        </Can>
        <Can perm={PERM.PAYMENT_METHOD_DELETE}>
          <DeletePaymentMethodModal
            id={row.original.id}
            name={row.original.name}
          />
        </Can>
      </div>
    ),
  },
]
