import { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { CreditCard, FolderOpen, Pencil, Plus, RefreshCw, Search, Trash2 } from 'lucide-react'

import { AuthAlert } from '@/components/Auth/AuthPanel'
import { Can } from '@/components/Auth/Can'
import { DangerDialog } from '@/components/Auth/DangerDialog'
import { hudEyebrowClass, hudInputClass, hudPrimaryButtonClass } from '@/components/Auth/hud-styles'
import { DashboardLayout } from '@/components/Layout/dashboard-layout'
import { PaymentMethodFormDialog } from '@/components/PaymentMethod/PaymentMethodFormDialog'
import { formatFee, formatLimit } from '@/components/PaymentMethod/payment-format'
import { Input } from '@/components/ui/input'
import { Switch } from '@/components/ui/switch'
import { PERM } from '@/constants/permissions'
import { usePermissions } from '@/hooks/usePermissions'
import { toPaymentMethodUpdate, useDeletePaymentMethod, useGetPaymentMethods, useUpdatePaymentMethod } from '@/hooks/usePaymentMethod'
import { useGetPaymentMethodCategory } from '@/hooks/usePaymentMethodCategory'
import { cn } from '@/lib/utils'
import type { PaymentMethod } from '@/types/payment-method'

/** Payment methods are a short list; load them all and group on the client. */
const LIST_LIMIT = 200

const iconButtonClass =
  'grid size-8 shrink-0 place-items-center text-slate-400 hud-clip-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset'

interface Group {
  id: string
  name: string
  iconUrl?: string
  methods: PaymentMethod[]
}

export default function PaymentMethodPage() {
  const { t } = useTranslation('common')
  const { can } = usePermissions()
  const { data, isLoading, isError, isFetching, refetch } = useGetPaymentMethods(1, LIST_LIMIT)
  const { data: categoryData } = useGetPaymentMethodCategory(can(PERM.paymentCategoryView))
  const deleteMethod = useDeletePaymentMethod()
  const [formTarget, setFormTarget] = useState<PaymentMethod | 'new' | null>(null)
  const [toDelete, setToDelete] = useState<PaymentMethod | null>(null)
  const [search, setSearch] = useState('')

  const methods = useMemo(() => [...(data?.data ?? [])].sort((a, b) => a.sort_order - b.sort_order), [data])
  const activeCount = methods.filter((m) => m.is_active).length
  const suggestions = useMemo(
    () => ({
      types: [...new Set(methods.map((m) => m.type).filter(Boolean))].sort(),
      providers: [...new Set(methods.map((m) => m.provider).filter(Boolean))].sort(),
    }),
    [methods]
  )
  const nextSortOrder = methods.reduce((max, m) => Math.max(max, m.sort_order), 0) + 1

  const query = search.trim().toLowerCase()
  const groups = useMemo<Group[]>(() => {
    const visible = query
      ? methods.filter((m) => [m.name, m.code, m.type, m.provider].some((v) => v?.toLowerCase().includes(query)))
      : methods
    const categories = [...(categoryData?.data ?? [])].sort((a, b) => a.sort_order - b.sort_order)
    const known = new Set(categories.map((c) => c.id))
    const result: Group[] = categories.map((c) => ({
      id: c.id,
      name: c.name,
      iconUrl: c.icon_url,
      methods: visible.filter((m) => m.category_id === c.id),
    }))
    result.push({ id: 'none', name: '', methods: visible.filter((m) => !m.category_id || !known.has(m.category_id)) })
    return result.filter((g) => g.methods.length > 0)
  }, [methods, categoryData, query])

  const openCreate = () => setFormTarget('new')

  return (
    <DashboardLayout>
      <div className='mx-auto max-w-6xl space-y-6'>
        <header className='flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between'>
          <div className='space-y-1'>
            <p className={hudEyebrowClass}>{t('paymentMethodPage.eyebrow')}</p>
            <h1 className='font-display text-3xl font-bold tracking-tight text-slate-900'>{t('paymentMethodPage.title')}</h1>
            <p className='max-w-2xl text-sm leading-relaxed text-slate-500'>{t('paymentMethodPage.subtitle')}</p>
          </div>
          <div className='flex shrink-0 items-center gap-3'>
            {data && (
              <span className='font-display text-xs font-semibold uppercase tracking-[0.15em] text-slate-400'>
                {t('paymentMethodPage.total', { active: activeCount, count: methods.length })}
              </span>
            )}
            <Can permission={PERM.paymentMethodCreate}>
              <button type='button' onClick={openCreate} className={hudPrimaryButtonClass}>
                <span className='pointer-events-none absolute inset-y-0 right-0 w-1.5 bg-brand-cyan' aria-hidden />
                <Plus className='size-4' aria-hidden />
                {t('paymentMethodPage.addBtn')}
              </button>
            </Can>
          </div>
        </header>

        {methods.length > 0 && (
          <div className='group relative max-w-sm'>
            <span className='pointer-events-none absolute inset-y-0 left-0 flex w-11 items-center justify-center text-slate-400 group-focus-within:text-brand-purple'>
              <Search className='size-4' aria-hidden />
            </span>
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={t('paymentMethodPage.searchPlaceholder')}
              aria-label={t('paymentMethodPage.searchPlaceholder')}
              className={cn(hudInputClass, 'bg-white pl-11')}
            />
          </div>
        )}

        {isError && (
          <div className='space-y-3'>
            <AuthAlert>{t('paymentMethodPage.loadError')}</AuthAlert>
            <button
              type='button'
              onClick={() => void refetch()}
              className='inline-flex h-9 items-center gap-2 rounded-md border border-slate-200 bg-white px-3 text-sm font-medium text-slate-600 transition-colors hover:text-brand-purple'
            >
              <RefreshCw className='size-4' aria-hidden />
              {t('paymentMethodPage.retry')}
            </button>
          </div>
        )}

        {isLoading && <div className='h-80 animate-pulse bg-slate-200/60 hud-clip' aria-hidden />}

        {!isError && !isLoading && methods.length === 0 && (
          <div className='grid place-items-center rounded-xl border border-dashed border-slate-300 bg-white px-6 py-16 text-center animate-in fade-in duration-500'>
            <span className='mb-4 grid size-14 place-items-center bg-linear-to-br from-brand-purple to-brand-cyan text-white hud-clip-sm'>
              <CreditCard className='size-6' aria-hidden />
            </span>
            <h2 className='font-display text-xl font-bold text-slate-900'>{t('paymentMethodPage.emptyTitle')}</h2>
            <p className='mt-1 max-w-sm text-sm text-slate-500'>{t('paymentMethodPage.emptyBody')}</p>
          </div>
        )}

        {methods.length > 0 && groups.length === 0 && (
          <p className='rounded-md border border-dashed border-slate-300 bg-white px-4 py-10 text-center text-sm text-slate-500'>
            {t('paymentMethodPage.noMatch')}
          </p>
        )}

        <div className='space-y-6' aria-busy={isFetching}>
          {groups.map((group, groupIndex) => (
            <section
              key={group.id}
              className='animate-in fade-in slide-in-from-bottom-2 duration-500 ease-hud fill-mode-both'
              style={{ animationDelay: `${groupIndex * 60}ms` }}
              aria-label={group.name || t('paymentMethodPage.uncategorized')}
            >
              <h2 className='mb-2 flex items-center gap-3'>
                {group.iconUrl ? (
                  <img src={group.iconUrl} alt='' className='size-5 object-contain' />
                ) : (
                  <FolderOpen className='size-4 text-slate-400' aria-hidden />
                )}
                <span className='font-display text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-600'>
                  {group.name || t('paymentMethodPage.uncategorized')}
                </span>
                <span className='h-px flex-1 bg-slate-200' aria-hidden />
                <span className='font-display text-[10px] font-semibold uppercase tracking-[0.15em] text-slate-400'>
                  {t('paymentMethodPage.methodCount', { count: group.methods.length })}
                </span>
              </h2>
              <div className='bg-slate-200/80 p-px hud-clip'>
                <ul className='divide-y divide-slate-100 bg-white hud-clip'>
                  {group.methods.map((method) => (
                    <MethodRow
                      key={method.id}
                      method={method}
                      onEdit={() => setFormTarget(method)}
                      onDelete={() => setToDelete(method)}
                    />
                  ))}
                </ul>
              </div>
            </section>
          ))}
        </div>
      </div>

      <PaymentMethodFormDialog
        open={formTarget !== null}
        onOpenChange={(open) => !open && setFormTarget(null)}
        method={formTarget === 'new' ? undefined : (formTarget ?? undefined)}
        suggestions={suggestions}
        nextSortOrder={nextSortOrder}
      />
      <DangerDialog
        open={!!toDelete}
        onOpenChange={(open) => !open && setToDelete(null)}
        eyebrow={t('paymentMethodPage.deleteConfirm.eyebrow')}
        title={t('paymentMethodPage.deleteConfirm.title', { name: toDelete?.name ?? '' })}
        description={t('paymentMethodPage.deleteConfirm.description')}
        confirmLabel={t('paymentMethodPage.deleteConfirm.confirm')}
        cancelLabel={t('paymentMethodPage.deleteConfirm.cancel')}
        pending={deleteMethod.isPending}
        onConfirm={() => {
          if (!toDelete) return
          deleteMethod.mutate(toDelete.id, { onSuccess: () => setToDelete(null) })
        }}
      />
    </DashboardLayout>
  )
}

function MethodRow({ method, onEdit, onDelete }: { method: PaymentMethod; onEdit: () => void; onDelete: () => void }) {
  const { t } = useTranslation('common')
  const { can } = usePermissions()
  const update = useUpdatePaymentMethod(undefined, 'paymentMethodPage.toasts.statusSaved')
  const [iconFailed, setIconFailed] = useState(false)

  return (
    <li className={cn('flex flex-wrap items-center gap-x-4 gap-y-3 px-4 py-3.5 transition-colors hover:bg-slate-50/70 sm:px-5', !method.is_active && 'bg-slate-50/50')}>
      <span className='grid size-11 shrink-0 place-items-center overflow-hidden bg-white ring-1 ring-inset ring-slate-200 hud-clip-sm'>
        {method.icon_url && !iconFailed ? (
          <img src={method.icon_url} alt='' className={cn('size-full object-contain p-1.5', !method.is_active && 'grayscale')} onError={() => setIconFailed(true)} />
        ) : (
          <CreditCard className='size-5 text-slate-300' aria-hidden />
        )}
      </span>

      <div className='min-w-0 flex-1 basis-48 space-y-1'>
        <div className='flex flex-wrap items-center gap-x-2 gap-y-1'>
          <p className={cn('truncate font-semibold', method.is_active ? 'text-slate-900' : 'text-slate-500')}>{method.name}</p>
          {method.type && (
            <span className='bg-slate-100 px-1.5 py-0.5 font-display text-[10px] font-semibold uppercase tracking-[0.12em] text-slate-600 hud-clip-sm'>
              {method.type}
            </span>
          )}
          {!method.is_active && (
            <span className='font-display text-[10px] font-semibold uppercase tracking-[0.12em] text-slate-400'>{t('paymentMethodPage.inactive')}</span>
          )}
        </div>
        <p className='truncate text-xs text-slate-500'>
          <span className='font-mono'>{method.code}</span>
          {method.provider && <span> · {method.provider}</span>}
        </p>
      </div>

      <dl className='grid shrink-0 grid-cols-2 gap-x-6 text-xs sm:w-72'>
        <div className='min-w-0'>
          <dt className='font-display text-[10px] font-semibold uppercase tracking-[0.15em] text-slate-400'>{t('paymentMethodPage.fee')}</dt>
          <dd className='truncate font-medium tabular-nums text-slate-700'>{formatFee(method, t)}</dd>
        </div>
        <div className='min-w-0'>
          <dt className='font-display text-[10px] font-semibold uppercase tracking-[0.15em] text-slate-400'>{t('paymentMethodPage.limit')}</dt>
          <dd className='truncate font-medium tabular-nums text-slate-700' title={formatLimit(method, t)}>{formatLimit(method, t)}</dd>
        </div>
      </dl>

      <div className='flex shrink-0 items-center gap-1'>
        {can(PERM.paymentMethodUpdate) && (
          <Switch
            checked={method.is_active}
            disabled={update.isPending}
            onCheckedChange={(checked) => update.mutate({ id: method.id, payload: { ...toPaymentMethodUpdate(method), is_active: checked } })}
            aria-label={t('paymentMethodPage.toggleActive', { name: method.name })}
            title={t('paymentMethodPage.toggleActive', { name: method.name })}
            className='mr-2 data-[state=checked]:bg-emerald-500'
          />
        )}
        <Can permission={PERM.paymentMethodUpdate}>
          <button
            type='button'
            onClick={onEdit}
            aria-label={t('paymentMethodPage.editBtn', { name: method.name })}
            title={t('paymentMethodPage.editBtn', { name: method.name })}
            className={`${iconButtonClass} hover:bg-brand-purple/10 hover:text-brand-purple focus-visible:ring-brand-purple/40`}
          >
            <Pencil className='size-4' aria-hidden />
          </button>
        </Can>
        <Can permission={PERM.paymentMethodDelete}>
          <button
            type='button'
            onClick={onDelete}
            aria-label={t('paymentMethodPage.deleteBtn', { name: method.name })}
            title={t('paymentMethodPage.deleteBtn', { name: method.name })}
            className={`${iconButtonClass} hover:bg-rose-50 hover:text-rose-600 focus-visible:ring-rose-500/30`}
          >
            <Trash2 className='size-4' aria-hidden />
          </button>
        </Can>
      </div>
    </li>
  )
}
