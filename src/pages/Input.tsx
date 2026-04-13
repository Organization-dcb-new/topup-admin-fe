import GameInputSearchInput from '@/components/Inputs/SearchInput'
import { DashboardLayout } from '@/components/Layout/dashboard-layout'
import ErrorComponent from '@/components/Layout/error'
import Pagination from '@/components/Layout/Pagination'
import { DataTable } from '@/components/Layout/table-data'
import { useDebounce } from '@/hooks/useDebounce'
import { useGetGameInputs } from '@/hooks/useGameInput'
import { getInputColumns } from '@/tables/table-input'
import { AlertCircle, CheckCircle2, Keyboard, Loader2 } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import toast from 'react-hot-toast'

export default function InputPages() {
  const { t, i18n } = useTranslation('common')
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const limit = 20

  const debouncedSearch = useDebounce(search, 500)

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- sinkron pagination dengan filter pencarian
    setPage(1)
  }, [debouncedSearch])

  const { data, isSuccess, isFetchedAfterMount, isError, isLoading } = useGetGameInputs(
    debouncedSearch,
    page,
    limit,
    'all',
  )

  const inputColumns = useMemo(() => getInputColumns(t), [t])

  useEffect(() => {
    if (isSuccess && isFetchedAfterMount) {
      toast.success(t('inputToasts.loadSuccess'))
    }
    if (isError && isFetchedAfterMount) {
      toast.error(t('inputToasts.loadError'))
    }
  }, [isSuccess, isError, isFetchedAfterMount, t])

  const rows = data?.data ?? []

  return (
    <DashboardLayout>
      <div className="mx-auto max-w-7xl space-y-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex gap-3">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <Keyboard className="h-5 w-5" aria-hidden />
            </div>
            <div className="min-w-0 space-y-1">
              <h1 className="text-2xl font-semibold tracking-tight text-gray-900">{t('inputPage.title')}</h1>
              <p className="text-sm text-muted-foreground">
                {t('inputPage.subtitle')}
              </p>
            </div>
          </div>
          <div className="flex flex-col items-end gap-1 sm:text-right">
            {isLoading && (
              <p className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                <Loader2 className="h-4 w-4 shrink-0 animate-spin text-primary" aria-hidden />
                {t('inputPage.loadingShort')}
              </p>
            )}
            {isError && (
              <p className="flex items-center gap-2 text-sm font-medium text-destructive">
                <AlertCircle className="h-4 w-4 shrink-0" aria-hidden />
                {t('inputPage.errorShort')}
              </p>
            )}
            {isSuccess && (
              <p className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600" aria-hidden />
                <span className="tabular-nums text-foreground">
                  {t('inputPage.total', {
                    total: (data?.meta?.total_data ?? 0).toLocaleString(
                      i18n.language.startsWith('id') ? 'id-ID' : 'en-US',
                    ),
                  })}
                </span>
              </p>
            )}
          </div>
        </div>

        <div className="overflow-hidden rounded-xl bg-white shadow-sm ring-1 ring-gray-900/5">
          <div className="border-b border-gray-100 px-4 py-3 sm:px-5">
            <div className="min-w-0 space-y-0.5">
              <h2 className="text-sm font-semibold text-gray-900">{t('inputPage.listTitle')}</h2>
              <p className="text-xs text-muted-foreground">
                {t('inputPage.listHint', { limit })}
              </p>
            </div>
            <div className="mt-3 max-w-md">
              <GameInputSearchInput onChange={setSearch} value={search} />
            </div>
          </div>

          <div className="p-3 sm:p-4">
            {isLoading && (
              <div
                className="flex min-h-[16rem] flex-col items-center justify-center gap-4 rounded-lg border border-dashed border-border/80 bg-muted/20 py-12"
                role="status"
                aria-live="polite"
                aria-busy="true"
              >
                <Loader2 className="h-11 w-11 animate-spin text-primary" aria-hidden />
                <div className="text-center">
                  <p className="text-sm font-medium text-foreground">{t('inputPage.loadingBody')}</p>
                  <p className="mt-1 text-xs text-muted-foreground">{t('inputPage.pleaseWait')}</p>
                </div>
              </div>
            )}

            {isError && (
              <ErrorComponent message={t('inputPage.errorMessage')} />
            )}

            {isSuccess && (
              <>
                <div className="max-h-[min(70vh,40rem)] overflow-y-auto overflow-x-auto overscroll-contain">
                  <DataTable
                    columns={inputColumns}
                    data={rows}
                    emptyMessage={t('inputPage.emptyMessage')}
                  />
                </div>
                <div className="mt-4">
                  <Pagination
                    page={page}
                    totalPage={data?.meta?.total_page ?? 1}
                    onChange={setPage}
                  />
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}
