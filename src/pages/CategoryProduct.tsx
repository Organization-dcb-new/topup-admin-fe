import { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { EyeOff, Gamepad2, ListPlus, Package, Pencil, Plus, RefreshCw, Shapes, Trash2 } from 'lucide-react'

import { AuthAlert } from '@/components/Auth/AuthPanel'
import { Can } from '@/components/Auth/Can'
import { DangerDialog } from '@/components/Auth/DangerDialog'
import { hudEyebrowClass, hudPrimaryButtonClass } from '@/components/Auth/hud-styles'
import { CategoryProductFormDialog } from '@/components/CategoryProduct/CategoryProductFormDialog'
import { CategoryProductsDialog } from '@/components/CategoryProduct/CategoryProductsDialog'
import { DashboardLayout } from '@/components/Layout/dashboard-layout'
import { HudPagination } from '@/components/Layout/hud-pagination'
import { PERM } from '@/constants/permissions'
import { useDeleteCategoryProduct, useGetCategoryProduct } from '@/hooks/useCategoryProduct'
import { usePermissions } from '@/hooks/usePermissions'
import { formatCurrency } from '@/lib/format'
import { cn } from '@/lib/utils'
import type { CategoryProduct as CategoryProductType } from '@/types/category-product'

const PAGE_SIZE = 30
/** Products listed on a card before it collapses into "+N more". */
const PREVIEW_PRODUCTS = 4

const iconButtonClass =
  'grid size-8 shrink-0 place-items-center text-slate-400 hud-clip-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset'

interface GameGroup {
  gameId: string
  gameName: string
  categories: CategoryProductType[]
}

export default function CategoryProduct() {
  const { t, i18n } = useTranslation('common')
  const { can } = usePermissions()
  const [page, setPage] = useState(1)
  const { data, isLoading, isError, isFetching, isPlaceholderData, refetch } = useGetCategoryProduct(page, PAGE_SIZE)
  const deleteCategory = useDeleteCategoryProduct()
  // 'new' opens the create form; a category opens it for renaming.
  const [formTarget, setFormTarget] = useState<CategoryProductType | 'new' | null>(null)
  const [productsTarget, setProductsTarget] = useState<CategoryProductType | null>(null)
  const [toDelete, setToDelete] = useState<CategoryProductType | null>(null)

  const categories = useMemo(() => data?.data ?? [], [data])
  const total = data?.meta?.total_data

  // Categories live on a game's storefront page, so group them the same way.
  const groups = useMemo<GameGroup[]>(() => {
    const byGame = new Map<string, GameGroup>()
    for (const c of categories) {
      const group = byGame.get(c.game_id) ?? { gameId: c.game_id, gameName: c.game_name, categories: [] }
      group.categories.push(c)
      byGame.set(c.game_id, group)
    }
    return [...byGame.values()]
      .map((g) => ({ ...g, categories: [...g.categories].sort((a, b) => a.name.localeCompare(b.name)) }))
      .sort((a, b) => a.gameName.localeCompare(b.gameName))
  }, [categories])

  const openCreate = () => setFormTarget('new')

  return (
    <DashboardLayout>
      <div className='mx-auto max-w-6xl space-y-6'>
        <header className='flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between'>
          <div className='space-y-1'>
            <p className={hudEyebrowClass}>{t('categoryProductPage.eyebrow')}</p>
            <h1 className='font-display text-3xl font-bold tracking-tight text-slate-900'>{t('categoryProductPage.title')}</h1>
            <p className='max-w-2xl text-sm leading-relaxed text-slate-500'>{t('categoryProductPage.subtitle')}</p>
          </div>
          <div className='flex shrink-0 items-center gap-3'>
            {total !== undefined && (
              <span className='font-display text-xs font-semibold uppercase tracking-[0.15em] text-slate-400'>
                {t('categoryProductPage.total', { count: total, formatted: total.toLocaleString(i18n.resolvedLanguage) })}
              </span>
            )}
            <Can permission={PERM.categoryProductCreate}>
              <button type='button' onClick={openCreate} className={hudPrimaryButtonClass}>
                <span className='pointer-events-none absolute inset-y-0 right-0 w-1.5 bg-brand-cyan' aria-hidden />
                <Plus className='size-4' aria-hidden />
                {t('categoryProductPage.addBtn')}
              </button>
            </Can>
          </div>
        </header>

        {isError && (
          <div className='space-y-3'>
            <AuthAlert>{t('categoryProductPage.loadError')}</AuthAlert>
            <button
              type='button'
              onClick={() => void refetch()}
              className='inline-flex h-9 items-center gap-2 rounded-md border border-slate-200 bg-white px-3 text-sm font-medium text-slate-600 transition-colors hover:text-brand-purple'
            >
              <RefreshCw className='size-4' aria-hidden />
              {t('categoryProductPage.retry')}
            </button>
          </div>
        )}

        {isLoading ? (
          <ul className='grid gap-5 md:grid-cols-2 xl:grid-cols-3' aria-hidden>
            {Array.from({ length: 6 }, (_, i) => (
              <li key={i} className='h-64 animate-pulse bg-slate-200/60 hud-clip' />
            ))}
          </ul>
        ) : !isError && categories.length === 0 ? (
          <div className='grid place-items-center rounded-xl border border-dashed border-slate-300 bg-white px-6 py-16 text-center animate-in fade-in duration-500'>
            <span className='mb-4 grid size-14 place-items-center bg-linear-to-br from-brand-purple to-brand-cyan text-white hud-clip-sm'>
              <Shapes className='size-6' aria-hidden />
            </span>
            <h2 className='font-display text-xl font-bold text-slate-900'>{t('categoryProductPage.emptyTitle')}</h2>
            <p className='mt-1 max-w-sm text-sm text-slate-500'>{t('categoryProductPage.emptyBody')}</p>
            <Can permission={PERM.categoryProductCreate}>
              <button type='button' onClick={openCreate} className={`${hudPrimaryButtonClass} mt-6`}>
                <span className='pointer-events-none absolute inset-y-0 right-0 w-1.5 bg-brand-cyan' aria-hidden />
                <Plus className='size-4' aria-hidden />
                {t('categoryProductPage.addBtn')}
              </button>
            </Can>
          </div>
        ) : (
          <div className={cn('space-y-8 transition-opacity duration-300', isPlaceholderData && 'opacity-60')} aria-busy={isFetching}>
            {groups.map((group, groupIndex) => (
              <section
                key={group.gameId}
                aria-label={group.gameName}
                className='animate-in fade-in slide-in-from-bottom-2 duration-500 ease-hud fill-mode-both'
                style={{ animationDelay: `${groupIndex * 60}ms` }}
              >
                <h2 className='mb-3 flex items-center gap-3'>
                  <Gamepad2 className='size-4 shrink-0 text-brand-purple' aria-hidden />
                  <span className='truncate font-display text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-600'>
                    {group.gameName || t('categoryProductPage.unknownGame')}
                  </span>
                  <span className='h-px flex-1 bg-slate-200' aria-hidden />
                  <span className='shrink-0 font-display text-[10px] font-semibold uppercase tracking-[0.15em] text-slate-400'>
                    {t('categoryProductPage.categoryCount', { count: group.categories.length })}
                  </span>
                </h2>
                <ul className='grid gap-5 md:grid-cols-2 xl:grid-cols-3'>
                  {group.categories.map((category, index) => (
                    <CategoryCard
                      key={category.id}
                      category={category}
                      order={index}
                      onProducts={() => setProductsTarget(category)}
                      onRename={() => setFormTarget(category)}
                      onDelete={() => setToDelete(category)}
                    />
                  ))}
                </ul>
              </section>
            ))}
          </div>
        )}

        <HudPagination page={page} totalPages={data?.meta?.total_page ?? 1} onChange={setPage} />
      </div>

      <CategoryProductFormDialog
        open={formTarget !== null}
        onOpenChange={(open) => !open && setFormTarget(null)}
        category={formTarget === 'new' ? undefined : (formTarget ?? undefined)}
      />
      <CategoryProductsDialog
        category={productsTarget}
        categories={categories}
        onOpenChange={(open) => !open && setProductsTarget(null)}
      />
      <DangerDialog
        open={!!toDelete}
        onOpenChange={(open) => !open && setToDelete(null)}
        eyebrow={t('categoryProductPage.deleteConfirm.eyebrow')}
        title={t('categoryProductPage.deleteConfirm.title', { name: toDelete?.name ?? '' })}
        description={t('categoryProductPage.deleteConfirm.description', { count: toDelete?.product?.length ?? 0 })}
        confirmLabel={t('categoryProductPage.deleteConfirm.confirm')}
        cancelLabel={t('categoryProductPage.deleteConfirm.cancel')}
        pending={deleteCategory.isPending}
        onConfirm={() => {
          if (!toDelete) return
          deleteCategory.mutate(
            // Emptying first needs the update permission; without it the delete still goes through.
            { category: toDelete, release: can(PERM.categoryProductUpdate) },
            {
              onSuccess: () => {
                setToDelete(null)
                if (categories.length === 1 && page > 1) setPage((p) => p - 1)
              },
            }
          )
        }}
      />
    </DashboardLayout>
  )
}

interface CategoryCardProps {
  category: CategoryProductType
  order: number
  onProducts: () => void
  onRename: () => void
  onDelete: () => void
}

function CategoryCard({ category, order, onProducts, onRename, onDelete }: CategoryCardProps) {
  const { t } = useTranslation('common')
  const [iconFailed, setIconFailed] = useState(false)
  const products = [...(category.product ?? [])].sort((a, b) => a.selling_price - b.selling_price)
  const active = category.is_active !== false
  const hidden = products.length - PREVIEW_PRODUCTS

  return (
    <li className='min-w-0 animate-in fade-in slide-in-from-bottom-2 duration-500 ease-hud fill-mode-both' style={{ animationDelay: `${order * 50}ms` }}>
      <div className='h-full bg-slate-200/80 p-px transition-colors duration-300 hud-clip hover:bg-brand-purple/40'>
        <article className='flex h-full flex-col bg-white hud-clip'>
          <div className={cn('h-1', active ? 'bg-linear-to-r from-brand-purple to-brand-cyan' : 'bg-slate-200')} aria-hidden />
          <div className='flex flex-1 flex-col gap-4 p-5'>
            <div className='flex items-start gap-3'>
              <span className='grid size-12 shrink-0 place-items-center overflow-hidden bg-slate-50 ring-1 ring-inset ring-slate-200 hud-clip-sm'>
                {category.icon_url && !iconFailed ? (
                  <img src={category.icon_url} alt='' className='size-full object-contain p-1.5' onError={() => setIconFailed(true)} />
                ) : (
                  <Shapes className='size-5 text-slate-300' aria-hidden />
                )}
              </span>
              <div className='min-w-0 flex-1 space-y-1'>
                <h3 className={cn('truncate font-display text-lg font-bold', active ? 'text-slate-900' : 'text-slate-500')}>{category.name}</h3>
                <p className='truncate font-mono text-xs text-slate-400'>{category.slug}</p>
              </div>
              <span
                className={cn(
                  'inline-flex shrink-0 items-center gap-1 px-2 py-0.5 font-display text-[10px] font-semibold uppercase tracking-[0.15em] hud-clip-sm',
                  active ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-500'
                )}
              >
                {active ? (
                  <span className='size-1.5 rounded-full bg-emerald-500' aria-hidden />
                ) : (
                  <EyeOff className='size-3' aria-hidden />
                )}
                {active ? t('categoryProductPage.status.active') : t('categoryProductPage.status.inactive')}
              </span>
            </div>

            {category.description && <p className='line-clamp-2 text-sm leading-relaxed text-slate-500'>{category.description}</p>}

            <div className='flex-1 rounded-lg border border-slate-200 p-3'>
              <div className='mb-2 flex items-center justify-between gap-2'>
                <span className='font-display text-[10px] font-semibold uppercase tracking-[0.15em] text-slate-400'>
                  {t('categoryProductPage.productCount', { count: products.length })}
                </span>
                <Can permission={PERM.categoryProductUpdate}>
                  <button
                    type='button'
                    onClick={onProducts}
                    className='inline-flex h-7 items-center gap-1 px-2 font-display text-[10px] font-semibold uppercase tracking-[0.15em] text-brand-purple hud-clip-sm transition-colors hover:bg-brand-purple/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-brand-purple/40'
                  >
                    <ListPlus className='size-3.5' aria-hidden />
                    {t('categoryProductPage.manageProducts')}
                  </button>
                </Can>
              </div>
              {products.length ? (
                <ul className='space-y-1.5'>
                  {products.slice(0, PREVIEW_PRODUCTS).map((p) => (
                    <li key={p.id} className='flex items-center justify-between gap-3 text-xs'>
                      <span className={cn('flex min-w-0 items-center gap-1.5', p.is_active ? 'text-slate-700' : 'text-slate-400')}>
                        <Package className='size-3 shrink-0 text-slate-300' aria-hidden />
                        <span className={cn('truncate', !p.is_active && 'line-through decoration-slate-300')} title={p.name}>
                          {p.name}
                        </span>
                      </span>
                      <span className='shrink-0 tabular-nums text-slate-500'>{formatCurrency(p.selling_price)}</span>
                    </li>
                  ))}
                  {hidden > 0 && (
                    <li className='pt-0.5 text-[11px] text-slate-400'>{t('categoryProductPage.moreProducts', { count: hidden })}</li>
                  )}
                </ul>
              ) : (
                <p className='py-2 text-xs text-slate-400'>{t('categoryProductPage.noProducts')}</p>
              )}
            </div>

            <div className='flex items-center justify-end gap-0.5 border-t border-slate-100 pt-3'>
              <Can permission={PERM.categoryProductUpdate}>
                <button
                  type='button'
                  onClick={onRename}
                  aria-label={t('categoryProductPage.renameBtn', { name: category.name })}
                  title={t('categoryProductPage.renameBtn', { name: category.name })}
                  className={`${iconButtonClass} hover:bg-brand-purple/10 hover:text-brand-purple focus-visible:ring-brand-purple/40`}
                >
                  <Pencil className='size-4' aria-hidden />
                </button>
              </Can>
              <Can permission={PERM.categoryProductDelete}>
                <button
                  type='button'
                  onClick={onDelete}
                  aria-label={t('categoryProductPage.deleteBtn', { name: category.name })}
                  title={t('categoryProductPage.deleteBtn', { name: category.name })}
                  className={`${iconButtonClass} hover:bg-rose-50 hover:text-rose-600 focus-visible:ring-rose-500/30`}
                >
                  <Trash2 className='size-4' aria-hidden />
                </button>
              </Can>
            </div>
          </div>
        </article>
      </div>
    </li>
  )
}
