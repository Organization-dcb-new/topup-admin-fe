import type { ReactNode } from 'react'
import { Link, useLocation, useParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import {
  ArrowLeft,
  CalendarClock,
  CheckCircle,
  KeyRound,
  ReceiptText,
  RefreshCw,
  SearchX,
  TriangleAlert,
  UserRound,
  Wallet,
  type LucideIcon,
} from 'lucide-react'

import { Can } from '@/components/Auth/Can'
import { hudEyebrowClass } from '@/components/Auth/hud-styles'
import { CustomerActions } from '@/components/Customer/CustomerActions'
import {
  CustomerAvatar,
  CustomerMetric,
  CustomerStatusChip,
  EmailVerifiedChip,
  SignInMethodChips,
} from '@/components/Customer/CustomerParts'
import { DashboardLayout } from '@/components/Layout/dashboard-layout'
import { DetailField, DetailPanel, EmptyValue } from '@/components/Transaction/detail-parts'
import { PERM } from '@/constants/permissions'
import { isCustomerId, toCustomerError, useCustomerDetail } from '@/hooks/useCustomer'
import { formatBackendDateTime } from '@/lib/backend-datetime'
import { formatCurrency, formatNumber } from '@/lib/format'
import { cn } from '@/lib/utils'
import type { CustomerDetail } from '@/types/customer'

export default function CustomerDetailPage() {
  const { t } = useTranslation('common')
  const { id } = useParams<{ id: string }>()
  const location = useLocation()
  const valid = isCustomerId(id)
  const { data: customer, isLoading, isError, error, isFetching, refetch } = useCustomerDetail(valid ? id : undefined)
  const loadError = isError ? toCustomerError(error) : null
  // 400 is a malformed id; both mean there is nothing to show at this address.
  const notFound = !valid || loadError?.status === 404 || loadError?.status === 400
  // The list keeps its filters in the query string; go back to the same view.
  const fromSearch = (location.state as { search?: string } | null)?.search
  const backTo = fromSearch ? `/customers?${fromSearch}` : '/customers'

  return (
    <DashboardLayout>
      <div className='mx-auto max-w-6xl space-y-6'>
        <div className='flex items-center justify-between gap-3'>
          <Link
            to={backTo}
            className='group inline-flex items-center gap-1.5 font-display text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-500 transition-colors hover:text-brand-purple'
          >
            <ArrowLeft className='size-3.5 transition-transform duration-300 ease-hud group-hover:-translate-x-0.5' aria-hidden />
            {t('customerPage.detail.back')}
          </Link>
          {customer && !notFound && (
            <button
              type='button'
              onClick={() => void refetch()}
              disabled={isFetching}
              className='inline-flex h-9 items-center gap-2 rounded-md border border-slate-200 bg-white px-3 text-sm font-medium text-slate-600 transition-colors hover:text-brand-purple disabled:opacity-60'
            >
              <RefreshCw className={cn('size-4', isFetching && 'animate-spin')} aria-hidden />
              <span className='hidden sm:inline'>{t('customerPage.refresh')}</span>
            </button>
          )}
        </div>

        {notFound ? (
          <DetailState
            icon={SearchX}
            title={t('customerPage.detail.notFoundTitle')}
            body={t('customerPage.detail.notFoundBody')}
            backTo={backTo}
          />
        ) : loadError && !customer ? (
          <DetailState
            icon={TriangleAlert}
            tone='error'
            title={t('customerPage.detail.errorTitle')}
            body={loadError.key === 'customerPage.errors.generic' ? t('customerPage.detail.errorBody') : t(loadError.key)}
            backTo={backTo}
            action={
              <button
                type='button'
                onClick={() => void refetch()}
                disabled={isFetching}
                className='inline-flex h-9 items-center gap-2 rounded-md border border-slate-200 bg-white px-3 text-sm font-medium text-slate-600 transition-colors hover:text-brand-purple disabled:opacity-60'
              >
                <RefreshCw className={cn('size-4', isFetching && 'animate-spin')} aria-hidden />
                {t('customerPage.retry')}
              </button>
            }
          />
        ) : isLoading || !customer ? (
          <DetailSkeleton />
        ) : (
          <CustomerDetailView customer={customer} />
        )}
      </div>
    </DashboardLayout>
  )
}

function CustomerDetailView({ customer }: { customer: CustomerDetail }) {
  const { t } = useTranslation('common')
  const { summary } = customer
  const date = (raw: string | null) => (raw ? formatBackendDateTime(raw, 'dd MMM yyyy, HH:mm') : null)

  return (
    <>
      <section className='bg-slate-200/80 p-px hud-clip animate-in fade-in slide-in-from-bottom-3 duration-500 ease-hud'>
        <div className='bg-white hud-clip'>
          <div
            className={cn('h-1', customer.is_active ? 'bg-linear-to-r from-brand-purple to-brand-cyan' : 'bg-rose-300')}
            aria-hidden
          />
          <div className='space-y-5 p-5 sm:p-7'>
            <div className='flex items-start gap-4'>
              <CustomerAvatar customer={customer} size='lg' />
              <div className='min-w-0 flex-1 space-y-2'>
                <p className={hudEyebrowClass}>{t('customerPage.detail.eyebrow')}</p>
                <h1
                  className={cn(
                    'break-words font-display text-2xl font-bold leading-tight tracking-tight sm:text-3xl',
                    customer.name ? 'text-slate-900' : 'italic text-slate-400'
                  )}
                >
                  {customer.name || t('customerPage.noName')}
                </h1>
                <p className='break-all text-sm text-slate-500'>{customer.email}</p>
                <div className='flex flex-wrap items-center gap-2'>
                  <CustomerStatusChip active={customer.is_active} />
                  <EmailVerifiedChip verified={customer.email_verified} />
                  <SignInMethodChips customer={customer} />
                </div>
              </div>
            </div>

            {!customer.is_active && (
              <p className='rounded-md border border-rose-200 border-l-[3px] border-l-rose-500 bg-rose-50 px-3.5 py-2.5 text-xs leading-relaxed text-rose-700'>
                {t('customerPage.detail.inactiveNote')}
              </p>
            )}

            <Can permission={PERM.customerUpdate}>
              <div className='border-t border-slate-100 pt-5'>
                <CustomerActions key={customer.id} customer={customer} />
              </div>
            </Can>
          </div>
        </div>
      </section>

      <section aria-labelledby='customer-purchases' className='space-y-3'>
        <div className='flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between'>
          <h2 id='customer-purchases' className={hudEyebrowClass}>
            {t('customerPage.detail.summaryTitle')}
          </h2>
          <p className='text-xs text-slate-500'>{t('customerPage.detail.summaryHint')}</p>
        </div>
        <ul className='grid grid-cols-2 gap-4 lg:grid-cols-4'>
          <CustomerMetric
            order={0}
            icon={ReceiptText}
            label={t('customerPage.detail.metrics.transactions')}
            value={formatNumber(summary.transaction_count)}
          />
          <CustomerMetric
            order={1}
            icon={CheckCircle}
            label={t('customerPage.detail.metrics.paid')}
            value={formatNumber(summary.paid_count)}
            tone='emerald'
          />
          <CustomerMetric
            order={2}
            icon={Wallet}
            label={t('customerPage.detail.metrics.spent')}
            value={formatCurrency(summary.paid_total)}
            hint={t('customerPage.detail.metrics.spentHint')}
            tone='emerald'
          />
          <CustomerMetric
            order={3}
            icon={CalendarClock}
            label={t('customerPage.detail.metrics.lastTransaction')}
            value={date(summary.last_transaction_at) ?? t('customerPage.detail.metrics.noTransaction')}
          />
        </ul>
      </section>

      <div className='grid items-start gap-6 lg:grid-cols-2'>
        <DetailPanel icon={UserRound} title={t('customerPage.detail.profileTitle')} order={0}>
          <dl>
            <DetailField label={t('customerPage.detail.fields.name')}>{customer.name || <EmptyValue />}</DetailField>
            <DetailField label={t('customerPage.detail.fields.email')} copy={customer.email}>
              {customer.email}
            </DetailField>
            <DetailField label={t('customerPage.detail.fields.emailStatus')}>
              <EmailVerifiedChip verified={customer.email_verified} />
            </DetailField>
            <DetailField label={t('customerPage.detail.fields.phone')} copy={customer.phone || undefined}>
              {customer.phone || <EmptyValue />}
            </DetailField>
            <DetailField label={t('customerPage.detail.fields.status')}>
              <CustomerStatusChip active={customer.is_active} />
            </DetailField>
            <DetailField label={t('customerPage.detail.fields.createdAt')}>{date(customer.created_at) ?? <EmptyValue />}</DetailField>
            <DetailField label={t('customerPage.detail.fields.lastLogin')}>
              {date(customer.last_login_at) ?? <span className='text-slate-400'>{t('customerPage.neverLoggedIn')}</span>}
            </DetailField>
            <DetailField label={t('customerPage.detail.fields.id')} copy={customer.id} mono stacked>
              {customer.id}
            </DetailField>
          </dl>
        </DetailPanel>

        <DetailPanel
          icon={KeyRound}
          title={t('customerPage.detail.methodsTitle')}
          order={1}
          footer={t('customerPage.detail.methodsFooter')}
        >
          <dl>
            <DetailField label={t('customerPage.detail.fields.password')}>
              <YesNo yes={customer.has_password}>
                {customer.has_password ? t('customerPage.detail.passwordSet') : t('customerPage.detail.passwordNotSet')}
              </YesNo>
            </DetailField>
            <DetailField label={t('customerPage.detail.fields.google')}>
              <YesNo yes={customer.google_linked}>
                {customer.google_linked ? t('customerPage.detail.googleLinked') : t('customerPage.detail.googleNotLinked')}
              </YesNo>
            </DetailField>
            <DetailField label={t('customerPage.detail.fields.createdVia')}>
              {customer.auth_provider === 'google' ? t('customerPage.detail.viaGoogle') : t('customerPage.detail.viaManual')}
            </DetailField>
          </dl>
        </DetailPanel>
      </div>
    </>
  )
}

function YesNo({ yes, children }: { yes: boolean; children: ReactNode }) {
  return (
    <span className={cn('inline-flex items-center gap-1.5 font-medium', yes ? 'text-emerald-700' : 'text-slate-500')}>
      <span className={cn('size-1.5 rounded-full', yes ? 'bg-emerald-500' : 'bg-slate-300')} aria-hidden />
      {children}
    </span>
  )
}

interface DetailStateProps {
  icon: LucideIcon
  title: string
  body: string
  backTo: string
  tone?: 'error'
  action?: ReactNode
}

function DetailState({ icon: Icon, title, body, backTo, tone, action }: DetailStateProps) {
  const { t } = useTranslation('common')
  return (
    <div
      role={tone === 'error' ? 'alert' : undefined}
      className='grid place-items-center rounded-xl border border-dashed border-slate-300 bg-white px-6 py-16 text-center animate-in fade-in duration-300'
    >
      <span
        className={cn(
          'mb-4 grid size-14 place-items-center text-white hud-clip-sm',
          tone === 'error' ? 'bg-linear-to-br from-rose-500 to-amber-500' : 'bg-linear-to-br from-brand-purple to-brand-cyan'
        )}
      >
        <Icon className='size-6' aria-hidden />
      </span>
      <h1 className='font-display text-xl font-bold text-slate-900'>{title}</h1>
      <p className='mt-1 max-w-sm text-sm text-slate-500'>{body}</p>
      <div className='mt-5 flex flex-wrap items-center justify-center gap-3'>
        {action}
        <Link
          to={backTo}
          className='inline-flex h-9 items-center rounded-md px-3 text-sm font-medium text-brand-purple transition-colors hover:bg-brand-purple/10'
        >
          {t('customerPage.detail.back')}
        </Link>
      </div>
    </div>
  )
}

function DetailSkeleton() {
  const { t } = useTranslation('common')
  return (
    <div className='space-y-6' role='status' aria-label={t('customerPage.detail.loading')}>
      <div className='h-56 animate-pulse bg-slate-200/60 hud-clip' />
      <div className='grid grid-cols-2 gap-4 lg:grid-cols-4'>
        {Array.from({ length: 4 }, (_, i) => (
          <div key={i} className='h-24 animate-pulse bg-slate-200/60 hud-clip-sm' />
        ))}
      </div>
      <div className='grid gap-6 lg:grid-cols-2'>
        <div className='h-80 animate-pulse bg-slate-200/60 hud-clip' />
        <div className='h-48 animate-pulse bg-slate-200/60 hud-clip' />
      </div>
    </div>
  )
}
