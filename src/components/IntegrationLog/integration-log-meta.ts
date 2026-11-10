import { useTranslation } from 'react-i18next'

/** "Buat order · Response" style label for a supplier log row. */
export function useProviderLogLabel() {
  const { t } = useTranslation('common')
  return (operation: string, logType: string) => {
    const op = ['CREATE_ORDER', 'CHECK_STATUS', 'CALLBACK'].includes(operation) ? t(`integrationLog.operation.${operation}`) : operation
    const type = ['REQUEST_TO_PROVIDER', 'RESPONSE_FROM_PROVIDER', 'CALLBACK_FROM_PROVIDER'].includes(logType)
      ? t(`integrationLog.logType.${logType}`)
      : logType
    return { op, type }
  }
}

/** Shared filter-card and list shell styles of the two log pages. */
export const logCardClass = 'bg-slate-200/80 p-px hud-clip'
export const logRowLinkClass =
  'group grid items-center gap-x-4 gap-y-2 px-4 py-3 transition-colors hover:bg-brand-purple/[0.03] focus-visible:bg-brand-purple/[0.04] focus-visible:outline-none sm:px-5'
