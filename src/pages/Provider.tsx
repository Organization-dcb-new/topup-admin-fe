import { useState, type ReactNode } from 'react'
import { useTranslation } from 'react-i18next'
import toast from 'react-hot-toast'
import { Check, Copy, Globe, KeyRound, Pencil, Plus, RefreshCw, Server, Timer, Trash2, Wallet, type LucideIcon } from 'lucide-react'

import { AuthAlert } from '@/components/Auth/AuthPanel'
import { Can } from '@/components/Auth/Can'
import { DangerDialog } from '@/components/Auth/DangerDialog'
import { hudEyebrowClass, hudPrimaryButtonClass } from '@/components/Auth/hud-styles'
import { DashboardLayout } from '@/components/Layout/dashboard-layout'
import { ProviderCredentials } from '@/components/Provider/ProviderCredentials'
import { ProviderFormDialog } from '@/components/Provider/ProviderFormDialog'
import { Switch } from '@/components/ui/switch'
import { PERM } from '@/constants/permissions'
import { usePermissions } from '@/hooks/usePermissions'
import {
  toProviderUpdate,
  useDeleteProvider,
  useGetProvider,
  useProviderBalance,
  useUpdateProvider,
} from '@/hooks/useProvider'
import { formatBackendDateTime } from '@/lib/backend-datetime'
import { copyTextToClipboard } from '@/lib/copy-to-clipboard'
import { formatCurrency } from '@/lib/format'
import { cn } from '@/lib/utils'
import type { Provider, ProviderStatus } from '@/types/provider'
import { useRetained } from '@/hooks/useRetained'

const STATUS_STYLE: Record<ProviderStatus, { chip: string; dot: string; bar: string }> = {
  ACTIVE: { chip: 'bg-emerald-50 text-emerald-700', dot: 'bg-emerald-500', bar: 'bg-linear-to-r from-brand-purple to-brand-cyan' },
  INACTIVE: { chip: 'bg-slate-100 text-slate-500', dot: 'bg-slate-400', bar: 'bg-slate-200' },
  ERROR: { chip: 'bg-rose-50 text-rose-700', dot: 'bg-rose-500 animate-hud-signal', bar: 'bg-linear-to-r from-rose-500 to-amber-400' },
}

const iconButtonClass =
  'grid size-8 shrink-0 place-items-center text-slate-400 hud-clip-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset'

export default function ProviderPages() {
  const { t } = useTranslation('common')
  const { data, isLoading, isError, isFetching, refetch } = useGetProvider()
  const deleteProvider = useDeleteProvider()
  const providers = data?.data ?? []
  const [formTarget, setFormTarget] = useState<Provider | 'new' | null>(null)
  const [toDelete, setToDelete] = useState<Provider | null>(null)
  // The confirm dialog keeps naming its target while it animates closed.
  const deleting = useRetained(toDelete)
  const activeCount = providers.filter((p) => p.status === 'ACTIVE').length
  const nextPriority = providers.reduce((max, p) => Math.max(max, p.priority), 0) + 1

  const openCreate = () => setFormTarget('new')

  return (
    <DashboardLayout>
      <div className='mx-auto max-w-6xl space-y-6'>
        <header className='flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between'>
          <div className='space-y-1'>
            <p className={hudEyebrowClass}>{t('providerPage.eyebrow')}</p>
            <h1 className='font-display text-3xl font-bold tracking-tight text-slate-900'>{t('providerPage.title')}</h1>
            <p className='max-w-2xl text-sm leading-relaxed text-slate-500'>{t('providerPage.subtitle')}</p>
          </div>
          <div className='flex shrink-0 items-center gap-3'>
            {data && (
              <span className='font-display text-xs font-semibold uppercase tracking-[0.15em] text-slate-400'>
                {t('providerPage.total', { active: activeCount, count: providers.length })}
              </span>
            )}
            <Can permission={PERM.providerCreate}>
              <button type='button' onClick={openCreate} className={hudPrimaryButtonClass}>
                <span className='pointer-events-none absolute inset-y-0 right-0 w-1.5 bg-brand-cyan' aria-hidden />
                <Plus className='size-4' aria-hidden />
                {t('providerPage.addBtn')}
              </button>
            </Can>
          </div>
        </header>

        {isError && (
          <div className='space-y-3'>
            <AuthAlert>{t('providerPage.loadError')}</AuthAlert>
            <button
              type='button'
              onClick={() => void refetch()}
              className='inline-flex h-9 items-center gap-2 rounded-md border border-slate-200 bg-white px-3 text-sm font-medium text-slate-600 transition-colors hover:text-brand-purple'
            >
              <RefreshCw className='size-4' aria-hidden />
              {t('providerPage.retry')}
            </button>
          </div>
        )}

        {!isError && !isLoading && providers.length === 0 ? (
          <div className='grid place-items-center rounded-xl border border-dashed border-slate-300 bg-white px-6 py-16 text-center animate-in fade-in duration-500'>
            <span className='mb-4 grid size-14 place-items-center bg-linear-to-br from-brand-purple to-brand-cyan text-white hud-clip-sm'>
              <Server className='size-6' aria-hidden />
            </span>
            <h2 className='font-display text-xl font-bold text-slate-900'>{t('providerPage.emptyTitle')}</h2>
            <p className='mt-1 max-w-sm text-sm text-slate-500'>{t('providerPage.emptyBody')}</p>
          </div>
        ) : (
          <ul className='grid gap-5 lg:grid-cols-2' aria-busy={isFetching}>
            {isLoading &&
              Array.from({ length: 4 }, (_, i) => <li key={i} className='h-64 animate-pulse bg-slate-200/60 hud-clip' aria-hidden />)}
            {providers.map((provider, index) => (
              <ProviderCard
                key={provider.id}
                provider={provider}
                order={index}
                onEdit={() => setFormTarget(provider)}
                onDelete={() => setToDelete(provider)}
              />
            ))}
          </ul>
        )}
      </div>

      <ProviderFormDialog
        open={formTarget !== null}
        onOpenChange={(open) => !open && setFormTarget(null)}
        provider={formTarget === 'new' ? undefined : (formTarget ?? undefined)}
        nextPriority={nextPriority}
      />
      <DangerDialog
        open={!!toDelete}
        onOpenChange={(open) => !open && setToDelete(null)}
        eyebrow={t('providerPage.deleteConfirm.eyebrow')}
        title={t('providerPage.deleteConfirm.title', { name: deleting?.name ?? '' })}
        description={t('providerPage.deleteConfirm.description')}
        confirmLabel={t('providerPage.deleteConfirm.confirm')}
        cancelLabel={t('providerPage.deleteConfirm.cancel')}
        pending={deleteProvider.isPending}
        onConfirm={() => {
          if (!toDelete) return
          deleteProvider.mutate(toDelete.id, { onSuccess: () => setToDelete(null) })
        }}
      />
    </DashboardLayout>
  )
}

interface ProviderCardProps {
  provider: Provider
  order: number
  onEdit: () => void
  onDelete: () => void
}

function ProviderCard({ provider, order, onEdit, onDelete }: ProviderCardProps) {
  const { t } = useTranslation('common')
  const { can } = usePermissions()
  const update = useUpdateProvider(undefined, 'providerPage.toasts.statusSaved')
  const style = STATUS_STYLE[provider.status] ?? STATUS_STYLE.INACTIVE
  const timeout = typeof provider.config?.timeout === 'number' ? provider.config.timeout : null
  const extraConfig = Object.keys(provider.config ?? {}).filter((k) => k !== 'timeout').length

  return (
    <li className='min-w-0 animate-in fade-in slide-in-from-bottom-2 duration-500 ease-hud fill-mode-both' style={{ animationDelay: `${order * 50}ms` }}>
      <div
        className={cn(
          'h-full p-px transition-colors duration-300 hud-clip',
          provider.status === 'ERROR' ? 'bg-rose-300/80' : 'bg-slate-200/80 hover:bg-brand-purple/40'
        )}
      >
        <article className='flex h-full flex-col bg-white hud-clip'>
          <div className={cn('h-1 transition-colors duration-300', style.bar)} aria-hidden />
          <div className='flex flex-1 flex-col gap-4 p-5'>
            <div className='flex items-start gap-4'>
              <span
                className='grid size-12 shrink-0 place-items-center bg-slate-900 text-white hud-clip-sm'
                title={t('providerPage.priorityTitle')}
              >
                <span className='text-center leading-none'>
                  <span className='block font-display text-[8px] font-semibold uppercase tracking-[0.15em] text-white/60'>
                    {t('providerPage.priorityShort')}
                  </span>
                  <span className='font-display text-lg font-bold'>{provider.priority}</span>
                </span>
              </span>
              <div className='min-w-0 flex-1 space-y-1.5'>
                <h2 className='truncate font-display text-lg font-bold text-slate-900'>{provider.name}</h2>
                <div className='flex flex-wrap items-center gap-2'>
                  <span className='font-mono text-xs text-slate-500'>{provider.code}</span>
                  <span
                    className={cn(
                      'inline-flex items-center gap-1.5 px-2 py-0.5 font-display text-[10px] font-semibold uppercase tracking-[0.15em] hud-clip-sm',
                      style.chip
                    )}
                  >
                    <span className={cn('size-1.5 rounded-full', style.dot)} aria-hidden />
                    {t(`providerPage.status.${provider.status}`)}
                  </span>
                </div>
              </div>
              {can(PERM.providerUpdate) && (
                <Switch
                  checked={provider.status === 'ACTIVE'}
                  disabled={update.isPending}
                  onCheckedChange={(checked) =>
                    update.mutate({ id: provider.id, payload: { ...toProviderUpdate(provider), status: checked ? 'ACTIVE' : 'INACTIVE' } })
                  }
                  aria-label={t('providerPage.toggleActive', { name: provider.name })}
                  title={t('providerPage.toggleActive', { name: provider.name })}
                  className='data-[state=checked]:bg-emerald-500'
                />
              )}
            </div>

            <dl className='divide-y divide-slate-100 rounded-lg border border-slate-200 text-sm'>
              {/* Same permission the backend asks for on GET /providers/:id/balance. */}
              {can(PERM.integrationViewBalance) && (
                <DetailRow icon={Wallet} label={t('providerPage.balance.label')}>
                  {provider.balance_supported ? (
                    <ProviderBalance provider={provider} />
                  ) : (
                    <span className='min-w-0 flex-1 truncate text-xs text-slate-400'>{t('providerPage.balance.unsupported')}</span>
                  )}
                </DetailRow>
              )}
              <DetailRow icon={Globe} label={t('providerPage.apiUrl')}>
                <span className='min-w-0 flex-1 truncate font-mono text-xs text-slate-700' title={provider.api_url}>
                  {provider.api_url || '—'}
                </span>
                {provider.api_url && <CopyButton value={provider.api_url} label={t('providerPage.copyUrl')} />}
              </DetailRow>
              <DetailRow icon={KeyRound} label={t('providerPage.credentials')}>
                <ProviderCredentials credentials={provider.credentials} />
              </DetailRow>
              <DetailRow icon={Timer} label={t('providerPage.config')}>
                <span className='min-w-0 flex-1 truncate text-xs text-slate-700'>
                  {timeout !== null ? t('providerPage.timeout', { seconds: timeout }) : t('providerPage.noTimeout')}
                  {extraConfig > 0 && <span className='text-slate-400'> · {t('providerPage.moreConfig', { count: extraConfig })}</span>}
                </span>
              </DetailRow>
            </dl>

            <div className='mt-auto flex items-center justify-between gap-2 border-t border-slate-100 pt-3'>
              <span className='min-w-0 truncate text-xs text-slate-500'>
                {t('providerPage.updatedAt', { date: formatBackendDateTime(provider.updated_at, 'dd MMM yyyy, HH:mm') })}
              </span>
              <div className='flex shrink-0 items-center gap-0.5'>
                <Can permission={PERM.providerUpdate}>
                  <button
                    type='button'
                    onClick={onEdit}
                    aria-label={t('providerPage.editBtn', { name: provider.name })}
                    title={t('providerPage.editBtn', { name: provider.name })}
                    className={`${iconButtonClass} hover:bg-brand-purple/10 hover:text-brand-purple focus-visible:ring-brand-purple/40`}
                  >
                    <Pencil className='size-4' aria-hidden />
                  </button>
                </Can>
                <Can permission={PERM.providerDelete}>
                  <button
                    type='button'
                    onClick={onDelete}
                    aria-label={t('providerPage.deleteBtn', { name: provider.name })}
                    title={t('providerPage.deleteBtn', { name: provider.name })}
                    className={`${iconButtonClass} hover:bg-rose-50 hover:text-rose-600 focus-visible:ring-rose-500/30`}
                  >
                    <Trash2 className='size-4' aria-hidden />
                  </button>
                </Can>
              </div>
            </div>
          </div>
        </article>
      </div>
    </li>
  )
}

function DetailRow({ icon: Icon, label, children }: { icon: LucideIcon; label: string; children: ReactNode }) {
  return (
    <div className='flex items-center gap-3 px-3 py-2'>
      <dt className='flex w-24 shrink-0 items-center gap-1.5 font-display text-[10px] font-semibold uppercase tracking-[0.15em] text-slate-400'>
        <Icon className='size-3.5' aria-hidden />
        {label}
      </dt>
      <dd className='flex min-w-0 flex-1 items-center gap-1'>{children}</dd>
    </div>
  )
}

/** Our deposit at this supplier, asked live from the supplier when the card loads. */
function ProviderBalance({ provider }: { provider: Provider }) {
  const { t } = useTranslation('common')
  const balance = useProviderBalance(provider.id, true)
  const refreshLabel = t('providerPage.balance.refresh', { name: provider.name })

  return (
    <>
      <span className='min-w-0 flex-1 truncate'>
        {balance.isLoading ? (
          <span className='inline-block h-4 w-28 animate-pulse rounded bg-slate-100 align-middle' aria-hidden />
        ) : balance.isError ? (
          <span className='text-xs font-medium text-rose-600'>{t('providerPage.balance.error')}</span>
        ) : (
          <>
            <span className='font-display text-sm font-bold tabular-nums text-slate-900'>{formatCurrency(balance.data?.balance)}</span>
            {balance.data?.checked_at && (
              <span className='ml-2 text-xs text-slate-400'>
                {t('providerPage.balance.checkedAt', { time: formatBackendDateTime(balance.data.checked_at, 'HH:mm') })}
              </span>
            )}
          </>
        )}
      </span>
      <button
        type='button'
        onClick={() => void balance.refetch()}
        disabled={balance.isFetching}
        aria-label={refreshLabel}
        title={refreshLabel}
        className='grid size-7 shrink-0 place-items-center rounded text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700 disabled:opacity-60'
      >
        <RefreshCw className={cn('size-3.5', balance.isFetching && 'animate-spin')} aria-hidden />
      </button>
    </>
  )
}

function CopyButton({ value, label }: { value: string; label: string }) {
  const { t } = useTranslation('common')
  const [copied, setCopied] = useState(false)
  const copy = async () => {
    try {
      await copyTextToClipboard(value)
    } catch {
      toast.error(t('providerPage.copyFailed'))
      return
    }
    setCopied(true)
    toast.success(t('providerPage.copied'))
    setTimeout(() => setCopied(false), 2000)
  }
  return (
    <button
      type='button'
      onClick={copy}
      aria-label={label}
      title={label}
      className='grid size-7 shrink-0 place-items-center rounded text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700'
    >
      {copied ? <Check className='size-3.5 text-emerald-600' aria-hidden /> : <Copy className='size-3.5' aria-hidden />}
    </button>
  )
}
