import type { TFunction } from 'i18next'
import { Activity, LogIn, LogOut, Pencil, Plus, Trash2, type LucideIcon } from 'lucide-react'

import type { AdminLog } from '@/types/admin-log'

interface ActionMeta {
  icon: LucideIcon
  /** Icon tile colours. */
  tile: string
  /** Chip colours. */
  chip: string
}

const ACTION_META: Record<string, ActionMeta> = {
  CREATE: { icon: Plus, tile: 'bg-cyan-50 text-cyan-600', chip: 'bg-cyan-50 text-cyan-700' },
  UPDATE: { icon: Pencil, tile: 'bg-brand-purple/10 text-brand-purple', chip: 'bg-brand-purple/10 text-brand-purple' },
  DELETE: { icon: Trash2, tile: 'bg-rose-50 text-rose-600', chip: 'bg-rose-50 text-rose-700' },
  LOGIN: { icon: LogIn, tile: 'bg-emerald-50 text-emerald-600', chip: 'bg-emerald-50 text-emerald-700' },
  LOGOUT: { icon: LogOut, tile: 'bg-slate-100 text-slate-500', chip: 'bg-slate-100 text-slate-600' },
}

const FALLBACK_META: ActionMeta = { icon: Activity, tile: 'bg-slate-100 text-slate-500', chip: 'bg-slate-100 text-slate-600' }

export function actionMeta(action: string): ActionMeta {
  return ACTION_META[action] ?? FALLBACK_META
}

/** The description, or "Sign in · Admin" built from the labels when the backend left it empty. */
export function logTitle(log: Pick<AdminLog, 'Description' | 'Action' | 'Module'>, t: TFunction) {
  if (log.Description) return log.Description
  return t('adminLogPage.fallbackDescription', {
    action: t(`adminLogPage.actions.${log.Action}`, { defaultValue: log.Action }),
    module: t(`adminLogPage.modules.${log.Module}`, { defaultValue: log.Module.replaceAll('_', ' ') }),
  })
}

/** Snapshots are whole rows, so they can carry hashes and secrets; never print those. */
const SENSITIVE_KEY = /pass(word)?|secret|token|hash|otp|recovery/i
export const MASKED_VALUE = '••••••'

export function isSensitiveKey(key: string) {
  return SENSITIVE_KEY.test(key)
}

export interface FieldChange {
  key: string
  before: string
  after: string
  changed: boolean
}

export function formatLogValue(key: string, value: unknown): string {
  if (value === undefined || value === null || value === '') return '—'
  if (isSensitiveKey(key)) return MASKED_VALUE
  if (typeof value === 'object') return JSON.stringify(value)
  return String(value)
}

/** Field-by-field comparison of the two snapshots, changed fields first. */
export function diffLogData(log: Pick<AdminLog, 'OldData' | 'NewData'>): FieldChange[] {
  const before = log.OldData ?? {}
  const after = log.NewData ?? {}
  const keys = [...new Set([...Object.keys(before), ...Object.keys(after)])]
  const rows = keys.map((key) => ({
    key,
    before: formatLogValue(key, before[key]),
    after: formatLogValue(key, after[key]),
    // Compare raw values, so a changed secret still counts even though both sides are masked.
    changed: !!log.OldData && !!log.NewData && JSON.stringify(before[key]) !== JSON.stringify(after[key]),
  }))
  return rows.sort((a, b) => Number(b.changed) - Number(a.changed))
}

/** Changed fields when both snapshots exist; otherwise how many fields the one snapshot holds. */
export function countLogFields(log: Pick<AdminLog, 'OldData' | 'NewData'>) {
  if (log.OldData && log.NewData) return { kind: 'changed' as const, count: diffLogData(log).filter((r) => r.changed).length }
  const snapshot = log.NewData ?? log.OldData
  return snapshot ? { kind: 'fields' as const, count: Object.keys(snapshot).length } : null
}

const BROWSERS: [RegExp, string][] = [
  [/Edg\//, 'Edge'],
  [/OPR\//, 'Opera'],
  [/Brave/, 'Brave'],
  [/Firefox\//, 'Firefox'],
  [/Chrome\//, 'Chrome'],
  [/Safari\//, 'Safari'],
  [/PostmanRuntime/, 'Postman'],
  [/curl\//, 'curl'],
]
const SYSTEMS: [RegExp, string][] = [
  [/Windows/, 'Windows'],
  [/iPhone|iPad/, 'iOS'],
  [/Android/, 'Android'],
  [/Mac OS X|Macintosh/, 'macOS'],
  [/Linux/, 'Linux'],
]

/** "Chrome · macOS" from a user agent string; null when nothing is recognisable. */
export function describeUserAgent(ua: string): string | null {
  const browser = BROWSERS.find(([re]) => re.test(ua))?.[1]
  const system = SYSTEMS.find(([re]) => re.test(ua))?.[1]
  return [browser, system].filter(Boolean).join(' · ') || null
}
