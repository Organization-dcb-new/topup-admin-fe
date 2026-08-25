import { DashboardLayout } from '@/components/Layout/dashboard-layout'
import ErrorComponent from '@/components/Layout/error'
import type { GameActiveFilterValue } from '@/components/Games/GameActiveFilter'
import type { ProductProviderStatusFilterValue } from '@/components/Product/Filter/ProductProviderStatusFilter'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { useGetGameById, useToggleGameShow, useToggleGameStatus } from '@/hooks/useGame'
import { useProductsByGame } from '@/hooks/useProduct'
import { Switch } from '@/components/ui/switch'
import { ChangeImageModal } from '@/components/Games/UploadImageModal'
import EditGameModal from '@/components/Games/EditGameModal'
import { useForm } from 'react-hook-form'
import { useUpdateGameInput } from '@/hooks/useGameInput'
import { Label } from '@/components/ui/label'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { copyTextToClipboard } from '@/lib/copy-to-clipboard'
import { formatBackendDateTime } from '@/lib/backend-datetime'
import i18n from '@/i18n'
import { DEFAULT_GAME_IMAGE } from '@/tables/table-game'
import type { Game, GameInput } from '@/types/game'
import type { Product } from '@/types/product'
import {
  ArrowLeft,
  Check,
  Copy,
  Gamepad2,
  ImageIcon,
  Loader2,
  Package,
  RefreshCw,
  Search,
  Pencil,
  TextCursorInput,
  Info,
  Calendar,
  Clock,
  User,
  Building,
  Star,
  Layers,
} from 'lucide-react'
import { useMemo, useState, useEffect } from 'react'
import Pagination from '@/components/Layout/Pagination'
import toast from 'react-hot-toast'
import { useTranslation } from 'react-i18next'
import type { TFunction } from 'i18next'
import { Link, useParams } from 'react-router-dom'
import { Can } from '@/components/Auth/Can'
import { PERM } from '@/constants/permissions'

function EditGameInputModal({ input }: { input: GameInput }) {
  const [open, setOpen] = useState(false)
  const updateMutation = useUpdateGameInput()

  const { register, handleSubmit, reset } = useForm<{
    label: string
    placeholder: string
  }>()

  useEffect(() => {
    if (open) {
      reset({
        label: input.label,
        placeholder: input.placeholder ?? '',
      })
    }
  }, [open, input, reset])

  const onSubmit = (values: { label: string; placeholder: string }) => {
    updateMutation.mutate(
      {
        id: input.id,
        label: values.label,
        placeholder: values.placeholder,
      },
      {
        onSuccess: () => setOpen(false),
      }
    )
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          type='button'
          variant='ghost'
          size='icon'
          className='h-7 w-7 text-slate-400 hover:text-foreground hover:bg-slate-100 dark:hover:bg-zinc-800 rounded-lg cursor-pointer'
          title='Edit Input Field'
        >
          <Pencil className='h-3.5 w-3.5' />
        </Button>
      </DialogTrigger>
      <DialogContent className='rounded-2xl sm:max-w-md border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-950'>
        <DialogHeader className='text-left'>
          <DialogTitle className='font-bold text-slate-900 dark:text-white'>Edit Field Input</DialogTitle>
          <p className='text-xs text-slate-500 dark:text-slate-400'>
            Update the display label and placeholder for key <code className='font-mono bg-slate-100 dark:bg-zinc-900 px-1 py-0.5 rounded text-primary'>{input.key}</code>
          </p>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className='space-y-4 mt-2'>
          <div className='space-y-3'>
            <div className='space-y-1.5'>
              <Label htmlFor='label' className='text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider'>
                Label
              </Label>
              <Input
                id='label'
                {...register('label', { required: true })}
                placeholder='Enter field label'
                className='rounded-xl border-slate-200 dark:border-zinc-800'
              />
            </div>
            <div className='space-y-1.5'>
              <Label htmlFor='placeholder' className='text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider'>
                Placeholder
              </Label>
              <Input
                id='placeholder'
                {...register('placeholder')}
                placeholder='Enter field placeholder'
                className='rounded-xl border-slate-200 dark:border-zinc-800'
              />
            </div>
          </div>
          <DialogFooter className='gap-2 sm:gap-0 border-t border-slate-100 dark:border-zinc-900 pt-3 mt-4'>
            <Button
              type='button'
              variant='outline'
              onClick={() => setOpen(false)}
              className='rounded-xl border-slate-200 dark:border-zinc-800'
            >
              Cancel
            </Button>
            <Button
              type='submit'
              disabled={updateMutation.isPending}
              className='rounded-xl gap-2 font-semibold'
            >
              {updateMutation.isPending && <Loader2 className='h-3.5 w-3.5 animate-spin' />}
              Save Changes
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

const detailPageCardClass =
  'overflow-hidden rounded-xl border border-border/80 bg-card text-card-foreground shadow-sm ring-1 ring-gray-900/5 dark:ring-white/10'

function DetailPageShell({ children }: { children: React.ReactNode }) {
  return (
    <DashboardLayout>
      <div className='min-w-0 -mx-4 -mt-4 flex w-full flex-col bg-muted/30 md:-mx-6 md:-mt-6'>
        <div className='w-full min-w-0 px-4 py-6 sm:px-6 md:px-8 md:py-8'>{children}</div>
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
  const raw = status?.trim()
  const s = raw?.toLowerCase() ?? ''
  if (s === 'available') return 'success'
  if (s === 'empty' || raw === '') return 'secondary'
  return 'outline'
}

function providerStatusLabel(status: string, t: TFunction<'common'>) {
  const raw = status?.trim()
  const lower = raw?.toLowerCase()
  const isAvailable = lower === 'available'
  const isEmpty = lower === 'empty' || raw === ''
  if (isAvailable) return t('productTable.providerAvailable')
  if (isEmpty) return t('productTable.providerEmpty')
  return raw || t('gameDetailPage.emptyValue')
}

function productMatchesDetailFilters(
  p: Product,
  query: string,
  active: GameActiveFilterValue,
  provider: ProductProviderStatusFilterValue,
): boolean {
  const needle = query.trim().toLowerCase()
  if (needle) {
    const name = p.name.toLowerCase()
    const sku = (p.sku ?? '').toLowerCase()
    if (!name.includes(needle) && !sku.includes(needle)) return false
  }
  if (active === 'active' && !p.is_active) return false
  if (active === 'inactive' && p.is_active) return false
  if (provider === 'available') {
    if ((p.provider_status?.trim().toLowerCase() ?? '') !== 'available') return false
  }
  if (provider === 'empty') {
    const raw = p.provider_status?.trim() ?? ''
    const lower = raw.toLowerCase()
    if (!(lower === 'empty' || raw === '')) return false
  }
  return true
}

function GameDetailThumb({ url }: { url: string }) {
  const [failed, setFailed] = useState(false)
  const src = failed ? DEFAULT_GAME_IMAGE : (url || DEFAULT_GAME_IMAGE)
  return (
    <img
      src={src}
      alt=''
      className='h-full w-full rounded-xl object-cover'
      loading='lazy'
      onError={() => setFailed(true)}
    />
  )
}

function CopyIdButton({ text, ariaLabel }: { text: string; ariaLabel: string }) {
  const { t } = useTranslation('common')
  const [copied, setCopied] = useState(false)

  const handle = async () => {
    try {
      await copyTextToClipboard(text)
      toast.success(t('gameDetailPage.copyIdSuccess'))
      setCopied(true)
      window.setTimeout(() => setCopied(false), 2000)
    } catch {
      toast.error(t('gameDetailPage.copyIdError'))
    }
  }

  return (
    <Button
      type='button'
      variant='ghost'
      size='icon'
      className='h-7 w-7 shrink-0 text-muted-foreground hover:text-foreground hover:bg-muted'
      onClick={() => void handle()}
      aria-label={ariaLabel}
    >
      {copied ? (
        <Check className='h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400' aria-hidden />
      ) : (
        <Copy className='h-3.5 w-3.5' aria-hidden />
      )}
    </Button>
  )
}

function GameDetailView({ game }: { game: Game }) {
  const { t } = useTranslation('common')
  const toggleShowMutation = useToggleGameShow(game.id)
  const toggleStatusMutation = useToggleGameStatus(game.id)
  const inputs = gameInputRows(game).slice().sort((a, b) => a.sort_order - b.sort_order)

  const [productQuery, setProductQuery] = useState('')
  const [productActive, setProductActive] = useState<GameActiveFilterValue>('all')
  const [productProvider, setProductProvider] = useState<ProductProviderStatusFilterValue>('all')

  const fetchProductsFallback = (game.product?.length ?? 0) === 0
  const { data: productsFromApi = [], isLoading: productsLoading, isFetching: productsFetching } =
    useProductsByGame(game.id, fetchProductsFallback)

  const allProducts = useMemo(() => {
    const list = fetchProductsFallback ? productsFromApi : (game.product ?? [])
    return list.slice().sort((a, b) => {
      if (a.sort_order !== b.sort_order) return a.sort_order - b.sort_order
      return a.name.localeCompare(b.name)
    })
  }, [fetchProductsFallback, productsFromApi, game.product])

  const filteredProducts = useMemo(
    () =>
      allProducts.filter((p) =>
        productMatchesDetailFilters(p, productQuery, productActive, productProvider),
      ),
    [allProducts, productActive, productProvider, productQuery],
  )

  const productFiltersActive =
    productQuery.trim() !== '' || productActive !== 'all' || productProvider !== 'all'

  const clearProductFilters = () => {
    setProductQuery('')
    setProductActive('all')
    setProductProvider('all')
  }

  const [currentPage, setCurrentPage] = useState(1)
  const pageSize = 10

  useEffect(() => {
    setCurrentPage(1)
  }, [productQuery, productActive, productProvider])

  const paginatedProducts = useMemo(() => {
    const start = (currentPage - 1) * pageSize
    return filteredProducts.slice(start, start + pageSize)
  }, [filteredProducts, currentPage])

  const totalPage = Math.ceil(filteredProducts.length / pageSize)

  const thumbKey = `${game.id}:${game.thumbnail_url ?? ''}`

  return (
    <div className='space-y-6'>
      {/* Navigation Header */}
      <div className='flex items-center justify-between'>
        <Button
          type='button'
          variant='ghost'
          size='sm'
          className='gap-2 text-muted-foreground hover:text-foreground hover:bg-muted/50 rounded-xl'
          asChild
        >
          <Link to='/games'>
            <ArrowLeft className='h-4 w-4' />
            {t('gameDetailPage.backButton')}
          </Link>
        </Button>
      </div>

      {/* Hero Banner Section */}
      <div className='relative overflow-hidden rounded-2xl border border-border/80 bg-card shadow-sm'>
        {/* Banner Background with Gradient Overlay */}
        <div className='relative aspect-[21/5] w-full overflow-hidden bg-muted/30'>
          {game.banner_url ? (
            <img
              src={game.banner_url}
              alt=''
              className='h-full w-full object-cover filter brightness-[0.8] dark:brightness-[0.7]'
            />
          ) : (
            <div className='flex h-full w-full items-center justify-center bg-gradient-to-r from-primary/10 via-primary/5 to-transparent text-muted-foreground'>
              <Gamepad2 className='h-12 w-12 opacity-25' />
            </div>
          )}
          <div className='absolute inset-0 bg-gradient-to-t from-card via-card/25 to-transparent' />
        </div>

        {/* Header Details Overlay */}
        <div className='relative -mt-14 px-6 pb-6 sm:-mt-20 sm:px-8 flex flex-col gap-6 md:flex-row md:items-end md:justify-between md:gap-4'>
          <div className='flex flex-col gap-4 sm:flex-row sm:items-end'>
            {/* Overlapping Thumbnail Avatar */}
            <div className='relative h-28 w-28 shrink-0 overflow-hidden rounded-2xl border-4 border-card bg-card shadow-lg sm:h-36 sm:w-36 transition-transform duration-300 hover:scale-[1.02]'>
              <GameDetailThumb key={thumbKey} url={game.thumbnail_url?.trim() ?? ''} />
            </div>

            {/* Title & Metadata tags */}
            <div className='space-y-2'>
              <h1 className='text-2xl font-extrabold tracking-tight text-foreground sm:text-3xl'>
                {game.name}
              </h1>
              <div className='flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-muted-foreground'>
                <span className='font-mono text-xs px-2 py-0.5 rounded bg-muted border border-border/40 font-semibold text-foreground'>
                  {game.code}
                </span>
                <span className='text-border/60'>•</span>
                <span>{game.slug}</span>
                {game.category?.name && (
                  <>
                    <span className='text-border/60'>•</span>
                    <span className='flex items-center gap-1 font-medium text-foreground/90'>
                      <Layers className='h-3.5 w-3.5 text-primary' />
                      {game.category.name}
                    </span>
                  </>
                )}
              </div>
              <div className='flex flex-wrap gap-1.5 pt-1'>
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
          </div>

          {/* Inline Action Toggles */}
          <div className='flex flex-wrap items-center gap-3'>
            <Can perm={PERM.GAME_UPDATE}>
              <EditGameModal game={game}>
              <Button
                variant='outline'
                size='sm'
                className='h-10 rounded-xl gap-2 font-medium border-border/80 bg-background/90 hover:bg-muted transition-colors shadow-sm'
              >
                <Pencil className='h-4 w-4 text-primary' />
                {t('editGameModal.title') || 'Edit Game'}
              </Button>
              </EditGameModal>
            </Can>

            <Can perm={PERM.GAME_UPDATE}>
              <ChangeImageModal game={game} image={game.thumbnail_url}>
              <Button
                variant='outline'
                size='sm'
                className='h-10 rounded-xl gap-2 font-medium border-border/80 bg-background/90 hover:bg-muted transition-colors shadow-sm'
              >
                <ImageIcon className='h-4 w-4 text-primary' />
                {t('gameImageModal.changeImages') || 'Change Images'}
              </Button>
              </ChangeImageModal>
            </Can>

            <div className='flex items-center gap-3 rounded-xl border border-border/80 bg-background/90 backdrop-blur-sm p-2 shadow-sm'>
              <div className='flex items-center gap-2 px-1'>
                <span className='text-xs font-semibold text-muted-foreground'>
                  {t('gameToggleLabels.active')}
                </span>
                <Switch
                  checked={game.is_active}
                  onCheckedChange={(v) => toggleStatusMutation.mutate(v)}
                  disabled={toggleStatusMutation.isPending}
                />
              </div>
              <div className='h-5 w-px bg-border' />
              <div className='flex items-center gap-2 px-1'>
                <span className='text-xs font-semibold text-muted-foreground'>
                  {t('gameShowcase.label')}
                </span>
                <Switch
                  checked={game.is_show}
                  onCheckedChange={(v) => toggleShowMutation.mutate(v)}
                  disabled={toggleShowMutation.isPending}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Detail Layout Grid */}
      <div className='grid gap-6 md:grid-cols-3'>
        {/* Left Column: Quick Stats Card */}
        <div className='md:col-span-1 space-y-6'>
          <Card className='shadow-sm border-border/80 rounded-2xl'>
            <CardHeader className='pb-3 border-b border-border/40'>
              <CardTitle className='text-base font-bold flex items-center gap-2'>
                <Info className='h-4.5 w-4.5 text-primary' />
                {t('gameDetailPage.overviewTitle')}
              </CardTitle>
              <CardDescription>
                {t('gameDetailPage.overviewDescription')}
              </CardDescription>
            </CardHeader>
            <CardContent className='space-y-4 pt-4'>
              {/* Game ID */}
              <div className='flex items-center justify-between gap-2 border-b border-border/40 pb-3'>
                <div className='space-y-0.5 min-w-0'>
                  <p className='text-[10px] font-bold uppercase tracking-wider text-muted-foreground'>
                    {t('gameDetailPage.gameIdLabel')}
                  </p>
                  <p className='font-mono text-xs text-foreground truncate max-w-[170px]' title={game.id}>
                    {game.id}
                  </p>
                </div>
                <CopyIdButton text={game.id} ariaLabel={t('gameDetailPage.copyGameIdAria')} />
              </div>

              {/* Popularity */}
              <div className='flex items-center justify-between border-b border-border/40 pb-3'>
                <div className='space-y-0.5'>
                  <p className='text-[10px] font-bold uppercase tracking-wider text-muted-foreground'>
                    {t('gameDetailPage.popularity')}
                  </p>
                  <p className='text-sm font-semibold text-foreground flex items-center gap-1.5'>
                    <Star className='h-4 w-4 fill-amber-400 text-amber-400' />
                    {game.popularity_score}
                  </p>
                </div>
              </div>

              {/* Created At */}
              <div className='flex items-center justify-between border-b border-border/40 pb-3'>
                <div className='space-y-0.5'>
                  <p className='text-[10px] font-bold uppercase tracking-wider text-muted-foreground'>
                    {t('gameDetailPage.createdAt')}
                  </p>
                  <p className='text-xs text-foreground flex items-center gap-1.5 font-medium'>
                    <Calendar className='h-3.5 w-3.5 text-muted-foreground' />
                    {formatBackendDateTime(game.created_at)}
                  </p>
                </div>
              </div>

              {/* Updated At */}
              <div className='flex items-center justify-between pb-1'>
                <div className='space-y-0.5'>
                  <p className='text-[10px] font-bold uppercase tracking-wider text-muted-foreground'>
                    {t('gameDetailPage.updatedAt')}
                  </p>
                  <p className='text-xs text-foreground flex items-center gap-1.5 font-medium'>
                    <Clock className='h-3.5 w-3.5 text-muted-foreground' />
                    {formatBackendDateTime(game.updated_at)}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Developer / Publisher Card */}
          {(game.developer || game.publisher) && (
            <Card className='shadow-sm border-border/80 rounded-2xl'>
              <CardContent className='space-y-4 pt-6'>
                {game.developer && (
                  <div className='flex items-center gap-3'>
                    <div className='flex h-9 w-9 items-center justify-center rounded-lg bg-primary/5 text-primary'>
                      <User className='h-4.5 w-4.5' />
                    </div>
                    <div className='min-w-0'>
                      <p className='text-[10px] font-bold uppercase tracking-wider text-muted-foreground'>
                        {t('gameDetailPage.developer')}
                      </p>
                      <p className='text-sm font-semibold text-foreground truncate'>
                        {game.developer}
                      </p>
                    </div>
                  </div>
                )}

                {game.publisher && (
                  <div className='flex items-center gap-3'>
                    <div className='flex h-9 w-9 items-center justify-center rounded-lg bg-primary/5 text-primary'>
                      <Building className='h-4.5 w-4.5' />
                    </div>
                    <div className='min-w-0'>
                      <p className='text-[10px] font-bold uppercase tracking-wider text-muted-foreground'>
                        {t('gameDetailPage.publisher')}
                      </p>
                      <p className='text-sm font-semibold text-foreground truncate'>
                        {game.publisher}
                      </p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>

        {/* Right Column: Description & Inputs Card */}
        <div className='md:col-span-2 space-y-6'>
          {/* Description & Instruction Card */}
          {(game.description || game.instruction) && (
            <Card className='shadow-sm border-border/80 rounded-2xl'>
              <CardContent className='p-6 space-y-6'>
                {game.description && (
                  <div className='space-y-2'>
                    <h3 className='text-xs font-bold uppercase tracking-wider text-muted-foreground'>
                      {t('gameDetailPage.description')}
                    </h3>
                    <div className='text-sm leading-relaxed text-foreground bg-muted/20 rounded-xl p-4 border border-border/30 whitespace-pre-wrap'>
                      {game.description}
                    </div>
                  </div>
                )}
                {game.instruction && (
                  <div className='space-y-2'>
                    <h3 className='text-xs font-bold uppercase tracking-wider text-muted-foreground'>
                      {t('gameDetailPage.instruction')}
                    </h3>
                    <div className='text-sm leading-relaxed text-foreground bg-muted/20 rounded-xl p-4 border border-border/30 whitespace-pre-wrap'>
                      {game.instruction}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Customer Inputs Card */}
          <Card className='shadow-sm border-border/80 rounded-2xl'>
            <CardHeader className='pb-4 border-b border-border/60'>
              <div className='flex items-center gap-2'>
                <TextCursorInput className='h-5 w-5 text-primary' />
                <div>
                  <CardTitle className='text-base font-bold'>{t('gameDetailPage.inputsTitle')}</CardTitle>
                  <CardDescription>{t('gameDetailPage.inputsDescription')}</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className='pt-6'>
              {inputs.length === 0 ? (
                <div className='flex flex-col items-center justify-center py-6 text-center text-muted-foreground'>
                  <Info className='h-8 w-8 mb-2 opacity-35' />
                  <p className='text-sm'>{t('gameDetailPage.inputsEmpty')}</p>
                </div>
              ) : (
                <div className='overflow-hidden rounded-xl border border-border/80 shadow-sm'>
                  <table className='w-full min-w-[36rem] text-left text-sm'>
                    <thead className='bg-muted/40 text-xs font-bold uppercase tracking-wider text-muted-foreground border-b border-border/80'>
                      <tr>
                        <th scope='col' className='px-4 py-3'>{t('gameDetailPage.inputLabel')}</th>
                        <th scope='col' className='px-4 py-3'>{t('gameDetailPage.inputKey')}</th>
                        <th scope='col' className='px-4 py-3'>{t('gameDetailPage.inputType')}</th>
                        <th scope='col' className='px-4 py-3'>{t('gameDetailPage.inputRequired')}</th>
                        <th scope='col' className='px-4 py-3'>{t('gameDetailPage.inputPlaceholder')}</th>
                        <th scope='col' className='px-4 py-3 text-right pr-6'>{t('gameDetailPage.actions') || 'Actions'}</th>
                      </tr>
                    </thead>
                    <tbody className='divide-y divide-border/60'>
                      {inputs.map((row) => (
                        <tr
                          key={row.id}
                          className='transition-colors hover:bg-muted/30'
                        >
                          <td className='px-4 py-3 font-semibold text-foreground'>{row.label}</td>
                          <td className='px-4 py-3'>
                            <span className='font-mono text-xs px-2 py-0.5 rounded bg-muted text-muted-foreground border border-border/40'>
                              {row.key}
                            </span>
                          </td>
                          <td className='px-4 py-3'>
                            <span className='text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-primary/5 text-primary border border-primary/10'>
                              {row.input_type}
                            </span>
                          </td>
                          <td className='px-4 py-3'>
                            <Badge variant={row.required ? 'destructive' : 'secondary'} className='font-normal text-xs'>
                              {row.required ? t('gameDetailPage.yes') : t('gameDetailPage.no')}
                            </Badge>
                          </td>
                          <td className='max-w-[12rem] truncate px-4 py-3 text-muted-foreground'>
                            {row.placeholder || <span className='italic text-muted-foreground/40'>{t('gameDetailPage.emptyValue')}</span>}
                          </td>
                          <td className='px-4 py-3 text-right pr-5'>
                            <EditGameInputModal input={row} />
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

      {/* Linked Products Card */}
      <Card className='shadow-sm border-border/80 rounded-2xl'>
        <CardHeader className='pb-4 border-b border-border/60'>
          <div className='flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between'>
            <div className='flex items-center gap-2'>
              <Package className='h-5 w-5 text-primary' />
              <div>
                <CardTitle className='text-base font-bold'>{t('gameDetailPage.productsTitle')}</CardTitle>
                <CardDescription>
                  {t('gameDetailPage.productsDescription', { count: allProducts.length })}
                  {productFiltersActive && allProducts.length > 0 ? (
                    <span className='ml-2 font-medium text-primary'>
                      ({t('gameDetailPage.productsFilteredHint', {
                        shown: filteredProducts.length,
                        total: allProducts.length,
                      })})
                    </span>
                  ) : null}
                </CardDescription>
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent className='pt-6'>
          {fetchProductsFallback && (productsLoading || productsFetching) && allProducts.length === 0 ? (
            <div className='flex flex-col items-center justify-center py-12 text-center text-muted-foreground'>
              <Loader2 className='h-8 w-8 animate-spin mb-2 text-primary' />
              <p className='text-sm'>{t('gameDetailPage.productsLoading')}</p>
            </div>
          ) : allProducts.length === 0 ? (
            <div className='flex flex-col items-center justify-center py-12 text-center text-muted-foreground'>
              <Package className='h-10 w-10 mb-2 opacity-35' />
              <p className='text-sm'>{t('gameDetailPage.productsEmpty')}</p>
            </div>
          ) : (
            <div className='space-y-4'>
              {/* Product Filtering Bar */}
              <div className='grid gap-4 sm:grid-cols-2 md:grid-cols-4 items-end bg-muted/20 p-4 rounded-xl border border-border/40'>
                {/* Search Input */}
                <div className='space-y-1.5'>
                  <label className='text-xs font-semibold text-muted-foreground'>
                    {t('searchLabel') || 'Search'}
                  </label>
                  <div className='relative min-w-0'>
                    <Search className='pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground/75' />
                    <Input
                      value={productQuery}
                      onChange={(e) => setProductQuery(e.target.value)}
                      placeholder={t('gameDetailPage.productSearchPlaceholder')}
                      aria-label={t('gameDetailPage.productSearchAria')}
                      className='h-10 pl-9 shadow-sm rounded-xl bg-background border-border/80 focus-visible:ring-1 focus-visible:ring-ring'
                    />
                  </div>
                </div>

                {/* Active Status Dropdown */}
                <div className='space-y-1.5'>
                  <label className='text-xs font-semibold text-muted-foreground'>
                    {t('gameFilters.statusLabel')}
                  </label>
                  <Select value={productActive} onValueChange={(v) => setProductActive(v as GameActiveFilterValue)}>
                    <SelectTrigger className='h-10 w-full min-w-0 shadow-sm bg-background border-border/80 rounded-xl'>
                      <SelectValue placeholder={t('gameFilters.statusPlaceholder')} />
                    </SelectTrigger>
                    <SelectContent position='popper' align='start'>
                      <SelectItem value='all'>{t('gameFilters.all')}</SelectItem>
                      <SelectItem value='active'>{t('gameFilters.active')}</SelectItem>
                      <SelectItem value='inactive'>{t('gameFilters.inactive')}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Provider Status Dropdown */}
                <div className='space-y-1.5'>
                  <label className='text-xs font-semibold text-muted-foreground'>
                    {t('productFilters.providerStatusLabel')}
                  </label>
                  <Select value={productProvider} onValueChange={(v) => setProductProvider(v as ProductProviderStatusFilterValue)}>
                    <SelectTrigger className='h-10 w-full min-w-0 shadow-sm bg-background border-border/80 rounded-xl'>
                      <SelectValue placeholder={t('productFilters.providerStatusPlaceholder')} />
                    </SelectTrigger>
                    <SelectContent position='popper' align='start'>
                      <SelectItem value='all'>{t('productFilters.all')}</SelectItem>
                      <SelectItem value='available'>{t('productFilters.providerAvailable')}</SelectItem>
                      <SelectItem value='empty'>{t('productFilters.providerEmpty')}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Clear / Reset Button */}
                <div className='h-10 flex items-center'>
                  {productFiltersActive ? (
                    <Button
                      type='button'
                      variant='outline'
                      size='sm'
                      className='h-10 w-full rounded-xl gap-2 font-medium hover:bg-muted transition-colors border-border/80'
                      onClick={clearProductFilters}
                      aria-label={t('gameDetailPage.clearProductFiltersAria')}
                    >
                      <RefreshCw className='h-4 w-4' />
                      {t('gameDetailPage.clearProductFilters')}
                    </Button>
                  ) : (
                    <div className='h-10 w-full' />
                  )}
                </div>
              </div>

              {/* Products Table List */}
              {filteredProducts.length === 0 ? (
                <div className='flex flex-col items-center justify-center py-8 text-center text-muted-foreground'>
                  <p className='text-sm'>{t('gameDetailPage.productsNoFilterMatch')}</p>
                </div>
              ) : (
                <div className='overflow-hidden rounded-xl border border-border/80 shadow-sm bg-card'>
                  <div className='overflow-x-auto'>
                    <table className='w-full min-w-[50rem] text-left text-sm'>
                      <thead className='bg-muted/50 text-xs font-bold uppercase tracking-wider text-muted-foreground border-b border-border/80'>
                        <tr>
                          <th scope='col' className='px-4 py-3.5'>{t('gameDetailPage.productName')}</th>
                          <th scope='col' className='px-4 py-3.5'>{t('gameDetailPage.providerStatus')}</th>
                          <th scope='col' className='px-4 py-3.5 text-right'>{t('gameDetailPage.sellingPrice')}</th>
                          <th scope='col' className='px-4 py-3.5 text-right'>{t('gameDetailPage.stock')}</th>
                          <th scope='col' className='px-4 py-3.5 text-center'>{t('gameDetailPage.productActive')}</th>
                        </tr>
                      </thead>
                      <tbody className='divide-y divide-border/60'>
                        {paginatedProducts.map((p: Product) => {
                          const statusLabel = providerStatusLabel(p.provider_status, t)
                          return (
                            <tr key={p.id} className='transition-colors hover:bg-muted/30'>
                              {/* Product Info (Name + SKU) */}
                              <td className='px-4 py-3.5'>
                                <div className='space-y-0.5'>
                                  <div className='font-semibold text-foreground leading-snug'>{p.name}</div>
                                  <div className='font-mono text-[10px] text-muted-foreground'>{p.sku}</div>
                                </div>
                              </td>

                              {/* Provider Status */}
                              <td className='px-4 py-3.5 align-middle'>
                                <Badge variant={providerStatusVariant(p.provider_status)} className='max-w-[10rem] truncate font-normal text-xs'>
                                  {statusLabel}
                                </Badge>
                              </td>

                              {/* Price Details (Selling Price + Breakdown) */}
                              <td className='px-4 py-3.5 text-right align-middle'>
                                <div className='space-y-0.5'>
                                  <div className='font-bold text-foreground tabular-nums text-sm'>
                                    {moneyFmt(p.selling_price)}
                                  </div>
                                  <div className='text-[10px] text-muted-foreground tabular-nums'>
                                    Base: {moneyFmt(p.base_price)} • Markup: {moneyFmt(p.additional_fee)} ({p.additional_percent}%)
                                  </div>
                                </div>
                              </td>

                              {/* Stock Info */}
                              <td className='px-4 py-3.5 text-right align-middle'>
                                {p.is_unlimited_stock ? (
                                  <Badge variant='outline' className='border-emerald-500/30 bg-emerald-500/5 text-emerald-600 dark:text-emerald-400 font-medium text-[11px] px-2 py-0.5'>
                                    ∞ Unlimited
                                  </Badge>
                                ) : (
                                  <span className={`font-medium tabular-nums text-xs ${p.stock_quantity === 0 ? 'text-destructive font-bold' : 'text-foreground'}`}>
                                    {p.stock_quantity.toLocaleString()} pcs
                                  </span>
                                )}
                              </td>

                              {/* Active Status Badge */}
                              <td className='px-4 py-3.5 text-center align-middle'>
                                <Badge
                                  variant={p.is_active ? 'success' : 'secondary'}
                                  className='font-semibold text-xs px-2.5 py-0.5 rounded-full'
                                >
                                  {p.is_active ? t('gameToggleLabels.active') : t('gameToggleLabels.inactive')}
                                </Badge>
                              </td>
                            </tr>
                          )
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* Pagination controls */}
              <Pagination
                page={currentPage}
                totalPage={totalPage}
                onChange={setCurrentPage}
              />
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

export default function GameDetailPage() {
  const { t } = useTranslation('common')
  const { gameId } = useParams<{ gameId: string }>()

  const { data, isLoading, isError, isSuccess, refetch, isFetching } = useGetGameById(gameId ?? '')

  if (!gameId) {
    return (
      <DetailPageShell>
        <div className={detailPageCardClass}>
          <div className='px-4 py-10 sm:px-6 md:px-8'>
            <ErrorComponent message={t('gameDetailPage.missingIdMessage')} />
            <Button variant='outline' className='mt-4' asChild>
              <Link to='/games'>{t('gameDetailPage.backButton')}</Link>
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
            className='flex min-h-[min(60vh,28rem)] flex-col items-center justify-center gap-4 bg-muted/20 px-4 py-16 sm:px-6 md:px-8'
            role='status'
            aria-live='polite'
            aria-busy='true'
          >
            <Loader2 className='h-11 w-11 shrink-0 animate-spin text-primary' aria-hidden />
            <div className='text-center'>
              <p className='text-sm font-medium text-foreground'>{t('gameDetailPage.loadingTitle')}</p>
              <p className='mt-1 text-xs text-muted-foreground'>{t('gameDetailPage.loadingHint')}</p>
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
          <div className='space-y-6 px-4 py-10 sm:px-6 md:px-8'>
            <ErrorComponent message={t('gameDetailPage.errorMessage')} />
            <div className='flex flex-wrap gap-2'>
              <Button
                type='button'
                variant='default'
                className='gap-2'
                disabled={isFetching}
                aria-label={t('gameDetailPage.retryAria')}
                onClick={() => void refetch()}
              >
                <RefreshCw
                  className={`h-4 w-4 shrink-0 ${isFetching ? 'animate-spin' : ''}`}
                  aria-hidden
                />
                {t('gameDetailPage.retry')}
              </Button>
              <Button variant='outline' asChild>
                <Link to='/games'>{t('gameDetailPage.backButton')}</Link>
              </Button>
            </div>
          </div>
        </div>
      </DetailPageShell>
    )
  }

  if (isSuccess && !data?.data) {
    return (
      <DetailPageShell>
        <div className={detailPageCardClass}>
          <div className='space-y-6 px-4 py-10 sm:px-6 md:px-8'>
            <ErrorComponent message={t('gameDetailPage.notFoundMessage')} />
            <Button variant='outline' asChild>
              <Link to='/games'>{t('gameDetailPage.backButton')}</Link>
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
