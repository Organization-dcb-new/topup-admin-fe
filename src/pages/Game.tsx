import { useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { ChevronRight, Eye, Gamepad2, Pencil, Percent, Plus, RefreshCw, RotateCcw, Search, SearchX, Zap, type LucideIcon } from 'lucide-react'

import { AuthAlert } from '@/components/Auth/AuthPanel'
import { Can } from '@/components/Auth/Can'
import { hudEyebrowClass, hudInputClass, hudPrimaryButtonClass } from '@/components/Auth/hud-styles'
import { ConfirmActionDialog } from '@/components/Games/ConfirmActionDialog'
import EditBulkAllPriceModal from '@/components/Games/EditBulkAllPriceModal'
import { GameFormDialog } from '@/components/Games/GameFormDialog'
import { GameImageDialog } from '@/components/Games/GameImageDialog'
import { GameStatusChips, GameThumb, GameToggles } from '@/components/Games/GameParts'
import { GamePriceDialog } from '@/components/Games/GamePriceDialog'
import { formatMarkup } from '@/components/Games/game-utils'
import { DashboardLayout } from '@/components/Layout/dashboard-layout'
import { HudPagination } from '@/components/Layout/hud-pagination'
import { Input } from '@/components/ui/input'
import { Segmented } from '@/components/ui/segmented'
import { PERM } from '@/constants/permissions'
import { useDebounce } from '@/hooks/useDebounce'
import { useGetGames, useInitGamesFromProvider } from '@/hooks/useGame'
import { usePermissions } from '@/hooks/usePermissions'
import { cn } from '@/lib/utils'
import type { Game } from '@/types/game'

const PAGE_SIZE = 20

const STATUSES = ['all', 'active', 'inactive'] as const
const IMAGES = ['all', 'with_image', 'no_image'] as const

function pick<T extends string>(value: string | null, allowed: readonly T[], fallback: T): T {
  return allowed.includes(value as T) ? (value as T) : fallback
}

const iconButtonClass =
  'grid size-8 shrink-0 place-items-center text-slate-400 hud-clip-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset'

export default function GamePage() {
  const { t, i18n } = useTranslation('common')
  const { can } = usePermissions()
  // Filters live in the URL, so coming back from a game's detail page keeps them.
  const [params, setParams] = useSearchParams()
  const q = params.get('q') ?? ''
  const status = pick(params.get('status'), STATUSES, 'all')
  const image = pick(params.get('image'), IMAGES, 'all')
  const page = Math.max(1, Number(params.get('page')) || 1)
  const debouncedQ = useDebounce(q.trim(), 350)

  const update = (patch: Record<string, string | null>) =>
    setParams(
      (prev) => {
        const next = new URLSearchParams(prev)
        for (const [key, value] of Object.entries(patch)) {
          if (!value || value === 'all' || (key === 'page' && value === '1')) next.delete(key)
          else next.set(key, value)
        }
        return next
      },
      { replace: true }
    )

  const { data, isLoading, isError, isFetching, isPlaceholderData, refetch } = useGetGames(page, PAGE_SIZE, {
    search: debouncedQ,
    image,
    ...(status !== 'all' && { is_active: status === 'active' }),
  })
  const games = data?.data ?? []
  const meta = data?.meta
  const filtered = !!(q || status !== 'all' || image !== 'all')
  const locale = i18n.resolvedLanguage

  const [formTarget, setFormTarget] = useState<Game | 'new' | null>(null)
  const [imageTarget, setImageTarget] = useState<Game | null>(null)
  const [priceTarget, setPriceTarget] = useState<Game | null>(null)
  const [syncOpen, setSyncOpen] = useState(false)
  const sync = useInitGamesFromProvider(() => setSyncOpen(false))

  return (
    <DashboardLayout>
      <div className='mx-auto max-w-6xl space-y-6'>
        <header className='flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between'>
          <div className='space-y-1'>
            <p className={hudEyebrowClass}>{t('gamePage.eyebrow')}</p>
            <h1 className='font-display text-3xl font-bold tracking-tight text-slate-900'>{t('gamePage.title')}</h1>
            <p className='max-w-2xl text-sm leading-relaxed text-slate-500'>{t('gamePage.subtitle')}</p>
          </div>
          <div className='flex flex-wrap items-center gap-2'>
            <Can permission={PERM.gameSync}>
              <button
                type='button'
                onClick={() => setSyncOpen(true)}
                className='inline-flex h-11 items-center gap-2 bg-white px-4 font-display text-xs font-bold uppercase tracking-[0.15em] text-slate-600 ring-1 ring-inset ring-slate-200 hud-clip-sm transition-colors hover:text-brand-purple focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-purple/40'
              >
                <RefreshCw className='size-4' aria-hidden />
                {t('gamePage.syncBtn')}
              </button>
            </Can>
            <Can permission={PERM.productUpdatePrice}>
              <EditBulkAllPriceModal />
            </Can>
            <Can permission={PERM.gameCreate}>
              <button type='button' onClick={() => setFormTarget('new')} className={hudPrimaryButtonClass}>
                <span className='pointer-events-none absolute inset-y-0 right-0 w-1.5 bg-brand-cyan' aria-hidden />
                <Plus className='size-4' aria-hidden />
                {t('gamePage.addBtn')}
              </button>
            </Can>
          </div>
        </header>

        {meta && (
          <ul className='grid grid-cols-3 gap-3 sm:gap-4'>
            <StatTile order={0} icon={Gamepad2} label={filtered ? t('gamePage.stats.results') : t('gamePage.stats.total')} value={meta.total_data} locale={locale} />
            <StatTile order={1} icon={Zap} label={t('gamePage.stats.active')} hint={t('gamePage.stats.allGames')} value={meta.game_active} locale={locale} tone='emerald' />
            <StatTile order={2} icon={Eye} label={t('gamePage.stats.shown')} hint={t('gamePage.stats.allGames')} value={meta.game_show} locale={locale} tone='cyan' />
          </ul>
        )}

        <div className='bg-slate-200/80 p-px hud-clip'>
          <div className='flex flex-col gap-3 bg-white p-4 hud-clip lg:flex-row lg:items-center'>
            <div className='group relative min-w-0 flex-1'>
              <span className='pointer-events-none absolute inset-y-0 left-0 flex w-10 items-center justify-center text-slate-400 group-focus-within:text-brand-purple'>
                <Search className='size-4' aria-hidden />
              </span>
              <Input
                value={q}
                onChange={(e) => update({ q: e.target.value, page: null })}
                placeholder={t('gamePage.searchPlaceholder')}
                aria-label={t('gamePage.searchPlaceholder')}
                className={cn(hudInputClass, 'h-10 bg-white pl-10 text-sm')}
              />
            </div>
            <Segmented
              size='md'
              value={status}
              onChange={(v) => update({ status: v, page: null })}
              label={t('gamePage.filters.status')}
              options={STATUSES.map((s) => ({ value: s, label: t(`gamePage.filters.statusOptions.${s}`) }))}
            />
            <Segmented
              size='md'
              value={image}
              onChange={(v) => update({ image: v, page: null })}
              label={t('gamePage.filters.image')}
              options={IMAGES.map((s) => ({ value: s, label: t(`gamePage.filters.imageOptions.${s}`) }))}
            />
            {filtered && (
              <button
                type='button'
                onClick={() => update({ q: null, status: null, image: null, page: null })}
                className='inline-flex h-10 shrink-0 items-center gap-1.5 rounded-md px-3 text-xs font-medium text-slate-500 transition-colors hover:bg-rose-50 hover:text-rose-600'
              >
                <RotateCcw className='size-3.5' aria-hidden />
                {t('gamePage.filters.reset')}
              </button>
            )}
          </div>
        </div>

        {isError && (
          <div className='space-y-3'>
            <AuthAlert>{t('gamePage.loadError')}</AuthAlert>
            <button
              type='button'
              onClick={() => void refetch()}
              className='inline-flex h-9 items-center gap-2 rounded-md border border-slate-200 bg-white px-3 text-sm font-medium text-slate-600 transition-colors hover:text-brand-purple'
            >
              <RefreshCw className='size-4' aria-hidden />
              {t('gamePage.retry')}
            </button>
          </div>
        )}

        {isLoading ? (
          <div className='space-y-px overflow-hidden bg-slate-200/60 p-px hud-clip' aria-hidden>
            {Array.from({ length: 6 }, (_, i) => (
              <div key={i} className='flex items-center gap-4 bg-white px-5 py-4'>
                <div className='size-12 animate-pulse rounded-md bg-slate-200/70' />
                <div className='flex-1 space-y-2'>
                  <div className='h-3.5 w-1/3 animate-pulse rounded bg-slate-200/70' />
                  <div className='h-3 w-1/4 animate-pulse rounded bg-slate-100' />
                </div>
              </div>
            ))}
          </div>
        ) : !isError && games.length === 0 ? (
          <div className='grid place-items-center rounded-xl border border-dashed border-slate-300 bg-white px-6 py-16 text-center animate-in fade-in duration-500'>
            <span className='mb-4 grid size-14 place-items-center bg-linear-to-br from-brand-purple to-brand-cyan text-white hud-clip-sm'>
              {filtered ? <SearchX className='size-6' aria-hidden /> : <Gamepad2 className='size-6' aria-hidden />}
            </span>
            <h2 className='font-display text-xl font-bold text-slate-900'>{filtered ? t('gamePage.noMatchTitle') : t('gamePage.emptyTitle')}</h2>
            <p className='mt-1 max-w-sm text-sm text-slate-500'>{filtered ? t('gamePage.noMatchBody') : t('gamePage.emptyBody')}</p>
          </div>
        ) : (
          games.length > 0 && (
            <div className={cn('bg-slate-200/80 p-px transition-opacity duration-300 hud-clip', isPlaceholderData && 'opacity-60')}>
              <ul className='divide-y divide-slate-100 bg-white hud-clip' aria-busy={isFetching}>
                {games.map((game, index) => (
                  <GameRow
                    key={game.id}
                    game={game}
                    order={index}
                    canUpdate={can(PERM.gameUpdate)}
                    onImage={() => setImageTarget(game)}
                    onEdit={() => setFormTarget(game)}
                    onPrice={() => setPriceTarget(game)}
                  />
                ))}
              </ul>
            </div>
          )
        )}

        <HudPagination page={page} totalPages={meta?.total_page ?? 1} onChange={(p) => update({ page: String(p) })} />
      </div>

      <GameFormDialog
        open={formTarget !== null}
        onOpenChange={(open) => !open && setFormTarget(null)}
        game={formTarget === 'new' ? undefined : (formTarget ?? undefined)}
      />
      <GameImageDialog game={imageTarget} onOpenChange={(open) => !open && setImageTarget(null)} />
      <GamePriceDialog game={priceTarget} onOpenChange={(open) => !open && setPriceTarget(null)} />
      <ConfirmActionDialog
        open={syncOpen}
        onOpenChange={setSyncOpen}
        eyebrow={t('gamePage.sync.eyebrow')}
        title={t('gamePage.sync.title')}
        description={t('gamePage.sync.description')}
        confirmLabel={t('gamePage.sync.confirm')}
        cancelLabel={t('gamePage.sync.cancel')}
        pendingLabel={t('gamePage.sync.pending')}
        pending={sync.isPending}
        onConfirm={() => sync.mutate()}
      />
    </DashboardLayout>
  )
}

interface StatTileProps {
  order: number
  icon: LucideIcon
  label: string
  hint?: string
  value: number
  locale?: string
  tone?: 'emerald' | 'cyan'
}

function StatTile({ order, icon: Icon, label, hint, value, locale, tone }: StatTileProps) {
  return (
    <li className='min-w-0 animate-in fade-in slide-in-from-bottom-2 duration-500 ease-hud fill-mode-both' style={{ animationDelay: `${order * 60}ms` }}>
      <div className='h-full bg-slate-200/80 p-px hud-clip-sm'>
        <div className='flex h-full items-center justify-between gap-3 bg-white p-3 hud-clip-sm sm:p-4'>
          <div className='min-w-0'>
            <p className='truncate font-display text-[10px] font-semibold uppercase tracking-[0.15em] text-slate-400 sm:tracking-[0.2em]'>{label}</p>
            <p
              className={cn(
                'mt-1 font-display text-2xl font-bold',
                tone === 'emerald' ? 'text-emerald-600' : tone === 'cyan' ? 'text-cyan-600' : 'text-slate-900'
              )}
            >
              {value.toLocaleString(locale)}
            </p>
            {hint && <p className='hidden truncate text-[11px] text-slate-400 sm:block'>{hint}</p>}
          </div>
          <span
            className={cn(
              'hidden size-10 shrink-0 place-items-center hud-clip-sm sm:grid',
              tone === 'emerald' ? 'bg-emerald-50 text-emerald-600' : tone === 'cyan' ? 'bg-cyan-50 text-cyan-600' : 'bg-brand-purple/10 text-brand-purple'
            )}
          >
            <Icon className='size-5' aria-hidden />
          </span>
        </div>
      </div>
    </li>
  )
}

interface GameRowProps {
  game: Game
  order: number
  canUpdate: boolean
  onImage: () => void
  onEdit: () => void
  onPrice: () => void
}

function GameRow({ game, order, canUpdate, onImage, onEdit, onPrice }: GameRowProps) {
  const { t } = useTranslation('common')
  const markup = formatMarkup(game.additional_percent, game.additional_fee)
  const thumb = <GameThumb src={game.thumbnail_url} className='size-full' />

  return (
    <li
      className='grid gap-x-5 gap-y-3 px-4 py-3.5 animate-in fade-in duration-300 fill-mode-both sm:px-5 lg:grid-cols-[minmax(0,1fr)_8rem_auto_auto] lg:items-center'
      style={{ animationDelay: `${Math.min(order, 12) * 20}ms` }}
    >
      <div className='flex min-w-0 items-center gap-3'>
        {canUpdate ? (
          <button
            type='button'
            onClick={onImage}
            aria-label={t('gamePage.changeImages', { name: game.name })}
            title={t('gamePage.changeImages', { name: game.name })}
            className='group relative size-12 shrink-0 overflow-hidden rounded-md ring-1 ring-slate-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-purple/50'
          >
            {thumb}
            <span className='absolute inset-0 grid place-items-center bg-slate-950/0 text-white opacity-0 transition-all duration-300 group-hover:bg-slate-950/45 group-hover:opacity-100 group-focus-visible:bg-slate-950/45 group-focus-visible:opacity-100'>
              <Pencil className='size-4' aria-hidden />
            </span>
          </button>
        ) : (
          <span className='size-12 shrink-0 overflow-hidden rounded-md ring-1 ring-slate-200'>{thumb}</span>
        )}
        <div className='min-w-0 space-y-1'>
          <div className='flex min-w-0 flex-wrap items-center gap-x-2 gap-y-1'>
            <Link
              to={`/games/${game.id}`}
              className={cn('truncate font-semibold transition-colors hover:text-brand-purple', game.is_active ? 'text-slate-900' : 'text-slate-500')}
            >
              {game.name}
            </Link>
            <GameStatusChips game={game} flagsOnly={canUpdate} />
          </div>
          <p className='truncate text-xs text-slate-500'>
            <span className='font-mono'>{game.code}</span>
            <span> · /{game.slug}</span>
          </p>
        </div>
      </div>

      <div className='text-xs'>
        <p className='font-display text-[10px] font-semibold uppercase tracking-[0.15em] text-slate-400'>{t('gamePage.markup')}</p>
        <p className={cn('font-medium tabular-nums', markup ? 'text-slate-700' : 'text-slate-400')}>{markup ?? t('gamePage.noMarkup')}</p>
      </div>

      <GameToggles game={game} />

      <div className='flex items-center gap-0.5 justify-self-start lg:justify-self-end'>
        <Can permission={PERM.gameUpdate}>
          <button
            type='button'
            onClick={onEdit}
            aria-label={t('gamePage.editBtn', { name: game.name })}
            title={t('gamePage.editBtn', { name: game.name })}
            className={`${iconButtonClass} hover:bg-brand-purple/10 hover:text-brand-purple focus-visible:ring-brand-purple/40`}
          >
            <Pencil className='size-4' aria-hidden />
          </button>
        </Can>
        <Can permission={PERM.productUpdatePrice}>
          <button
            type='button'
            onClick={onPrice}
            aria-label={t('gamePage.priceBtn', { name: game.name })}
            title={t('gamePage.priceBtn', { name: game.name })}
            className={`${iconButtonClass} hover:bg-brand-purple/10 hover:text-brand-purple focus-visible:ring-brand-purple/40`}
          >
            <Percent className='size-4' aria-hidden />
          </button>
        </Can>
        <Link
          to={`/games/${game.id}`}
          className='group/open ml-1 inline-flex h-8 items-center gap-1 px-2.5 font-display text-[11px] font-semibold uppercase tracking-[0.15em] text-brand-purple hud-clip-sm transition-colors hover:bg-brand-purple/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-brand-purple/40'
        >
          {t('gamePage.open')}
          <ChevronRight className='size-3.5 transition-transform duration-300 ease-hud group-hover/open:translate-x-0.5' aria-hidden />
        </Link>
      </div>
    </li>
  )
}
