import type { Product } from '@/types/product'
import { cn } from '@/lib/utils'
import type { ColumnDef } from '@tanstack/react-table'
import type { TFunction } from 'i18next'
import i18n from '@/i18n'

function formatRp(value: number | undefined | null) {
  const n = value ?? 0
  const locale = i18n.language.startsWith('id') ? 'id-ID' : 'en-US'
  return new Intl.NumberFormat(locale, { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(n)
}

/** Kriteria tampilan di kolom ringkasan (selaras dengan filter mental admin). */
export function getAnomalyIssueLabels(p: Product, t: TFunction): string[] {
  const labels: string[] = []
  if (p.selling_price < p.base_price) {
    labels.push(t('anomalyProductTable.issueSellingBelowBase'))
  }
  if ((p.additional_fee ?? 0) < 0) {
    labels.push(t('anomalyProductTable.issueNegativeFee'))
  }
  if ((p.additional_percent ?? 0) < 0) {
    labels.push(t('anomalyProductTable.issueNegativePercent'))
  }
  return labels
}

export const getAnomalyProductColumns = (t: TFunction): ColumnDef<Product>[] => [
  {
    accessorKey: 'name',
    header: t('anomalyProductTable.colProductName'),
    cell: ({ row }) => (
      <div className="max-w-[14rem] font-medium text-gray-900 sm:max-w-xs">{row.original.name}</div>
    ),
  },
  {
    id: 'anomaly_issues',
    header: t('anomalyProductTable.colDetectedIssues'),
    cell: ({ row }) => {
      const issues = getAnomalyIssueLabels(row.original, t)
      if (!issues.length) {
        return <span className="text-xs text-muted-foreground">{t('anomalyProductTable.noIssuesFromCriteria')}</span>
      }
      return (
        <ul className="max-w-[16rem] list-disc space-y-0.5 pl-3.5 text-xs leading-snug text-amber-900 dark:text-amber-100">
          {issues.map((text) => (
            <li key={text}>{text}</li>
          ))}
        </ul>
      )
    },
  },
  {
    id: 'game',
    header: t('anomalyProductTable.colGame'),
    cell: ({ row }) => (
      <span className="max-w-[10rem] truncate text-sm text-foreground sm:max-w-[12rem]">
        {row.original.game?.name ?? '—'}
      </span>
    ),
  },
  {
    accessorKey: 'sku',
    header: t('anomalyProductTable.colSku'),
    cell: ({ row }) => (
      <span className="font-mono text-xs tabular-nums text-muted-foreground">{row.original.sku}</span>
    ),
  },
  {
    accessorKey: 'additional_fee',
    header: t('anomalyProductTable.colAdditionalFee'),
    cell: ({ row }) => {
      const fee = row.original.additional_fee ?? 0
      const bad = fee < 0
      return (
        <span
          className={cn(
            'tabular-nums text-sm',
            bad ? 'font-medium text-destructive' : 'text-foreground',
          )}
        >
          {formatRp(row.original.additional_fee)}
        </span>
      )
    },
  },
  {
    accessorKey: 'additional_percent',
    header: t('anomalyProductTable.colAdditionalPercent'),
    cell: ({ row }) => {
      const pct = row.original.additional_percent ?? 0
      const bad = pct < 0
      return (
        <span
          className={cn(
            'tabular-nums text-sm',
            bad ? 'font-medium text-destructive' : 'text-foreground',
          )}
        >
          {pct} %
        </span>
      )
    },
  },
  {
    accessorKey: 'base_price',
    header: t('anomalyProductTable.colBasePrice'),
    cell: ({ row }) => (
      <span className="tabular-nums text-sm text-foreground">{formatRp(row.original.base_price)}</span>
    ),
  },
  {
    accessorKey: 'selling_price',
    header: t('anomalyProductTable.colSellingPrice'),
    cell: ({ row }) => {
      const bad = row.original.selling_price < row.original.base_price
      return (
        <span
          className={cn(
            'tabular-nums text-sm',
            bad ? 'font-medium text-destructive' : 'text-foreground',
          )}
        >
          {formatRp(row.original.selling_price)}
        </span>
      )
    },
  },
  {
    accessorKey: 'stock_quantity',
    header: t('anomalyProductTable.colStock'),
    cell: ({ row }) =>
      row.original.is_unlimited_stock ? (
        <span className="text-sm text-muted-foreground">{t('anomalyProductTable.stockUnlimited')}</span>
      ) : (
        <span className="tabular-nums text-sm font-medium text-foreground">
          {row.original.stock_quantity}
        </span>
      ),
  },
]
