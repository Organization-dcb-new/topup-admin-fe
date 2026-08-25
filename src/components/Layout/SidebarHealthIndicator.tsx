import { useHealthCheck } from '@/hooks/useHealth'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { cn } from '@/lib/utils'
import { Activity, RefreshCw } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useQueryClient } from '@tanstack/react-query'
import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import type { TFunction } from 'i18next'

function formatTimeSince(date: Date, t: TFunction): string {
  const seconds = Math.floor((Date.now() - date.getTime()) / 1000)
  if (seconds < 60) return t('health.secondsAgo', { count: seconds })
  const minutes = Math.floor(seconds / 60)
  if (minutes < 60) return t('health.minutesAgo', { count: minutes })
  const hours = Math.floor(minutes / 60)
  return t('health.hoursAgo', { hours, minutes: minutes % 60 })
}

export function SidebarHealthIndicator({ collapsed }: { collapsed: boolean }) {
  const { t } = useTranslation('common')
  const { data, isLoading, isError, dataUpdatedAt } = useHealthCheck()
  const queryClient = useQueryClient()
  const [, setTick] = useState(0)

  useEffect(() => {
    const interval = setInterval(() => setTick((v) => v + 1), 30_000)
    return () => clearInterval(interval)
  }, [])

  const handleRefresh = () => {
    queryClient.invalidateQueries({ queryKey: ['health'] })
  }

  const lastChecked = dataUpdatedAt
    ? formatTimeSince(new Date(dataUpdatedAt), t)
    : null

  const isHealthy = data?.status === 'healthy'
  const services = data?.services ?? {}
  const downServices = Object.entries(services).filter(([, status]) => status !== 'up')

  let dotColor = 'bg-muted-foreground animate-pulse'
  let statusLabel = t('health.statusChecking')

  if (!isLoading) {
    if (isError || !data) {
      dotColor = 'bg-red-500'
      statusLabel = t('health.statusUnreachable')
    } else if (isHealthy && downServices.length === 0) {
      dotColor = 'bg-emerald-500'
      statusLabel = t('health.statusOperational')
    } else {
      dotColor = 'bg-amber-500'
      statusLabel = t('health.statusDegraded')
    }
  }

  const trigger = (
    <button
      type='button'
      className={cn(
        'flex cursor-pointer items-center rounded-lg border border-border bg-background shadow-xs transition-colors duration-200 hover:bg-muted',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1',
        collapsed
          ? 'mx-auto h-10 w-10 justify-center p-0'
          : 'h-10 w-full gap-3 px-3',
      )}
      title={collapsed ? t('health.triggerTitle', { status: statusLabel }) : undefined}
      aria-label={t('health.triggerAria', { status: statusLabel })}
    >
      <span className='relative flex h-4 w-4 shrink-0 items-center justify-center'>
        <Activity className='h-4 w-4 text-muted-foreground' aria-hidden />
        <span
          className={cn('absolute -right-0.5 -top-0.5 h-2 w-2 rounded-full ring-2 ring-background', dotColor)}
        />
      </span>
      {!collapsed && (
        <span className='min-w-0 truncate text-xs font-medium text-foreground'>
          {statusLabel}
        </span>
      )}
    </button>
  )

  return (
    <Popover>
      <PopoverTrigger asChild>{trigger}</PopoverTrigger>
      <PopoverContent
        side={collapsed ? 'right' : 'top'}
        align='start'
        sideOffset={8}
        className='z-60 w-64 p-3'
      >
        <div className='space-y-3'>
          <div className='flex items-center justify-between'>
            <h4 className='text-sm font-semibold text-foreground'>
              {t('health.popoverTitle')}
            </h4>
            <Button
              type='button'
              variant='ghost'
              size='sm'
              className='h-7 gap-1.5 text-xs'
              onClick={handleRefresh}
            >
              <RefreshCw className='h-3 w-3' aria-hidden />
              {t('common.refresh')}
            </Button>
          </div>

          {isLoading && (
            <p className='text-xs text-muted-foreground'>{t('health.loadingText')}</p>
          )}

          {!isLoading && (isError || !data) && (
            <div className='rounded-md bg-destructive/10 p-2'>
              <p className='text-xs font-medium text-destructive'>
                {t('health.errorTitle')}
              </p>
              {/* Warna penuh, bukan /80: opasitas menjatuhkan kontras di bawah AA */}
              <p className='mt-0.5 text-xs text-destructive'>
                {t('health.errorDescription')}
              </p>
            </div>
          )}

          {!isLoading && data && (
            <div className='space-y-2'>
              <div className='flex flex-wrap gap-1.5'>
                {Object.entries(services).map(([name, status]) => {
                  const isUp = status === 'up'
                  return (
                    <span
                      key={name}
                      className={cn(
                        'inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs font-medium',
                        isUp
                          ? 'bg-emerald-100 text-emerald-700'
                          : 'bg-red-100 text-red-700',
                      )}
                    >
                      <span
                        className={cn(
                          'h-1.5 w-1.5 rounded-full',
                          isUp ? 'bg-emerald-500' : 'bg-red-500',
                        )}
                      />
                      {name}
                    </span>
                  )
                })}
              </div>

              {lastChecked && (
                <p className='text-xs text-muted-foreground'>
                  {t('health.lastChecked', { time: lastChecked })}
                </p>
              )}
              <p className='text-xs text-muted-foreground'>
                {t('health.autoRefresh')}
              </p>
            </div>
          )}
        </div>
      </PopoverContent>
    </Popover>
  )
}
