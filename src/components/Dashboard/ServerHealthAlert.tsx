import { useQueryClient } from '@tanstack/react-query'
import { AlertTriangle, RefreshCw, ServerCrash } from 'lucide-react'
import { useTranslation } from 'react-i18next'

import { useServerStatus } from '@/hooks/useHealth'
import { cn } from '@/lib/utils'

/**
 * Only speaks up when something is wrong; the navbar pill already shows the healthy state.
 */
export function ServerHealthAlert() {
  const { t } = useTranslation('common')
  const queryClient = useQueryClient()
  const { status, services, isFetching } = useServerStatus()

  if (status !== 'degraded' && status !== 'unreachable') return null

  const unreachable = status === 'unreachable'
  const down = Object.entries(services).filter(([, state]) => state !== 'up')
  const Icon = unreachable ? ServerCrash : AlertTriangle

  return (
    <div
      role='alert'
      className={cn(
        'p-px hud-clip animate-in fade-in slide-in-from-top-1 duration-500 ease-hud',
        unreachable ? 'bg-rose-300/80' : 'bg-amber-300/80'
      )}
    >
      <div
        className={cn(
          'flex flex-col gap-3 px-5 py-3.5 hud-clip sm:flex-row sm:items-center',
          unreachable ? 'bg-rose-50' : 'bg-amber-50'
        )}
      >
        <span
          className={cn(
            'grid size-9 shrink-0 place-items-center text-white hud-clip-sm',
            unreachable ? 'bg-rose-500' : 'bg-amber-500'
          )}
          aria-hidden
        >
          <Icon className='size-4' />
        </span>
        <div className='min-w-0 flex-1'>
          <p className={cn('text-sm font-semibold', unreachable ? 'text-rose-800' : 'text-amber-800')}>
            {unreachable ? t('sidebar.health.unreachableTitle') : t('dashboard.health.degradedTitle')}
          </p>
          <p className={cn('text-xs', unreachable ? 'text-rose-700' : 'text-amber-700')}>
            {unreachable
              ? t('sidebar.health.unreachableBody')
              : t('dashboard.health.degradedBody', { services: down.map(([name]) => name).join(', ') })}
          </p>
        </div>
        <button
          type='button'
          onClick={() => void queryClient.invalidateQueries({ queryKey: ['health'] })}
          disabled={isFetching}
          className='inline-flex h-8 shrink-0 items-center gap-1.5 self-start bg-white px-3 text-xs font-medium text-slate-700 ring-1 ring-inset ring-slate-200 hud-clip-sm transition-colors hover:text-brand-purple disabled:opacity-60 sm:self-auto'
        >
          <RefreshCw className={cn('size-3.5', isFetching && 'animate-spin')} aria-hidden />
          {t('sidebar.health.refresh')}
        </button>
      </div>
    </div>
  )
}
