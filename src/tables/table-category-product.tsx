import { AddProductToCategoryProductButton } from '@/components/CategoryProduct/AddProduct'
import { DeleteCategoryProductButton } from '@/components/CategoryProduct/DeleteCategoryProduct'
import { UpdateCategoryProduct } from '@/components/CategoryProduct/UpdateCategoryProduct'
import type { CategoryProduct } from '@/hooks/useCategoryProduct'
import type { ColumnDef } from '@tanstack/react-table'
import { ChevronDown, ChevronRight } from 'lucide-react'

const FALLBACK_ICON = 'https://api.dicebear.com/9.x/lorelei/svg'

export const categoryProductColumn: ColumnDef<CategoryProduct>[] = [
  {
    id: 'expand',
    header: '',
    cell: ({ row }) =>
      row.original.product?.length ? (
        <button
          type="button"
          className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-md border border-border/70 bg-muted/25 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          onClick={row.getToggleExpandedHandler()}
          aria-expanded={row.getIsExpanded()}
          aria-label={
            row.getIsExpanded()
              ? 'Sembunyikan daftar produk'
              : 'Tampilkan daftar produk di baris ini'
          }
        >
          {row.getIsExpanded() ? (
            <ChevronDown className="h-4 w-4" aria-hidden />
          ) : (
            <ChevronRight className="h-4 w-4" aria-hidden />
          )}
        </button>
      ) : (
        <span className="inline-block w-8" aria-hidden />
      ),
    size: 40,
  },
  {
    id: 'icon',
    accessorKey: 'icon_url',
    header: 'Ikon',
    cell: ({ row }) => {
      const src = row.original.icon_url?.trim() || FALLBACK_ICON
      return (
        <img
          src={src}
          alt={row.original.name ? `Ikon ${row.original.name}` : 'Ikon kategori'}
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
    header: 'Nama kategori',
    cell: ({ row }) => (
      <div className="max-w-[12rem] font-medium text-gray-900 sm:max-w-xs">{row.original.name}</div>
    ),
  },
  {
    accessorKey: 'game_name',
    header: 'Game',
    cell: ({ row }) => (
      <span className="max-w-[10rem] truncate text-sm text-foreground sm:max-w-[12rem]">
        {row.original.game_name}
      </span>
    ),
  },
  {
    id: 'product_count',
    accessorKey: 'product',
    header: 'Jumlah produk',
    cell: ({ row }) => (
      <span className="tabular-nums text-sm font-medium text-foreground">
        {row.original.product?.length ?? 0}
      </span>
    ),
  },
  {
    id: 'actions',
    header: 'Aksi',
    cell: ({ row }) => (
      <div className="flex min-w-0 items-center">
        <div
          className="inline-flex flex-wrap items-center gap-0.5 rounded-lg border border-border/70 bg-muted/25 p-0.5 shadow-sm"
          role="group"
          aria-label={`Aksi untuk kategori ${row.original.name}`}
        >
          <AddProductToCategoryProductButton
            id={row.original.id}
            game_id={row.original.game_id}
            existingProduct={row.original.product}
          />
          <DeleteCategoryProductButton id={row.original.id} />
          <UpdateCategoryProduct category={row.original} />
        </div>
      </div>
    ),
  },
]
