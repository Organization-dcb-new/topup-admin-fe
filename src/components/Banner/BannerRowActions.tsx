import type { Banner } from '@/types/banner'
import { DeleteBannerButton } from '@/components/Banner/DeleteBannerModal'
import { UpdateBanner } from '@/components/Banner/EditBannerModal'
import { useTranslation } from 'react-i18next'

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
    <div
      className='flex w-full min-w-[10rem] items-center justify-end gap-2'
      role='group'
      aria-label={t('bannerTable.rowActionsAria')}
    >
      <UpdateBanner banner={banner} triggerClassName='bg-[#ffd84d]' />
      <DeleteBannerButton id={banner.id} triggerClassName='bg-[#ff4d3d]' />
    </div>
  )
}
