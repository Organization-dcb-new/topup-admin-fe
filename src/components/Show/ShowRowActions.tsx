import type { Show } from '@/types/show'
import { AddGamesToShowButton } from '@/components/Show/AddGameToShowModal'
import { DeleteShowButton } from '@/components/Show/DeleteShowModal'
import { UpdateShowModal } from '@/components/Show/EditShowModal'

export function ShowActionsHeader() {
  return (
    <span className="flex w-full min-w-[12rem] justify-end pr-1 text-right">Aksi</span>
  )
}

export function ShowRowActions({ show }: { show: Show }) {
  const toolbarBtn =
    'border-0 bg-transparent shadow-none hover:bg-muted/70'

  return (
    <div className="flex w-full min-w-[12rem] justify-end pr-0.5">
      <div
        className="inline-flex flex-wrap items-center gap-1 rounded-lg border border-input bg-muted/25 p-1 shadow-xs dark:bg-muted/35"
        role="group"
        aria-label="Aksi untuk show ini"
      >
        <AddGamesToShowButton
          showId={show.ID}
          existingGames={show.Games}
          triggerClassName={toolbarBtn}
        />
        <UpdateShowModal show={show} triggerClassName={toolbarBtn} />
        <DeleteShowButton id={show.ID} triggerClassName={toolbarBtn} />
      </div>
    </div>
  )
}
