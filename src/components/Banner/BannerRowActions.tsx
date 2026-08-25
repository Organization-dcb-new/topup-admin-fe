import type { Banner } from '@/types/banner'
import { DeleteBannerButton } from '@/components/Banner/DeleteBannerModal'
import { UpdateBanner } from '@/components/Banner/EditBannerModal'
import { useTranslation } from 'react-i18next'
import { Can } from '@/components/Auth/Can'
import { PERM } from '@/constants/permissions'

export function BannerActionsHeader() {
  const { t } = useTranslation('common')
  return (
    <span className='flex w-full min-w-[10rem] justify-end pr-1 text-right'>
      {t('bannerTable.actionsHeader')}
    </span>
  )
}

export function BannerRowActions({ banner }: { banner: Banner }) {
  const { t } = useTranslation('common')
  return (
    <div className='flex w-full min-w-[10rem] justify-end pr-0.5'>
      <div
        className='inline-flex items-center gap-1 rounded-lg border border-input bg-muted/25 p-1 shadow-xs dark:bg-muted/35'
        role='group'
        aria-label={t('bannerTable.rowActionsAria')}
      >
        <Can perm={PERM.BANNER_UPDATE}>
          <UpdateBanner
            banner={banner}
            triggerClassName='border-0 bg-transparent shadow-none hover:bg-muted/70'
          />
        </Can>
        <Can perm={PERM.BANNER_DELETE}>
          <DeleteBannerButton
            id={banner.id}
            triggerClassName='border-0 bg-transparent shadow-none hover:bg-destructive/10'
          />
        </Can>
      </div>
    </div>
  )
}
