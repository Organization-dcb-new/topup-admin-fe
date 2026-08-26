import type { Show } from '@/types/show'
import { AddGamesToShowButton } from '@/components/Show/AddGameToShowModal'
import { DeleteShowButton } from '@/components/Show/DeleteShowModal'
import { UpdateShowModal } from '@/components/Show/EditShowModal'
import { useTranslation } from 'react-i18next'
import { Can } from '@/components/Auth/Can'
import { PERM } from '@/constants/permissions'

export function ShowActionsHeader() {
  const { t } = useTranslation('common')
  return (
    <span className='flex w-full min-w-0 justify-end pr-1 text-right sm:min-w-48'>
      {t('showTable.actionsHeader')}
    </span>
  )
}

export function ShowRowActions({ show }: { show: Show }) {
  const { t } = useTranslation('common')
  // Umpan balik tekan dipasang di konstanta bersama supaya ketiga tombol
  // toolbar mendapat perlakuan yang sama lewat triggerClassName.
  const toolbarBtn =
    'border-0 bg-transparent shadow-none transition-[background-color,transform] duration-150 ease-out hover:bg-muted/70 active:scale-95 motion-reduce:transition-none motion-reduce:active:scale-100'

  return (
    <div className='flex w-full min-w-0 justify-end pr-0.5 sm:min-w-48'>
      <div
        className='inline-flex flex-wrap items-center gap-1 rounded-lg border border-input bg-muted/25 p-1 shadow-xs dark:bg-muted/35'
        role='group'
        aria-label={t('showTable.rowActionsAriaNamed', { name: show.name })}
      >
        {/* Dialognya membaca daftar nama game (GET /games/names → game.view)
            lalu menulis keanggotaan show (PUT /shows/:id/games → show.update),
            jadi butuh dua izin sekaligus. */}
        <Can perm={PERM.SHOW_UPDATE}>
          <Can perm={PERM.GAME_VIEW}>
            <AddGamesToShowButton
              showId={show.id}
              existingGames={show.games}
              triggerClassName={toolbarBtn}
            />
          </Can>
        </Can>
        <Can perm={PERM.SHOW_UPDATE}>
          <UpdateShowModal show={show} triggerClassName={toolbarBtn} />
        </Can>
        <Can perm={PERM.SHOW_DELETE}>
          <DeleteShowButton show={show} triggerClassName={toolbarBtn} />
        </Can>
      </div>
    </div>
  )
}
