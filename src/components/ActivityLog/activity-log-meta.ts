import { useTranslation } from 'react-i18next'

import type { ActivityLog } from '@/types/activity-log'

/** The actor's email, a system caller's name, or a word for no one known. */
export function useActorLabel() {
  const { t } = useTranslation('common')
  return (log: Pick<ActivityLog, 'actor_email' | 'actor_name'>) => log.actor_email || log.actor_name || t('activityLogPage.unknownActor')
}
