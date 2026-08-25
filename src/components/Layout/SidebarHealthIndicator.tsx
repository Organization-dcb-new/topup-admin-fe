import { useHealthCheck } from '@/hooks/useHealth'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { cn } from '@/lib/utils'
import { Activity, RefreshCw } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useQueryClient } from '@tanstack/react-query'
import { useState, useEffect } from 'react'

function formatTimeSince(date: Date): string {
  const seconds = Math.floor((Date.now() - date.getTime()) / 1000)
  if (seconds < 60) return `${seconds}s ago`
  const minutes = Math.floor(seconds / 60)
  if (minutes < 60) return `${minutes}m ago`
  const hours = Math.floor(minutes / 60)
  return `${hours}h ${minutes % 60}m ago`
}

export function SidebarHealthIndicator({ collapsed }: { collapsed: boolean }) {
  const { data, isLoading, isError, dataUpdatedAt } = useHealthCheck()
  const queryClient = useQueryClient()
  const [, setTick] = useState(0)

  useEffect(() => {
    const interval = setInterval(() => setTick((t) => t + 1), 30_000)
    return () => clearInterval(interval)
  }, [])

  const handleRefresh = () => {
    queryClient.invalidateQueries({ queryKey: ['health'] })
  }

  const lastChecked = dataUpdatedAt ? formatTimeSince(new Date(dataUpdatedAt)) : null

  const isHealthy = data?.status === 'healthy'
  const services = data?.services ?? {}
  const downServices = Object.entries(services).filter(([, status]) => status !== 'up')

  let dotColor = 'bg-gray-400 animate-pulse' // loading
  let statusLabel = 'Checking...'

  if (!isLoading) {
    if (isError || !data) {
      dotColor = 'bg-red-500'
      statusLabel = 'Unreachable'
    } else if (isHealthy && downServices.length === 0) {
      dotColor = 'bg-emerald-500'
      statusLabel = 'Operational'
    } else {
      dotColor = 'bg-amber-500'
      statusLabel = 'Degraded'
    }
  }

  const trigger = (
    <button
      type='button'
      className={cn(
        'flex cursor-pointer items-center rounded-lg border border-white/10 bg-white/5 transition-colors duration-200 hover:bg-white/10',
        collapsed
          ? 'mx-auto h-10 w-10 justify-center p-0'
          : 'h-10 w-full gap-3 px-3',
      )}
      title={collapsed ? `Server: ${statusLabel}` : undefined}
      aria-label={`Server status: ${statusLabel}`}
    >
      <span className='relative flex h-4 w-4 shrink-0 items-center justify-center'>
        <Activity className='h-4 w-4 text-zinc-400' aria-hidden />
        <span
          className={cn('absolute -right-0.5 -top-0.5 h-2 w-2 rounded-full ring-2 ring-zinc-950', dotColor)}
        />
      </span>
      {!collapsed && (
        <span className='min-w-0 truncate text-xs font-medium text-zinc-300'>
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
        className='z-[60] w-64 p-3'
      >
        <div className='space-y-3'>
          <div className='flex items-center justify-between'>
            <h4 className='text-sm font-semibold text-foreground'>Server Health</h4>
            <Button
              type='button'
              variant='ghost'
              size='sm'
              className='h-7 gap-1.5 text-xs'
              onClick={handleRefresh}
            >
              <RefreshCw className='h-3 w-3' />
              Refresh
            </Button>
          </div>

          {isLoading && (
            <p className='text-xs text-muted-foreground'>Checking server health...</p>
          )}

          {!isLoading && (isError || !data) && (
            <div className='rounded-md bg-red-50 p-2 dark:bg-red-950/30'>
              <p className='text-xs font-medium text-red-700 dark:text-red-300'>
                Cannot connect to server
              </p>
              <p className='mt-0.5 text-xs text-red-600 dark:text-red-400'>
                Backend may be down or unreachable.
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
                          ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/50 dark:text-emerald-300'
                          : 'bg-red-100 text-red-700 dark:bg-red-900/50 dark:text-red-300',
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
                  Last checked: {lastChecked}
                </p>
              )}
              <p className='text-xs text-muted-foreground'>
                Auto-refresh every 5 minutes
              </p>
            </div>
          )}
        </div>
      </PopoverContent>
    </Popover>
  )
}
