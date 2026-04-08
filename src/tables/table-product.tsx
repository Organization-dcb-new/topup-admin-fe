import type { ColumnDef } from '@tanstack/react-table'
import type { Product } from '@/types/product'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import { DEFAULT_GAME_IMAGE } from './table-game'
import { ChangeImageModalProduct } from '@/components/Product/Filter/UploadImage'
import UpdateProductPriceModal from '@/components/Product/Filter/UpdatePrice'

function formatRp(value: number | undefined | null) {
  const n = value ?? 0
  return `Rp ${n.toLocaleString('id-ID')}`
}

export const productColumns: ColumnDef<Product>[] = [
  {
    id: 'image',
    header: 'Gambar',
    cell: ({ row }: { row: { original: Product } }) => {
      const image = row.original.image?.trim() || DEFAULT_GAME_IMAGE

      return (
        <div className="flex items-center">
          <ChangeImageModalProduct product={row.original} image={image} />
        </div>
      )
    },
  },
  {
    accessorKey: 'name',
    header: 'Nama',
    cell: ({ row }) => (
      <div
        className="max-w-[12rem] font-medium text-gray-900 sm:max-w-xs"
        title={row.original.name}
      >
        {row.original.name}
      </div>
    ),
  },
  {
    accessorFn: (row) => row.game?.name || '-',
    id: 'game_name',
    header: 'Game',
    cell: ({ row }) => {
      const name = row.original.game?.name
      return (
        <span
          className={cn(
            'max-w-[10rem] truncate text-sm sm:max-w-[12rem]',
            name ? 'text-foreground' : 'text-muted-foreground',
          )}
          title={name ?? undefined}
        >
          {name ?? '—'}
        </span>
      )
    },
  },
  {
    accessorKey: 'sku',
    header: 'SKU',
    cell: ({ row }) => (
      <span className="tabular-nums text-sm font-medium text-foreground">{row.original.sku}</span>
    ),
  },
  {
    accessorKey: 'additional_fee',
    header: 'Biaya tambahan',
    cell: ({ row }) => (
      <span className="tabular-nums text-sm font-medium text-foreground">
        {formatRp(row.original.additional_fee)}
      </span>
    ),
  },
  {
    accessorKey: 'additional_percent',
    header: 'Persen',
    cell: ({ row }) => (
      <span className="tabular-nums text-sm font-medium text-foreground">
        {row.original.additional_percent} %
      </span>
    ),
  },
  {
    accessorKey: 'base_price',
    header: 'Harga dasar',
    cell: ({ row }) => (
      <span className="tabular-nums text-sm font-medium text-foreground">
        {formatRp(row.original.base_price)}
      </span>
    ),
  },
  {
    accessorKey: 'selling_price',
    header: 'Harga jual',
    cell: ({ row }) => (
      <span className="tabular-nums text-sm font-medium text-foreground">
        {formatRp(row.original.selling_price)}
      </span>
    ),
  },
  {
    accessorKey: 'stock_quantity',
    header: 'Stok',
    cell: ({ row }) =>
      row.original.is_unlimited_stock ? (
        <Badge variant="outline" className="font-normal text-sm">
          Tanpa batas
        </Badge>
      ) : (
        <span className="tabular-nums text-sm font-medium text-foreground">
          {row.original.stock_quantity}
        </span>
      ),
  },
  {
    accessorKey: 'is_active',
    header: 'Status',
    cell: ({ row }) => (
      <Badge
        variant={row.original.is_active ? 'success' : 'secondary'}
        className="font-normal text-sm"
      >
        {row.original.is_active ? 'Aktif' : 'Nonaktif'}
      </Badge>
    ),
  },
  {
    accessorKey: 'provider_status',
    header: 'Status provider',
    cell: ({ row }) => {
      const raw = row.original.provider_status?.trim()
      const lower = raw?.toLowerCase()
      const isAvailable = lower === 'available'
      const isEmpty = lower === 'empty' || raw === ''
      const label = isAvailable ? 'Tersedia' : isEmpty ? 'Kosong' : raw || '—'
      return (
        <Badge
          variant={isAvailable ? 'success' : isEmpty ? 'secondary' : 'outline'}
          className="max-w-[10rem] truncate font-normal text-sm"
          title={raw || undefined}
        >
          {label}
        </Badge>
      )
    },
  },
  {
    id: 'actions',
    header: 'Aksi',
    cell: ({ row }) => (
      <div className="flex min-w-0 items-center">
        <div
          className="inline-flex flex-wrap items-center gap-0.5 rounded-lg border border-border/70 bg-muted/25 p-0.5 shadow-sm"
          role="group"
          aria-label={`Aksi untuk produk ${row.original.name}`}
        >
          <UpdateProductPriceModal
            basePrice={row.original.base_price}
            productId={row.original.id}
            productName={row.original.name}
          />
        </div>
      </div>
    ),
  },
]
