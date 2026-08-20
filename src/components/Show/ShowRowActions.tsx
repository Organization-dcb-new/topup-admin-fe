import type { Show } from '@/types/show'
import { AddGamesToShowButton } from '@/components/Show/AddGameToShowModal'
import { DeleteShowButton } from '@/components/Show/DeleteShowModal'
import { UpdateShowModal } from '@/components/Show/EditShowModal'
import { useTranslation } from 'react-i18next'

export function ShowActionsHeader() {
  const { t } = useTranslation('common')
  return (
    <span className='flex w-full min-w-[12rem] justify-end pr-1 text-right'>
      {t('showTable.actionsHeader')}
    </span>
  )
}

export function ShowRowActions({ show }: { show: Show }) {
  const { t } = useTranslation('common')

  return (
    <div
      className='flex w-full min-w-[12rem] flex-wrap items-center justify-end gap-2'
      role='group'
      aria-label={t('showTable.rowActionsAria')}
    >
      <AddGamesToShowButton
        showId={show.id}
        existingGames={show.games}
        triggerClassName='bg-[#6fe3f5]'
      />
      <UpdateShowModal show={show} triggerClassName='bg-[#ffd84d]' />
      <DeleteShowButton id={show.id} triggerClassName='bg-[#ff4d3d]' />
    </div>
  )
}
