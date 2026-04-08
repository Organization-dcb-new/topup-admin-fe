import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import i18n from '@/i18n'
import { copyTextToClipboard } from '@/lib/copy-to-clipboard'
import type { Payment } from '@/types/transaction'
import type { ColumnDef } from '@tanstack/react-table'
import type { TFunction } from 'i18next'
import { format, isValid } from 'date-fns'
import { enUS, id as idLocale } from 'date-fns/locale'
import { ChevronRight, Copy } from 'lucide-react'
import toast from 'react-hot-toast'
import { Link } from 'react-router-dom'

export function parseBackendDate(raw?: string): Date | null {
  if (!raw) return null

  const cleaned = raw.replace(' WIB', '').replace(/ /, 'T').replace(/ \+/, '+')

  const date = new Date(cleaned)
  return isValid(date) ? date : null
}

function formatIdr(value: number) {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0,
  }).format(value)
}

function statusLabel(status: Payment['status'], t: TFunction) {
  return t(`paymentStatus.${status}`)
}

function dateLocale() {
  return i18n.language.startsWith('id') ? idLocale : enUS
}

export function getPaymentColumns(t: TFunction): ColumnDef<Payment>[] {
  const copyTransactionId = async (value: string) => {
    try {
      await copyTextToClipboard(value)
    } catch {
      toast.error(t('transactionTable.copyError'))
      return
    }
    // Separate from clipboard try/catch: if toast.success throws, we must not show copy failure.
    toast.success(t('transactionTable.copySuccess'))
  }

  return [
    {
      accessorKey: 'id',
      header: () => (
        <span className="font-medium">
          {t('transactionTable.colTransactionId')}
          <span className="mt-0.5 block text-[10px] font-normal normal-case tracking-normal text-muted-foreground">
            {t('transactionTable.colTransactionIdSub')}
          </span>
        </span>
      ),
      cell: ({ row }) => {
        const txId = row.original.id
        return (
          <div className="flex max-w-[min(100%,18rem)] items-center gap-0.5">
            <Link
              to={`/transactions/${txId}`}
              className="group inline-flex min-w-0 flex-1 items-center gap-1 rounded-md py-0.5 pl-0.5 pr-1 text-left font-medium text-primary transition-colors hover:bg-primary/5 focus-visible:bg-primary/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              title={t('transactionTable.openDetailTitle', { id: txId })}
              aria-label={t('transactionTable.openDetailAria', { id: txId })}
            >
              <span className="min-w-0 select-text truncate font-mono text-sm underline-offset-4 group-hover:underline">
                {txId}
              </span>
              <ChevronRight
                className="h-4 w-4 shrink-0 text-primary/60 transition-transform group-hover:translate-x-0.5 group-hover:text-primary"
                aria-hidden
              />
            </Link>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="h-8 w-8 shrink-0 text-muted-foreground hover:text-foreground"
              title={t('transactionTable.copyIdTitle')}
              aria-label={t('transactionTable.copyIdAria')}
              onClick={() => void copyTransactionId(txId)}
            >
              <Copy className="h-3.5 w-3.5" aria-hidden />
            </Button>
          </div>
        )
      },
    },
    {
      accessorKey: 'payment_number',
      header: () => <span className="font-medium">{t('transactionTable.colPayNumber')}</span>,
      cell: ({ row }) => (
        <span className="font-mono text-sm tabular-nums text-foreground">
          {row.original.payment_number}
        </span>
      ),
    },
    {
      accessorKey: 'app_name',
      header: () => <span className="font-medium">{t('transactionTable.colApp')}</span>,
      cell: ({ row }) => (
        <span className="max-w-[10rem] truncate text-sm" title={row.original.app_name}>
          {row.original.app_name}
        </span>
      ),
    },
    {
      accessorKey: 'order_id',
      header: () => <span className="font-medium">{t('transactionTable.colOrderId')}</span>,
      cell: ({ row }) => (
        <span className="font-mono text-sm text-muted-foreground">{row.original.order_id}</span>
      ),
    },
    {
      accessorKey: 'amount',
      header: () => (
        <span className="block text-right font-medium">{t('transactionTable.colAmount')}</span>
      ),
      cell: ({ row }) => (
        <span className="block text-right text-sm font-medium tabular-nums text-foreground">
          {formatIdr(row.original.amount)}
        </span>
      ),
    },
    {
      accessorKey: 'margin',
      header: () => (
        <span className="block text-right font-medium">{t('transactionTable.colMargin')}</span>
      ),
      cell: ({ row }) => (
        <span className="block text-right text-sm tabular-nums text-muted-foreground">
          {formatIdr(row.original.margin)}
        </span>
      ),
    },
    {
      accessorKey: 'payment_channel',
      header: () => <span className="font-medium">{t('transactionTable.colChannel')}</span>,
      cell: ({ row }) => (
        <span className="text-sm text-foreground">{row.original.payment_channel}</span>
      ),
    },
    {
      accessorKey: 'va_number',
      header: () => <span className="font-medium">{t('transactionTable.colVa')}</span>,
      cell: ({ row }) => (
        <span className="font-mono text-sm tabular-nums text-muted-foreground">
          {row.original.va_number || '—'}
        </span>
      ),
    },
    {
      accessorKey: 'status',
      header: () => <span className="font-medium">{t('transactionTable.colStatus')}</span>,
      cell: ({ row }) => {
        const status = row.original.status
        const variant =
          status === 'PAID' ? 'success' : status === 'PENDING' ? 'outline' : 'destructive'

        return (
          <Badge variant={variant} className="font-medium">
            {statusLabel(status, t)}
          </Badge>
        )
      },
    },
    {
      accessorKey: 'created_at',
      header: () => <span className="font-medium">{t('transactionTable.colCreated')}</span>,
      cell: ({ row }) => {
        const date = parseBackendDate(row.original.created_at)
        return (
          <span className="whitespace-nowrap text-sm tabular-nums text-muted-foreground">
            {date ? format(date, 'dd MMM yyyy, HH:mm:ss', { locale: dateLocale() }) : '—'}
          </span>
        )
      },
    },
  ]
}
