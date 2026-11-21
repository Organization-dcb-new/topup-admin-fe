import { useTranslation } from 'react-i18next'

import { LogChip, type ToneName } from '@/components/IntegrationLog/integration-log-parts'
import type { ActivityActor } from '@/types/activity-log'

const ACTOR_TONES: Record<ActivityActor, ToneName> = {
  ADMIN: 'info',
  USER: 'success',
  GUEST: 'warn',
  SYSTEM: 'neutral',
  ANONYMOUS: 'neutral',
}

/** Who made the request: Admin, Pembeli, Tamu, Sistem or Tidak dikenal. */
export function ActorChip({ actor }: { actor: ActivityActor }) {
  const { t } = useTranslation('common')
  return <LogChip tone={ACTOR_TONES[actor] ?? 'neutral'}>{t(`activityLogPage.actor.${actor}`, { defaultValue: actor })}</LogChip>
}

const METHOD_STYLES: Record<string, string> = {
  POST: 'bg-emerald-50 text-emerald-700',
  PUT: 'bg-sky-50 text-sky-700',
  PATCH: 'bg-sky-50 text-sky-700',
  DELETE: 'bg-rose-50 text-rose-700',
}

export function MethodChip({ method }: { method: string }) {
  return (
    <span
      className={`inline-flex w-14 shrink-0 justify-center px-1.5 py-0.5 font-mono text-[11px] font-semibold hud-clip-sm ${METHOD_STYLES[method] ?? 'bg-slate-100 text-slate-600'}`}
    >
      {method}
    </span>
  )
}

/** The HTTP status: green under 400, amber for a refused request, red for a server error. */
export function StatusChip({ status }: { status: number }) {
  const tone: ToneName = status >= 500 ? 'danger' : status >= 400 ? 'warn' : 'success'
  return <LogChip tone={tone}>{status || '—'}</LogChip>
}
