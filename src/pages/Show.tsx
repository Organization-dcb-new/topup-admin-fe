import { DashboardLayout } from '@/components/Layout/dashboard-layout'
import ErrorComponent from '@/components/Layout/error'
import { DataTable } from '@/components/Layout/table-data'
import { CreateShowModal } from '@/components/Show/CreateShowModal'
import { useGetShows } from '@/hooks/useShow'
import { cn } from '@/lib/utils'
import { getShowColumns } from '@/tables/table-show'
import {
  AlertCircle,
  CheckCircle2,
  Clapperboard,
  Loader2,
  Gamepad2,
} from 'lucide-react'
import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'

/** Label status di sisi kanan judul halaman. */
function StatusTag({
  accent,
  children,
}: {
  accent: string
  children: React.ReactNode
}) {
  return (
    <p
      className={cn(
        'nb-frame nb-frame-thin nb-sd-sm inline-flex items-center gap-2 px-2.5 py-1.5 text-xs font-black uppercase tracking-[0.12em]',
        accent,
      )}
    >
      {children}
    </p>
  )
}

export default function ShowPage() {
  const { t } = useTranslation('common')
  const { data, isPending, isError, isSuccess } = useGetShows()
  const rows = data?.data ?? []
  const showColumns = useMemo(() => getShowColumns(t), [t])

  return (
    <DashboardLayout>
      <div className='mx-auto max-w-7xl space-y-5'>
        <div className='nb-frame nb-frame-thick nb-sd flex flex-col gap-4 bg-white p-4 sm:flex-row sm:items-center sm:justify-between sm:p-5'>
          <div className='flex gap-3'>
            <span className='nb-frame nb-frame-thin nb-sd-sm flex h-12 w-12 shrink-0 items-center justify-center bg-[#6fe3f5]'>
              <Clapperboard className='h-5 w-5' strokeWidth={2.5} aria-hidden />
            </span>
            <div className='min-w-0 space-y-1.5'>
              <h1 className='text-2xl font-black uppercase leading-none tracking-tight'>
                {t('showPage.title')}
              </h1>
              <p className='inline-block bg-[#ffd84d] px-1.5 py-0.5 text-xs font-bold'>
                {t('showPage.subtitle')}
              </p>
            </div>
          </div>

          <div className='flex shrink-0 sm:justify-end'>
            {isPending && (
              <StatusTag accent='bg-[#6fe3f5]'>
                <Loader2 className='h-4 w-4 shrink-0 animate-spin' strokeWidth={3} aria-hidden />
                {t('showPage.loadingShort')}
              </StatusTag>
            )}
            {isError && (
              <StatusTag accent='bg-[#ff4d3d]'>
                <AlertCircle className='h-4 w-4 shrink-0' strokeWidth={3} aria-hidden />
                {t('showPage.loadFailedShort')}
              </StatusTag>
            )}
            {isSuccess && (
              <StatusTag accent='bg-[#c9f24d]'>
                <CheckCircle2 className='h-4 w-4 shrink-0' strokeWidth={3} aria-hidden />
                <span className='tabular-nums'>
                  {t('showPage.totalShows', { count: rows.length })}
                </span>
              </StatusTag>
            )}
          </div>
        </div>

        <div className='nb-frame nb-frame-thick nb-sd flex flex-col gap-3 bg-white p-3 sm:flex-row sm:items-center sm:justify-between sm:p-4'>
          <div className='min-w-0'>
            <h2 className='text-sm font-black uppercase tracking-tight'>
              {t('showPage.listTitle')}
            </h2>
            <p className='mt-0.5 text-xs font-bold text-[#111]/70'>
              {t('showPage.listHint')}
            </p>
          </div>
          <CreateShowModal />
        </div>

        {isPending && (
          <div
            className='nb-frame nb-frame-thick nb-sd flex min-h-[16rem] flex-col items-center justify-center gap-4 bg-white py-12'
            role='status'
            aria-live='polite'
            aria-busy='true'
          >
            <span className='nb-frame nb-frame-thin nb-sd-sm flex h-14 w-14 items-center justify-center bg-[#6fe3f5]'>
              <Loader2 className='h-7 w-7 animate-spin' strokeWidth={3} aria-hidden />
            </span>
            <div className='text-center'>
              <p className='text-sm font-black uppercase tracking-tight'>
                {t('showPage.tableLoadingTitle')}
              </p>
              <p className='mt-1 text-xs font-bold text-[#111]/70'>
                {t('showPage.tableLoadingHint')}
              </p>
            </div>
          </div>
        )}

        {isError && (
          <div className='nb-frame nb-frame-thick nb-sd bg-white'>
            <ErrorComponent message={t('showPage.loadErrorDetail')} />
          </div>
        )}

        {isSuccess && (
          <DataTable
            className='nb nb-table nb-sd'
            emptyMessage={t('showPage.emptyPage')}
            renderSubRow={(row) => (
              <div className='border-t-4 border-[#111] bg-[#f5f1e8] px-5 py-4'>
                <p className='mb-3 inline-block bg-[#ffd84d] px-1.5 py-0.5 text-[11px] font-black uppercase tracking-[0.14em]'>
                  {t('showPage.subRowGamesTitle')}
                </p>
                {row.games?.length ? (
                  <div className='grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'>
                    {row.games.map((g) => (
                      <div
                        key={g.id}
                        className='nb-frame nb-frame-thin nb-sd-sm flex items-center gap-2.5 bg-white px-3 py-2'
                      >
                        <span className='nb-frame nb-frame-thin flex h-8 w-8 shrink-0 items-center justify-center bg-[#c9f24d]'>
                          <Gamepad2 className='h-4 w-4' strokeWidth={3} aria-hidden />
                        </span>
                        <div className='min-w-0 flex-1'>
                          <p className='truncate text-xs font-black uppercase tracking-tight'>
                            {g.name}
                          </p>
                          {g.slug && (
                            <p className='truncate font-mono text-[10px] font-bold text-[#111]/70'>
                              /{g.slug}
                            </p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className='text-xs font-bold text-[#111]/70'>
                    {t('showPage.subRowNoGames')}
                  </p>
                )}
              </div>
            )}
            columns={showColumns}
            data={rows}
          />
        )}
      </div>
    </DashboardLayout>
  )
}
