import { CopyButton } from '@/components/ui/copy-button'
import { cn } from '@/lib/utils'
import type { OrderItemV2Response } from '@/types/order-item'
import type { ColumnDef } from '@tanstack/react-table'
import type { TFunction } from 'i18next'

function formatIdr(value: number) {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0,
  }).format(value)
}

/** Sel teks panjang (ID/SKU) dengan tombol salin di sebelahnya. Tombolnya
 *  sengaja selalu terlihat: versi lama hanya muncul saat hover, jadi tidak
 *  terjangkau lewat sentuh maupun keyboard. */
function CopyCell({
  value,
  t,
  mono,
}: {
  value?: string
  t: TFunction
  mono?: boolean
}) {
  if (!value) return <span className='font-black text-[#111]/70'>—</span>

  return (
    <div className='flex max-w-[min(100%,18rem)] items-center gap-1.5'>
      <span
        className={cn('min-w-0 truncate font-bold', mono && 'font-mono text-xs')}
        title={value}
      >
        {value}
      </span>
      <CopyButton
        value={value}
        label={t('orderTable.copyLabel')}
        errorLabel={t('orderTable.copyError')}
        className='h-7 w-7'
      />
    </div>
  )
}

function ProviderStatusTag({ status }: { status?: string }) {
  if (!status) return <span className='font-black text-[#111]/70'>—</span>

  const isSuccess = status === 'SUCCESS'
  const isPending = status === 'PENDING' || status === 'PROCESSING'
  const isFailed = status === 'FAILED'

  return (
    <span
      className={cn(
        'nb-frame nb-frame-thin inline-flex items-center gap-1.5 px-2 py-1 text-[10px] font-black uppercase tracking-[0.1em]',
        isSuccess && 'bg-[#c9f24d]',
        isPending && 'bg-[#ffd84d]',
        isFailed && 'bg-[#ff4d3d]',
        !isSuccess && !isPending && !isFailed && 'bg-white',
      )}
    >
      <span className='h-2.5 w-2.5 shrink-0 border-2 border-[#111] bg-white' aria-hidden />
      {status}
    </span>
  )
}

export function getOrderItemColumns(t: TFunction): ColumnDef<OrderItemV2Response>[] {
  return [
    {
      accessorKey: 'id',
      header: t('orderTable.colId'),
      cell: ({ row }) => <CopyCell value={row.original.id} t={t} mono />,
    },
    {
      accessorKey: 'product_id',
      header: t('orderTable.colProductId'),
      cell: ({ row }) => <CopyCell value={row.original.product_id} t={t} mono />,
    },
    {
      accessorKey: 'product_name',
      header: t('orderTable.colProductName'),
      cell: ({ row }) => (
        <span className='font-black uppercase tracking-tight'>{row.original.product_name}</span>
      ),
    },
    {
      accessorKey: 'product_sku',
      header: t('orderTable.colProductSku'),
      cell: ({ row }) => <CopyCell value={row.original.product_sku} t={t} mono />,
    },
    {
      accessorKey: 'quantity',
      header: t('orderTable.colQuantity'),
      cell: ({ row }) => (
        <span className='nb-frame nb-frame-thin inline-flex min-h-7 min-w-7 items-center justify-center bg-[#6fe3f5] px-2 text-xs font-black tabular-nums'>
          {row.original.quantity}x
        </span>
      ),
    },
    {
      accessorKey: 'status_order_provider',
      header: t('orderTable.colProviderStatus'),
      cell: ({ row }) => <ProviderStatusTag status={row.original.status_order_provider} />,
    },
    {
      accessorKey: 'unit_price',
      header: () => <span className='block text-right'>{t('orderTable.colUnitPrice')}</span>,
      cell: ({ row }) => (
        <span className='block whitespace-nowrap text-right text-xs font-bold tabular-nums'>
          {formatIdr(row.original.unit_price)}
        </span>
      ),
    },
    {
      accessorKey: 'subtotal',
      header: () => <span className='block text-right'>{t('orderTable.colTotal')}</span>,
      cell: ({ row }) => (
        <span className='block whitespace-nowrap text-right text-sm font-black tabular-nums'>
          {formatIdr(row.original.subtotal)}
        </span>
      ),
    },
  ]
}
