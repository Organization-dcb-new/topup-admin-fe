import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { CreditCard, Layers, ListPlus, Pencil, Plus, RefreshCw, Trash2 } from 'lucide-react'

import { AuthAlert } from '@/components/Auth/AuthPanel'
import { Can } from '@/components/Auth/Can'
import { DangerDialog } from '@/components/Auth/DangerDialog'
import { hudEyebrowClass, hudPrimaryButtonClass } from '@/components/Auth/hud-styles'
import { DashboardLayout } from '@/components/Layout/dashboard-layout'
import { CategoryMethodsDialog } from '@/components/PaymentMethodCategory/CategoryMethodsDialog'
import { PaymentCategoryFormDialog } from '@/components/PaymentMethodCategory/PaymentCategoryFormDialog'
import { Switch } from '@/components/ui/switch'
import { PERM } from '@/constants/permissions'
import { usePermissions } from '@/hooks/usePermissions'
import { useGetPaymentMethods } from '@/hooks/usePaymentMethod'
import {
  toPaymentCategoryUpdate,
  useDeletePaymentCategory,
  useGetPaymentMethodCategory,
  useUpdatePaymentCategory,
} from '@/hooks/usePaymentMethodCategory'
import { cn } from '@/lib/utils'
import type { PaymentMethod } from '@/types/payment-method'
import type { PaymentMethodCategory } from '@/types/payment-method-categories'

const iconButtonClass =
  'grid size-8 shrink-0 place-items-center text-slate-400 hud-clip-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset'

export default function PaymentMethodCategoryPages() {
  const { t } = useTranslation('common')
  const { can } = usePermissions()
  const { data, isLoading, isError, isFetching, refetch } = useGetPaymentMethodCategory()
  // Membership lives on the methods (category_id), so the cards and the picker read them too.
  const methodsQuery = useGetPaymentMethods(1, 200)
  const deleteCategory = useDeletePaymentCategory()
  const [formTarget, setFormTarget] = useState<PaymentMethodCategory | 'new' | null>(null)
  const [methodsTarget, setMethodsTarget] = useState<PaymentMethodCategory | null>(null)
  const [toDelete, setToDelete] = useState<PaymentMethodCategory | null>(null)

  const categories = [...(data?.data ?? [])].sort((a, b) => a.sort_order - b.sort_order)
  const methods = methodsQuery.data?.data ?? []
  const methodsOf = (id: string) => methods.filter((m) => m.category_id === id).sort((a, b) => a.sort_order - b.sort_order)
  const unassigned = methods.filter((m) => !m.category_id || !categories.some((c) => c.id === m.category_id)).length
  const nextSortOrder = categories.reduce((max, c) => Math.max(max, c.sort_order), 0) + 1

  const openCreate = () => setFormTarget('new')

  return (
    <DashboardLayout>
      <div className='mx-auto max-w-6xl space-y-6'>
        <header className='flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between'>
          <div className='space-y-1'>
            <p className={hudEyebrowClass}>{t('paymentCategoryPage.eyebrow')}</p>
            <h1 className='font-display text-3xl font-bold tracking-tight text-slate-900'>{t('paymentCategoryPage.title')}</h1>
            <p className='max-w-2xl text-sm leading-relaxed text-slate-500'>{t('paymentCategoryPage.subtitle')}</p>
          </div>
          <div className='flex shrink-0 items-center gap-3'>
            {data && (
              <span className='font-display text-xs font-semibold uppercase tracking-[0.15em] text-slate-400'>
                {t('paymentCategoryPage.total', { count: categories.length })}
              </span>
            )}
            <Can permission={PERM.paymentCategoryCreate}>
              <button type='button' onClick={openCreate} className={hudPrimaryButtonClass}>
                <span className='pointer-events-none absolute inset-y-0 right-0 w-1.5 bg-brand-cyan' aria-hidden />
                <Plus className='size-4' aria-hidden />
                {t('paymentCategoryPage.addBtn')}
              </button>
            </Can>
          </div>
        </header>

        {unassigned > 0 && (
          <p className='rounded-md bg-amber-50 px-4 py-2.5 text-sm text-amber-800 ring-1 ring-inset ring-amber-200'>
            {t('paymentCategoryPage.unassigned', { count: unassigned })}
          </p>
        )}

        {isError && (
          <div className='space-y-3'>
            <AuthAlert>{t('paymentCategoryPage.loadError')}</AuthAlert>
            <button
              type='button'
              onClick={() => void refetch()}
              className='inline-flex h-9 items-center gap-2 rounded-md border border-slate-200 bg-white px-3 text-sm font-medium text-slate-600 transition-colors hover:text-brand-purple'
            >
              <RefreshCw className='size-4' aria-hidden />
              {t('paymentCategoryPage.retry')}
            </button>
          </div>
        )}

        {!isError && !isLoading && categories.length === 0 ? (
          <div className='grid place-items-center rounded-xl border border-dashed border-slate-300 bg-white px-6 py-16 text-center animate-in fade-in duration-500'>
            <span className='mb-4 grid size-14 place-items-center bg-linear-to-br from-brand-purple to-brand-cyan text-white hud-clip-sm'>
              <Layers className='size-6' aria-hidden />
            </span>
            <h2 className='font-display text-xl font-bold text-slate-900'>{t('paymentCategoryPage.emptyTitle')}</h2>
            <p className='mt-1 max-w-sm text-sm text-slate-500'>{t('paymentCategoryPage.emptyBody')}</p>
          </div>
        ) : (
          <ul className='grid gap-5 md:grid-cols-2 xl:grid-cols-3' aria-busy={isFetching}>
            {isLoading && Array.from({ length: 3 }, (_, i) => <li key={i} className='h-56 animate-pulse bg-slate-200/60 hud-clip' aria-hidden />)}
            {categories.map((category, index) => (
              <CategoryCard
                key={category.id}
                category={category}
                methods={methodsOf(category.id)}
                order={index}
                canUpdate={can(PERM.paymentCategoryUpdate)}
                onEdit={() => setFormTarget(category)}
                onMethods={() => setMethodsTarget(category)}
                onDelete={() => setToDelete(category)}
              />
            ))}
          </ul>
        )}
      </div>

      <PaymentCategoryFormDialog
        open={formTarget !== null}
        onOpenChange={(open) => !open && setFormTarget(null)}
        category={formTarget === 'new' ? undefined : (formTarget ?? undefined)}
        nextSortOrder={nextSortOrder}
      />
      <CategoryMethodsDialog
        category={methodsTarget}
        categories={categories}
        methods={methods}
        isLoading={methodsQuery.isLoading}
        onOpenChange={(open) => !open && setMethodsTarget(null)}
      />
      <DangerDialog
        open={!!toDelete}
        onOpenChange={(open) => !open && setToDelete(null)}
        eyebrow={t('paymentCategoryPage.deleteConfirm.eyebrow')}
        title={t('paymentCategoryPage.deleteConfirm.title', { name: toDelete?.name ?? '' })}
        description={t('paymentCategoryPage.deleteConfirm.description', { count: toDelete ? methodsOf(toDelete.id).length : 0 })}
        confirmLabel={t('paymentCategoryPage.deleteConfirm.confirm')}
        cancelLabel={t('paymentCategoryPage.deleteConfirm.cancel')}
        pending={deleteCategory.isPending}
        onConfirm={() => {
          if (!toDelete) return
          deleteCategory.mutate(toDelete.id, { onSuccess: () => setToDelete(null) })
        }}
      />
    </DashboardLayout>
  )
}

interface CategoryCardProps {
  category: PaymentMethodCategory
  methods: PaymentMethod[]
  order: number
  canUpdate: boolean
  onEdit: () => void
  onMethods: () => void
  onDelete: () => void
}

function CategoryCard({ category, methods, order, canUpdate, onEdit, onMethods, onDelete }: CategoryCardProps) {
  const { t } = useTranslation('common')
  const update = useUpdatePaymentCategory(undefined, 'paymentCategoryPage.toasts.statusSaved')
  const [iconFailed, setIconFailed] = useState(false)

  return (
    <li className='min-w-0 animate-in fade-in slide-in-from-bottom-2 duration-500 ease-hud fill-mode-both' style={{ animationDelay: `${order * 50}ms` }}>
      <div className='h-full bg-slate-200/80 p-px transition-colors duration-300 hud-clip hover:bg-brand-purple/40'>
        <article className='flex h-full flex-col bg-white hud-clip'>
          <div className={cn('h-1', category.is_active ? 'bg-linear-to-r from-brand-purple to-brand-cyan' : 'bg-slate-200')} aria-hidden />
          <div className='flex flex-1 flex-col gap-4 p-5'>
            <div className='flex items-start gap-3'>
              <span className='grid size-12 shrink-0 place-items-center overflow-hidden bg-slate-50 ring-1 ring-inset ring-slate-200 hud-clip-sm'>
                {category.icon_url && !iconFailed ? (
                  <img src={category.icon_url} alt='' className='size-full object-contain p-1.5' onError={() => setIconFailed(true)} />
                ) : (
                  <Layers className='size-5 text-slate-300' aria-hidden />
                )}
              </span>
              <div className='min-w-0 flex-1'>
                <h2 className={cn('truncate font-display text-lg font-bold', category.is_active ? 'text-slate-900' : 'text-slate-500')}>{category.name}</h2>
                <p className='truncate text-xs text-slate-400'>
                  <span className='font-mono'>{category.slug}</span>
                  <span> · {t('paymentCategoryPage.orderShort', { order: category.sort_order })}</span>
                </p>
              </div>
              {canUpdate && (
                <Switch
                  checked={category.is_active}
                  disabled={update.isPending}
                  onCheckedChange={(checked) => update.mutate({ id: category.id, payload: { ...toPaymentCategoryUpdate(category), is_active: checked } })}
                  aria-label={t('paymentCategoryPage.toggleActive', { name: category.name })}
                  title={t('paymentCategoryPage.toggleActive', { name: category.name })}
                  className='data-[state=checked]:bg-emerald-500'
                />
              )}
            </div>

            <div className='flex-1 rounded-lg border border-slate-200 p-3'>
              <div className='mb-2 flex items-center justify-between'>
                <span className='font-display text-[10px] font-semibold uppercase tracking-[0.15em] text-slate-400'>
                  {t('paymentCategoryPage.methodCount', { count: methods.length })}
                </span>
                <Can permission={PERM.paymentCategoryUpdate}>
                  <button
                    type='button'
                    onClick={onMethods}
                    className='inline-flex h-7 items-center gap-1 px-2 font-display text-[10px] font-semibold uppercase tracking-[0.15em] text-brand-purple hud-clip-sm transition-colors hover:bg-brand-purple/10'
                  >
                    <ListPlus className='size-3.5' aria-hidden />
                    {t('paymentCategoryPage.manageMethods')}
                  </button>
                </Can>
              </div>
              {methods.length ? (
                <ul className='flex flex-wrap gap-1.5'>
                  {methods.map((m) => (
                    <li
                      key={m.id}
                      className={cn(
                        'inline-flex items-center gap-1.5 rounded bg-slate-50 py-1 pl-1 pr-2 text-xs ring-1 ring-inset ring-slate-200',
                        m.is_active ? 'text-slate-700' : 'text-slate-400 line-through decoration-slate-300'
                      )}
                      title={m.is_active ? m.name : t('paymentCategoryPage.methodInactive', { name: m.name })}
                    >
                      <span className='grid size-5 place-items-center overflow-hidden rounded-sm bg-white'>
                        {m.icon_url ? <img src={m.icon_url} alt='' className='size-full object-contain' /> : <CreditCard className='size-3 text-slate-300' aria-hidden />}
                      </span>
                      {m.name}
                    </li>
                  ))}
                </ul>
              ) : (
                <p className='py-2 text-xs text-slate-400'>{t('paymentCategoryPage.noMethods')}</p>
              )}
            </div>

            <div className='flex items-center justify-end gap-0.5 border-t border-slate-100 pt-3'>
              <Can permission={PERM.paymentCategoryUpdate}>
                <button
                  type='button'
                  onClick={onEdit}
                  aria-label={t('paymentCategoryPage.editBtn', { name: category.name })}
                  title={t('paymentCategoryPage.editBtn', { name: category.name })}
                  className={`${iconButtonClass} hover:bg-brand-purple/10 hover:text-brand-purple focus-visible:ring-brand-purple/40`}
                >
                  <Pencil className='size-4' aria-hidden />
                </button>
              </Can>
              <Can permission={PERM.paymentCategoryDelete}>
                <button
                  type='button'
                  onClick={onDelete}
                  aria-label={t('paymentCategoryPage.deleteBtn', { name: category.name })}
                  title={t('paymentCategoryPage.deleteBtn', { name: category.name })}
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
