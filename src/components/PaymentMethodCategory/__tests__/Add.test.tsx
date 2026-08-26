import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

import { AddPaymentMethodToPaymentCategoryButton } from '@/components/PaymentMethodCategory/Add'
import { useGetPaymentMethods } from '@/hooks/usePaymentMethod'
import {
  useAssignPaymentMethods,
  useGetPaymentMethodCategory,
} from '@/hooks/usePaymentMethodCategory'

vi.mock('@/hooks/usePaymentMethod', () => ({ useGetPaymentMethods: vi.fn() }))
vi.mock('@/hooks/usePaymentMethodCategory', () => ({
  useAssignPaymentMethods: vi.fn(),
  useGetPaymentMethodCategory: vi.fn(),
}))

const mockMethods = vi.mocked(useGetPaymentMethods)
const mockAssign = vi.mocked(useAssignPaymentMethods)
const mockCategories = vi.mocked(useGetPaymentMethodCategory)

const method = (id: string, name: string, categoryId = '') => ({
  id,
  name,
  code: name.toUpperCase(),
  type: 'ewallet',
  provider: 'midtrans',
  icon_url: '',
  fee_percentage: 0,
  fee_fixed: 0,
  min_amount: 0,
  max_amount: 0,
  category_id: categoryId,
  full_name: '',
  sort_order: 0,
  config: null,
  is_active: true,
  created_at: '',
  updated_at: '',
})

/** Hanya field yang dibaca komponen; sisanya tidak relevan untuk uji ini. */
const methodsQuery = (
  data: ReturnType<typeof method>[],
  { total, isLoading = false }: { total?: number; isLoading?: boolean } = {},
) =>
  ({
    data: isLoading
      ? undefined
      : {
          data,
          message: 'ok',
          status: 'success',
          meta: {
            page: 1,
            limit: 200,
            total_data: total ?? data.length,
            total_page: 1,
            has_next: false,
            has_prev: false,
          },
        },
    isLoading,
    isSuccess: !isLoading,
  }) as unknown as ReturnType<typeof useGetPaymentMethods>

const renderDialog = () => {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  })
  render(
    <QueryClientProvider client={client}>
      <AddPaymentMethodToPaymentCategoryButton
        categoryId='cat-1'
        categoryName='E-wallet'
      />
    </QueryClientProvider>,
  )
  fireEvent.click(screen.getByRole('button', { name: /Link payment methods/i }))
}

const saveButton = () => screen.getByRole('button', { name: /^Save$/ })

describe('AddPaymentMethodToPaymentCategoryButton', () => {
  const mutate = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
    mockAssign.mockReturnValue({
      mutate,
      isPending: false,
    } as unknown as ReturnType<typeof useAssignPaymentMethods>)
    mockCategories.mockReturnValue({
      data: { data: [{ id: 'cat-2', name: 'Virtual Account' }] },
    } as unknown as ReturnType<typeof useGetPaymentMethodCategory>)
  })

  it('mencentang metode yang sudah masuk kategori berdasarkan data server', async () => {
    mockMethods.mockReturnValue(
      methodsQuery([method('m1', 'QRIS', 'cat-1'), method('m2', 'GoPay')]),
    )
    renderDialog()

    const checkboxes = await screen.findAllByRole('checkbox')
    expect(checkboxes[0]).toBeChecked()
    expect(checkboxes[1]).not.toBeChecked()
  })

  it('tidak menyimpan apa pun selama tidak ada perubahan', async () => {
    mockMethods.mockReturnValue(methodsQuery([method('m1', 'QRIS', 'cat-1')]))
    renderDialog()

    await screen.findAllByRole('checkbox')
    expect(saveButton()).toBeDisabled()
    fireEvent.click(saveButton())
    expect(mutate).not.toHaveBeenCalled()
  })

  it('menolak menyimpan saat daftar metode belum termuat seluruhnya', async () => {
    // Endpoint PATCH bersifat replace-all: menyimpan daftar parsial akan
    // melepas metode yang tidak ikut terkirim
    mockMethods.mockReturnValue(
      methodsQuery([method('m1', 'QRIS', 'cat-1')], { total: 120 }),
    )
    renderDialog()

    expect(await screen.findByRole('alert')).toHaveTextContent(/1 of 120/i)
    expect(saveButton()).toBeDisabled()
  })

  it('mengirim daftar lengkap dan memberi tahu dampak penghapusan', async () => {
    mockMethods.mockReturnValue(
      methodsQuery([method('m1', 'QRIS', 'cat-1'), method('m2', 'GoPay')]),
    )
    renderDialog()

    const checkboxes = await screen.findAllByRole('checkbox')
    fireEvent.click(checkboxes[1]) // tambahkan GoPay
    fireEvent.click(checkboxes[0]) // keluarkan QRIS

    expect(screen.getByText(/will be removed from this category/i)).toBeInTheDocument()

    fireEvent.click(saveButton())
    await waitFor(() => expect(mutate).toHaveBeenCalledTimes(1))
    expect(mutate.mock.calls[0][0]).toEqual(['m2'])
  })

  it('menandai metode yang akan diambil dari kategori lain', async () => {
    mockMethods.mockReturnValue(
      methodsQuery([method('m3', 'BCA VA', 'cat-2')]),
    )
    renderDialog()

    const checkboxes = await screen.findAllByRole('checkbox')
    fireEvent.click(checkboxes[0])
    expect(
      screen.getByText(/will be moved out of another category/i),
    ).toBeInTheDocument()
  })
})
