import { Link, useSearchParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { ChevronRight, RefreshCw, RotateCcw, Search, SearchX, UsersRound } from 'lucide-react'

import { AuthAlert } from '@/components/Auth/AuthPanel'
import { hudEyebrowClass, hudInputClass } from '@/components/Auth/hud-styles'
import { CustomerAvatar, CustomerStatusChip, SignInMethodChips } from '@/components/Customer/CustomerParts'
import { DashboardLayout } from '@/components/Layout/dashboard-layout'
import { HudPagination } from '@/components/Layout/hud-pagination'
import { Input } from '@/components/ui/input'
import { Segmented } from '@/components/ui/segmented'
import { toCustomerError, useGetCustomers } from '@/hooks/useCustomer'
import { useDebounce } from '@/hooks/useDebounce'
import { formatBackendDateTime } from '@/lib/backend-datetime'
import { cn } from '@/lib/utils'
import type { Customer } from '@/types/customer'

const PAGE_SIZE = 20

const STATUSES = ['all', 'active', 'inactive'] as const
const METHODS = ['all', 'password', 'google'] as const

function pick<T extends string>(value: string | null, allowed: readonly T[], fallback: T): T {
  return allowed.includes(value as T) ? (value as T) : fallback
}

/** Desktop columns, shared by the header and every row. */
const columns = 'lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_9.5rem_6.5rem_6.5rem_7.5rem_1rem]'

export default function CustomerPage() {
  const { t, i18n } = useTranslation('common')
  // Filters live in the URL, so coming back from a customer's detail page keeps them.
  const [params, setParams] = useSearchParams()
  const q = params.get('q') ?? ''
  const status = pick(params.get('status'), STATUSES, 'all')
  const method = pick(params.get('method'), METHODS, 'all')
  const page = Math.max(1, Number(params.get('page')) || 1)
  const search = useDebounce(q.trim(), 350)

  const update = (patch: Record<string, string | null>) =>
    setParams(
      (prev) => {
        const next = new URLSearchParams(prev)
        for (const [key, value] of Object.entries(patch)) {
          if (!value || value === 'all' || (key === 'page' && value === '1')) next.delete(key)
          else next.set(key, value)
        }
        return next
      },
      { replace: true }
    )

  const { data, isLoading, isError, error, isFetching, isPlaceholderData, refetch } = useGetCustomers({
    page,
    limit: PAGE_SIZE,
    search,
    status: status === 'all' ? undefined : status,
    method: method === 'all' ? undefined : method,
  })
  const customers = data?.data ?? []
  const total = data?.meta?.total_data
  const filtered = !!(q.trim() || status !== 'all' || method !== 'all')
  // An empty page past the first (e.g. an old link) is "nothing here", not "no customers yet".
  const emptyByChoice = filtered || page > 1
  const loadError = isError ? toCustomerError(error) : null
  const reset = () => update({ q: null, status: null, method: null, page: null })

  return (
    <DashboardLayout>
      <div className='mx-auto max-w-6xl space-y-6'>
        <header className='flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between'>
          <div className='min-w-0 space-y-1'>
            <p className={hudEyebrowClass}>{t('customerPage.eyebrow')}</p>
            <h1 className='font-display text-3xl font-bold tracking-tight text-slate-900'>{t('customerPage.title')}</h1>
            <p className='max-w-2xl text-sm leading-relaxed text-slate-500'>{t('customerPage.subtitle')}</p>
          </div>
          <div className='flex shrink-0 items-center gap-3'>
            {total !== undefined && (
              <span className='font-display text-xs font-semibold uppercase tracking-[0.15em] text-slate-400'>
                {filtered
                  ? t('customerPage.results', { count: total, formatted: total.toLocaleString(i18n.resolvedLanguage) })
                  : t('customerPage.total', { count: total, formatted: total.toLocaleString(i18n.resolvedLanguage) })}
              </span>
            )}
            <button
              type='button'
              onClick={() => void refetch()}
              disabled={isFetching}
              aria-label={t('customerPage.refresh')}
              title={t('customerPage.refresh')}
              className='grid size-9 place-items-center rounded-md border border-slate-200 bg-white text-slate-600 transition-colors hover:text-brand-purple disabled:opacity-60'
            >
              <RefreshCw className={cn('size-4', isFetching && 'animate-spin')} aria-hidden />
            </button>
          </div>
        </header>

        <div className='bg-slate-200/80 p-px hud-clip'>
          <div className='flex flex-col gap-3 bg-white p-4 hud-clip lg:flex-row lg:items-center'>
            <div className='group relative min-w-0 flex-1'>
              <span className='pointer-events-none absolute inset-y-0 left-0 flex w-10 items-center justify-center text-slate-400 group-focus-within:text-brand-purple'>
                <Search className='size-4' aria-hidden />
              </span>
              <Input
                type='search'
                value={q}
                onChange={(e) => update({ q: e.target.value, page: null })}
                placeholder={t('customerPage.filters.searchPlaceholder')}
                aria-label={t('customerPage.filters.searchPlaceholder')}
                className={cn(hudInputClass, 'h-10 bg-white pl-10 text-sm')}
              />
            </div>
            <div className='flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center'>
              <Segmented
                size='md'
                value={status}
                onChange={(v) => update({ status: v, page: null })}
                label={t('customerPage.filters.status')}
                options={STATUSES.map((s) => ({ value: s, label: t(`customerPage.filters.statusOptions.${s}`) }))}
              />
              <Segmented
                size='md'
                value={method}
                onChange={(v) => update({ method: v, page: null })}
                label={t('customerPage.filters.method')}
                options={METHODS.map((m) => ({ value: m, label: t(`customerPage.filters.methodOptions.${m}`) }))}
              />
            </div>
            {filtered && (
              <button
                type='button'
                onClick={reset}
                className='inline-flex h-10 shrink-0 items-center gap-1.5 self-start rounded-md px-3 text-xs font-medium text-slate-500 transition-colors hover:bg-rose-50 hover:text-rose-600 lg:self-auto'
              >
                <RotateCcw className='size-3.5' aria-hidden />
                {t('customerPage.filters.reset')}
              </button>
            )}
          </div>
        </div>

        {loadError && (
          <div className='space-y-3'>
            <AuthAlert>{loadError.key === 'customerPage.errors.generic' ? t('customerPage.loadError') : t(loadError.key)}</AuthAlert>
            <button
              type='button'
              onClick={() => void refetch()}
              disabled={isFetching}
              className='inline-flex h-9 items-center gap-2 rounded-md border border-slate-200 bg-white px-3 text-sm font-medium text-slate-600 transition-colors hover:text-brand-purple disabled:opacity-60'
            >
              <RefreshCw className={cn('size-4', isFetching && 'animate-spin')} aria-hidden />
              {t('customerPage.retry')}
            </button>
          </div>
        )}

        {isLoading ? (
          <ListSkeleton />
        ) : !isError && customers.length === 0 ? (
          <div className='grid place-items-center rounded-xl border border-dashed border-slate-300 bg-white px-6 py-16 text-center animate-in fade-in duration-500'>
            <span className='mb-4 grid size-14 place-items-center bg-linear-to-br from-brand-purple to-brand-cyan text-white hud-clip-sm'>
              {emptyByChoice ? <SearchX className='size-6' aria-hidden /> : <UsersRound className='size-6' aria-hidden />}
            </span>
            <h2 className='font-display text-xl font-bold text-slate-900'>
              {emptyByChoice ? t('customerPage.noMatchTitle') : t('customerPage.emptyTitle')}
            </h2>
            <p className='mt-1 max-w-sm text-sm text-slate-500'>
              {emptyByChoice ? t('customerPage.noMatchBody') : t('customerPage.emptyBody')}
            </p>
            {emptyByChoice && (
              <button
                type='button'
                onClick={reset}
                className='mt-5 inline-flex h-9 items-center gap-2 rounded-md px-3 text-sm font-medium text-brand-purple transition-colors hover:bg-brand-purple/10'
              >
                <RotateCcw className='size-4' aria-hidden />
                {t('customerPage.filters.reset')}
              </button>
            )}
          </div>
        ) : (
          customers.length > 0 && (
            <section
              aria-label={t('customerPage.listLabel')}
              className={cn('bg-slate-200/80 p-px transition-opacity duration-300 hud-clip', isPlaceholderData && 'opacity-60')}
            >
              <div className='bg-white hud-clip'>
                <div
                  className={cn(
                    'hidden gap-x-4 border-b border-slate-100 px-5 py-2.5 font-display text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-400 lg:grid',
                    columns
                  )}
                  aria-hidden
                >
                  <span>{t('customerPage.columns.customer')}</span>
                  <span>{t('customerPage.columns.email')}</span>
                  <span>{t('customerPage.columns.methods')}</span>
                  <span>{t('customerPage.columns.status')}</span>
                  <span>{t('customerPage.columns.createdAt')}</span>
                  <span>{t('customerPage.columns.lastLogin')}</span>
                </div>
                <ul className='divide-y divide-slate-100' aria-busy={isFetching}>
                  {customers.map((customer, index) => (
                    <CustomerRow key={customer.id} customer={customer} order={index} listSearch={params.toString()} />
                  ))}
                </ul>
              </div>
            </section>
          )
        )}

        <HudPagination page={page} totalPages={data?.meta?.total_page ?? 1} onChange={(p) => update({ page: String(p) })} />
      </div>
    </DashboardLayout>
  )
}

interface CustomerRowProps {
  customer: Customer
  order: number
  /** The list's query string, so the detail page's back link returns to the same view. */
  listSearch: string
}

function CustomerRow({ customer, order, listSearch }: CustomerRowProps) {
  const { t } = useTranslation('common')
  const name = customer.name || t('customerPage.noName')
  const lastLogin = customer.last_login_at
    ? formatBackendDateTime(customer.last_login_at, 'dd MMM yyyy, HH:mm')
    : t('customerPage.neverLoggedIn')

  return (
    <li
      className='animate-in fade-in duration-300 fill-mode-both'
      style={{ animationDelay: `${Math.min(order, 14) * 18}ms` }}
    >
      <Link
        to={`/customers/${customer.id}`}
        state={{ search: listSearch }}
        className={cn(
          'group grid grid-cols-[minmax(0,1fr)_auto] items-center gap-x-4 gap-y-2 px-4 py-3 transition-colors hover:bg-brand-purple/[0.03] focus-visible:bg-brand-purple/[0.05] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-brand-purple/40 sm:px-5',
          columns
        )}
      >
        <div className='flex min-w-0 items-center gap-3'>
          <CustomerAvatar customer={customer} />
          <div className='min-w-0'>
            <p
              className={cn(
                'truncate text-sm font-semibold transition-colors group-hover:text-brand-purple',
                customer.name ? (customer.is_active ? 'text-slate-900' : 'text-slate-500') : 'italic text-slate-400'
              )}
            >
              {name}
            </p>
            <p className='truncate text-xs text-slate-500 lg:hidden'>{customer.email}</p>
          </div>
        </div>

        <p className='hidden truncate text-sm text-slate-600 lg:block' title={customer.email}>
          {customer.email}
        </p>

        {/* Phones: status beside the name, methods and dates on the line under it. */}
        <div className='justify-self-end lg:hidden'>
          <CustomerStatusChip active={customer.is_active} />
        </div>

        <div className='col-span-2 flex min-w-0 flex-wrap items-center gap-x-3 gap-y-1 lg:col-span-1'>
          <SignInMethodChips customer={customer} />
          <span className='ml-auto text-[11px] tabular-nums text-slate-400 lg:hidden'>
            {t('customerPage.row.lastLogin', { value: lastLogin })}
          </span>
        </div>

        <div className='hidden lg:block'>
          <CustomerStatusChip active={customer.is_active} />
        </div>

        <span className='hidden text-xs tabular-nums text-slate-600 lg:block'>
          {formatBackendDateTime(customer.created_at, 'dd MMM yyyy')}
        </span>

        <span className={cn('hidden text-xs tabular-nums lg:block', customer.last_login_at ? 'text-slate-600' : 'text-slate-400')}>
          {lastLogin}
        </span>

        <ChevronRight
          className='hidden size-4 text-slate-300 transition-transform duration-300 ease-hud group-hover:translate-x-0.5 group-hover:text-brand-purple lg:block'
          aria-hidden
        />
      </Link>
    </li>
  )
}

function ListSkeleton() {
  return (
    <div className='space-y-px overflow-hidden bg-slate-200/60 p-px hud-clip' aria-hidden>
      {Array.from({ length: 8 }, (_, i) => (
        <div key={i} className='flex items-center gap-4 bg-white px-5 py-4'>
          <div className='size-10 animate-pulse bg-slate-200/70 hud-clip-sm' />
          <div className='flex-1 space-y-2'>
            <div className='h-3.5 w-1/3 animate-pulse rounded bg-slate-200/70' />
            <div className='h-3 w-1/4 animate-pulse rounded bg-slate-100' />
          </div>
          <div className='hidden h-5 w-24 animate-pulse rounded bg-slate-100 sm:block' />
        </div>
      ))}
    </div>
  )
}
