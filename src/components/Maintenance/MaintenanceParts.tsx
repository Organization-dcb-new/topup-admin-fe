import { useTranslation } from 'react-i18next'

import { Can } from '@/components/Auth/Can'
import { Switch } from '@/components/ui/switch'
import { PERM } from '@/constants/permissions'
import { useUpdateMaintenance } from '@/hooks/useMaintenance'
import { cn } from '@/lib/utils'
import type { Maintenance } from '@/types/maintenance'
import type { MaintenanceStatus } from './maintenance-status'

const STATUS_STYLES: Record<MaintenanceStatus, { chip: string; dot: string }> = {
  live: { chip: 'bg-amber-50 text-amber-700', dot: 'bg-amber-500 animate-hud-signal' },
  scheduled: { chip: 'bg-cyan-50 text-cyan-700', dot: 'bg-brand-cyan' },
  ended: { chip: 'bg-slate-100 text-slate-500', dot: 'bg-slate-400' },
  off: { chip: 'bg-slate-100 text-slate-500', dot: 'bg-slate-300' },
}

export function MaintenanceStatusChip({ status }: { status: MaintenanceStatus }) {
  const { t } = useTranslation()
  const style = STATUS_STYLES[status]
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 px-2 py-0.5 font-display text-[10px] font-semibold uppercase tracking-[0.15em] hud-clip-sm transition-colors duration-300',
        style.chip
      )}
    >
      <span className={cn('size-1.5 rounded-full', style.dot)} aria-hidden />
      {t(`maintenancePage.status.${status}`)}
    </span>
  )
}

/** Mode switch for admins allowed to change it; nothing for everyone else. */
export function MaintenanceModeToggle({ maintenance }: { maintenance: Maintenance }) {
  const { t } = useTranslation()
  const update = useUpdateMaintenance()

  return (
    <Can permission={PERM.maintenanceUpdate}>
      <Switch
        checked={maintenance.is_maintenance}
        disabled={update.isPending}
        onCheckedChange={(checked) =>
          update.mutate({ id: maintenance.id, payload: { is_maintenance: checked } })
        }
        aria-label={t('maintenancePage.toggleMode', { name: maintenance.name })}
        title={t('maintenancePage.toggleMode', { name: maintenance.name })}
        className='data-[state=checked]:bg-amber-500'
      />
    </Can>
  )
}
