import { useHealthCheck } from '@/hooks/useHealth'
import { cn } from '@/lib/utils'
import { Activity, CheckCircle2, XCircle, AlertTriangle, RefreshCw } from 'lucide-react'
import { useQueryClient } from '@tanstack/react-query'
import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import type { TFunction } from 'i18next'

function formatTimeSince(date: Date, t: TFunction): string {
  const seconds = Math.max(0, Math.floor((Date.now() - date.getTime()) / 1000))
  if (seconds < 60) return t('dashboard.health.agoSeconds', { count: seconds })
  const minutes = Math.floor(seconds / 60)
  if (minutes < 60) return t('dashboard.health.agoMinutes', { count: minutes })
  const hours = Math.floor(minutes / 60)
  return t('dashboard.health.agoHours', { hours, minutes: minutes % 60 })
}

/**
 * Rangka banner status. Latar berwarna penuh sengaja disimpan untuk keadaan
 * yang butuh perhatian (server mati / degradasi); kondisi normal tetap putih
 * dengan kotak ikon berwarna supaya tidak berteriak setiap kali halaman dibuka.
 */
function HealthBanner({
  surface,
  chip,
  icon,
  title,
  description,
  children,
}: {
  surface: string
  chip: string
  icon: React.ReactNode
  title: string
  description?: string
  children?: React.ReactNode
}) {
  return (
    <div
      role='alert'
      className={cn(
        'nb-frame nb-frame-thick nb-sd flex flex-col gap-3 p-3 text-[#111] sm:flex-row sm:items-center sm:justify-between',
        surface,
      )}
    >
      <div className='flex items-center gap-3'>
        <span
          className={cn(
            'nb-frame nb-frame-thin nb-sd-sm flex h-9 w-9 shrink-0 items-center justify-center',
            chip,
          )}
        >
          {icon}
        </span>
        <div className='min-w-0'>
          <p className='text-sm font-black uppercase tracking-tight'>{title}</p>
          {description && <p className='mt-0.5 text-xs font-bold text-[#111]/70'>{description}</p>}
        </div>
      </div>
      {children && (
        <div className='flex flex-wrap items-center gap-2 sm:shrink-0 sm:justify-end'>
          {children}
        </div>
      )}
    </div>
  )
}

function ServiceTag({ name, status }: { name: string; status: string }) {
  const isUp = status === 'up'
  return (
    <span className='nb-frame nb-frame-thin inline-flex items-center gap-1.5 bg-white px-2 py-0.5 text-[11px] font-black uppercase tracking-tight'>
      <span
        className={cn('h-2.5 w-2.5 shrink-0 border-2 border-[#111]', isUp ? 'bg-[#c9f24d]' : 'bg-[#ff4d3d]')}
        aria-hidden
      />
      {name}: {status}
    </span>
  )
}

function RefreshButton({ label, onClick }: { label: string; onClick: () => void }) {
  return (
    <button
      type='button'
      onClick={onClick}
      className='nb-frame nb-frame-thin nb-sd-sm nb-press-sm flex h-8 shrink-0 cursor-pointer items-center gap-1.5 bg-white px-2 text-[11px] font-black uppercase tracking-tight'
    >
      <RefreshCw className='h-3.5 w-3.5' strokeWidth={3} aria-hidden />
      {label}
    </button>
  )
}

export function ServerHealthAlert() {
  const { t } = useTranslation('common')
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

  const lastChecked = dataUpdatedAt ? formatTimeSince(new Date(dataUpdatedAt), t) : null

  if (isLoading) {
    return (
      <HealthBanner
        surface='bg-white'
        chip='bg-[#6fe3f5]'
        icon={<Activity className='h-5 w-5 animate-pulse' strokeWidth={3} aria-hidden />}
        title={t('dashboard.health.title')}
        description={t('dashboard.health.checking')}
      />
    )
  }

  if (isError || !data) {
    return (
      <HealthBanner
        surface='bg-[#ff4d3d]'
        chip='bg-white'
        icon={<XCircle className='h-5 w-5' strokeWidth={3} aria-hidden />}
        title={t('dashboard.health.unreachable')}
        description={t('dashboard.health.unreachableHint')}
      >
        <RefreshButton label={t('dashboard.health.retry')} onClick={handleRefresh} />
      </HealthBanner>
    )
  }

  const isHealthy = data.status === 'healthy'
  const services = data.services ?? {}
  const downServices = Object.entries(services).filter(([, status]) => status !== 'up')

  if (isHealthy && downServices.length === 0) {
    return (
      <HealthBanner
        surface='bg-white'
        chip='bg-[#c9f24d]'
        icon={<CheckCircle2 className='h-5 w-5' strokeWidth={3} aria-hidden />}
        title={t('dashboard.health.operational')}
      >
        {Object.entries(services).map(([name, status]) => (
          <ServiceTag key={name} name={name} status={status} />
        ))}
        {lastChecked && (
          <span className='text-[11px] font-bold uppercase tracking-tight text-[#111]/55'>
            {lastChecked}
          </span>
        )}
        <RefreshButton label={t('dashboard.health.refresh')} onClick={handleRefresh} />
      </HealthBanner>
    )
  }

  // Partially degraded or unhealthy
  return (
    <HealthBanner
      surface='bg-[#ff9d3d]'
      chip='bg-white'
      icon={<AlertTriangle className='h-5 w-5' strokeWidth={3} aria-hidden />}
      title={t(isHealthy ? 'dashboard.health.degraded' : 'dashboard.health.unhealthy')}
    >
      {Object.entries(services).map(([name, status]) => (
        <ServiceTag key={name} name={name} status={status} />
      ))}
      {lastChecked && (
        <span className='text-[11px] font-bold uppercase tracking-tight text-[#111]/70'>
          {lastChecked}
        </span>
      )}
      <RefreshButton label={t('dashboard.health.refresh')} onClick={handleRefresh} />
    </HealthBanner>
  )
}
