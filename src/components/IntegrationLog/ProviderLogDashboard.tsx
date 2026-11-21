import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { BarChart3, Clock, Layers, Percent, ScrollText, Timer, TriangleAlert, type LucideIcon } from 'lucide-react'
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'

import { DashboardPanel } from '@/components/Dashboard/DashboardPanel'
import { Segmented } from '@/components/ui/segmented'
import { formatBackendDateTime } from '@/lib/backend-datetime'
import { formatNumber } from '@/lib/format'
import { cn } from '@/lib/utils'
import type { ProviderDailyCount, ProviderOrderLogDashboard } from '@/types/integration-log'

/**
 * Status colours of the chart. Checked with the dataviz palette validator on white: deutan ΔE 17, so the pair
 * stays apart for red-green colour blindness. Emerald is under 3:1 on white, which is why the chart always
 * carries a labelled legend and a table view.
 */
const SUCCESS_COLOR = '#10b981' // emerald-500
const FAILED_COLOR = '#be123c' // rose-700

/** Failure reasons the backend names itself; any other is the supplier's own code or "HTTP <status>". */
const NAMED_FAILURES = ['NO_RESPONSE', 'CALLBACK_NOT_APPLIED', 'OTHER']

interface Props {
  data?: ProviderOrderLogDashboard
  loading: boolean
  /** A new filter is loading while the previous sums stay on screen. */
  stale: boolean
}

/** The supplier order log page's cards and charts, for the logs the page's filters match. */
export function ProviderLogDashboard({ data, loading, stale }: Props) {
  const { t, i18n } = useTranslation('common')
  const locale = i18n.language.startsWith('id') ? 'id-ID' : 'en-US'
  const ms = (value: number | null | undefined) => (value == null ? '—' : t('integrationLog.ms', { ms: formatNumber(value) }))
  const rate = data?.success_rate ?? null
  const responseTime = data?.response_time_ms

  return (
    <div className={cn('space-y-4 transition-opacity duration-300', stale && 'opacity-60')}>
      <div className='space-y-2'>
        <ul className='grid grid-cols-2 gap-3 sm:gap-4 xl:grid-cols-4'>
          <Tile
            order={0}
            icon={ScrollText}
            label={t('providerOrderLogPage.dashboard.total')}
            value={formatNumber(data?.total ?? 0)}
            hint={data ? t('providerOrderLogPage.dashboard.orders', { count: data.orders, formatted: formatNumber(data.orders) }) : undefined}
            loading={loading}
          />
          <Tile
            order={1}
            icon={Percent}
            label={t('providerOrderLogPage.dashboard.successRate')}
            value={rate === null ? '—' : `${rate.toLocaleString(locale, { maximumFractionDigits: 2 })}%`}
            hint={
              data
                ? rate === null
                  ? t('providerOrderLogPage.dashboard.noAnswers')
                  : t('providerOrderLogPage.dashboard.successHint', {
                      success: formatNumber(data.by_result.SUCCESS),
                      failed: formatNumber(data.by_result.FAILED),
                    })
                : undefined
            }
            bar={rate === null ? undefined : Math.min(100, Math.max(0, rate))}
            loading={loading}
          />
          <Tile
            order={2}
            icon={Timer}
            label={t('providerOrderLogPage.dashboard.responseTime')}
            value={ms(responseTime?.avg)}
            hint={
              responseTime && responseTime.avg != null
                ? t('providerOrderLogPage.dashboard.responseHint', { p95: ms(responseTime.p95), max: ms(responseTime.max) })
                : undefined
            }
            loading={loading}
          />
          {/* LapakGaming's callbacks are not taken (we ask for statuses), so the last exchange is shown instead. */}
          <Tile
            order={3}
            icon={Clock}
            label={t('providerOrderLogPage.dashboard.lastLog')}
            value={data?.last_log_at ? formatBackendDateTime(data.last_log_at, 'dd MMM, HH:mm') : '—'}
            hint={data ? t('providerOrderLogPage.dashboard.lastLogHint') : undefined}
            loading={loading}
          />
        </ul>
        <p className='text-right font-display text-[10px] font-semibold uppercase tracking-[0.15em] text-slate-400'>
          {t('providerOrderLogPage.dashboard.scope')}
        </p>
      </div>

      <div className='grid gap-4 lg:grid-cols-3'>
        <DailyPanel daily={data?.daily ?? []} loading={loading} className='lg:col-span-2' />
        <div className='flex flex-col gap-4'>
          <FailurePanel codes={data?.failure_codes ?? []} loading={loading} />
          <OperationPanel operations={data?.operations ?? []} loading={loading} ms={ms} />
        </div>
      </div>
    </div>
  )
}

interface TileProps {
  order: number
  icon: LucideIcon
  label: string
  value: string
  hint?: string
  loading: boolean
  /** 0–100, draws a thin progress bar under the value. */
  bar?: number
}

/** The transactions page's stat tile, with a hint line under the value. */
function Tile({ order, icon: Icon, label, value, hint, loading, bar }: TileProps) {
  return (
    <li className='min-w-0 animate-in fade-in slide-in-from-bottom-2 duration-500 ease-hud fill-mode-both' style={{ animationDelay: `${order * 60}ms` }}>
      <div className='h-full bg-slate-200/80 p-px hud-clip-sm'>
        <div className='flex h-full flex-col gap-1.5 bg-white p-3 hud-clip-sm sm:p-4'>
          <div className='flex items-center justify-between gap-2'>
            <p className='truncate font-display text-[10px] font-semibold uppercase tracking-[0.15em] text-slate-400 sm:tracking-[0.2em]'>{label}</p>
            <Icon className='size-4 shrink-0 text-brand-purple/70' aria-hidden />
          </div>
          {loading ? (
            <div className='h-7 w-3/4 animate-pulse rounded bg-slate-100' aria-hidden />
          ) : (
            <p className='truncate font-display text-lg font-bold tabular-nums text-slate-900 sm:text-2xl'>{value}</p>
          )}
          {!loading && hint && <p className='truncate text-xs text-slate-500'>{hint}</p>}
          {bar !== undefined && !loading && (
            <div className='mt-auto h-1.5 w-full overflow-hidden rounded-full bg-slate-100' role='presentation'>
              <div className='h-full rounded-full bg-emerald-500 transition-[width] duration-700 ease-hud' style={{ width: `${bar}%` }} />
            </div>
          )}
        </div>
      </div>
    </li>
  )
}

/** Every day from the first to the last one sent, the days without logs as zeros, so the axis is continuous. */
function continuousDays(daily: ProviderDailyCount[]): ProviderDailyCount[] {
  if (daily.length < 2) return daily
  const byDate = new Map(daily.map((d) => [d.date, d]))
  const out: ProviderDailyCount[] = []
  const day = parseDay(daily[0].date)
  const last = parseDay(daily[daily.length - 1].date)
  // Bounded by the backend's 90-day log retention; the guard keeps a bad date from looping forever.
  for (let i = 0; day <= last && i < 400; i++) {
    const key = dayKey(day)
    out.push(byDate.get(key) ?? { date: key, sent: 0, success: 0, failed: 0 })
    day.setDate(day.getDate() + 1)
  }
  return out
}

const parseDay = (date: string) => {
  const [y, m, d] = date.split('-').map(Number)
  return new Date(y, m - 1, d)
}
const dayKey = (d: Date) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`

function DailyPanel({ daily, loading, className }: { daily: ProviderDailyCount[]; loading: boolean; className?: string }) {
  const { t, i18n } = useTranslation('common')
  const [view, setView] = useState<'chart' | 'table'>('chart')
  const days = continuousDays(daily)
  const answered = days.some((d) => d.success + d.failed > 0)
  const short = (date: string) => parseDay(date).toLocaleDateString(i18n.language, { day: '2-digit', month: 'short' })
  const full = (date: string) => parseDay(date).toLocaleDateString(i18n.language, { weekday: 'short', day: '2-digit', month: 'short', year: 'numeric' })

  return (
    <DashboardPanel
      title={t('providerOrderLogPage.dashboard.chartTitle')}
      icon={BarChart3}
      order={4}
      className={className}
      bodyClassName='p-0'
      actions={
        <Segmented
          value={view}
          onChange={setView}
          label={t('providerOrderLogPage.dashboard.viewLabel')}
          options={[
            { value: 'chart', label: t('providerOrderLogPage.dashboard.viewChart') },
            { value: 'table', label: t('providerOrderLogPage.dashboard.viewTable') },
          ]}
        />
      }
    >
      {loading ? (
        <div className='m-5 h-64 animate-pulse rounded-md bg-slate-100' aria-hidden />
      ) : !answered ? (
        <div className='flex h-72 flex-col items-center justify-center gap-2 px-5 text-center'>
          <BarChart3 className='size-7 text-slate-300' aria-hidden />
          <p className='text-sm text-slate-500'>{t('providerOrderLogPage.dashboard.chartEmpty')}</p>
        </div>
      ) : view === 'chart' ? (
        <div className='px-3 pb-3 pt-4 sm:px-4'>
          <ul className='mb-2 flex flex-wrap items-center gap-x-4 gap-y-1 px-1 text-xs text-slate-600'>
            <LegendItem color={SUCCESS_COLOR} label={t('providerOrderLogPage.dashboard.success')} />
            <LegendItem color={FAILED_COLOR} label={t('providerOrderLogPage.dashboard.failed')} />
          </ul>
          <div role='img' aria-label={t('providerOrderLogPage.dashboard.chartAria')}>
            <ResponsiveContainer width='100%' height={260}>
              <BarChart data={days} margin={{ top: 8, right: 8, left: 0, bottom: 0 }} barCategoryGap='20%'>
                <CartesianGrid vertical={false} stroke='#f1f5f9' />
                <XAxis
                  dataKey='date'
                  tickFormatter={short}
                  tick={{ fontSize: 11, fill: '#94a3b8' }}
                  tickLine={false}
                  axisLine={{ stroke: '#e2e8f0' }}
                  minTickGap={24}
                  height={28}
                />
                <YAxis
                  tick={{ fontSize: 11, fill: '#94a3b8' }}
                  tickLine={false}
                  axisLine={false}
                  width={40}
                  allowDecimals={false}
                  tickFormatter={(v: number) => formatNumber(v)}
                />
                <Tooltip
                  cursor={{ fill: '#9c27b0', fillOpacity: 0.06 }}
                  content={({ active, payload }) => {
                    const day = payload?.[0]?.payload as ProviderDailyCount | undefined
                    if (!active || !day) return null
                    return (
                      <div className='min-w-44 border border-slate-200 bg-white px-3 py-2.5 text-xs shadow-xl hud-clip-sm'>
                        <p className='mb-1.5 font-display text-[10px] font-semibold uppercase tracking-[0.15em] text-slate-400'>{full(day.date)}</p>
                        <dl className='grid grid-cols-[auto_auto] gap-x-4 gap-y-0.5'>
                          <TooltipRow color={SUCCESS_COLOR} label={t('providerOrderLogPage.dashboard.success')} value={day.success} />
                          <TooltipRow color={FAILED_COLOR} label={t('providerOrderLogPage.dashboard.failed')} value={day.failed} />
                          <TooltipRow label={t('providerOrderLogPage.dashboard.sent')} value={day.sent} />
                        </dl>
                      </div>
                    )
                  }}
                />
                {/* Stacked, success at the base; the white stroke leaves a surface gap between the two fills. */}
                <Bar dataKey='success' stackId='day' fill={SUCCESS_COLOR} stroke='#ffffff' strokeWidth={1} radius={[3, 3, 0, 0]} maxBarSize={28} />
                <Bar dataKey='failed' stackId='day' fill={FAILED_COLOR} stroke='#ffffff' strokeWidth={1} radius={[3, 3, 0, 0]} maxBarSize={28} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      ) : (
        <div className='max-h-80 overflow-auto'>
          <table className='w-full text-sm'>
            <thead className='sticky top-0 bg-white'>
              <tr className='border-b border-slate-100 text-left font-display text-[10px] font-semibold uppercase tracking-[0.15em] text-slate-400'>
                <th className='px-5 py-2.5 font-semibold'>{t('providerOrderLogPage.dashboard.date')}</th>
                <th className='px-3 py-2.5 text-right font-semibold'>{t('providerOrderLogPage.dashboard.success')}</th>
                <th className='px-3 py-2.5 text-right font-semibold'>{t('providerOrderLogPage.dashboard.failed')}</th>
                <th className='px-5 py-2.5 text-right font-semibold'>{t('providerOrderLogPage.dashboard.sent')}</th>
              </tr>
            </thead>
            <tbody className='divide-y divide-slate-100 tabular-nums'>
              {[...days].reverse().map((d) => (
                <tr key={d.date}>
                  <td className='px-5 py-2 text-slate-700'>{full(d.date)}</td>
                  <td className='px-3 py-2 text-right text-slate-900'>{formatNumber(d.success)}</td>
                  <td className='px-3 py-2 text-right text-slate-900'>{formatNumber(d.failed)}</td>
                  <td className='px-5 py-2 text-right text-slate-500'>{formatNumber(d.sent)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </DashboardPanel>
  )
}

function LegendItem({ color, label }: { color: string; label: string }) {
  return (
    <li className='flex items-center gap-1.5'>
      <span className='size-2.5 rounded-[2px]' style={{ backgroundColor: color }} aria-hidden />
      {label}
    </li>
  )
}

function TooltipRow({ color, label, value }: { color?: string; label: string; value: number }) {
  return (
    <>
      <dt className='flex items-center gap-1.5 text-slate-500'>
        <span className='size-2 rounded-[2px]' style={{ backgroundColor: color ?? 'transparent' }} aria-hidden />
        {label}
      </dt>
      <dd className='text-right font-semibold tabular-nums text-slate-900'>{formatNumber(value)}</dd>
    </>
  )
}

function FailurePanel({ codes, loading }: { codes: ProviderOrderLogDashboard['failure_codes']; loading: boolean }) {
  const { t } = useTranslation('common')
  const top = Math.max(1, ...codes.map((c) => c.count))

  return (
    <DashboardPanel title={t('providerOrderLogPage.dashboard.failureTitle')} icon={TriangleAlert} order={5} bodyClassName='px-5 py-4'>
      {loading ? (
        <div className='h-24 animate-pulse rounded-md bg-slate-100' aria-hidden />
      ) : codes.length === 0 ? (
        <p className='text-sm text-slate-500'>{t('providerOrderLogPage.dashboard.failureEmpty')}</p>
      ) : (
        <ul className='space-y-2.5'>
          {codes.map((c) => (
            <li key={c.code} className='space-y-1'>
              <div className='flex items-baseline justify-between gap-3 text-sm'>
                <span className='min-w-0 truncate'>
                  <span className='font-mono text-xs font-medium text-slate-800'>{c.code}</span>
                  {NAMED_FAILURES.includes(c.code) && (
                    <span className='ml-1.5 text-xs text-slate-500'>{t(`providerOrderLogPage.dashboard.failureCode.${c.code}`)}</span>
                  )}
                </span>
                <span className='shrink-0 font-semibold tabular-nums text-slate-900'>{formatNumber(c.count)}</span>
              </div>
              <div className='h-1 w-full overflow-hidden rounded-full bg-slate-100' role='presentation'>
                <div className='h-full rounded-full' style={{ width: `${(c.count / top) * 100}%`, backgroundColor: FAILED_COLOR }} />
              </div>
            </li>
          ))}
        </ul>
      )}
    </DashboardPanel>
  )
}

function OperationPanel({
  operations,
  loading,
  ms,
}: {
  operations: ProviderOrderLogDashboard['operations']
  loading: boolean
  ms: (value: number | null | undefined) => string
}) {
  const { t } = useTranslation('common')
  const label = (op: string) => (['CREATE_ORDER', 'CHECK_STATUS', 'CALLBACK'].includes(op) ? t(`integrationLog.operation.${op}`) : op)

  return (
    <DashboardPanel title={t('providerOrderLogPage.dashboard.operationsTitle')} icon={Layers} order={6} bodyClassName='p-0'>
      {loading ? (
        <div className='m-5 h-20 animate-pulse rounded-md bg-slate-100' aria-hidden />
      ) : operations.length === 0 ? (
        <p className='px-5 py-4 text-sm text-slate-500'>{t('providerOrderLogPage.dashboard.chartEmpty')}</p>
      ) : (
        <table className='w-full text-sm'>
          <thead>
            <tr className='border-b border-slate-100 text-left font-display text-[10px] font-semibold uppercase tracking-[0.15em] text-slate-400'>
              <th className='px-5 py-2.5 font-semibold'>{t('providerOrderLogPage.dashboard.operation')}</th>
              <th className='px-2 py-2.5 text-right font-semibold'>{t('providerOrderLogPage.dashboard.success')}</th>
              <th className='px-2 py-2.5 text-right font-semibold'>{t('providerOrderLogPage.dashboard.failed')}</th>
              <th className='px-5 py-2.5 text-right font-semibold'>{t('providerOrderLogPage.dashboard.avg')}</th>
            </tr>
          </thead>
          <tbody className='divide-y divide-slate-100 tabular-nums'>
            {operations.map((o) => (
              <tr key={o.operation}>
                <td className='px-5 py-2 text-slate-700'>
                  {label(o.operation)}
                  <span className='ml-1 text-xs text-slate-400'>({formatNumber(o.total)})</span>
                </td>
                <td className='px-2 py-2 text-right text-slate-900'>{formatNumber(o.success)}</td>
                <td className='px-2 py-2 text-right text-slate-900'>{formatNumber(o.failed)}</td>
                <td className='whitespace-nowrap px-5 py-2 text-right text-slate-500'>{ms(o.avg_response_ms)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </DashboardPanel>
  )
}
