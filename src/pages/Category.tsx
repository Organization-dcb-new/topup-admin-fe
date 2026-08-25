import CategoriesSearchInput from '@/components/Category/SearchCategory'
import { CreateCategoryModal } from '@/components/Category/CreateCategoryModal'
import { DashboardLayout } from '@/components/Layout/dashboard-layout'
import ErrorComponent from '@/components/Layout/error'
import TableSkeleton from '@/components/Layout/loading'
import Pagination from '@/components/Layout/Pagination'
import { DataTable } from '@/components/Layout/table-data'
import { useGetCategories } from '@/hooks/useCategory'
import { useDebounce } from '@/hooks/useDebounce'
import { getCategoryColumns } from '@/tables/table-category'
import { useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import toast from 'react-hot-toast'
import { Can } from '@/components/Auth/Can'
import { PERM } from '@/constants/permissions'

export default function CategoryPage() {
  const { t, i18n } = useTranslation('common')
  const limit = 6
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')
  const debouncedSearch = useDebounce(search, 500)

  const { data, isLoading, isError, isSuccess, isFetchedAfterMount } = useGetCategories(
    page,
    limit,
    debouncedSearch
  )

  useEffect(() => {
    setPage(1)
  }, [debouncedSearch])

  const categoryColumns = useMemo(() => getCategoryColumns(t), [t])

  useEffect(() => {
    if (isSuccess && isFetchedAfterMount) {
      toast.success(t('categoryToasts.loadSuccess'))
    }
    if (isError && isFetchedAfterMount) {
      toast.error(t('categoryToasts.loadError'))
    }
  }, [isSuccess, isError, isFetchedAfterMount, t])

  return (
    <DashboardLayout>
      <div className='flex justify-between mb-4'>
        <CategoriesSearchInput value={search} onChange={setSearch} />
        <Can perm={PERM.CATEGORY_CREATE}>
          <CreateCategoryModal />
        </Can>
      </div>
      {isLoading && <TableSkeleton />}
      {isError && <ErrorComponent message={t('categoryPage.errorMessage')} />}
      {isSuccess && (
        <>
          <DataTable
            columns={categoryColumns}
            data={data?.data ?? []}
            emptyMessage={t('categoryPage.emptyMessage')}
          />{' '}
          <Pagination page={page} totalPage={data?.meta?.total_page} onChange={setPage} />
          <p className='mt-2 text-sm text-muted-foreground'>
            {t('categoryPage.totalCount', {
              total: (data?.meta?.total_data ?? 0).toLocaleString(
                i18n.language.startsWith('id') ? 'id-ID' : 'en-US',
              ),
            })}
          </p>
        </>
      )}
    </DashboardLayout>
  )
}
