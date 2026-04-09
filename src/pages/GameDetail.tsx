import { DashboardLayout } from '@/components/Layout/dashboard-layout'
import ErrorComponent from '@/components/Layout/error'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { useGetGameById } from '@/hooks/useGame'
import { formatBackendDateTime } from '@/lib/backend-datetime'
import i18n from '@/i18n'
import { DEFAULT_GAME_IMAGE } from '@/tables/table-game'
import type { Game, GameInput } from '@/types/game'
import type { Product } from '@/types/product'
import {
  ArrowLeft,
  Gamepad2,
  ImageIcon,
  Loader2,
  Package,
  TextCursorInput,
} from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { Link, useParams } from 'react-router-dom'

const detailPageCardClass =
  'overflow-hidden rounded-xl border border-border/80 bg-card text-card-foreground shadow-sm ring-1 ring-gray-900/5 dark:ring-white/10'

function DetailPageShell({ children }: { children: React.ReactNode }) {
  return (
    <DashboardLayout>
      <div className="min-w-0 -mx-4 -mt-4 flex w-full flex-col bg-muted/30 md:-mx-6 md:-mt-6">
        <div className="w-full min-w-0 px-4 py-6 sm:px-6 md:px-8 md:py-8">{children}</div>
      </div>
    </DashboardLayout>
  )
}

function gameInputRows(game: Game): GameInput[] {
  const raw = game.input
  if (raw == null) return []
  return Array.isArray(raw) ? raw : [raw]
}

function moneyFmt(n: number) {
  const locale = i18n.language.startsWith('id') ? 'id-ID' : 'en-US'
  return `Rp ${n.toLocaleString(locale)}`
}

function providerStatusVariant(
  status: string,
): 'success' | 'secondary' | 'outline' {
  const s = status.toLowerCase()
  if (s === 'available') return 'success'
  if (s === 'empty') return 'secondary'
  return 'outline'
}

function GameDetailView({ game }: { game: Game }) {
  const { t } = useTranslation('common')
  const inputs = gameInputRows(game).slice().sort((a, b) => a.sort_order - b.sort_order)
  const products = (game.product ?? []).slice().sort((a, b) => {
    if (a.sort_order !== b.sort_order) return a.sort_order - b.sort_order
    return a.name.localeCompare(b.name)
  })

  const thumb = game.thumbnail_url?.trim() || DEFAULT_GAME_IMAGE
  const banner = game.banner_url?.trim()

  return (
    <div className={detailPageCardClass}>
      <header className="border-b border-border/70 px-4 py-5 sm:px-6 md:px-8">
        <div className="flex min-w-0 items-start gap-3">
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="mt-0.5 shrink-0 rounded-full"
            aria-label={t('gameDetailPage.backAria')}
            asChild
          >
            <Link to="/games">
              <ArrowLeft className="h-5 w-5" aria-hidden />
            </Link>
          </Button>
          <div className="flex min-w-0 gap-3">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <Gamepad2 className="h-5 w-5" aria-hidden />
            </div>
            <div className="min-w-0 space-y-1">
              <h1 className="text-2xl font-semibold tracking-tight text-foreground">{game.name}</h1>
              <p className="text-sm text-muted-foreground">
                <span className="font-mono text-xs text-muted-foreground">{game.code}</span>
                <span className="mx-2 text-border">·</span>
                <span>{game.slug}</span>
              </p>
            </div>
          </div>
        </div>
      </header>

      <div className="space-y-6 px-4 py-6 sm:px-6 md:px-8">
        <div className="grid gap-4 lg:grid-cols-3">
          <div className="overflow-hidden rounded-xl border border-border/70 bg-muted/15 lg:col-span-1">
            <div className="aspect-square w-full border-b border-border/60 bg-muted/30 p-2">
              <img
                src={thumb}
                alt=""
                className="h-full w-full rounded-lg object-cover"
                loading="lazy"
              />
            </div>
            {banner ? (
              <div className="relative aspect-[21/9] w-full bg-muted/40">
                <img
                  src={banner}
                  alt=""
                  className="h-full w-full object-cover"
                  loading="lazy"
                />
              </div>
            ) : (
              <div className="flex aspect-[21/9] items-center justify-center gap-2 bg-muted/40 text-xs text-muted-foreground">
                <ImageIcon className="h-4 w-4 shrink-0 opacity-60" aria-hidden />
                {t('gameDetailPage.noBanner')}
              </div>
            )}
          </div>

          <Card className="border-border/70 shadow-none lg:col-span-2">
            <CardHeader className="border-b border-border/60 pb-4">
              <CardTitle className="text-lg">{t('gameDetailPage.overviewTitle')}</CardTitle>
              <CardDescription>{t('gameDetailPage.overviewDescription')}</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4 pt-6 sm:grid-cols-2">
              <div className="space-y-1">
                <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  {t('gameDetailPage.category')}
                </p>
                <p className="text-sm font-medium text-foreground">{game.category?.name ?? '—'}</p>
              </div>
              <div className="space-y-1">
                <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  {t('gameDetailPage.providerId')}
                </p>
                <p className="break-all font-mono text-xs text-foreground">{game.provider_id}</p>
              </div>
              <div className="space-y-1">
                <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  {t('gameDetailPage.popularity')}
                </p>
                <p className="tabular-nums text-sm font-medium text-foreground">
                  {game.popularity_score}
                </p>
              </div>
              <div className="space-y-1">
                <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  {t('gameDetailPage.createdAt')}
                </p>
                <p className="text-sm tabular-nums text-foreground">
                  {formatBackendDateTime(game.created_at)}
                </p>
              </div>
              <div className="space-y-1">
                <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  {t('gameDetailPage.updatedAt')}
                </p>
                <p className="text-sm tabular-nums text-foreground">
                  {formatBackendDateTime(game.updated_at)}
                </p>
              </div>

              <div className="sm:col-span-2">
                <p className="mb-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  {t('gameDetailPage.flags')}
                </p>
                <div className="flex flex-wrap gap-2">
                  <Badge variant={game.is_active ? 'success' : 'secondary'}>
                    {game.is_active ? t('gameDetailPage.active') : t('gameDetailPage.inactive')}
                  </Badge>
                  <Badge variant={game.is_show ? 'default' : 'outline'}>
                    {game.is_show ? t('gameDetailPage.showYes') : t('gameDetailPage.showNo')}
                  </Badge>
                  <Badge variant={game.is_featured ? 'default' : 'outline'}>
                    {game.is_featured ? t('gameDetailPage.featuredYes') : t('gameDetailPage.featuredNo')}
                  </Badge>
                  {game.is_check_id !== undefined && (
                    <Badge variant={game.is_check_id ? 'default' : 'outline'}>
                      {game.is_check_id ? t('gameDetailPage.checkIdYes') : t('gameDetailPage.checkIdNo')}
                    </Badge>
                  )}
                </div>
              </div>

              {(game.description || game.instruction || game.developer || game.publisher) && (
                <div className="space-y-3 sm:col-span-2">
                  {!!game.description && (
                    <div>
                      <p className="mb-1 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                        {t('gameDetailPage.description')}
                      </p>
                      <p className="whitespace-pre-wrap text-sm text-foreground">{game.description}</p>
                    </div>
                  )}
                  {!!game.instruction && (
                    <div>
                      <p className="mb-1 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                        {t('gameDetailPage.instruction')}
                      </p>
                      <p className="whitespace-pre-wrap text-sm text-foreground">{game.instruction}</p>
                    </div>
                  )}
                  {(game.developer || game.publisher) && (
                    <div className="flex flex-wrap gap-6 text-sm">
                      <div>
                        <span className="text-muted-foreground">{t('gameDetailPage.developer')}: </span>
                        <span className="text-foreground">{game.developer || '—'}</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">{t('gameDetailPage.publisher')}: </span>
                        <span className="text-foreground">{game.publisher || '—'}</span>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <Card className="border-border/70 shadow-none">
          <CardHeader className="border-b border-border/60 pb-4">
            <div className="flex items-center gap-2">
              <TextCursorInput className="h-5 w-5 text-primary" aria-hidden />
              <CardTitle className="text-lg">{t('gameDetailPage.inputsTitle')}</CardTitle>
            </div>
            <CardDescription>{t('gameDetailPage.inputsDescription')}</CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            {inputs.length === 0 ? (
              <p className="text-sm text-muted-foreground">{t('gameDetailPage.inputsEmpty')}</p>
            ) : (
              <div className="overflow-x-auto rounded-lg border border-border/70">
                <table className="w-full min-w-[36rem] text-left text-sm">
                  <thead className="bg-muted/40 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    <tr>
                      <th className="px-3 py-2">{t('gameDetailPage.inputLabel')}</th>
                      <th className="px-3 py-2">{t('gameDetailPage.inputKey')}</th>
                      <th className="px-3 py-2">{t('gameDetailPage.inputType')}</th>
                      <th className="px-3 py-2">{t('gameDetailPage.inputRequired')}</th>
                      <th className="px-3 py-2">{t('gameDetailPage.inputPlaceholder')}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {inputs.map((row) => (
                      <tr key={row.id} className="border-t border-border/60">
                        <td className="px-3 py-2 font-medium text-foreground">{row.label}</td>
                        <td className="px-3 py-2 font-mono text-xs text-muted-foreground">{row.key}</td>
                        <td className="px-3 py-2 text-muted-foreground">{row.input_type}</td>
                        <td className="px-3 py-2">
                          {row.required ? t('gameDetailPage.yes') : t('gameDetailPage.no')}
                        </td>
                        <td className="max-w-[12rem] truncate px-3 py-2 text-muted-foreground">
                          {row.placeholder || '—'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="border-border/70 shadow-none">
          <CardHeader className="border-b border-border/60 pb-4">
            <div className="flex items-center gap-2">
              <Package className="h-5 w-5 text-primary" aria-hidden />
              <CardTitle className="text-lg">{t('gameDetailPage.productsTitle')}</CardTitle>
            </div>
            <CardDescription>
              {t('gameDetailPage.productsDescription', { count: products.length })}
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            {products.length === 0 ? (
              <p className="text-sm text-muted-foreground">{t('gameDetailPage.productsEmpty')}</p>
            ) : (
              <div className="overflow-x-auto rounded-lg border border-border/70">
                <table className="w-full min-w-[56rem] text-left text-sm">
                  <thead className="bg-muted/40 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    <tr>
                      <th className="sticky left-0 z-[1] bg-muted/90 px-3 py-2 backdrop-blur-sm">
                        {t('gameDetailPage.productName')}
                      </th>
                      <th className="px-3 py-2">{t('gameDetailPage.productSku')}</th>
                      <th className="px-3 py-2">{t('gameDetailPage.providerStatus')}</th>
                      <th className="px-3 py-2 text-right">{t('gameDetailPage.basePrice')}</th>
                      <th className="px-3 py-2 text-right">{t('gameDetailPage.additionalFee')}</th>
                      <th className="px-3 py-2 text-right">{t('gameDetailPage.additionalPercent')}</th>
                      <th className="px-3 py-2 text-right">{t('gameDetailPage.sellingPrice')}</th>
                      <th className="px-3 py-2 text-right">{t('gameDetailPage.stock')}</th>
                      <th className="px-3 py-2">{t('gameDetailPage.unlimited')}</th>
                      <th className="px-3 py-2">{t('gameDetailPage.productActive')}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {products.map((p: Product) => (
                      <tr key={p.id} className="border-t border-border/60">
                        <td className="sticky left-0 z-[1] max-w-[14rem] bg-card px-3 py-2 font-medium text-foreground">
                          {p.name}
                        </td>
                        <td className="whitespace-nowrap px-3 py-2 font-mono text-xs text-muted-foreground">
                          {p.sku}
                        </td>
                        <td className="px-3 py-2">
                          <Badge variant={providerStatusVariant(p.provider_status)} className="capitalize">
                            {p.provider_status}
                          </Badge>
                        </td>
                        <td className="whitespace-nowrap px-3 py-2 text-right tabular-nums">
                          {moneyFmt(p.base_price)}
                        </td>
                        <td className="whitespace-nowrap px-3 py-2 text-right tabular-nums">
                          {moneyFmt(p.additional_fee)}
                        </td>
                        <td className="whitespace-nowrap px-3 py-2 text-right tabular-nums">
                          {p.additional_percent}%
                        </td>
                        <td className="whitespace-nowrap px-3 py-2 text-right font-medium tabular-nums text-foreground">
                          {moneyFmt(p.selling_price)}
                        </td>
                        <td className="whitespace-nowrap px-3 py-2 text-right tabular-nums">
                          {p.stock_quantity}
                        </td>
                        <td className="px-3 py-2">{p.is_unlimited_stock ? t('gameDetailPage.yes') : t('gameDetailPage.no')}</td>
                        <td className="px-3 py-2">
                          {p.is_active ? t('gameDetailPage.yes') : t('gameDetailPage.no')}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default function GameDetailPage() {
  const { t } = useTranslation('common')
  const { gameId } = useParams<{ gameId: string }>()

  const { data, isLoading, isError, isSuccess } = useGetGameById(gameId ?? '')

  if (!gameId) {
    return (
      <DetailPageShell>
        <div className={detailPageCardClass}>
          <div className="px-4 py-10 sm:px-6 md:px-8">
            <ErrorComponent message={t('gameDetailPage.missingIdMessage')} />
            <Button variant="outline" className="mt-4" asChild>
              <Link to="/games">{t('gameDetailPage.backButton')}</Link>
            </Button>
          </div>
        </div>
      </DetailPageShell>
    )
  }

  if (isLoading) {
    return (
      <DetailPageShell>
        <div className={detailPageCardClass}>
          <div
            className="flex min-h-[min(60vh,28rem)] flex-col items-center justify-center gap-4 bg-muted/20 px-4 py-16 sm:px-6 md:px-8"
            role="status"
            aria-live="polite"
            aria-busy="true"
          >
            <Loader2 className="h-11 w-11 shrink-0 animate-spin text-primary" aria-hidden />
            <div className="text-center">
              <p className="text-sm font-medium text-foreground">{t('gameDetailPage.loadingTitle')}</p>
              <p className="mt-1 text-xs text-muted-foreground">{t('gameDetailPage.loadingHint')}</p>
            </div>
          </div>
        </div>
      </DetailPageShell>
    )
  }

  if (isError) {
    return (
      <DetailPageShell>
        <div className={detailPageCardClass}>
          <div className="space-y-6 px-4 py-10 sm:px-6 md:px-8">
            <ErrorComponent message={t('gameDetailPage.errorMessage')} />
            <Button variant="outline" asChild>
              <Link to="/games">{t('gameDetailPage.backButton')}</Link>
            </Button>
          </div>
        </div>
      </DetailPageShell>
    )
  }

  if (isSuccess && !data?.data) {
    return (
      <DetailPageShell>
        <div className={detailPageCardClass}>
          <div className="space-y-6 px-4 py-10 sm:px-6 md:px-8">
            <ErrorComponent message={t('gameDetailPage.notFoundMessage')} />
            <Button variant="outline" asChild>
              <Link to="/games">{t('gameDetailPage.backButton')}</Link>
            </Button>
          </div>
        </div>
      </DetailPageShell>
    )
  }

  return (
    <DetailPageShell>
      <GameDetailView game={data!.data} />
    </DetailPageShell>
  )
}
