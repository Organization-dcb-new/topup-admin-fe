import { DashboardLayout } from '@/components/Layout/dashboard-layout'
import { useTranslation } from 'react-i18next'

export default function DashboardPage() {
  const { t } = useTranslation('common')
  return (
    <DashboardLayout>
      <div className='grid grid-cols-1 md:grid-cols-2 gap-5'>{t('dashboardPage.title')}</div>
    </DashboardLayout>
  )
}
