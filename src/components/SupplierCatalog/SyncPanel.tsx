import { useEffect, useRef } from 'react'
import { useTranslation } from 'react-i18next'
import { useQueryClient } from '@tanstack/react-query'
import { CloudDownload, Loader2 } from 'lucide-react'

import { Can } from '@/components/Auth/Can'
import { SyncStatusChip } from '@/components/SupplierCatalog/catalog-parts'
import { Segmented } from '@/components/ui/segmented'
import { PERM } from '@/constants/permissions'
import { supplierBrandsKey, supplierProductsKey, useProviderSync, useStartProviderSync } from '@/hooks/useSupplierCatalog'
import { formatBackendDateTime } from '@/lib/backend-datetime'
import type { Provider } from '@/types/provider'

interface SyncPanelProps {
  providers: Provider[]
  providerId: string
  onProviderChange: (id: string) => void
}

/** Which supplier's catalog is shown, how fresh it is, and the button that pulls it again. */
export function SyncPanel({ providers, providerId, onProviderChange }: SyncPanelProps) {
  const { t, i18n } = useTranslation('common')
  const queryClient = useQueryClient()
  const { data: run, isLoading } = useProviderSync(providerId)
  const start = useStartProviderSync(providerId)
  const running = run?.status === 'RUNNING'
  const provider = providers.find((p) => p.id === providerId)
  const number = (n: number) => n.toLocaleString(i18n.resolvedLanguage)

  // A finished full sync leaves the lists below stale, so they are fetched again once.
  const previousStatus = useRef<string | undefined>(undefined)
  useEffect(() => {
    const status = run?.status
    if (previousStatus.current === 'RUNNING' && status && status !== 'RUNNING') {
      void queryClient.invalidateQueries({ queryKey: supplierBrandsKey })
      void queryClient.invalidateQueries({ queryKey: supplierProductsKey })
    }
    previousStatus.current = status
  }, [run?.status, queryClient])

  return (
    <section aria-label={t('supplierCatalogPage.sync.label')} className='bg-slate-200/80 p-px hud-clip'>
      <div className='flex flex-col gap-4 bg-white p-4 hud-clip sm:p-5 lg:flex-row lg:items-center'>
        <div className='min-w-0 flex-1 space-y-3'>
          {providers.length > 1 ? (
            <Segmented
              size='md'
              value={providerId}
              onChange={onProviderChange}
              label={t('supplierCatalogPage.sync.provider')}
              options={providers.map((p) => ({ value: p.id, label: p.name }))}
            />
          ) : (
            <p className='flex flex-wrap items-baseline gap-2'>
              <span className='font-display text-lg font-bold text-slate-900'>{provider?.name ?? '—'}</span>
              {provider && <span className='font-mono text-xs text-slate-500'>{provider.code}</span>}
            </p>
          )}

          {isLoading ? (
            <div className='h-5 w-72 max-w-full animate-pulse rounded bg-slate-100' aria-hidden />
          ) : !run ? (
            <p className='text-sm text-slate-500'>{t('supplierCatalogPage.sync.never')}</p>
          ) : (
            <div className='space-y-1.5'>
              <div className='flex flex-wrap items-center gap-x-3 gap-y-1.5 text-sm text-slate-600'>
                <SyncStatusChip status={run.status} />
                <span className='tabular-nums'>
                  {t('supplierCatalogPage.sync.counts', {
                    brands: number(run.brands_seen),
                    products: number(run.products_seen),
                  })}
                </span>
                {run.brands_failed > 0 && (
                  <span className='tabular-nums text-amber-700'>
                    {t('supplierCatalogPage.sync.failed', { count: run.brands_failed })}
                  </span>
                )}
                <span className='text-xs text-slate-400'>
                  {running
                    ? t('supplierCatalogPage.sync.runningSince', { time: formatBackendDateTime(run.started_at, 'HH:mm') })
                    : t('supplierCatalogPage.sync.finishedAt', {
                        time: formatBackendDateTime(run.finished_at ?? run.started_at, 'dd MMM yyyy, HH:mm'),
                      })}
                </span>
              </div>
              {run.error && (
                <p className='line-clamp-2 text-xs text-rose-600' title={run.error}>
                  {run.error}
                </p>
              )}
              {running && <p className='text-xs text-slate-500'>{t('supplierCatalogPage.sync.runningHint')}</p>}
            </div>
          )}
        </div>

        <Can permission={PERM.gameSync}>
          <button
            type='button'
            onClick={() => start.mutate()}
            disabled={!providerId || running || start.isPending}
            className='inline-flex h-11 shrink-0 items-center justify-center gap-2 self-start bg-slate-900 px-5 font-display text-xs font-bold uppercase tracking-[0.2em] text-white hud-clip-sm transition-[background-color,opacity] duration-300 hover:bg-brand-purple focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-white/90 disabled:opacity-50 lg:self-center'
          >
            {running || start.isPending ? (
              <Loader2 className='size-4 animate-spin' aria-hidden />
            ) : (
              <CloudDownload className='size-4' aria-hidden />
            )}
            {running ? t('supplierCatalogPage.sync.running') : t('supplierCatalogPage.sync.start')}
          </button>
        </Can>
      </div>
    </section>
  )
}
