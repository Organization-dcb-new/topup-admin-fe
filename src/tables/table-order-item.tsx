import { useState } from 'react'
import type { OrderItemV2Response } from '@/types/order-item'
import type { ColumnDef } from '@tanstack/react-table'
import type { TFunction } from 'i18next'
import { Copy, Check } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { copyTextToClipboard } from '@/lib/copy-to-clipboard'
import toast from 'react-hot-toast'
import { cn } from '@/lib/utils'

function formatIdr(value: number) {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0,
  }).format(value)
}

function CopyHoverCell({ value, mono }: { value?: string; mono?: boolean }) {
  const [copied, setCopied] = useState(false)
  if (!value) return <span className='text-slate-400'>—</span>

  const handleCopy = async (e: React.MouseEvent) => {
    e.stopPropagation()
    try {
      await copyTextToClipboard(value)
      setCopied(true)
      toast.success('Copied to clipboard')
      setTimeout(() => setCopied(false), 2000)
    } catch {
      toast.error('Failed to copy')
    }
  }

  return (
    <div className='group flex max-w-[min(100%,18rem)] items-center justify-between gap-1.5'>
      <span className={cn('min-w-0 truncate text-slate-800 dark:text-slate-200', mono && 'font-mono text-xs')}>
        {value}
      </span>
      <Button
        type='button'
        variant='ghost'
        size='icon'
        className='opacity-0 group-hover:opacity-100 focus:opacity-100 h-7 w-7 shrink-0 text-slate-400 hover:text-foreground hover:bg-slate-100 dark:hover:bg-zinc-800 rounded-md transition-all duration-200 cursor-pointer'
        onClick={handleCopy}
        title={`Copy ${value}`}
      >
        {copied ? (
          <Check className='h-3.5 w-3.5 text-emerald-500' />
        ) : (
          <Copy className='h-3.5 w-3.5' />
        )}
      </Button>
    </div>
  )
}

function ProviderStatusBadge({ status }: { status?: string }) {
  if (!status) return <span className='text-slate-400'>—</span>
  const isSuccess = status === 'SUCCESS'
  const isPending = status === 'PENDING' || status === 'PROCESSING'
  const isFailed = status === 'FAILED'

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold border backdrop-blur-md shadow-xs transition-all duration-200',
        isSuccess && 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-450 border-emerald-500/20',
        isPending && 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20',
        isFailed && 'bg-rose-500/10 text-rose-600 dark:text-rose-455 border-rose-500/20'
      )}
    >
      <span
        className={cn(
          'h-1.5 w-1.5 shrink-0 rounded-full',
          isSuccess && 'bg-emerald-500',
          isPending && 'bg-amber-500 animate-pulse',
          isFailed && 'bg-rose-500'
        )}
      />
      {status}
    </span>
  )
}

export function getOrderItemColumns(t: TFunction): ColumnDef<OrderItemV2Response>[] {
  return [
    {
      accessorKey: 'id',
      header: () => <span className='font-bold'>{t('orderTable.colId')}</span>,
      cell: ({ row }) => <CopyHoverCell value={row.original.id} mono />,
    },
    {
      accessorKey: 'product_id',
      header: () => <span className='font-bold'>{t('orderTable.colProductId')}</span>,
      cell: ({ row }) => <CopyHoverCell value={row.original.product_id} mono />,
    },
    {
      accessorKey: 'product_name',
      header: () => <span className='font-bold'>{t('orderTable.colProductName')}</span>,
      cell: ({ row }) => <span className='font-semibold text-slate-900 dark:text-white'>{row.original.product_name}</span>,
    },
    {
      accessorKey: 'product_sku',
      header: () => <span className='font-bold'>{t('orderTable.colProductSku')}</span>,
      cell: ({ row }) => <CopyHoverCell value={row.original.product_sku} mono />,
    },
    {
      accessorKey: 'quantity',
      header: () => <span className='font-bold'>{t('orderTable.colQuantity')}</span>,
      cell: ({ row }) => <span className='font-bold tabular-nums text-slate-800 dark:text-slate-200'>{row.original.quantity}x</span>,
    },
    {
      accessorKey: 'status_order_provider',
      header: () => <span className='font-bold'>{t('orderTable.colProviderStatus')}</span>,
      cell: ({ row }) => <ProviderStatusBadge status={row.original.status_order_provider} />,
    },
    {
      accessorKey: 'unit_price',
      header: () => <span className='font-bold'>{t('orderTable.colUnitPrice')}</span>,
      cell: ({ row }) => <span className='font-semibold tabular-nums text-slate-700 dark:text-slate-350'>{formatIdr(row.original.unit_price)}</span>,
    },
    {
      accessorKey: 'subtotal',
      header: () => <span className='font-bold'>{t('orderTable.colTotal')}</span>,
      cell: ({ row }) => <span className='font-black tabular-nums text-slate-900 dark:text-white'>{formatIdr(row.original.subtotal)}</span>,
    },
  ]
}
