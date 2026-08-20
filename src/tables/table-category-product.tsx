import { AddProductToCategoryProductButton } from '@/components/CategoryProduct/AddProduct'
import { DeleteCategoryProductButton } from '@/components/CategoryProduct/DeleteCategoryProduct'
import { UpdateCategoryProduct } from '@/components/CategoryProduct/UpdateCategoryProduct'
import { FallbackImage } from '@/components/ui/fallback-image'
import type { CategoryProduct } from '@/hooks/useCategoryProduct'
import { cn } from '@/lib/utils'
import { nbAccent, nbIconBtnSm, nbTag } from '@/styles/nb'
import type { ColumnDef } from '@tanstack/react-table'
import type { TFunction } from 'i18next'
import { ChevronDown, ChevronRight } from 'lucide-react'

export const getCategoryProductColumns = (t: TFunction): ColumnDef<CategoryProduct>[] => [
  {
    id: 'expand',
    header: '',
    cell: ({ row }) =>
      row.original.product?.length ? (
        <button
          type='button'
          className={cn(nbIconBtnSm, row.getIsExpanded() ? nbAccent.yellow : nbAccent.white)}
          onClick={row.getToggleExpandedHandler()}
          aria-expanded={row.getIsExpanded()}
          aria-label={
            row.getIsExpanded()
              ? t('categoryProductTable.collapseProductsAria')
              : t('categoryProductTable.expandProductsAria')
          }
        >
          {row.getIsExpanded() ? (
            <ChevronDown className='h-4 w-4' strokeWidth={3} aria-hidden />
          ) : (
            <ChevronRight className='h-4 w-4' strokeWidth={3} aria-hidden />
          )}
        </button>
      ) : (
        <span className='inline-block w-8' aria-hidden />
      ),
    size: 40,
  },
  {
    id: 'icon',
    accessorKey: 'icon_url',
    header: t('categoryProductTable.colIcon'),
    cell: ({ row }) => (
      <span className='nb-frame nb-frame-thin nb-sd-sm flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden bg-[#f5f1e8]'>
        <FallbackImage
          src={row.original.icon_url?.trim()}
          alt={
            row.original.name
              ? t('categoryProductTable.iconAltName', { name: row.original.name })
              : t('categoryProductTable.iconAltFallback')
          }
          label={t('categoryProductTable.noIcon')}
          className='h-full w-full object-contain'
        />
      </span>
    ),
  },
  {
    accessorKey: 'name',
    header: t('categoryProductTable.colCategoryName'),
    cell: ({ row }) => (
      <div className='max-w-[12rem] font-black uppercase tracking-tight text-[#111] sm:max-w-xs'>
        {row.original.name}
      </div>
    ),
  },
  {
    accessorKey: 'game_name',
    header: t('categoryProductTable.colGame'),
    cell: ({ row }) => (
      <span className={cn(nbTag, nbAccent.cyan, 'max-w-[12rem] truncate')}>
        {row.original.game_name}
      </span>
    ),
  },
  {
    id: 'product_count',
    accessorKey: 'product',
    header: t('categoryProductTable.colProductCount'),
    cell: ({ row }) => (
      <span className={cn(nbTag, nbAccent.lime, 'tabular-nums')}>
        {row.original.product?.length ?? 0}
      </span>
    ),
  },
  {
    id: 'actions',
    header: t('categoryProductTable.colActions'),
    cell: ({ row }) => (
      <div
        className='flex min-w-0 flex-wrap items-center gap-2'
        role='group'
        aria-label={t('categoryProductTable.rowActionsAria', { name: row.original.name })}
      >
        <AddProductToCategoryProductButton
          id={row.original.id}
          game_id={row.original.game_id}
          existingProduct={row.original.product}
          triggerClassName={nbAccent.cyan}
        />
        <UpdateCategoryProduct category={row.original} triggerClassName={nbAccent.yellow} />
        <DeleteCategoryProductButton id={row.original.id} triggerClassName={nbAccent.red} />
      </div>
    ),
  },
]
