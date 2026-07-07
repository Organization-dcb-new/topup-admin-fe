import { useHealthCheck } from '@/hooks/useHealth'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Activity, CheckCircle2, XCircle, AlertTriangle, RefreshCw } from 'lucide-react'
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

export function ServerHealthAlert() {
  const { data, isLoading, isError, dataUpdatedAt } = useHealthCheck()
  const queryClient = useQueryClient()
  const [, setTick] = useState(0)

  // Update "last checked" display every 30s
  useEffect(() => {
    const interval = setInterval(() => setTick((t) => t + 1), 30_000)
    return () => clearInterval(interval)
  }, [])

  const handleRefresh = () => {
    queryClient.invalidateQueries({ queryKey: ['health'] })
  }

  const lastChecked = dataUpdatedAt ? formatTimeSince(new Date(dataUpdatedAt)) : null

  if (isLoading) {
    return (
      <Alert className='border-blue-200 bg-blue-50/50 dark:border-blue-900 dark:bg-blue-950/30'>
        <Activity className='h-4 w-4 animate-pulse text-blue-600 dark:text-blue-400' />
        <AlertTitle className='text-blue-800 dark:text-blue-300'>Server Status</AlertTitle>
        <AlertDescription className='text-blue-600 dark:text-blue-400'>
          Checking server health...
        </AlertDescription>
      </Alert>
    )
  }

  if (isError || !data) {
    return (
      <Alert className='border-red-200 bg-red-50/50 dark:border-red-900 dark:bg-red-950/30'>
        <XCircle className='h-4 w-4 text-red-600 dark:text-red-400' />
        <AlertTitle className='text-red-800 dark:text-red-300'>Server Unreachable</AlertTitle>
        <AlertDescription>
          <div className='flex items-center justify-between gap-2'>
            <span className='text-red-600 dark:text-red-400'>
              Cannot connect to the server. Please check if the backend is running.
            </span>
            <Button
              variant='ghost'
              size='sm'
              className='h-7 shrink-0 gap-1.5 text-xs text-red-700 hover:bg-red-100 dark:text-red-300 dark:hover:bg-red-900/40'
              onClick={handleRefresh}
            >
              <RefreshCw className='h-3 w-3' />
              Retry
            </Button>
          </div>
        </AlertDescription>
      </Alert>
    )
  }

  const isHealthy = data.status === 'healthy'
  const services = data.services ?? {}
  const downServices = Object.entries(services).filter(([, status]) => status !== 'up')

  if (isHealthy && downServices.length === 0) {
    return (
      <Alert className='border-emerald-200 bg-emerald-50/50 dark:border-emerald-900 dark:bg-emerald-950/30'>
        <CheckCircle2 className='h-4 w-4 text-emerald-600 dark:text-emerald-400' />
        <AlertTitle className='text-emerald-800 dark:text-emerald-300'>All Systems Operational</AlertTitle>
        <AlertDescription>
          <div className='flex items-center justify-between gap-2'>
            <div className='flex flex-wrap items-center gap-2 text-emerald-600 dark:text-emerald-400'>
              {Object.entries(services).map(([name, status]) => (
                <span
                  key={name}
                  className='inline-flex items-center gap-1 rounded-md bg-emerald-100 px-2 py-0.5 text-xs font-medium text-emerald-700 dark:bg-emerald-900/50 dark:text-emerald-300'
                >
                  <span className='h-1.5 w-1.5 rounded-full bg-emerald-500' />
                  {name}: {status}
                </span>
              ))}
            </div>
            <div className='flex shrink-0 items-center gap-2'>
              {lastChecked && (
                <span className='text-xs text-muted-foreground'>{lastChecked}</span>
              )}
              <Button
                variant='ghost'
                size='sm'
                className='h-7 gap-1.5 text-xs text-emerald-700 hover:bg-emerald-100 dark:text-emerald-300 dark:hover:bg-emerald-900/40'
                onClick={handleRefresh}
              >
                <RefreshCw className='h-3 w-3' />
                Refresh
              </Button>
            </div>
          </div>
        </AlertDescription>
      </Alert>
    )
  }

  // Partially degraded or unhealthy
  return (
    <Alert className='border-amber-200 bg-amber-50/50 dark:border-amber-900 dark:bg-amber-950/30'>
      <AlertTriangle className='h-4 w-4 text-amber-600 dark:text-amber-400' />
      <AlertTitle className='text-amber-800 dark:text-amber-300'>
        {isHealthy ? 'Degraded Performance' : 'Server Unhealthy'}
      </AlertTitle>
      <AlertDescription>
        <div className='flex items-center justify-between gap-2'>
          <div className='flex flex-wrap items-center gap-2'>
            {Object.entries(services).map(([name, status]) => {
              const isUp = status === 'up'
              return (
                <span
                  key={name}
                  className={`inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-xs font-medium ${
                    isUp
                      ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/50 dark:text-emerald-300'
                      : 'bg-red-100 text-red-700 dark:bg-red-900/50 dark:text-red-300'
                  }`}
                >
                  <span
                    className={`h-1.5 w-1.5 rounded-full ${isUp ? 'bg-emerald-500' : 'bg-red-500'}`}
                  />
                  {name}: {status}
                </span>
              )
            })}
          </div>
          <div className='flex shrink-0 items-center gap-2'>
            {lastChecked && (
              <span className='text-xs text-muted-foreground'>{lastChecked}</span>
            )}
            <Button
              variant='ghost'
              size='sm'
              className='h-7 gap-1.5 text-xs text-amber-700 hover:bg-amber-100 dark:text-amber-300 dark:hover:bg-amber-900/40'
              onClick={handleRefresh}
            >
              <RefreshCw className='h-3 w-3' />
              Refresh
            </Button>
          </div>
        </div>
      </AlertDescription>
    </Alert>
  )
}
