import type { Product } from '@/types/product'
import { cn } from '@/lib/utils'
import type { ColumnDef } from '@tanstack/react-table'

function formatRp(value: number | undefined | null) {
  const n = value ?? 0
  return `Rp ${n.toLocaleString('id-ID')}`
}

/** Kriteria tampilan di kolom ringkasan (selaras dengan filter mental admin). */
export function getAnomalyIssueLabels(p: Product): string[] {
  const labels: string[] = []
  if (p.selling_price < p.base_price) {
    labels.push('Harga jual di bawah harga dasar')
  }
  if ((p.additional_fee ?? 0) < 0) {
    labels.push('Biaya tambahan minus')
  }
  if ((p.additional_percent ?? 0) < 0) {
    labels.push('Persentase tambahan minus')
  }
  return labels
}

export const anomalyProductTable: ColumnDef<Product>[] = [
  {
    accessorKey: 'name',
    header: 'Nama produk',
    cell: ({ row }) => (
      <div className="max-w-[14rem] font-medium text-gray-900 sm:max-w-xs">{row.original.name}</div>
    ),
  },
  {
    id: 'anomaly_issues',
    header: 'Masalah terdeteksi',
    cell: ({ row }) => {
      const issues = getAnomalyIssueLabels(row.original)
      if (!issues.length) {
        return <span className="text-xs text-muted-foreground">Tidak dari kriteria ini</span>
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
    header: 'Game',
    cell: ({ row }) => (
      <span className="max-w-[10rem] truncate text-sm text-foreground sm:max-w-[12rem]">
        {row.original.game?.name ?? '—'}
      </span>
    ),
  },
  {
    accessorKey: 'sku',
    header: 'SKU',
    cell: ({ row }) => (
      <span className="font-mono text-xs tabular-nums text-muted-foreground">{row.original.sku}</span>
    ),
  },
  {
    accessorKey: 'additional_fee',
    header: 'Biaya tambahan',
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
    header: 'Persentase tambahan',
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
    header: 'Harga dasar',
    cell: ({ row }) => (
      <span className="tabular-nums text-sm text-foreground">{formatRp(row.original.base_price)}</span>
    ),
  },
  {
    accessorKey: 'selling_price',
    header: 'Harga jual',
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
    header: 'Stok',
    cell: ({ row }) =>
      row.original.is_unlimited_stock ? (
        <span className="text-sm text-muted-foreground">Tanpa batas</span>
      ) : (
        <span className="tabular-nums text-sm font-medium text-foreground">
          {row.original.stock_quantity}
        </span>
      ),
  },
]
