import type { Banner } from '@/types/banner'
import { DeleteBannerButton } from '@/components/Banner/DeleteBannerModal'
import { UpdateBanner } from '@/components/Banner/EditBannerModal'

export function BannerActionsHeader() {
  return (
    <span className="flex w-full min-w-[10rem] justify-end pr-1 text-right">Aksi</span>
  )
}

export function BannerRowActions({ banner }: { banner: Banner }) {
  return (
    <div className="flex w-full min-w-[10rem] justify-end pr-0.5">
      <div
        className="inline-flex items-center gap-1 rounded-lg border border-input bg-muted/25 p-1 shadow-xs dark:bg-muted/35"
        role="group"
        aria-label="Aksi untuk banner ini"
      >
        <UpdateBanner
          banner={banner}
          triggerClassName="border-0 bg-transparent shadow-none hover:bg-muted/70"
        />
        <DeleteBannerButton
          id={banner.id}
          triggerClassName="border-0 bg-transparent shadow-none hover:bg-destructive/10"
        />
      </div>
    </div>
  )
}
