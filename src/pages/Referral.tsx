import { DashboardLayout } from '@/components/Layout/dashboard-layout'
import ErrorComponent from '@/components/Layout/error'
import Pagination from '@/components/Layout/Pagination'
import { DataTable } from '@/components/Layout/table-data'
import { ReferralFormModal } from '@/components/ReferralCode/ReferralFormModal'
import { useGetReferralCodes, useUpdateReferralCode } from '@/hooks/useReferral'
import {
  nbAccent,
  nbHint,
  nbPageIcon,
  nbPageSubtitle,
  nbPageTitle,
  nbPagination,
  nbPanel,
  nbSectionTitle,
  nbTable,
  nbTag,
} from '@/lib/nb'
import { cn } from '@/lib/utils'
import { getReferralColumns } from '@/tables/table-referral'
import type { ReferralCode } from '@/types/referral'
import { AlertCircle, CheckCircle2, Loader2, Percent } from 'lucide-react'
import { useCallback, useEffect, useMemo, useState } from 'react'
import toast from 'react-hot-toast'
import { useTranslation } from 'react-i18next'

const PAGE_LIMIT = 10

/** Label status di sisi kanan judul halaman. */
function StatusTag({ accent, children }: { accent: string; children: React.ReactNode }) {
  return <p className={cn(nbTag, accent)}>{children}</p>
}

export default function ReferralPage() {
  const { t } = useTranslation('common')
  const [page, setPage] = useState(1)

  const { data, isLoading, isError, isSuccess, isFetchedAfterMount } = useGetReferralCodes({
    page,
    limit: PAGE_LIMIT,
  })

  const { mutate: updateMutate } = useUpdateReferralCode()

  useEffect(() => {
    if (isSuccess && isFetchedAfterMount) {
      toast.success(t('referralPage.toastSuccess'))
    }
    if (isError && isFetchedAfterMount) {
      toast.error(t('referralPage.toastError'))
    }
  }, [isSuccess, isError, isFetchedAfterMount, t])

  const handleToggleStatus = useCallback(
    (referral: ReferralCode) => {
      updateMutate({
        id: referral.id,
        payload: { is_active: !referral.is_active },
      })
    },
    [updateMutate],
  )

  const columns = useMemo(
    () => getReferralColumns(t, handleToggleStatus),
    [t, handleToggleStatus],
  )

  const rows = data?.data ?? []
  const meta = data?.meta

  return (
    <DashboardLayout>
      <div className='mx-auto min-w-0 max-w-7xl space-y-5'>
        <div
          className={cn(
            nbPanel,
            'flex flex-col gap-4 p-4 sm:flex-row sm:items-center sm:justify-between sm:p-5',
          )}
        >
          <div className='flex gap-3'>
            <span className={cn(nbPageIcon, nbAccent.pink)}>
              <Percent className='h-5 w-5' strokeWidth={2.5} aria-hidden />
            </span>
            <div className='min-w-0 space-y-1.5'>
              <h1 className={nbPageTitle}>{t('referralPage.title')}</h1>
              <p className={nbPageSubtitle}>{t('referralPage.subtitle')}</p>
            </div>
          </div>

          <div className='flex shrink-0 sm:justify-end'>
            {isLoading && (
              <StatusTag accent={nbAccent.cyan}>
                <Loader2 className='h-4 w-4 shrink-0 animate-spin' strokeWidth={3} aria-hidden />
                {t('providerPage.loadingShort')}
              </StatusTag>
            )}
            {isError && (
              <StatusTag accent={nbAccent.red}>
                <AlertCircle className='h-4 w-4 shrink-0' strokeWidth={3} aria-hidden />
                {t('providerPage.loadFailedShort')}
              </StatusTag>
            )}
            {isSuccess && (
              <StatusTag accent={nbAccent.lime}>
                <CheckCircle2 className='h-4 w-4 shrink-0' strokeWidth={3} aria-hidden />
                <span className='tabular-nums'>
                  {t('referralPage.table.totalData')}: {meta?.total_data ?? rows.length}
                </span>
              </StatusTag>
            )}
          </div>
        </div>

        <div
          className={cn(
            nbPanel,
            'flex flex-col gap-3 p-3 sm:flex-row sm:items-center sm:justify-between sm:p-4',
          )}
        >
          <div className='min-w-0'>
            <h2 className={nbSectionTitle}>{t('referralPage.title')}</h2>
            <p className={cn('mt-0.5', nbHint)}>{t('referralPage.subtitle')}</p>
          </div>
          <ReferralFormModal />
        </div>

        {isLoading && (
          <div
            className={cn(
              nbPanel,
              'flex min-h-[16rem] flex-col items-center justify-center gap-4 py-12',
            )}
            role='status'
            aria-live='polite'
            aria-busy='true'
          >
            <span
              className={cn(
                'nb-frame nb-frame-thin nb-sd-sm flex h-14 w-14 items-center justify-center',
                nbAccent.cyan,
              )}
            >
              <Loader2 className='h-7 w-7 animate-spin' strokeWidth={3} aria-hidden />
            </span>
            <p className={nbSectionTitle}>{t('providerPage.loadingShort')}</p>
          </div>
        )}

        {isError && (
          <div className={nbPanel}>
            <ErrorComponent message={t('referralPage.toastError')} />
          </div>
        )}

        {isSuccess && (
          <>
            <DataTable
              className={nbTable}
              getRowId={(row) => row.id}
              columns={columns}
              data={rows}
              emptyMessage={t('referralPage.emptyPage')}
            />
            <Pagination
              className={nbPagination}
              page={meta?.page ?? 1}
              totalPage={meta?.total_page ?? 1}
              onChange={setPage}
            />
          </>
        )}
      </div>
    </DashboardLayout>
  )
}
