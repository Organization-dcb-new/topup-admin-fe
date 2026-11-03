import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { ArrowRight, ShieldX } from 'lucide-react'

import { AuthPanelHeader, HudCard } from '@/components/Auth/AuthPanel'
import { hudPrimaryButtonClass } from '@/components/Auth/hud-styles'
import { firstAccessiblePath, visibleMenus } from '@/components/Layout/sidebar-nav'
import { usePermissions } from '@/hooks/usePermissions'

export default function UnauthorizedPage() {
  const { t } = useTranslation('common')
  const { can } = usePermissions()
  const home = firstAccessiblePath(visibleMenus(can))

  return (
    <div className='mx-auto max-w-lg py-6 sm:py-12'>
      <HudCard className='animate-in fade-in slide-in-from-bottom-4 duration-700 ease-hud'>
        <AuthPanelHeader
          eyebrow={t('unauthorizedPage.eyebrow')}
          icon={ShieldX}
          title={t('unauthorizedPage.title')}
          description={t('unauthorizedPage.subtitle')}
        />
        {home && (
          <Link to={home} className={hudPrimaryButtonClass}>
            <span className='pointer-events-none absolute inset-y-0 right-0 w-1.5 bg-brand-cyan' aria-hidden />
            {t('unauthorizedPage.backButton')}
            <ArrowRight className='size-4' aria-hidden />
          </Link>
        )}
      </HudCard>
    </div>
  )
}
