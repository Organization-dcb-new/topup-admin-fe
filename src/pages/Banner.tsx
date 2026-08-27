import { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import {
  AlertCircle,
  ArrowUpDown,
  GalleryHorizontalEnd,
  Images,
  Plus,
  RefreshCw,
} from 'lucide-react'

import { Can } from '@/components/Auth/Can'
import { BANNER_ASPECT } from '@/constants/image-ratios'
import { cn } from '@/lib/utils'
import { BannerCarouselPreview } from '@/components/Banner/BannerCarouselPreview'
import { BannerFormDialog } from '@/components/Banner/BannerFormDialog'
import { BannerListRow } from '@/components/Banner/BannerListRow'
import { DashboardLayout } from '@/components/Layout/dashboard-layout'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { PERM } from '@/constants/permissions'
import {
  useCreateBanner,
  useGetBanners,
  useReorderBanners,
} from '@/hooks/useBanner'
import { useNow } from '@/hooks/useNow'
import { isBannerLive } from '@/lib/banner-schedule'

/** Rangka muat yang meniru tata letak akhir: satu blok 16:9 lalu deret baris. */
function BannerPageSkeleton({ label }: { label: string }) {
  return (
    <div role='status' aria-busy='true' aria-live='polite' className='space-y-6'>
      <span className='sr-only'>{label}</span>

      <section className='space-y-4 rounded-xl border border-border bg-card p-4 shadow-sm sm:p-5'>
        <div className='space-y-2'>
          <Skeleton className='h-4 w-44' />
          <Skeleton className='h-3 w-64' />
        </div>
        <Skeleton className={cn(BANNER_ASPECT, 'w-full rounded-xl')} />
        <div className='flex items-center justify-between'>
          <Skeleton className='h-8 w-24 rounded-lg' />
          <Skeleton className='h-2 w-20 rounded-full' />
        </div>
      </section>

      <section className='space-y-4 rounded-xl border border-border bg-card p-4 shadow-sm sm:p-5'>
        <div className='flex items-center justify-between gap-4'>
          <div className='space-y-2'>
            <Skeleton className='h-4 w-32' />
            <Skeleton className='h-3 w-56' />
          </div>
          <Skeleton className='h-9 w-32 rounded-md' />
        </div>
        <div className='space-y-2'>
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className='h-24 w-full rounded-xl sm:h-[5.5rem]' />
          ))}
        </div>
      </section>
    </div>
  )
}

export default function BannerPage() {
  const { t } = useTranslation('common')
  const [createOpen, setCreateOpen] = useState(false)
  const now = useNow()

  const { data, isLoading, isError, isSuccess, isFetching, refetch } =
    useGetBanners()
  const createBanner = useCreateBanner()
  const reorderBanners = useReorderBanners()

  const banners = useMemo(
    () => [...(data?.data ?? [])].sort((a, b) => a.sort_order - b.sort_order),
    [data]
  )

  const liveBanners = useMemo(
    () => banners.filter((banner) => isBannerLive(banner, now)),
    [banners, now]
  )

  const activeCount = banners.filter((banner) => banner.is_active).length

  // Server yang memegang urutan final, jadi seluruh daftar dikirim ulang
  // dengan sort_order 0..n-1 — bukan hanya dua baris yang bertukar.
  const handleMove = (index: number, direction: 'up' | 'down') => {
    const target = direction === 'up' ? index - 1 : index + 1
    if (target < 0 || target >= banners.length) return

    const next = banners.slice()
    const moved = next[index]
    next[index] = next[target]
    next[target] = moved

    reorderBanners.mutate(
      next.map((banner, order) => ({ id: banner.id, sort_order: order }))
    )
  }

  return (
    <DashboardLayout>
      <div className='mx-auto max-w-5xl space-y-6'>
        <header className='flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between'>
          <div className='flex gap-3'>
            <span
              className='flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary'
              aria-hidden
            >
              <GalleryHorizontalEnd className='h-5 w-5' />
            </span>
            <div className='min-w-0 space-y-1'>
              {/* h2, bukan h1: navbar sudah merender h1 judul halaman */}
              <h2 className='text-2xl font-semibold tracking-tight text-foreground'>
                {t('bannerPage.title')}
              </h2>
              <p className='text-sm text-muted-foreground'>
                {t('bannerPage.subtitle')}
              </p>
            </div>
          </div>

          {isSuccess && (
            <div className='flex shrink-0 items-center gap-2 rounded-lg border border-border bg-card px-3 py-2 shadow-xs'>
              <span className='flex items-center gap-1.5 text-sm font-semibold text-foreground'>
                <span
                  className='h-1.5 w-1.5 rounded-full bg-emerald-500'
                  aria-hidden
                />
                {t('bannerPage.activeCount', { count: activeCount })}
              </span>
              <span className='text-border' aria-hidden>
                /
              </span>
              <span className='text-sm text-muted-foreground tabular-nums'>
                {t('bannerPage.totalCount', { count: banners.length })}
              </span>
            </div>
          )}
        </header>

        {isLoading && (
          <BannerPageSkeleton label={t('bannerPage.loadingLabel')} />
        )}

        {isError && (
          <section className='flex flex-col items-center gap-3 rounded-xl border border-border bg-card px-6 py-14 text-center shadow-sm'>
            <span
              className='flex h-12 w-12 items-center justify-center rounded-xl bg-destructive/10 text-destructive'
              aria-hidden
            >
              <AlertCircle className='h-6 w-6' />
            </span>
            <div className='space-y-1'>
              <h3 className='text-sm font-semibold text-foreground'>
                {t('bannerPage.loadErrorTitle')}
              </h3>
              <p className='text-sm text-muted-foreground'>
                {t('bannerPage.loadErrorDetail')}
              </p>
            </div>
            <Button
              type='button'
              variant='outline'
              size='sm'
              className='gap-2'
              disabled={isFetching}
              onClick={() => void refetch()}
            >
              <RefreshCw className='h-3.5 w-3.5' aria-hidden />
              {t('bannerPage.retry')}
            </Button>
          </section>
        )}

        {isSuccess && (
          <>
            <section className='space-y-4 rounded-xl border border-border bg-card p-4 shadow-sm duration-300 animate-in fade-in slide-in-from-bottom-2 fill-mode-backwards motion-reduce:animate-none sm:p-5'>
              <div className='min-w-0 space-y-0.5'>
                <h3 className='text-sm font-semibold text-foreground'>
                  {t('bannerPage.previewTitle')}
                </h3>
                <p className='text-xs text-muted-foreground'>
                  {t('bannerPage.previewHint')}
                </p>
              </div>

              <BannerCarouselPreview banners={liveBanners} />
            </section>

            <section
              className='space-y-4 rounded-xl border border-border bg-card p-4 shadow-sm duration-300 animate-in fade-in slide-in-from-bottom-2 fill-mode-backwards motion-reduce:animate-none sm:p-5'
              style={{ animationDelay: '80ms' }}
            >
              <div className='flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between'>
                <div className='min-w-0 space-y-0.5'>
                  <h3 className='text-sm font-semibold text-foreground'>
                    {t('bannerPage.listTitle')}
                  </h3>
                  <p className='text-xs text-muted-foreground'>
                    {t('bannerPage.listHint')}
                  </p>
                </div>

                <Can perm={PERM.BANNER_CREATE}>
                  <Button
                    type='button'
                    size='sm'
                    className='gap-2 self-start'
                    onClick={() => setCreateOpen(true)}
                  >
                    <Plus className='h-4 w-4' aria-hidden />
                    {t('bannerPage.addBanner')}
                  </Button>
                </Can>
              </div>

              {banners.length === 0 ? (
                <div className='flex flex-col items-center gap-3 px-4 py-12 text-center'>
                  <span
                    className='flex h-12 w-12 items-center justify-center rounded-xl bg-muted text-muted-foreground'
                    aria-hidden
                  >
                    <Images className='h-6 w-6' />
                  </span>
                  <div className='space-y-1'>
                    <h4 className='text-sm font-semibold text-foreground'>
                      {t('bannerPage.emptyTitle')}
                    </h4>
                    <p className='text-sm text-muted-foreground'>
                      {t('bannerPage.emptyHint')}
                    </p>
                  </div>
                  <Can perm={PERM.BANNER_CREATE}>
                    <Button
                      type='button'
                      size='sm'
                      className='gap-2'
                      onClick={() => setCreateOpen(true)}
                    >
                      <Plus className='h-4 w-4' aria-hidden />
                      {t('bannerPage.emptyAction')}
                    </Button>
                  </Can>
                </div>
              ) : (
                <div className='space-y-3'>
                  <Can perm={PERM.BANNER_UPDATE}>
                    <p className='flex items-center gap-1.5 text-xs text-muted-foreground'>
                      <ArrowUpDown className='h-3 w-3 shrink-0' aria-hidden />
                      {t('bannerPage.reorderHint')}
                    </p>
                  </Can>

                  <ul className='space-y-2'>
                    {banners.map((banner, index) => (
                      <BannerListRow
                        key={banner.id}
                        banner={banner}
                        index={index}
                        total={banners.length}
                        isReordering={reorderBanners.isPending}
                        onMove={(direction) => handleMove(index, direction)}
                      />
                    ))}
                  </ul>
                </div>
              )}
            </section>
          </>
        )}

        <BannerFormDialog
          open={createOpen}
          onOpenChange={setCreateOpen}
          mode='create'
          isPending={createBanner.isPending}
          onSubmit={(values, done) =>
            createBanner.mutate(values, { onSuccess: done })
          }
        />
      </div>
    </DashboardLayout>
  )
}
