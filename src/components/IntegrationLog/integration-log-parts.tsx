import { useState, type ReactNode } from 'react'
import { useTranslation } from 'react-i18next'
import { Check, Copy } from 'lucide-react'
import toast from 'react-hot-toast'

import { copyTextToClipboard } from '@/lib/copy-to-clipboard'
import { cn } from '@/lib/utils'

type ToneName = 'success' | 'warn' | 'danger' | 'info' | 'neutral'

const TONES: Record<ToneName, { chip: string; dot: string }> = {
  success: { chip: 'bg-emerald-50 text-emerald-700', dot: 'bg-emerald-500' },
  warn: { chip: 'bg-amber-50 text-amber-700', dot: 'bg-amber-500' },
  danger: { chip: 'bg-rose-50 text-rose-700', dot: 'bg-rose-500' },
  info: { chip: 'bg-cyan-50 text-cyan-700', dot: 'bg-brand-cyan' },
  neutral: { chip: 'bg-slate-100 text-slate-600', dot: 'bg-slate-400' },
}

function LogChip({ tone, children, title }: { tone: ToneName; children: ReactNode; title?: string }) {
  return (
    <span
      title={title}
      className={cn(
        'inline-flex items-center gap-1.5 whitespace-nowrap px-2 py-0.5 font-display text-[10px] font-semibold uppercase tracking-[0.14em] hud-clip-sm',
        TONES[tone].chip
      )}
    >
      <span className={cn('size-1.5 shrink-0 rounded-full', TONES[tone].dot)} aria-hidden />
      {children}
    </span>
  )
}

const OUTCOME_TONES: Record<string, ToneName> = {
  PROCESSED: 'success',
  DUPLICATE: 'info',
  FAILED: 'danger',
  REJECTED: 'warn',
  UNAVAILABLE: 'neutral',
}

/** What the backend did with a Paylabs notification. */
export function CallbackOutcomeChip({ outcome }: { outcome: string }) {
  const { t } = useTranslation('common')
  const known = outcome in OUTCOME_TONES
  return (
    <LogChip tone={OUTCOME_TONES[outcome] ?? 'neutral'} title={known ? t(`integrationLog.outcomeHint.${outcome}`) : undefined}>
      {known ? t(`integrationLog.outcome.${outcome}`) : outcome || '—'}
    </LogChip>
  )
}

const PAYLABS_STATUS_TONES: Record<string, ToneName> = { '01': 'warn', '02': 'success', '09': 'danger' }

/** Paylabs' order status code (01/02/09), with its meaning. */
export function PaylabsStatusChip({ status }: { status: string }) {
  const { t } = useTranslation('common')
  if (!status) return <span className='text-xs text-slate-400'>—</span>
  const known = status in PAYLABS_STATUS_TONES
  return (
    <LogChip tone={PAYLABS_STATUS_TONES[status] ?? 'neutral'}>
      {known ? `${status} · ${t(`integrationLog.paylabsStatus.${status}`)}` : status}
    </LogChip>
  )
}

const RESULT_TONES: Record<string, ToneName> = { SENT: 'neutral', SUCCESS: 'success', FAILED: 'danger' }

/** Our verdict on one exchange with the supplier. */
export function ProviderResultChip({ result }: { result: string }) {
  const { t } = useTranslation('common')
  const known = result in RESULT_TONES
  return <LogChip tone={RESULT_TONES[result] ?? 'neutral'}>{known ? t(`integrationLog.result.${result}`) : result || '—'}</LogChip>
}

/** The supplier's own code or status, verbatim: SUCCESS reads green, PENDING amber, anything else red. */
export function SupplierCodeChip({ value }: { value: string }) {
  if (!value) return null
  const upper = value.toUpperCase()
  const tone: ToneName =
    upper === 'SUCCESS' ? 'success' : upper === 'PENDING' || upper === 'PROCESS' || upper === 'PROCESSING' ? 'warn' : 'danger'
  return <LogChip tone={tone}>{value}</LogChip>
}

/** A titled block of pretty-printed JSON (or raw text) with a copy button. */
export function JsonBlock({ title, value, raw, empty }: { title: string; value?: unknown; raw?: string; empty?: string }) {
  const { t } = useTranslation('common')
  const [copied, setCopied] = useState(false)
  const text = value !== undefined && value !== null ? JSON.stringify(value, null, 2) : raw || ''

  const copy = async () => {
    try {
      await copyTextToClipboard(text)
    } catch {
      toast.error(t('integrationLog.copyFailed'))
      return
    }
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }

  return (
    <div className='min-w-0 space-y-2'>
      <div className='flex items-center justify-between gap-2'>
        <p className='font-display text-[10px] font-semibold uppercase tracking-[0.2em] text-slate-400'>{title}</p>
        {text && (
          <button
            type='button'
            onClick={() => void copy()}
            className='inline-flex h-7 items-center gap-1.5 rounded-md px-2 text-xs font-medium text-slate-500 transition-colors hover:bg-slate-100 hover:text-brand-purple'
          >
            {copied ? <Check className='size-3.5' aria-hidden /> : <Copy className='size-3.5' aria-hidden />}
            {copied ? t('integrationLog.copied') : t('integrationLog.copy')}
          </button>
        )}
      </div>
      {text ? (
        <pre className='max-h-96 overflow-auto whitespace-pre-wrap break-all rounded-md bg-slate-950 p-4 font-mono text-xs leading-relaxed text-slate-200'>
          {text}
        </pre>
      ) : (
        <p className='rounded-md border border-dashed border-slate-200 px-4 py-3 text-xs text-slate-400'>{empty ?? t('integrationLog.emptyPayload')}</p>
      )}
    </div>
  )
}

/** One label/value pair in a detail grid. */
export function LogMeta({ label, children, mono }: { label: string; children: ReactNode; mono?: boolean }) {
  return (
    <div className='min-w-0 text-sm'>
      <dt className='mb-1 font-display text-[10px] font-semibold uppercase tracking-[0.2em] text-slate-400'>{label}</dt>
      <dd className={cn('break-all font-medium text-slate-800', mono && 'font-mono text-[13px]')}>{children || <span className='text-slate-400'>—</span>}</dd>
    </div>
  )
}
