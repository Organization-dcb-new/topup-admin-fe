import { useHealthCheck } from '@/hooks/useHealth'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { cn } from '@/lib/utils'
import { Activity, RefreshCw } from 'lucide-react'
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

  let dotColor = 'bg-white animate-pulse' // loading
  let statusLabel = 'Checking...'

  if (!isLoading) {
    if (isError || !data) {
      dotColor = 'bg-[#ff4d3d]'
      statusLabel = 'Unreachable'
    } else if (isHealthy && downServices.length === 0) {
      dotColor = 'bg-[#c9f24d]'
      statusLabel = 'Operational'
    } else {
      dotColor = 'bg-[#ffd84d]'
      statusLabel = 'Degraded'
    }
  }

  const trigger = (
    <button
      type='button'
      className={cn(
        'nb-frame nb-frame-thin nb-sd-sm nb-press-sm flex cursor-pointer items-center bg-white',
        collapsed ? 'mx-auto h-10 w-10 justify-center p-0' : 'h-10 w-full gap-2.5 px-2.5',
      )}
      title={collapsed ? `Server: ${statusLabel}` : undefined}
      aria-label={`Server status: ${statusLabel}`}
    >
      <span className='relative flex h-4.5 w-4.5 shrink-0 items-center justify-center'>
        <Activity className='h-4.5 w-4.5' strokeWidth={2.5} aria-hidden />
        <span
          className={cn(
            'absolute -right-1 -top-1 h-2.5 w-2.5 border-2 border-[#111]',
            dotColor,
          )}
        />
      </span>
      {!collapsed && (
        <span className='min-w-0 truncate text-[11px] font-black uppercase tracking-[0.14em]'>
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
        sideOffset={10}
        className='nb nb-frame nb-frame-thick nb-sd z-60 w-64 bg-white p-3'
      >
        <div className='space-y-3'>
          <div className='flex items-center justify-between gap-2 border-b-4 border-[#111] pb-2'>
            <h4 className='text-[11px] font-black uppercase tracking-[0.16em]'>
              Server Health
            </h4>
            <button
              type='button'
              className='nb-frame nb-frame-thin nb-press-sm flex h-7 cursor-pointer items-center gap-1.5 bg-[#6fe3f5] px-2 text-[10px] font-black uppercase tracking-[0.12em]'
              onClick={handleRefresh}
            >
              <RefreshCw className='h-3 w-3' strokeWidth={3} aria-hidden />
              Refresh
            </button>
          </div>

          {isLoading && (
            <p className='text-[11px] font-bold uppercase tracking-wide text-[#111]/60'>
              Checking server health...
            </p>
          )}

          {!isLoading && (isError || !data) && (
            <div className='nb-frame nb-frame-thin bg-[#ff4d3d] p-2'>
              <p className='text-[11px] font-black uppercase tracking-wide'>
                Cannot connect to server
              </p>
              <p className='mt-0.5 text-[11px] font-bold'>
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
                        'nb-frame nb-frame-thin inline-flex items-center gap-1.5 px-1.5 py-0.5 text-[10px] font-black uppercase tracking-wide',
                        isUp ? 'bg-[#c9f24d]' : 'bg-[#ff4d3d]',
                      )}
                    >
                      <span
                        className={cn(
                          'h-2 w-2 border-2 border-[#111]',
                          isUp ? 'bg-white' : 'bg-[#111]',
                        )}
                      />
                      {name}
                    </span>
                  )
                })}
              </div>

              {lastChecked && (
                <p className='text-[10px] font-bold uppercase tracking-wide text-[#111]/60'>
                  Last checked: {lastChecked}
                </p>
              )}
              <p className='text-[10px] font-bold uppercase tracking-wide text-[#111]/60'>
                Auto-refresh every 5 minutes
              </p>
            </div>
          )}
        </div>
      </PopoverContent>
    </Popover>
  )
}
