import type { ColumnDef } from '@tanstack/react-table'
import type { TFunction } from 'i18next'
import i18n from '@/i18n'
import type { PaymentMethod } from '@/types/payment-method'
import { pmCellIcon, pmCode, pmTag } from '@/components/PaymentMethod/styles'
import { cn } from '@/lib/utils'
import { DeletePaymentMethodModal } from '@/components/PaymentMethod/DeletePaymentMethodModal'
import { EditPaymentMethodModal } from '@/components/PaymentMethod/EditPaymentMethodModal'
const FALLBACK_ICON = 'https://api.dicebear.com/9.x/lorelei/svg'

const currency = (value: number) =>
  new Intl.NumberFormat(i18n.language.startsWith('id') ? 'id-ID' : 'en-US', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0,
  }).format(value)

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
          className={pmCellIcon}
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
      <div className='max-w-[10rem] font-black text-[#111] sm:max-w-xs'>{row.original.name}</div>
    ),
  },
  {
    accessorKey: 'code',
    header: t('paymentMethodTable.colCode'),
    cell: ({ row }) => <code className={pmCode}>{row.original.code}</code>,
  },
  {
    accessorKey: 'provider',
    header: t('paymentMethodTable.colProvider'),
    cell: ({ row }) => (
      <span className={cn(pmTag, 'bg-[#6fe3f5]')}>{row.original.provider}</span>
    ),
  },
  {
    accessorKey: 'fee_percentage',
    header: t('paymentMethodTable.colFeePercent'),
    cell: ({ row }) => (
      <span className='text-sm font-black tabular-nums'>{row.original.fee_percentage}%</span>
    ),
  },
  {
    accessorKey: 'fee_fixed',
    header: t('paymentMethodTable.colFeeFixed'),
    cell: ({ row }) => (
      <span className='text-sm font-black tabular-nums'>{currency(row.original.fee_fixed)}</span>
    ),
  },
  {
    accessorKey: 'min_amount',
    header: t('paymentMethodTable.colMin'),
    cell: ({ row }) => (
      <span className='text-sm font-bold tabular-nums text-[#111]/70'>
        {currency(row.original.min_amount)}
      </span>
    ),
  },
  {
    accessorKey: 'max_amount',
    header: t('paymentMethodTable.colMax'),
    cell: ({ row }) => (
      <span className='text-sm font-bold tabular-nums text-[#111]/70'>
        {currency(row.original.max_amount)}
      </span>
    ),
  },
  {
    accessorKey: 'is_active',
    header: t('paymentMethodTable.colStatus'),
    cell: ({ row }) =>
      row.original.is_active ? (
        <span className={cn(pmTag, 'bg-[#c9f24d]')}>{t('paymentMethodTable.statusActive')}</span>
      ) : (
        <span className={cn(pmTag, 'bg-white text-[#111]/60')}>
          {t('paymentMethodTable.statusInactive')}
        </span>
      ),
  },
  {
    id: 'actions',
    header: t('paymentMethodTable.colActions'),
    cell: ({ row }) => (
      <div className='flex flex-wrap items-center gap-1.5'>
        <EditPaymentMethodModal paymentMethod={row.original} />
        <DeletePaymentMethodModal id={row.original.id} />
      </div>
    ),
  },
]
