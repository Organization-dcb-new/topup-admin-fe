import { useTranslation } from 'react-i18next'

/**
 * Label permission dilokalkan di FE, bukan diambil dari `description` milik
 * server: field itu hanya satu bahasa. Kuncinya dipecah per resource dan per
 * action supaya jumlahnya tetap kecil — permission baru tidak menuntut kunci
 * locale baru selama resource dan action-nya sudah dikenal.
 */
export function usePermissionLabels() {
  const { t } = useTranslation('common')

  const resourceLabel = (resource: string) =>
    t(`permissionResource.${resource}`, { defaultValue: resource })

  const actionLabel = (action: string) =>
    t(`permissionAction.${action}`, { defaultValue: action })

  return { resourceLabel, actionLabel }
}
