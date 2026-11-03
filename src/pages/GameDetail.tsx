import { useState } from 'react'
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { ArrowLeft, Gamepad2, RefreshCw, Trash2 } from 'lucide-react'

import { AuthAlert } from '@/components/Auth/AuthPanel'
import { Can } from '@/components/Auth/Can'
import { DangerDialog } from '@/components/Auth/DangerDialog'
import { ConfirmActionDialog } from '@/components/Games/ConfirmActionDialog'
import { GameCheckoutPanel } from '@/components/Games/GameCheckoutPanel'
import { GameDetailHero } from '@/components/Games/GameDetailHero'
import { GameAboutPanel, GameOverviewPanel } from '@/components/Games/GameDetailInfo'
import { GameFormDialog } from '@/components/Games/GameFormDialog'
import { GameImageDialog } from '@/components/Games/GameImageDialog'
import { GamePriceDialog } from '@/components/Games/GamePriceDialog'
import { GameProductsPanel } from '@/components/Games/GameProductsPanel'
import { isUuid, usualPercent } from '@/components/Games/game-utils'
import { DashboardLayout } from '@/components/Layout/dashboard-layout'
import { PERM } from '@/constants/permissions'
import { gameServerMessage, useDeleteGame, useGetGameById, useSyncGameProducts } from '@/hooks/useGame'
import { usePermissions } from '@/hooks/usePermissions'
import type { Game } from '@/types/game'

export default function GameDetailPage() {
  const { t } = useTranslation('common')
  const { gameId = '' } = useParams()
  const location = useLocation()
  const validId = isUuid(gameId)
  const { data, isLoading, isError, error, refetch, isFetching } = useGetGameById(validId ? gameId : '')
  const game = data?.data
  const notFound = !validId || gameServerMessage(error) === 'Game Not Found' || (!!data && !game)
  // The list keeps its filters in the query string; go back to the same view.
  const fromSearch = (location.state as { search?: string } | null)?.search
  const backTo = fromSearch ? `/games?${fromSearch}` : '/games'

  return (
    <DashboardLayout>
      <div className='mx-auto max-w-6xl space-y-6'>
        <Link
          to={backTo}
          className='group inline-flex items-center gap-1.5 font-display text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-500 transition-colors hover:text-brand-purple'
        >
          <ArrowLeft className='size-3.5 transition-transform duration-300 ease-hud group-hover:-translate-x-0.5' aria-hidden />
          {t('gameDetailPage.back')}
        </Link>

        {notFound ? (
          <div className='grid place-items-center rounded-xl border border-dashed border-slate-300 bg-white px-6 py-16 text-center animate-in fade-in duration-500'>
            <span className='mb-4 grid size-14 place-items-center bg-linear-to-br from-brand-purple to-brand-cyan text-white hud-clip-sm'>
              <Gamepad2 className='size-6' aria-hidden />
            </span>
            <h1 className='font-display text-xl font-bold text-slate-900'>{t('gameDetailPage.notFoundTitle')}</h1>
            <p className='mt-1 max-w-sm text-sm text-slate-500'>{t('gameDetailPage.notFoundBody')}</p>
          </div>
        ) : isError ? (
          <div className='space-y-3'>
            <AuthAlert>{t('gameDetailPage.loadError')}</AuthAlert>
            <button
              type='button'
              onClick={() => void refetch()}
              disabled={isFetching}
              className='inline-flex h-9 items-center gap-2 rounded-md border border-slate-200 bg-white px-3 text-sm font-medium text-slate-600 transition-colors hover:text-brand-purple disabled:opacity-60'
            >
              <RefreshCw className={isFetching ? 'size-4 animate-spin' : 'size-4'} aria-hidden />
              {t('gameDetailPage.retry')}
            </button>
          </div>
        ) : isLoading || !game ? (
          <DetailSkeleton />
        ) : (
          <GameDetailView game={game} />
        )}
      </div>
    </DashboardLayout>
  )
}

function GameDetailView({ game }: { game: Game }) {
  const { t } = useTranslation('common')
  const navigate = useNavigate()
  const { can } = usePermissions()
  const [editing, setEditing] = useState(false)
  const [imagesOpen, setImagesOpen] = useState(false)
  const [priceOpen, setPriceOpen] = useState(false)
  const [syncOpen, setSyncOpen] = useState(false)
  const [deleteOpen, setDeleteOpen] = useState(false)
  const sync = useSyncGameProducts(game.id, () => setSyncOpen(false))
  const remove = useDeleteGame(() => navigate('/games', { replace: true }))

  return (
    <>
      <GameDetailHero game={game} onEdit={() => setEditing(true)} onImages={() => setImagesOpen(true)} />

      <div className='grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_22rem]'>
        <div className='min-w-0 space-y-6'>
          <GameAboutPanel game={game} onEdit={can(PERM.gameUpdate) ? () => setEditing(true) : undefined} order={1} />
          <GameCheckoutPanel game={game} order={2} />
        </div>
        <GameOverviewPanel game={game} order={3} />
      </div>

      <GameProductsPanel game={game} onPrice={() => setPriceOpen(true)} onSync={() => setSyncOpen(true)} order={4} />

      <Can permission={PERM.gameDelete}>
        <section className='flex flex-col gap-4 rounded-xl border border-rose-200 bg-rose-50/50 p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6'>
          <div className='min-w-0 space-y-1'>
            <h2 className='font-display text-base font-bold text-rose-700'>{t('gameDetailPage.danger.title')}</h2>
            <p className='text-sm text-rose-700/80'>{t('gameDetailPage.danger.body')}</p>
          </div>
          <button
            type='button'
            onClick={() => setDeleteOpen(true)}
            className='inline-flex h-10 shrink-0 items-center justify-center gap-2 bg-rose-600 px-4 font-display text-xs font-bold uppercase tracking-[0.15em] text-white hud-clip-sm transition-colors hover:bg-rose-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-white/90'
          >
            <Trash2 className='size-4' aria-hidden />
            {t('gameDetailPage.danger.button')}
          </button>
        </section>
      </Can>

      <GameFormDialog open={editing} onOpenChange={setEditing} game={game} />
      <GameImageDialog game={imagesOpen ? game : null} onOpenChange={(open) => !open && setImagesOpen(false)} />
      <GamePriceDialog
        game={priceOpen ? { id: game.id, name: game.name, additional_percent: usualPercent(game.product ?? []) } : null}
        onOpenChange={(open) => !open && setPriceOpen(false)}
      />
      <ConfirmActionDialog
        open={syncOpen}
        onOpenChange={setSyncOpen}
        eyebrow={t('gameDetailPage.sync.eyebrow')}
        title={t('gameDetailPage.sync.title', { name: game.name })}
        description={t('gameDetailPage.sync.description')}
        confirmLabel={t('gameDetailPage.sync.confirm')}
        cancelLabel={t('gameDetailPage.sync.cancel')}
        pendingLabel={t('gameDetailPage.sync.pending')}
        pending={sync.isPending}
        onConfirm={() => sync.mutate()}
      />
      <DangerDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        eyebrow={t('gameDetailPage.delete.eyebrow')}
        title={t('gameDetailPage.delete.title', { name: game.name })}
        description={t('gameDetailPage.delete.description')}
        confirmLabel={t('gameDetailPage.delete.confirm')}
        cancelLabel={t('gameDetailPage.delete.cancel')}
        pending={remove.isPending}
        onConfirm={() => remove.mutate(game.id)}
      />
    </>
  )
}

function DetailSkeleton() {
  return (
    <div className='space-y-6' aria-hidden>
      <div className='bg-slate-200/60 p-px hud-clip'>
        <div className='bg-white hud-clip'>
          <div className='aspect-[21/9] animate-pulse bg-slate-200/70 sm:aspect-auto sm:h-56' />
          <div className='flex gap-4 px-5 pb-6 sm:px-7'>
            <div className='-mt-12 size-24 shrink-0 animate-pulse rounded-xl bg-slate-200 ring-4 ring-white sm:-mt-14 sm:size-28' />
            <div className='flex-1 space-y-2 pt-4'>
              <div className='h-3 w-24 animate-pulse rounded bg-slate-200/70' />
              <div className='h-6 w-1/2 animate-pulse rounded bg-slate-200/70' />
              <div className='h-3 w-1/3 animate-pulse rounded bg-slate-100' />
            </div>
          </div>
        </div>
      </div>
      <div className='grid gap-6 lg:grid-cols-[minmax(0,1fr)_22rem]'>
        <div className='h-64 animate-pulse bg-slate-200/50 hud-clip' />
        <div className='h-64 animate-pulse bg-slate-200/50 hud-clip' />
      </div>
    </div>
  )
}
